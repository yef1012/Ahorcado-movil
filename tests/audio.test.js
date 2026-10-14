import assert from 'node:assert/strict';
import test from 'node:test';

import {
  GAME_AUDIO_MODE, SOUND_PLAYER_OPTIONS, createAudioSession, createEffectPlayer, waitForSoundReady,
} from '../src/utils/audio.js';
import { createFeedbackController } from '../src/utils/feedback.js';
import { createAppStore } from '../src/storage/appStore.js';
import { STORAGE_KEYS } from '../src/storage/model.js';

// Dobles de la API nativa: estas pruebas verifican coordinación, no audibilidad.
const flush = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
};

function nativePlayer(initialStatus = { isLoaded: false }) {
  const listeners = new Set();
  const calls = { play: 0, pause: 0, seek: [], removed: 0 };
  const player = {
    currentStatus: { ...initialStatus },
    isLoaded: false, // En Android puede ser false al terminar aunque currentStatus.isLoaded sea true.
    volume: 0,
    muted: true,
    loop: true,
    addListener(name, listener) {
      assert.equal(name, 'playbackStatusUpdate');
      listeners.add(listener);
      return { remove() { if (listeners.delete(listener)) calls.removed += 1; } };
    },
    pause() { calls.pause += 1; },
    seekTo: async (seconds) => { calls.seek.push(seconds); },
    play() { calls.play += 1; },
  };
  return {
    player, calls, listeners,
    status(update) {
      player.currentStatus = { ...player.currentStatus, ...update };
      for (const listener of [...listeners]) listener(player.currentStatus);
    },
  };
}

function feedbackFor(native, initializeAudio = async () => {}) {
  const errors = [];
  const effect = createEffectPlayer(native.player, initializeAudio);
  const controller = createFeedbackController({
    players: { correct: effect },
    preferences: { soundEnabled: true, hapticsEnabled: false },
    haptic: async () => {},
    onError: (error) => errors.push(error),
  });
  return { controller, errors };
}

const event = (sequence) => ({ gameId: 'audio-game', type: 'correct', sequence });

test('audio: sesión permite modo silencio, sin grabación ni segundo plano, y descarga antes de cargar', () => {
  assert.equal(GAME_AUDIO_MODE.playsInSilentMode, true);
  assert.equal(GAME_AUDIO_MODE.allowsRecording, false);
  assert.equal(GAME_AUDIO_MODE.allowsBackgroundRecording, false);
  assert.equal(GAME_AUDIO_MODE.shouldPlayInBackground, false);
  assert.equal(GAME_AUDIO_MODE.shouldRouteThroughEarpiece, false);
  assert.equal(GAME_AUDIO_MODE.interruptionMode, 'mixWithOthers');
  assert.equal(SOUND_PLAYER_OPTIONS.downloadFirst, true);
});

test('audio: inicializaciones simultáneas comparten la configuración de sesión y la reutilizan', async () => {
  const pending = deferred();
  const calls = [];
  const session = createAudioSession((mode) => { calls.push(mode); return pending.promise; });
  const first = session();
  const second = session();
  await flush();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], GAME_AUDIO_MODE);
  pending.resolve();
  await Promise.all([first, second]);
  await session();
  assert.equal(calls.length, 1);
});

test('audio: un rechazo de sesión se informa y permite un nuevo intento', async () => {
  const failure = new Error('Sesión no disponible');
  let calls = 0;
  const session = createAudioSession(async () => {
    calls += 1;
    if (calls === 1) throw failure;
  });
  await assert.rejects(session(), failure);
  await session();
  assert.equal(calls, 2);
});

test('audio: un clip ya cargado, incluso terminado, no espera eventos futuros', async () => {
  const native = nativePlayer({ isLoaded: true, playbackState: 'ended', didJustFinish: true });
  await waitForSoundReady(native.player, new AbortController().signal, 100);
  assert.equal(native.listeners.size, 0);
});

test('audio: espera isLoaded y elimina la suscripción al completar la carga', async () => {
  const native = nativePlayer();
  let ready = false;
  const waiting = waitForSoundReady(native.player, new AbortController().signal, 1000)
    .then(() => { ready = true; });
  await flush();
  assert.equal(native.listeners.size, 1);
  native.status({ isLoaded: false, isBuffering: true });
  await flush();
  assert.equal(ready, false);
  native.status({ isLoaded: true });
  await waiting;
  assert.equal(ready, true);
  assert.equal(native.listeners.size, 0);
  assert.equal(native.calls.removed, 1);
});

test('audio: un error nativo de carga rechaza la espera y elimina el listener', async () => {
  const native = nativePlayer();
  const waiting = waitForSoundReady(native.player, new AbortController().signal, 1000);
  const rejected = assert.rejects(waiting, /archivo no disponible/i);
  native.status({ error: 'Archivo no disponible' });
  await rejected;
  assert.equal(native.listeners.size, 0);
  assert.equal(native.calls.removed, 1);
});

test('audio: un error que ya estaba en currentStatus no espera al timeout', async () => {
  const native = nativePlayer({ isLoaded: false, error: 'Formato inválido' });
  await assert.rejects(waitForSoundReady(native.player, new AbortController().signal, 1000), /formato inválido/i);
  assert.equal(native.listeners.size, 0);
});

