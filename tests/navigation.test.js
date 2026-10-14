import assert from 'node:assert/strict';
import test from 'node:test';
import { CommonActions, StackActions, StackRouter } from '@react-navigation/routers';

import { ROUTES } from '../src/navigation/routes.js';

test('el stack permite repetir sin acumular Juego/Resultado y regresar a Inicio', () => {
  const router = StackRouter({ initialRouteName: ROUTES.SPLASH });
  const options = { routeNames: Object.values(ROUTES), routeParamList: {}, routeGetIdList: {} };
  let state = router.getInitialState(options);
  const dispatch = (action) => {
    const next = router.getStateForAction(state, action, options);
    assert.ok(next, 'La acción debe resolverse en el stack');
    state = next;
  };
  dispatch(StackActions.replace(ROUTES.INICIO));
  dispatch(CommonActions.navigate(ROUTES.CATEGORIA));
  dispatch(CommonActions.navigate(ROUTES.JUEGO, { categoryId: 'aleatoria', difficultyId: 'facil' }));
  const firstGameKey = state.routes.at(-1).key;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    dispatch(StackActions.replace(ROUTES.RESULTADO, { result: { outcome: 'won', score: 170 } }));
    assert.equal(state.routes.length, 3);
    dispatch(StackActions.replace(ROUTES.JUEGO, { categoryId: 'aleatoria', difficultyId: 'facil', previousWordId: 'frutas-borojo' }));
    assert.equal(state.routes.length, 3);
    assert.notEqual(state.routes.at(-1).key, firstGameKey, 'Una key nueva remonta la partida');
    assert.equal(state.routes.at(-1).params.categoryId, 'aleatoria');
  }
  dispatch(StackActions.replace(ROUTES.RESULTADO, { result: { outcome: 'lost', reason: 'errors', score: -30 } }));
  dispatch(StackActions.popTo(ROUTES.INICIO));
  assert.deepEqual(state.routes.map((route) => route.name), [ROUTES.INICIO]);
});
