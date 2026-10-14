/** @typedef {'correct'|'incorrect'|'win'|'loss'} FeedbackType */
/** @typedef {{gameId:string, sequence:number, type:FeedbackType}} FeedbackEvent */
/** @typedef {{pause:()=>void, seekTo:(seconds:number)=>Promise<void>, play:()=>void, prepare?:(signal:AbortSignal)=>Promise<void>}} EffectPlayer */
/** @typedef {{soundEnabled:boolean, hapticsEnabled:boolean}} FeedbackPreferences */

const EFFECT_TYPES = ['correct', 'incorrect', 'win', 'loss'];

/**
 * Una transición final tiene un solo efecto: victoria o derrota. Las pistas
 * ordinarias no se confunden con letras acertadas ni reproducen sonidos extra.
 * @param {Pick<import('./juego.js').GameState, 'status'|'lastEvent'>} state
 * @param {string} gameId
 * @returns {FeedbackEvent|null}
 */
export function getGameFeedbackEvent(state, gameId) {
  if (!gameId || !state.lastEvent) return null;
  const { sequence, type } = state.lastEvent;
  if (state.status === 'won') return { gameId, sequence, type: 'win' };
  if (state.status === 'lost') return { gameId, sequence, type: 'loss' };
  if (type === 'correct' || type === 'incorrect') return { gameId, sequence, type };
  return null;
}

/**
 * Controlador independiente de React y del hardware. Vive sobre la navegación,
 * así que desmontar Juego al mostrar Resultado no corta su efecto final.
 * @param {{
 * players:Partial<Record<FeedbackType, EffectPlayer>>,
 * haptic:(type:FeedbackType)=>Promise<void>,
 * preferences?:FeedbackPreferences,
 * active?:boolean,
 * onError?:(error:unknown)=>void
 * }} options
 */
export function createFeedbackController({ players, haptic, preferences = { soundEnabled: false, hapticsEnabled: false }, active = true, onError = () => {} }) {
  let currentPreferences = { ...preferences };
  let foreground = active;
  let disposed = false;
  let audioRevision = 0;
  /** @type {AbortController|null} */
  let preparation = null;
  // Sólo conserva un contador y un indicador por partida de esta sesión.
  // Volver a montar una pantalla o reabrir Resultado no reinicia este registro.
  const consumed = new Map();

  function report(error) {
    try { onError(error); } catch { /* Los diagnósticos no pueden interrumpir el juego. */ }
  }

  function stopAudio() {
    audioRevision += 1;
    preparation?.abort();
    preparation = null;
    for (const player of Object.values(players)) {
      try { player.pause(); } catch (error) { report(error); }
    }
  }

  async function playEffect(type, revision) {
    const player = players[type];
    if (!player) return;
    const operation = new AbortController();
    preparation = operation;
    try {
      // La sesión y el recurso deben estar listos antes de seekTo/play.
      if (player.prepare) await player.prepare(operation.signal);
      if (operation.signal.aborted || revision !== audioRevision) return;
      // expo-audio conserva la posición al terminar. Cada evento vuelve al inicio.
      await player.seekTo(0);
      // Un cambio de preferencias, otro evento o desmontaje invalida este seek.
      if (disposed || !foreground || !currentPreferences.soundEnabled || revision !== audioRevision) return;
      player.play();
    } catch (error) {
      if (!operation.signal.aborted) report(error);
    } finally {
      if (preparation === operation) preparation = null;
    }
  }

  /** @param {FeedbackEvent|null} event */
  function emit(event) {
    if (disposed || !event || typeof event.gameId !== 'string' || !event.gameId
      || !Number.isSafeInteger(event.sequence) || event.sequence < 1 || !EFFECT_TYPES.includes(event.type)) return false;
    const previous = consumed.get(event.gameId);
    if (previous && (previous.terminal || event.sequence <= previous.sequence)) return false;
    consumed.set(event.gameId, { sequence: event.sequence, terminal: event.type === 'win' || event.type === 'loss' });

    // También se consumen eventos silenciados: activarlos después no los repite.
    if (!foreground) return true;
    if (currentPreferences.soundEnabled) {
      stopAudio();
      void playEffect(event.type, audioRevision);
    }
    if (currentPreferences.hapticsEnabled) {
      try { Promise.resolve(haptic(event.type)).catch(report); } catch (error) { report(error); }
    }
    return true;
  }

  return {
    emit,
    /** @param {FeedbackPreferences} next */
    setPreferences(next) {
      const disablingSound = currentPreferences.soundEnabled && !next.soundEnabled;
      currentPreferences = { soundEnabled: Boolean(next.soundEnabled), hapticsEnabled: Boolean(next.hapticsEnabled) };
      if (disablingSound) stopAudio();
    },
    /** @param {boolean} value */
    setActive(value) {
      foreground = value;
      if (!value) stopAudio();
    },
    // React Strict Mode puede hacer setup/cleanup/setup conservando la instancia.
    activate() { disposed = false; },
    dispose() {
      disposed = true;
      stopAudio();
    },
  };
}