test('audio: abortar la carga elimina la suscripción y una carga tardía no la reactiva', async () => {
  const native = nativePlayer();
  const abort = new AbortController();
  const waiting = waitForSoundReady(native.player, abort.signal, 1000);
  const rejected = assert.rejects(waiting);
  abort.abort();
  await rejected;
  assert.equal(native.listeners.size, 0);
  assert.equal(native.calls.removed, 1);
  native.status({ isLoaded: true });
  assert.equal(native.calls.play, 0);
});

test('audio: una señal ya abortada no conserva listeners ni prepara la reproducción', async () => {
  const native = nativePlayer();
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(waitForSoundReady(native.player, abort.signal, 1000));
  assert.equal(native.listeners.size, 0);
});

test('audio: una carga que no termina expira y limpia la suscripción', async () => {
  const native = nativePlayer();
  await assert.rejects(waitForSoundReady(native.player, new AbortController().signal, 10));
  assert.equal(native.listeners.size, 0);
  assert.equal(native.calls.removed, 1);
});

test('audio: una notificación sincrónica al suscribir también limpia el listener', async () => {
  let removed = 0;
  const player = {
    currentStatus: { isLoaded: false },
    addListener(_event, listener) {
      listener({ isLoaded: true });
      return { remove() { removed += 1; } };
    },
  };
  await waitForSoundReady(player, new AbortController().signal, 1000);
  assert.equal(removed, 1);
});

test('audio: errores al suscribir o leer el estado rechazan la espera sin dejar listeners', async () => {
  const failure = new Error('Reproductor liberado');
  await assert.rejects(waitForSoundReady({
    currentStatus: { isLoaded: false },
    addListener() { throw failure; },
  }, new AbortController().signal, 1000), failure);
  const native = nativePlayer();
  Object.defineProperty(native.player, 'currentStatus', { get() { throw failure; } });
  await assert.rejects(waitForSoundReady(native.player, new AbortController().signal, 1000), failure);
  assert.equal(native.listeners.size, 0);
  assert.equal(native.calls.removed, 1);
});

test('audio: un fallo al retirar un listener se captura sin escapar del evento nativo', async () => {
  const native = nativePlayer();
  const failure = new Error('Recurso nativo ya liberado');
  const subscribe = native.player.addListener;
  native.player.addListener = (...args) => {
    const subscription = subscribe(...args);
    return { remove() { subscription.remove(); throw failure; } };
  };
  const waiting = waitForSoundReady(native.player, new AbortController().signal, 1000);
  const rejected = assert.rejects(waiting, failure);
  assert.doesNotThrow(() => native.status({ isLoaded: true }));
  await rejected;
  assert.equal(native.listeners.size, 0);
});

test('audio: prepare espera sesión y carga, fija volumen y no reproduce por su cuenta', async () => {
  const native = nativePlayer();
  const session = deferred();
  const effect = createEffectPlayer(native.player, () => session.promise);
  let ready = false;
  const preparing = effect.prepare(new AbortController().signal).then(() => { ready = true; });
  await flush();
  assert.equal(ready, false);
  assert.equal(native.calls.play, 0);
  session.resolve();
  await flush();
  assert.equal(ready, false);
  native.status({ isLoaded: true });
  await preparing;
  assert.equal(native.player.volume, 1);
  assert.equal(native.player.muted, false);
  assert.equal(native.player.loop, false);
  assert.equal(native.calls.play, 0);
  effect.pause();
  await effect.seekTo(0);
  effect.play();
  assert.equal(native.calls.pause, 1);
  assert.deepEqual(native.calls.seek, [0]);
  assert.equal(native.calls.play, 1);
});

test('audio: el controlador no inicia seek ni play hasta que el recurso esté cargado', async () => {
  const native = nativePlayer();
  const { controller, errors } = feedbackFor(native);
  controller.emit(event(1));
  await flush();
  assert.deepEqual(native.calls.seek, []);
  assert.equal(native.calls.play, 0);
  native.status({ isLoaded: true });
  await flush();
  assert.deepEqual(native.calls.seek, [0]);
  assert.equal(native.calls.play, 1);
  assert.deepEqual(errors, []);
  controller.dispose();
});

test('audio: eventos distintos repiten el mismo clip desde cero; duplicados no lo repiten', async () => {
  const native = nativePlayer({ isLoaded: true });
  const { controller } = feedbackFor(native);
  controller.emit(event(1));
  await flush();
  native.status({ isLoaded: true, playbackState: 'ended', didJustFinish: true });
  controller.emit(event(2));
  await flush();
  assert.equal(controller.emit(event(2)), false);
  await flush();
  assert.equal(native.calls.play, 2);
  assert.deepEqual(native.calls.seek, [0, 0]);
  controller.dispose();
});

