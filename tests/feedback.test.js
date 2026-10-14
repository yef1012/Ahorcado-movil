import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createFeedbackController, getGameFeedbackEvent } from '../src/utils/feedback.js';
import { createGame, gameReducer, normalizeWord } from '../src/utils/juego.js';

const flush = () => new Promise((resolve) => setImmediate(resolve));
const event = (type = 'correct', sequence = 1, gameId = 'partida-1') => ({ gameId, sequence, type });
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

function setup({ soundEnabled = true, hapticsEnabled = true, overrides = {}, haptic } = {}) {
  const calls = { play: [], pause: [], seek: [], haptic: [], errors: [] };
  const players = Object.fromEntries(['correct', 'incorrect', 'win', 'loss'].map((type) => [type, {
    pause() { calls.pause.push(type); },
    seekTo: async (seconds) => { calls.seek.push([type, seconds]); },
    play() { calls.play.push(type); },
    ...overrides[type],
  }]));
  const controller = createFeedbackController({
    players,
    preferences: { soundEnabled, hapticsEnabled },
    haptic: haptic ?? (async (type) => { calls.haptic.push(type); }),
    onError: (error) => calls.errors.push(error),
  });
  return { controller, calls };
}

test('los cuatro eventos reproducen audio desde cero y una respuesta háptica', async () => {
  const { controller, calls } = setup();
  for (const [index, type] of ['correct', 'incorrect', 'win', 'loss'].entries()) {
    assert.equal(controller.emit(event(type, 1, `partida-${index}`)), true);
    await flush();
  }
  assert.deepEqual(calls.play, ['correct', 'incorrect', 'win', 'loss']);
  assert.deepEqual(calls.haptic, calls.play);
  assert.deepEqual(calls.seek.map((item) => item[1]), [0, 0, 0, 0]);
});

test('preferencias independientes: sonido apagado y vibración encendida, y viceversa', async () => {
  const muted = setup({ soundEnabled: false });
  muted.controller.emit(event());
  await flush();
  assert.deepEqual(muted.calls.play, []);
  assert.deepEqual(muted.calls.haptic, ['correct']);
  const noHaptics = setup({ hapticsEnabled: false });
  noHaptics.controller.emit(event());
  await flush();
  assert.deepEqual(noHaptics.calls.play, ['correct']);
  assert.deepEqual(noHaptics.calls.haptic, []);
});

test('cada secuencia se consume una vez incluso con rerenders, reentrada o eventos antiguos', async () => {
  const { controller, calls } = setup();
  assert.equal(controller.emit(event()), true);
  await flush();
  assert.equal(controller.emit(event()), false);
  assert.equal(controller.emit(event('incorrect', 2)), true);
  await flush();
  assert.equal(controller.emit(event('correct', 1)), false);
  assert.deepEqual(calls.play, ['correct', 'incorrect']);
  assert.deepEqual(calls.haptic, ['correct', 'incorrect']);
});

test('una partida terminada no vuelve a emitir, pero jugar de nuevo usa otro identificador', async () => {
  const { controller, calls } = setup();
  controller.emit(event('win', 4));
  await flush();
  assert.equal(controller.emit(event('win', 4)), false);
  assert.equal(controller.emit(event('win', 5)), false);
  assert.equal(controller.emit(event('incorrect', 6)), false);
  assert.equal(controller.emit(event('correct', 1, 'partida-2')), true);
  await flush();
  assert.deepEqual(calls.play, ['win', 'correct']);
});

test('activar sonido o vibración no repite eventos que ocurrieron con ambos apagados', async () => {
  const { controller, calls } = setup({ soundEnabled: false, hapticsEnabled: false });
  controller.emit(event());
  controller.setPreferences({ soundEnabled: true, hapticsEnabled: true });
  assert.equal(controller.emit(event()), false);
  controller.emit(event('incorrect', 2));
  await flush();
  assert.deepEqual(calls.play, ['incorrect']);
  assert.deepEqual(calls.haptic, ['incorrect']);
});

