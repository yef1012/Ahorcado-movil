import {
  DEFAULT_CONFIG, STORAGE_KEYS, addResult, clearResults, createEmptyStats,
  publicStats, readConfig, readStats, validateConfigPatch, validateGameResult,
} from './model.js';

/** @typedef {{getItem:(key:string)=>Promise<string|null>,setItem:(key:string,value:string)=>Promise<unknown>}} StorageAdapter */
/** @typedef {{type:'config',patch:Partial<import('./model.js').AppConfig>}|{type:'game',result:import('./model.js').GameResult}|{type:'clear'}} Mutation */

/**
 * Un solo escritor serializa lecturas, resultados, preferencias y borrados.
 * @ahorcado_stats es la fuente canónica: contadores, IDs consumidos y top 10
 * se guardan juntos. @ahorcado_ranking es una copia reconstruible. Así, una
 * interrupción entre ambas escrituras no duplica partidas ni pierde puntajes.
 * Los datos originales jamás se sustituyen por defaults después de un error
 * de lectura. Las mutaciones fallidas permanecen en memoria para retry().
 * @param {StorageAdapter} adapter
 */
export function createAppStore(adapter) {
  let document = createEmptyStats();
  let config = DEFAULT_CONFIG;
  let rankingDirty = false;
  /** @type {string[]} */
  let corruptedKeys = [];
  let recoveryRequested = false;
  /** @type {Mutation[]} */
  const pending = [];
  const listeners = new Set();
  /** @type {Promise<unknown>} */
  let tail = Promise.resolve();
  let snapshot = Object.freeze({
    hydrated: false, loading: false, recoveryAvailable: false, error: /** @type {string|null} */ (null),
    stats: publicStats(document.counters), ranking: Object.freeze([...document.ranking]), config,
  });

  function publish(status = {}) {
    snapshot = Object.freeze({
      ...snapshot, ...status,
      stats: publicStats(document.counters), ranking: Object.freeze([...document.ranking]), config,
    });
    listeners.forEach((listener) => listener());
  }

  async function load() {
    if (snapshot.hydrated) return true;
    try {
      const [statsRaw, configRaw, rankingRaw] = await Promise.all([
        adapter.getItem(STORAGE_KEYS.stats), adapter.getItem(STORAGE_KEYS.config), adapter.getItem(STORAGE_KEYS.ranking),
      ]);
      // Primero se validan ambas fuentes; ningún dato parcial se publica.
      let nextDocument = createEmptyStats();
      let nextConfig = DEFAULT_CONFIG;
      corruptedKeys = [];
      try { nextDocument = readStats(statsRaw); } catch { corruptedKeys.push(STORAGE_KEYS.stats); }
      try { nextConfig = readConfig(configRaw); } catch { corruptedKeys.push(STORAGE_KEYS.config); }
      if (corruptedKeys.length) {
        publish({
          recoveryAvailable: true,
          error: 'Hay datos locales dañados. Puedes reintentar su lectura o confirmar que se restablezcan únicamente los datos dañados.',
        });
        return false;
      }
      document = nextDocument;
      config = nextConfig;
      const expectedRanking = JSON.stringify(document.ranking);
      // Una copia dañada/obsoleta se repara desde el documento canónico.
      rankingDirty = rankingRaw !== expectedRanking && !(rankingRaw === null && document.ranking.length === 0);
      publish({ hydrated: true, recoveryAvailable: false });
      return true;
    } catch {
      publish({ error: 'No se pudieron leer los datos locales. Se conservaron sin sobrescribir. Intenta cargar de nuevo.' });
      return false;
    }
  }

  async function writeRanking() {
    if (!rankingDirty) return;
    await adapter.setItem(STORAGE_KEYS.ranking, JSON.stringify(document.ranking));
    rankingDirty = false;
  }

  async function drain() {
    publish({ loading: true });
    try {
      // Sólo se ejecuta después de la confirmación explícita de la interfaz.
      // Las claves sanas se vuelven a leer y no se reemplazan.
      if (recoveryRequested) {
        while (corruptedKeys.length) {
          const key = corruptedKeys[0];
          const replacement = key === STORAGE_KEYS.stats ? createEmptyStats() : { version: 1, ...DEFAULT_CONFIG };
          await adapter.setItem(key, JSON.stringify(replacement));
          corruptedKeys.shift();
        }
        recoveryRequested = false;
      }
      if (!(await load())) return false;
      await writeRanking();
      while (pending.length) {
        const operation = pending[0];
        if (operation.type === 'config') {
          const nextConfig = Object.freeze({ ...config, ...operation.patch });
          await adapter.setItem(STORAGE_KEYS.config, JSON.stringify({ version: 1, ...nextConfig }));
          config = nextConfig;
        } else {
          const nextDocument = operation.type === 'clear' ? clearResults(document) : addResult(document, operation.result);
          if (nextDocument !== document) {
            await adapter.setItem(STORAGE_KEYS.stats, JSON.stringify(nextDocument));
            document = nextDocument;
            rankingDirty = true;
          }
        }
        // Tras guardar la fuente, nunca se aplica de nuevo la operación aunque
        // falle la copia del ranking. Una recarga puede reconstruir esa copia.
        pending.shift();
        publish();
        await writeRanking();
      }
      publish({ error: null });
      return true;
    } catch {
      publish({ error: 'No se pudieron guardar todos los cambios. Reintenta antes de cerrar la aplicación.' });
      return false;
    } finally {
      publish({ loading: false });
    }
  }

  function schedule() {
    const task = tail.then(drain, drain);
    tail = task;
    return task;
  }

  function enqueue(operation) {
    pending.push(operation);
    return schedule();
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    hydrate: schedule,
    retry: schedule,
    hasRecordedGame: (id) => document.processedGameIds.includes(id),
    recoverCorruptedData() {
      recoveryRequested = corruptedKeys.length > 0;
      return schedule();
    },
    /** @param {Partial<import('./model.js').AppConfig>} patch */
    updateConfig(patch) {
      try {
        return enqueue({ type: 'config', patch: validateConfigPatch(patch) });
      } catch {
        publish({ error: 'No se guardó la configuración: contiene valores no válidos.' });
        return Promise.resolve(false);
      }
    },
    /** @param {import('./model.js').GameResult} result */
    recordGame(result) {
      try {
        return enqueue({ type: 'game', result: validateGameResult(result) });
      } catch {
        publish({ error: 'No se registró la partida: el resultado está incompleto o no es válido.' });
        return Promise.resolve(false);
      }
    },
    clearStats: () => enqueue({ type: 'clear' }),
  };
}
