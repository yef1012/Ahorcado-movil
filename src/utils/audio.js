/** Configuración de reproducción de efectos para expo-audio (SDK 57). */
export const GAME_AUDIO_MODE = Object.freeze({
  allowsRecording: false,
  allowsBackgroundRecording: false,
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
  interruptionMode: 'mixWithOthers',
});

// En Expo Go el require puede apuntar a Metro: guardar el WAV en caché antes de cargarlo.
export const SOUND_PLAYER_OPTIONS = Object.freeze({ downloadFirst: true });

/**
 * Comparte la inicialización entre los cuatro efectos. Un fallo permite reintentar
 * en el siguiente evento, sin rechazos no manejados ni cambios en las preferencias.
 * @param {(mode:typeof GAME_AUDIO_MODE)=>Promise<void>} setAudioMode
 */
export function createAudioSession(setAudioMode) {
  /** @type {Promise<void>|null} */
  let pending = null;
  return function initializeAudio() {
    if (!pending) {
      pending = Promise.resolve().then(() => setAudioMode(GAME_AUDIO_MODE)).catch((error) => {
        pending = null;
        throw error;
      });
    }
    return pending;
  };
}

/**
 * @typedef {{isLoaded:boolean,error?:string|null}} SoundStatus
 * @typedef {object} LoadablePlayer
 * @property {SoundStatus} currentStatus
 * @property {(event:'playbackStatusUpdate',listener:(status:SoundStatus)=>void)=>{remove:()=>void}} addListener
 */

/**
 * Espera carga real, no un retardo fijo. currentStatus.isLoaded también reconoce
 * STATE_ENDED en Android; player.isLoaded por sí solo impediría repetir ese clip.
 * La cancelación retira el listener al silenciar, cambiar de efecto o desmontar.
 * @param {LoadablePlayer} player
 * @param {AbortSignal} signal
 * @param {number} timeoutMs
 * @returns {Promise<void>}
 */
export function waitForSoundReady(player, signal, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    /** @type {{remove:()=>void}|undefined} */
    let subscription;
    /** @type {ReturnType<typeof setTimeout>|undefined} */
    let timer;
    /** @param {unknown} [error] */
    function finish(error = undefined) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      try { subscription?.remove(); } catch (cleanupError) { error ??= cleanupError; }
      if (error) reject(error);
      else resolve();
    }
    function abort() { finish(new Error('Preparación de sonido cancelada.')); }
    /** @param {SoundStatus} status */
    function check(status) {
      if (status.error) finish(new Error(`No se pudo cargar el sonido: ${status.error}`));
      else if (status.isLoaded) finish();
    }
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort);
    timer = setTimeout(() => finish(new Error('El sonido no terminó de cargar a tiempo.')), timeoutMs);
    try {
      subscription = player.addListener('playbackStatusUpdate', check);
      // También cubre una notificación sincrónica durante la suscripción.
      if (settled) subscription.remove();
      else check(player.currentStatus);
    } catch (error) { finish(error); }
  });
}

/**
 * Adaptador pequeño y comprobable. useAudioPlayer sigue siendo dueño del recurso
 * nativo y de su liberación; aquí no se crean ni se liberan reproductores.
 * @param {LoadablePlayer & {volume:number,muted:boolean,loop:boolean,pause:()=>void,play:()=>void,seekTo:(seconds:number)=>Promise<void>}} player
 * @param {()=>Promise<void>} initializeAudio
 */
export function createEffectPlayer(player, initializeAudio) {
  return {
    pause: () => player.pause(),
    seekTo: (seconds) => player.seekTo(seconds),
    play: () => player.play(),
    /** @param {AbortSignal} signal */
    async prepare(signal) {
      await initializeAudio();
      await waitForSoundReady(player, signal);
      if (signal.aborted) return;
      player.volume = 1;
      player.muted = false;
      player.loop = false;
    },
  };
}