test('desactivar sonido pausa lo activo y cancela un seek pendiente aunque se reactive después', async () => {
  const pending = deferred();
  const { controller, calls } = setup({ overrides: { correct: { seekTo: () => pending.promise } } });
  controller.emit(event());
  const pausedBefore = calls.pause.length;
  controller.setPreferences({ soundEnabled: false, hapticsEnabled: false });
  assert.equal(calls.pause.length, pausedBefore + 4);
  controller.setPreferences({ soundEnabled: true, hapticsEnabled: true });
  pending.resolve();
  await flush();
  assert.deepEqual(calls.play, []);
  controller.emit(event('correct', 2));
  await flush();
  assert.deepEqual(calls.play, ['correct']);
});

test('eventos rápidos sustituyen audio pendiente sin iniciar clips antiguos fuera de orden', async () => {
  const pending = deferred();
  const { controller, calls } = setup({ overrides: { correct: { seekTo: () => pending.promise } } });
  controller.emit(event());
  controller.emit(event('win', 2));
  await flush();
  pending.resolve();
  await flush();
  assert.deepEqual(calls.play, ['win']);
});

test('segundo plano pausa efectos, consume eventos silenciosamente y no los repite al volver', async () => {
  const pending = deferred();
  const { controller, calls } = setup({ overrides: { correct: { seekTo: () => pending.promise } } });
  controller.emit(event());
  controller.setActive(false);
  controller.emit(event('loss', 2));
  pending.resolve();
  await flush();
  assert.deepEqual(calls.play, []);
  assert.deepEqual(calls.haptic, ['correct']);
  controller.setActive(true);
  assert.equal(controller.emit(event('loss', 2)), false);
});

test('desmontar invalida operaciones pendientes y rechaza efectos nuevos; reactivar conserva deduplicación', async () => {
  const pending = deferred();
  const { controller, calls } = setup({ overrides: { correct: { seekTo: () => pending.promise } } });
  controller.emit(event());
  controller.dispose();
  pending.resolve();
  await flush();
  assert.deepEqual(calls.play, []);
  assert.equal(controller.emit(event('win', 2)), false);
  controller.activate();
  assert.equal(controller.emit(event()), false);
  assert.equal(controller.emit(event('win', 2)), true);
  await flush();
  assert.deepEqual(calls.play, ['win']);
});

test('errores nativos síncronos y asíncronos se manejan sin bloquear letras posteriores', async () => {
  const failure = new Error('Hardware no disponible');
  const { controller, calls } = setup({
    overrides: { correct: { seekTo: async () => { throw failure; }, pause() { throw failure; } } },
    haptic: async () => { throw failure; },
  });
  assert.doesNotThrow(() => controller.emit(event()));
  await flush();
  assert.ok(calls.errors.length >= 3);
  assert.doesNotThrow(() => controller.emit(event('win', 2)));
  await flush();
  assert.deepEqual(calls.play, ['win']);
  const syncError = setup({ haptic: () => { throw failure; }, overrides: { correct: { play() { throw failure; } } } });
  assert.doesNotThrow(() => syncError.controller.emit(event()));
  await flush();
  assert.equal(syncError.calls.errors.length, 2);
});

test('un evento inválido no dispara sonido ni vibración', async () => {
  const { controller, calls } = setup();
  for (const value of [null, event('hint'), event('correct', 0), event('correct', 1.5), event('correct', 1, '')]) {
    assert.equal(controller.emit(value), false);
  }
  await flush();
  assert.deepEqual(calls.play, []);
  assert.deepEqual(calls.haptic, []);
});

const word = { id: 'frutas-pina', palabra: 'PIÑA', categoria: 'frutas', descripcion: 'Fruta tropical.', dificultad: 'facil' };
const start = () => createGame({ word, difficultyId: 'facil', now: 0 });
const letter = (state, value) => gameReducer(state, { type: 'letter', letter: value, now: 1000 });

