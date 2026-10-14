import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { createContext, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { AppState, Platform } from 'react-native';

import { createFeedbackController, getGameFeedbackEvent } from '../utils/feedback';
import { createAudioSession, createEffectPlayer, SOUND_PLAYER_OPTIONS } from '../utils/audio';

/** @typedef {(event:import('../utils/feedback').FeedbackEvent|null)=>boolean} EmitFeedback */
const FeedbackContext = createContext(/** @type {EmitFeedback|null} */ (null));

/** @param {import('../utils/feedback').FeedbackType} type */
function haptic(type) {
  if (Platform.OS === 'android') {
    // Usa el motor háptico nativo, sin patrones largos ni bucles de vibración.
    const effects = {
      correct: Haptics.AndroidHaptics.Keyboard_Tap,
      incorrect: Haptics.AndroidHaptics.Context_Click,
      win: Haptics.AndroidHaptics.Confirm,
      loss: Haptics.AndroidHaptics.Reject,
    };
    return Haptics.performAndroidHapticsAsync(effects[type]);
  }
  if (type === 'win') return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  if (type === 'loss') return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  return Haptics.impactAsync(type === 'correct' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Soft);
}

function reportFeedbackError(error) {
  if (__DEV__) console.warn('No se pudo reproducir un efecto del juego.', error);
}

/**
 * Mantener este proveedor sobre AppNavigator. useAudioPlayer libera los cuatro
 * reproductores al desmontar el proveedor; no se crean recursos por letra.
 * @param {{children:import('react').ReactNode, soundEnabled:boolean, hapticsEnabled:boolean}} props
 */
export function GameFeedbackProvider({ children, soundEnabled, hapticsEnabled }) {
  // @ts-expect-error Metro resuelve el WAV como recurso nativo; no es un módulo JS.
  const correct = useAudioPlayer(require('../../assets/sounds/correct.wav'), SOUND_PLAYER_OPTIONS);
  // @ts-expect-error Metro resuelve el WAV como recurso nativo; no es un módulo JS.
  const incorrect = useAudioPlayer(require('../../assets/sounds/incorrect.wav'), SOUND_PLAYER_OPTIONS);
  // @ts-expect-error Metro resuelve el WAV como recurso nativo; no es un módulo JS.
  const win = useAudioPlayer(require('../../assets/sounds/win.wav'), SOUND_PLAYER_OPTIONS);
  // @ts-expect-error Metro resuelve el WAV como recurso nativo; no es un módulo JS.
  const loss = useAudioPlayer(require('../../assets/sounds/loss.wav'), SOUND_PLAYER_OPTIONS);
  const initializeAudio = useMemo(() => createAudioSession(setAudioModeAsync), []);
  const controller = useMemo(() => createFeedbackController({
    players: {
      correct: createEffectPlayer(correct, initializeAudio),
      incorrect: createEffectPlayer(incorrect, initializeAudio),
      win: createEffectPlayer(win, initializeAudio),
      loss: createEffectPlayer(loss, initializeAudio),
    },
    haptic,
    onError: reportFeedbackError,
  }), [correct, incorrect, win, loss, initializeAudio]);

  useLayoutEffect(() => {
    controller.activate();
    controller.setActive(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', (state) => controller.setActive(state === 'active'));
    return () => {
      subscription.remove();
      controller.dispose();
    };
  }, [controller]);

  useLayoutEffect(() => {
    controller.setPreferences({ soundEnabled, hapticsEnabled });
  }, [controller, soundEnabled, hapticsEnabled]);

  useEffect(() => {
    // Se anticipa la preparación; cada efecto también espera esta misma promesa.
    initializeAudio().catch(reportFeedbackError);
  }, [initializeAudio]);

  return <FeedbackContext.Provider value={controller.emit}>{children}</FeedbackContext.Provider>;
}

export function useFeedback() {
  const emit = useContext(FeedbackContext);
  if (!emit) throw new Error('useFeedback requiere GameFeedbackProvider.');
  return emit;
}

/**
 * Puede recibir el mismo estado muchas veces: la deduplicación es global.
 * @param {import('../utils/juego').GameState} state
 * @param {string} gameId Identificador único, estable durante la partida.
 */
export default function useGameFeedback(state, gameId) {
  const emit = useFeedback();
  const { status, lastEvent } = state;
  useEffect(() => {
    emit(getGameFeedbackEvent({ status, lastEvent }, gameId));
  }, [emit, gameId, status, lastEvent]);
}
