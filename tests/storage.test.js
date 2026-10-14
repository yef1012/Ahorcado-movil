import assert from 'node:assert/strict';
import test from 'node:test';

import { createAppStore } from '../src/storage/appStore.js';
import { DEFAULT_CONFIG, STORAGE_KEYS } from '../src/storage/model.js';

function memoryStorage(initial = []) {
  const data = new Map(initial);
  const writes = [];
  const failReads = new Set();
  const failWrites = new Set();
  const failAfterWrites = new Set();
  return {
    data, writes, failReads, failWrites, failAfterWrites,
    async getItem(key) {
      if (failReads.has(key)) throw new Error('Lectura no disponible');
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      if (failWrites.has(key)) throw new Error('Escritura no disponible');
      data.set(key, value);
      writes.push({ key, value });
      if (failAfterWrites.has(key)) throw new Error('Confirmación perdida después de escribir');
    },
  };
}

function result(id, overrides = {}) {
  return {
    id: `partida-${id}`, playerName: 'Yefry', score: 170,
    categoryId: 'frutas', difficultyId: 'facil', outcome: 'won',
    finishedAt: '2026-10-13T12:00:00.000Z', ...overrides,
  };
}

test('almacenamiento nuevo: valores seguros y carga sin escrituras innecesarias', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  assert.equal(store.getSnapshot().hydrated, false);
  assert.equal(await store.hydrate(), true);
  assert.deepEqual(store.getSnapshot().config, DEFAULT_CONFIG);
  assert.deepEqual(store.getSnapshot().stats, { played: 0, won: 0, lost: 0, currentStreak: 0, bestStreak: 0, winPercentage: 0 });
  assert.deepEqual(store.getSnapshot().ranking, []);
  assert.equal(store.getSnapshot().loading, false);
  assert.equal(adapter.writes.length, 0);
});

test('guardar y recuperar estadísticas: 7 victorias de 10 partidas equivalen al 70 %', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  for (let index = 0; index < 10; index += 1) {
    assert.equal(await store.recordGame(result(index, { outcome: index < 7 ? 'won' : 'lost' })), true);
  }
  const reopened = createAppStore(adapter);
  await reopened.hydrate();
  assert.deepEqual(reopened.getSnapshot().stats, { played: 10, won: 7, lost: 3, currentStreak: 0, bestStreak: 7, winPercentage: 70 });
  assert.deepEqual([...adapter.data.keys()].sort(), [STORAGE_KEYS.stats, STORAGE_KEYS.ranking].sort());
});

test('racha actual se reinicia al perder y mejor racha histórica se conserva', async () => {
  const store = createAppStore(memoryStorage());
  const outcomes = ['won', 'won', 'won', 'lost', 'won', 'won'];
  await Promise.all(outcomes.map((outcome, index) => store.recordGame(result(index, { outcome }))));
  assert.equal(store.getSnapshot().stats.currentStreak, 2);
  assert.equal(store.getSnapshot().stats.bestStreak, 3);
  assert.equal(store.getSnapshot().stats.winPercentage, 83);
});

test('ranking: sólo los 10 mejores resultados reales, ordenados de mayor a menor', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  const scores = [8, 16, 30, 18, 0, -15, 90, 68, 54, 11, -5, 25, 7, 60];
  await Promise.all(scores.map((score, index) => store.recordGame(result(index, { score, outcome: index % 2 ? 'lost' : 'won' }))));
  const ranking = store.getSnapshot().ranking;
  assert.equal(ranking.length, 10);
  assert.deepEqual(ranking.map((row) => row.score), [90, 68, 60, 54, 30, 25, 18, 16, 11, 8]);
  assert.ok(ranking.some((row) => row.outcome === 'lost'));
  const reopened = createAppStore(adapter);
  await reopened.hydrate();
  assert.deepEqual(reopened.getSnapshot().ranking, ranking);
  assert.deepEqual(Object.keys(ranking[0]).sort(), ['id', 'playerName', 'score', 'categoryId', 'difficultyId', 'outcome', 'finishedAt'].sort());
});

test('ranking conserva puntajes negativos y nombre original aunque se edite el perfil', async () => {
  const store = createAppStore(memoryStorage());
  await store.recordGame(result(1, { score: -30, outcome: 'lost', playerName: '  Ana   María ' }));
  await store.updateConfig({ playerName: 'Carlos' });
  assert.equal(store.getSnapshot().ranking[0].score, -30);
  assert.equal(store.getSnapshot().ranking[0].playerName, 'Ana María');
});

test('duplicados concurrentes, nuevas instancias y renders repetidos no suman la misma partida', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  await Promise.all(Array.from({ length: 8 }, () => store.recordGame(result(1))));
  assert.equal(store.getSnapshot().stats.played, 1);
  assert.equal(store.getSnapshot().ranking.length, 1);
  const reopened = createAppStore(adapter);
  await reopened.recordGame(result(1));
  assert.equal(reopened.getSnapshot().stats.played, 1);
  assert.equal(reopened.hasRecordedGame('partida-1'), true);
});

