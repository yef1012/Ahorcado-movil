import assert from 'node:assert/strict';
import test from 'node:test';
import { PALABRAS } from '../src/data/palabras.js';
import { createGame, gameReducer, normalizeWord } from '../src/utils/juego.js';
import { createGameId, toGameRecord } from '../src/utils/gameRecord.js';
import { createAppStore } from '../src/storage/appStore.js';

const word = PALABRAS.find(item => item.id === 'frutas-pina');
const start = () => createGame({ word, id: createGameId(), difficultyId: 'facil', now: 1000 });
const win = (state) => [...new Set(normalizeWord(state.word.palabra))].reduce((current, letter) => gameReducer(current, { type: 'letter', letter, now: 3000 }), state);

test('solo una partida terminada produce un registro con identidad y puntuación reales', () => {
  const state = start();
  assert.equal(toGameRecord(state, 'Lucía'), null, 'abandonar no produce un registro');
  const finished = win(state);
  assert.equal(finished.id, state.id);
  assert.deepEqual(toGameRecord(finished, 'Lucía'), {
    id: state.id, playerName: 'Lucía', score: 150, categoryId: 'frutas', difficultyId: 'facil', outcome: 'won', finishedAt: '1970-01-01T00:00:03.000Z',
  });
});

test('reintentar asigna otra identidad sin alterar las reglas', () => {
  const previous = win(start());
  const next = gameReducer(previous, { type: 'restart', id: createGameId(), word, now: 5000 });
  assert.notEqual(previous.id, next.id);
  assert.equal(next.status, 'playing');
  assert.equal(next.subtotal, 0);
  assert.equal(toGameRecord(next, 'Lucía'), null);
});

test('Juego y Resultado pueden enviar el mismo final sin duplicarlo, incluso al recargar', async () => {
  const memory = new Map();
  const adapter = { getItem: async key => memory.get(key) ?? null, setItem: async (key, value) => { memory.set(key, value); } };
  const store = createAppStore(adapter);
  await store.hydrate();
  await store.updateConfig({ playerName: 'Lucía', theme: 'dark' });
  const record = toGameRecord(win(start()), 'Lucía');
  await Promise.all([store.recordGame(record), store.recordGame(record)]);
  const reopened = createAppStore(adapter);
  await reopened.hydrate();
  await reopened.recordGame(record);
  assert.equal(reopened.getSnapshot().stats.played, 1);
  assert.equal(reopened.getSnapshot().ranking[0].score, record.score);
  await reopened.clearStats();
  await reopened.recordGame(record);
  assert.equal(reopened.getSnapshot().stats.played, 0, 'un Resultado antiguo no revierte el borrado');
  assert.equal(reopened.getSnapshot().config.playerName, 'Lucía');
  assert.equal(reopened.getSnapshot().config.theme, 'dark');
});
