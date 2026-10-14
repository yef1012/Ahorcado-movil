import { useCallback, useEffect, useReducer } from 'react';
import { AppState } from 'react-native';

import { CATEGORIES, DIFFICULTIES } from '../data/gameOptions';
import { PALABRAS } from '../data/palabras';
import { createGame, gameReducer, selectWord } from '../utils/juego';
import { createGameId } from '../utils/gameRecord';

// Historial mínimo de la sesión: no persistencia, AsyncStorage ni estadísticas.
// Sobrevive a replace(Juego) al reintentar desde Resultado.
let lastWordId = null;

/** @param {{categoryId:string, difficultyId:string, previousWordId?:string|null}} options */
export default function useJuego({ categoryId, difficultyId, previousWordId = null }) {
  const requestedCategory = CATEGORIES.find((item) => item.id === categoryId) ?? CATEGORIES[0];
  const difficulty = DIFFICULTIES.find((item) => item.id === difficultyId) ?? DIFFICULTIES[1];
  const [state, dispatch] = useReducer(gameReducer, null, () => createGame({
    id: createGameId(),
    word: selectWord({ words: PALABRAS, categoryId: requestedCategory.id, difficultyId: difficulty.id, previousWordId: previousWordId ?? lastWordId }),
    requestedCategoryId: requestedCategory.id,
    difficultyId: difficulty.id,
    now: Date.now(),
  }));

  useEffect(() => {
    lastWordId = state.word.id;
  }, [state.word.id]);

  useEffect(() => {
    if (state.status !== 'playing' || state.deadlineAt === null) return;
    const tick = () => dispatch({ type: 'tick', now: Date.now() });
    // El intervalo sólo refresca la vista. La autoridad es deadlineAt: ni el
    // retraso de JS ni pasar a segundo plano detienen los 90 segundos.
    const interval = setInterval(tick, 250);
    const subscription = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') tick();
    });
    tick();
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [state.status, state.deadlineAt]);

  const seleccionarLetra = useCallback((letter) => {
    dispatch({ type: 'letter', letter, now: Date.now() });
  }, []);
  const usarPista = useCallback(() => {
    dispatch({ type: 'hint', now: Date.now() });
  }, []);
  const reiniciar = useCallback(() => {
    dispatch({
      type: 'restart',
      id: createGameId(),
      word: selectWord({ words: PALABRAS, categoryId: state.requestedCategoryId, difficultyId: state.difficultyId, previousWordId: state.word.id }),
      now: Date.now(),
    });
  }, [state.requestedCategoryId, state.difficultyId, state.word.id]);

  const category = CATEGORIES.find((item) => item.id === state.word.categoria) ?? CATEGORIES[0];
  return { state, category, difficulty, seleccionarLetra, usarPista, reiniciar };
}