test('las partidas abandonadas, activas o incompletas no se registran', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  for (const invalid of [
    result(1, { outcome: 'playing' }), result(2, { outcome: 'abandoned' }),
    result(3, { score: NaN }), result(4, { playerName: '' }), result(5, { finishedAt: 'ayer' }),
  ]) {
    assert.equal(await store.recordGame(invalid), false);
  }
  assert.equal(store.getSnapshot().stats.played, 0);
  assert.equal(adapter.writes.length, 0);
});

test('nombre y todas las preferencias persisten al recrear el almacén', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  await store.updateConfig({ playerName: '  María   José ', soundEnabled: false, hapticsEnabled: false, theme: 'system' });
  const reopened = createAppStore(adapter);
  await reopened.hydrate();
  assert.deepEqual(reopened.getSnapshot().config, {
    playerName: 'María José', soundEnabled: false, hapticsEnabled: false, theme: 'system',
  });
  await reopened.updateConfig({ theme: 'dark' });
  assert.equal(JSON.parse(adapter.data.get(STORAGE_KEYS.config)).theme, 'dark');
});

test('cambios concurrentes y anteriores a hidratar fusionan preferencias sin perder el nombre', async () => {
  const adapter = memoryStorage();
  await createAppStore(adapter).updateConfig({ playerName: 'Lucía', hapticsEnabled: false });
  const reopened = createAppStore(adapter);
  await Promise.all([reopened.updateConfig({ theme: 'dark' }), reopened.updateConfig({ soundEnabled: false })]);
  assert.deepEqual(reopened.getSnapshot().config, {
    playerName: 'Lucía', soundEnabled: false, hapticsEnabled: false, theme: 'dark',
  });
});

test('borrar estadísticas elimina el ranking y conserva nombre, preferencias e IDs consumidos', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  await store.updateConfig({ playerName: 'Camilo', theme: 'dark', soundEnabled: false });
  await store.recordGame(result(1));
  await store.clearStats();
  assert.equal(store.getSnapshot().stats.played, 0);
  assert.deepEqual(store.getSnapshot().ranking, []);
  const reopened = createAppStore(adapter);
  await reopened.hydrate();
  assert.equal(reopened.getSnapshot().config.playerName, 'Camilo');
  assert.equal(reopened.getSnapshot().config.theme, 'dark');
  assert.equal(reopened.getSnapshot().config.soundEnabled, false);
  await reopened.recordGame(result(1));
  assert.equal(reopened.getSnapshot().stats.played, 0, 'Resultado abierto antes del borrado no reaparece');
  await reopened.recordGame(result(2));
  assert.equal(reopened.getSnapshot().stats.played, 1, 'una partida nueva sí se registra');
});

test('resultados, borrado y preferencias concurrentes respetan el orden de las acciones', async () => {
  const store = createAppStore(memoryStorage());
  await Promise.all([
    store.recordGame(result(1)), store.clearStats(), store.recordGame(result(1)),
    store.updateConfig({ playerName: 'Luz' }), store.recordGame(result(2, { outcome: 'lost' })),
  ]);
  assert.equal(store.getSnapshot().stats.played, 1);
  assert.equal(store.getSnapshot().stats.lost, 1);
  assert.equal(store.getSnapshot().ranking[0].id, 'partida-2');
  assert.equal(store.getSnapshot().config.playerName, 'Luz');
});

test('un fallo de lectura no sobrescribe datos y permite guardar la operación pendiente al reintentar', async () => {
  const adapter = memoryStorage();
  await createAppStore(adapter).recordGame(result(1));
  const before = new Map(adapter.data);
  adapter.failReads.add(STORAGE_KEYS.stats);
  const store = createAppStore(adapter);
  assert.equal(await store.recordGame(result(2)), false);
  assert.equal(store.getSnapshot().hydrated, false);
  assert.ok(store.getSnapshot().error);
  assert.deepEqual(adapter.data, before);
  adapter.failReads.clear();
  assert.equal(await store.retry(), true);
  assert.equal(store.getSnapshot().stats.played, 2);
  assert.equal(store.getSnapshot().error, null);
});

test('un fallo al guardar conserva la operación para retry y nunca publica un resultado no persistido', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  adapter.failWrites.add(STORAGE_KEYS.stats);
  assert.equal(await store.recordGame(result(1)), false);
  assert.equal(store.getSnapshot().stats.played, 0);
  assert.equal(store.hasRecordedGame('partida-1'), false);
  adapter.failWrites.clear();
  assert.equal(await store.retry(), true);
  assert.equal(store.getSnapshot().stats.played, 1);
  assert.equal(await store.recordGame(result(1)), true);
  assert.equal(store.getSnapshot().stats.played, 1);
});

test('un error después de guardar físicamente sigue siendo idempotente al reintentar', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  adapter.failAfterWrites.add(STORAGE_KEYS.stats);
  assert.equal(await store.recordGame(result(1)), false);
  assert.ok(adapter.data.get(STORAGE_KEYS.stats));
  adapter.failAfterWrites.clear();
  assert.equal(await store.retry(), true);
  assert.equal(store.getSnapshot().stats.played, 1);
  const reopened = createAppStore(adapter);
  await reopened.recordGame(result(1));
  assert.equal(reopened.getSnapshot().stats.played, 1);
});