test('audio: una victoria sustituye el acierto pendiente sin reproducir después la carga antigua', async () => {
  const correct = nativePlayer();
  const win = nativePlayer({ isLoaded: true });
  const errors = [];
  const controller = createFeedbackController({
    players: {
      correct: createEffectPlayer(correct.player, async () => {}),
      win: createEffectPlayer(win.player, async () => {}),
    },
    preferences: { soundEnabled: true, hapticsEnabled: false },
    haptic: async () => {},
    onError: (error) => errors.push(error),
  });
  controller.emit(event(1));
  await flush();
  assert.equal(correct.listeners.size, 1);
  controller.emit({ ...event(2), type: 'win' });
  await flush();
  assert.equal(correct.listeners.size, 0);
  correct.status({ isLoaded: true });
  await flush();
  assert.equal(correct.calls.play, 0);
  assert.equal(win.calls.play, 1);
  assert.equal(controller.emit({ ...event(2), type: 'win' }), false);
  assert.deepEqual(errors, []);
  controller.dispose();
});

test('audio: desmontar durante la inicialización impide iniciar carga o reproducción al resolver la sesión', async () => {
  const native = nativePlayer({ isLoaded: true });
  const session = deferred();
  const { controller, errors } = feedbackFor(native, () => session.promise);
  controller.emit(event(1));
  controller.dispose();
  session.resolve();
  await flush();
  assert.equal(native.listeners.size, 0);
  assert.deepEqual(native.calls.seek, []);
  assert.equal(native.calls.play, 0);
  assert.deepEqual(errors, []);
});

for (const reason of ['mute', 'background', 'dispose']) {
  test(`audio: ${reason} cancela la carga pendiente y no reproduce al recibir isLoaded tarde`, async () => {
    const native = nativePlayer();
    const { controller, errors } = feedbackFor(native);
    controller.emit(event(1));
    await flush();
    assert.equal(native.listeners.size, 1);
    if (reason === 'mute') controller.setPreferences({ soundEnabled: false, hapticsEnabled: false });
    if (reason === 'background') controller.setActive(false);
    if (reason === 'dispose') controller.dispose();
    await flush();
    assert.equal(native.listeners.size, 0);
    native.status({ isLoaded: true });
    await flush();
    assert.equal(native.calls.play, 0);
    assert.deepEqual(errors, [], 'Cancelar voluntariamente no es un fallo de audio');
    controller.dispose();
  });
}

test('audio: una carga fallida no bloquea el juego y el siguiente evento puede reproducirse', async () => {
  const native = nativePlayer();
  const { controller, errors } = feedbackFor(native);
  controller.emit(event(1));
  await flush();
  native.status({ error: 'Carga fallida' });
  await flush();
  assert.equal(errors.length, 1);
  assert.equal(native.calls.play, 0);
  native.status({ error: undefined, isLoaded: true });
  controller.emit(event(2));
  await flush();
  assert.equal(native.calls.play, 1);
  controller.dispose();
});

test('audio: un fallo de sesión impide reproducir sin provocar errores no manejados y permite reintento', async () => {
  const native = nativePlayer({ isLoaded: true });
  let attempts = 0;
  const initializeAudio = createAudioSession(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('Sesión ocupada');
  });
  const { controller, errors } = feedbackFor(native, initializeAudio);
  controller.emit(event(1));
  await flush();
  assert.equal(errors.length, 1);
  assert.equal(native.calls.play, 0);
  assert.deepEqual(native.calls.seek, []);
  controller.emit(event(2));
  await flush();
  assert.equal(attempts, 2);
  assert.equal(native.calls.play, 1);
  controller.dispose();
});

test('audio: una preferencia false guardada permanece muda antes y después de hidratar', async () => {
  const native = nativePlayer({ isLoaded: true });
  const effect = createEffectPlayer(native.player, async () => {});
  const controller = createFeedbackController({ players: { correct: effect }, haptic: async () => {} });
  const saved = new Map([[STORAGE_KEYS.config, JSON.stringify({ version: 1, soundEnabled: false })]]);
  const loading = deferred();
  const writes = [];
  const store = createAppStore({
    async getItem(key) { await loading.promise; return saved.get(key) ?? null; },
    async setItem(key, value) { writes.push(key); saved.set(key, value); },
  });
  const syncPreferences = () => {
    const snapshot = store.getSnapshot();
    controller.setPreferences({
      soundEnabled: snapshot.hydrated && snapshot.config.soundEnabled,
      hapticsEnabled: snapshot.hydrated && snapshot.config.hapticsEnabled,
    });
  };
  const unsubscribe = store.subscribe(syncPreferences);
  syncPreferences();
  const hydration = store.hydrate();
  controller.emit(event(1));
  loading.resolve();
  await hydration;
  controller.emit(event(2));
  await flush();
  assert.equal(store.getSnapshot().config.soundEnabled, false);
  assert.equal(native.calls.play, 0);
  assert.deepEqual(writes, []);
  await store.updateConfig({ soundEnabled: true });
  assert.equal(controller.emit(event(2)), false, 'Activar no repite eventos silenciados');
  controller.emit(event(3));
  await flush();
  assert.equal(native.calls.play, 1);
  assert.equal(JSON.parse(saved.get(STORAGE_KEYS.config)).soundEnabled, true);
  unsubscribe();
  controller.dispose();
});