test('integración con reducer: letra repetida conserva secuencia; acertar la última sólo emite victoria', () => {
  let state = start();
  assert.equal(getGameFeedbackEvent(state, 'game-1'), null);
  state = letter(state, 'P');
  assert.equal(getGameFeedbackEvent(state, 'game-1').type, 'correct');
  assert.deepEqual(getGameFeedbackEvent(letter(state, 'P'), 'game-1'), getGameFeedbackEvent(state, 'game-1'));
  for (const value of new Set(normalizeWord(word.palabra))) state = letter(state, value);
  assert.equal(state.status, 'won');
  assert.equal(getGameFeedbackEvent(state, 'game-1').type, 'win');
});

test('integración con reducer: sexto error y fin del cronómetro sólo emiten derrota', () => {
  const lost = ['B', 'C', 'D', 'E', 'F', 'G'].reduce(letter, start());
  assert.equal(getGameFeedbackEvent(lost, 'game-1').type, 'loss');
  const hard = { ...word, palabra: 'BARRANQUILLA', categoria: 'capitales', dificultad: 'dificil' };
  const difficult = createGame({ word: hard, difficultyId: 'dificil', now: 0 });
  const timeout = gameReducer(difficult, { type: 'tick', now: 90000 });
  assert.equal(getGameFeedbackEvent(timeout, 'game-2').type, 'loss');
});

test('las pistas no producen efectos de letra, pero una pista que completa la palabra sí celebra victoria', () => {
  const hint = (state) => gameReducer(state, { type: 'hint', now: 1000 });
  assert.equal(getGameFeedbackEvent(hint(start()), 'game-1'), null);
  let state = ['P', 'I', 'Ñ'].reduce(letter, start());
  state = hint(hint(state));
  assert.equal(state.status, 'won');
  assert.equal(getGameFeedbackEvent(state, 'game-1').type, 'win');
});

test('cuatro recursos locales: RIFF/WAVE PCM mono 16 bits válidos, breves, no vacíos ni saturados', () => {
  const signatures = new Set();
  for (const name of ['correct', 'incorrect', 'win', 'loss']) {
    const wave = readFileSync(new URL(`../assets/sounds/${name}.wav`, import.meta.url));
    assert.equal(wave.toString('ascii', 0, 4), 'RIFF');
    assert.equal(wave.readUInt32LE(4), wave.length - 8);
    assert.equal(wave.toString('ascii', 8, 12), 'WAVE');
    assert.equal(wave.toString('ascii', 12, 16), 'fmt ');
    assert.equal(wave.readUInt32LE(16), 16);
    assert.equal(wave.readUInt16LE(20), 1, 'PCM sin compresión');
    assert.equal(wave.readUInt16LE(22), 1, 'mono');
    assert.equal(wave.readUInt32LE(24), 44100);
    assert.equal(wave.readUInt32LE(28), 88200);
    assert.equal(wave.readUInt16LE(32), 2);
    assert.equal(wave.readUInt16LE(34), 16);
    assert.equal(wave.toString('ascii', 36, 40), 'data');
    assert.equal(wave.readUInt32LE(40), wave.length - 44);
    assert.ok((wave.length - 44) / 88200 > 0.1 && (wave.length - 44) / 88200 < 0.8);
    let peak = 0;
    for (let offset = 44; offset < wave.length; offset += 2) peak = Math.max(peak, Math.abs(wave.readInt16LE(offset)));
    assert.ok(peak > 1000 && peak < 12000, `${name}: señal con margen y sin saturación`);
    assert.equal(wave.readInt16LE(44), 0, 'inicio sin salto');
    assert.equal(wave.readInt16LE(wave.length - 2), 0, 'fin sin salto');
    signatures.add(wave.toString('base64'));
  }
  assert.equal(signatures.size, 4);
});