test('fallo parcial del ranking: la fuente canónica recupera el puntaje al reiniciar sin duplicar', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  adapter.failWrites.add(STORAGE_KEYS.ranking);
  assert.equal(await store.recordGame(result(1, { score: 420 })), false);
  assert.equal(store.getSnapshot().stats.played, 1);
  assert.equal(store.hasRecordedGame('partida-1'), true);
  adapter.failWrites.clear();
  const reopened = createAppStore(adapter);
  await reopened.hydrate();
  await reopened.recordGame(result(1, { score: 420 }));
  assert.equal(reopened.getSnapshot().stats.played, 1);
  assert.equal(reopened.getSnapshot().ranking[0].score, 420);
  assert.deepEqual(JSON.parse(adapter.data.get(STORAGE_KEYS.ranking)), reopened.getSnapshot().ranking);
});

test('fallo parcial de borrar ranking no recupera estadísticas antiguas al reiniciar', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  await store.recordGame(result(1));
  adapter.failWrites.add(STORAGE_KEYS.ranking);
  assert.equal(await store.clearStats(), false);
  assert.equal(store.getSnapshot().stats.played, 0);
  adapter.failWrites.clear();
  const reopened = createAppStore(adapter);
  await reopened.hydrate();
  await reopened.recordGame(result(1));
  assert.equal(reopened.getSnapshot().stats.played, 0);
  assert.deepEqual(JSON.parse(adapter.data.get(STORAGE_KEYS.ranking)), []);
});

test('estadísticas corruptas no se sobrescriben sin confirmación; reparación conserva configuración sana', async () => {
  const adapter = memoryStorage();
  await createAppStore(adapter).updateConfig({ playerName: 'Sara', theme: 'dark' });
  adapter.data.set(STORAGE_KEYS.stats, '{json roto');
  const before = new Map(adapter.data);
  const store = createAppStore(adapter);
  assert.equal(await store.hydrate(), false);
  assert.equal(await store.retry(), false);
  assert.equal(store.getSnapshot().recoveryAvailable, true);
  assert.deepEqual(adapter.data, before);
  assert.equal(await store.recoverCorruptedData(), true);
  assert.equal(store.getSnapshot().hydrated, true);
  assert.equal(store.getSnapshot().recoveryAvailable, false);
  assert.equal(store.getSnapshot().config.playerName, 'Sara');
  assert.equal(store.getSnapshot().config.theme, 'dark');
});

test('configuración corrupta se repara con confirmación sin borrar estadísticas ni ranking', async () => {
  const adapter = memoryStorage();
  await createAppStore(adapter).recordGame(result(1));
  adapter.data.set(STORAGE_KEYS.config, JSON.stringify({ version: 1, soundEnabled: 'no' }));
  const store = createAppStore(adapter);
  assert.equal(await store.hydrate(), false);
  assert.equal(await store.recoverCorruptedData(), true);
  assert.equal(store.getSnapshot().stats.played, 1);
  assert.equal(store.getSnapshot().ranking[0].id, 'partida-1');
  assert.deepEqual(store.getSnapshot().config, DEFAULT_CONFIG);
});

test('una copia del ranking dañada se reconstruye a partir de la fuente sana', async () => {
  const adapter = memoryStorage();
  await createAppStore(adapter).recordGame(result(1));
  adapter.data.set(STORAGE_KEYS.ranking, 'datos dañados');
  const store = createAppStore(adapter);
  assert.equal(await store.hydrate(), true);
  assert.equal(store.getSnapshot().stats.played, 1);
  assert.equal(JSON.parse(adapter.data.get(STORAGE_KEYS.ranking))[0].id, 'partida-1');
});

test('fallo al guardar nombre retiene el cambio y retry lo persiste', async () => {
  const adapter = memoryStorage();
  const store = createAppStore(adapter);
  adapter.failWrites.add(STORAGE_KEYS.config);
  assert.equal(await store.updateConfig({ playerName: 'Nicolás' }), false);
  assert.equal(store.getSnapshot().config.playerName, '');
  adapter.failWrites.clear();
  assert.equal(await store.retry(), true);
  const reopened = createAppStore(adapter);
  await reopened.hydrate();
  assert.equal(reopened.getSnapshot().config.playerName, 'Nicolás');
});

test('suscripciones reciben datos confirmados y pueden darse de baja', async () => {
  const store = createAppStore(memoryStorage());
  const observed = [];
  const unsubscribe = store.subscribe(() => observed.push(store.getSnapshot()));
  await store.recordGame(result(1));
  assert.equal(observed.at(-1).stats.played, 1);
  assert.equal(observed.at(-1).loading, false);
  const count = observed.length;
  unsubscribe();
  await store.recordGame(result(2));
  assert.equal(observed.length, count);
});
