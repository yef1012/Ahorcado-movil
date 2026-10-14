// Modelo independiente de React y del adaptador nativo: se prueba con Node.
export const STORAGE_KEYS = Object.freeze({
  stats: '@ahorcado_stats',
  ranking: '@ahorcado_ranking',
  config: '@ahorcado_config',
});

/** @typedef {{playerName:string,soundEnabled:boolean,hapticsEnabled:boolean,theme:'light'|'dark'|'system'}} AppConfig */
/** @typedef {{id:string,playerName:string,score:number,categoryId:string,difficultyId:string,outcome:'won'|'lost',finishedAt:string}} GameResult */
/** @typedef {{played:number,won:number,lost:number,currentStreak:number,bestStreak:number}} Counters */
/** @typedef {{version:number,counters:Counters,processedGameIds:string[],ranking:GameResult[]}} StatsDocument */

/** @type {Readonly<AppConfig>} */
export const DEFAULT_CONFIG = Object.freeze({
  playerName: '', soundEnabled: true, hapticsEnabled: true, theme: 'light',
});

export function normalizePlayerName(value) {
  return String(value).trim().replace(/\s+/gu, ' ').slice(0, 20);
}

/** @returns {StatsDocument} */
export function createEmptyStats() {
  return {
    version: 1,
    counters: { played: 0, won: 0, lost: 0, currentStreak: 0, bestStreak: 0 },
    processedGameIds: [],
    ranking: [],
  };
}

/** @param {Counters} counters */
export function publicStats(counters) {
  return Object.freeze({
    ...counters,
    winPercentage: counters.played === 0 ? 0 : Math.round((counters.won / counters.played) * 100),
  });
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Sólo se admiten resultados terminados, nunca partidas en curso o abandonadas. */
export function validateGameResult(value) {
  if (!isObject(value)
    || typeof value.id !== 'string' || !value.id.trim()
    || typeof value.playerName !== 'string' || !normalizePlayerName(value.playerName)
    || !Number.isSafeInteger(value.score)
    || !['capitales', 'animales', 'frutas', 'comidas', 'aleatoria'].includes(value.categoryId)
    || !['facil', 'medio', 'dificil'].includes(value.difficultyId)
    || !['won', 'lost'].includes(value.outcome)
    || typeof value.finishedAt !== 'string' || !Number.isFinite(Date.parse(value.finishedAt))) {
    throw new Error('El resultado de la partida no es válido.');
  }
  /** @type {GameResult} */
  const result = {
    id: value.id,
    playerName: normalizePlayerName(value.playerName),
    score: value.score,
    categoryId: value.categoryId,
    difficultyId: value.difficultyId,
    outcome: value.outcome,
    finishedAt: new Date(value.finishedAt).toISOString(),
  };
  return Object.freeze(result);
}

/** Puntajes negativos y derrotas son resultados válidos; los empates priorizan la fecha más antigua. */
export function sortRanking(results) {
  return [...results].sort((a, b) => b.score - a.score
    || a.finishedAt.localeCompare(b.finishedAt) || a.id.localeCompare(b.id)).slice(0, 10);
}

/** @param {StatsDocument} document @param {GameResult} result @returns {StatsDocument} */
export function addResult(document, result) {
  if (document.processedGameIds.includes(result.id)) return document;
  const won = result.outcome === 'won';
  const currentStreak = won ? document.counters.currentStreak + 1 : 0;
  return {
    version: 1,
    counters: {
      played: document.counters.played + 1,
      won: document.counters.won + (won ? 1 : 0),
      lost: document.counters.lost + (won ? 0 : 1),
      currentStreak,
      bestStreak: Math.max(document.counters.bestStreak, currentStreak),
    },
    processedGameIds: [...document.processedGameIds, result.id],
    ranking: sortRanking([...document.ranking, result]),
  };
}

/** Se conservan sólo los identificadores para que un Resultado todavía abierto no reaparezca. */
export function clearResults(document) {
  return { ...createEmptyStats(), processedGameIds: [...document.processedGameIds] };
}

/** Rechazar datos dañados evita sustituir silenciosamente información real con ceros. */
export function readStats(raw) {
  if (raw === null) return createEmptyStats();
  const parsed = JSON.parse(raw);
  const counters = parsed?.counters;
  if (!isObject(parsed) || parsed.version !== 1 || !isObject(counters)
    || !['played', 'won', 'lost', 'currentStreak', 'bestStreak'].every((field) => Number.isSafeInteger(counters[field]) && counters[field] >= 0)
    || counters.played !== counters.won + counters.lost
    || counters.currentStreak > counters.bestStreak || counters.bestStreak > counters.won
    || !Array.isArray(parsed.processedGameIds)
    || parsed.processedGameIds.some((id) => typeof id !== 'string' || !id.trim())
    || new Set(parsed.processedGameIds).size !== parsed.processedGameIds.length
    || counters.played > parsed.processedGameIds.length
    || !Array.isArray(parsed.ranking) || parsed.ranking.length > 10
    || parsed.ranking.length > counters.played) {
    throw new Error('Las estadísticas guardadas tienen un formato no válido.');
  }
  const ranking = parsed.ranking.map(validateGameResult);
  if (new Set(ranking.map((row) => row.id)).size !== ranking.length
    || ranking.some((row) => !parsed.processedGameIds.includes(row.id))) {
    throw new Error('El registro de partidas guardado no es válido.');
  }
  return {
    version: 1,
    counters: {
      played: counters.played, won: counters.won, lost: counters.lost,
      currentStreak: counters.currentStreak, bestStreak: counters.bestStreak,
    },
    processedGameIds: parsed.processedGameIds,
    ranking: sortRanking(ranking),
  };
}

/** @param {Partial<AppConfig>} patch @returns {Partial<AppConfig>} */
export function validateConfigPatch(patch) {
  if (!isObject(patch) || Object.keys(patch).some((key) => !Object.hasOwn(DEFAULT_CONFIG, key))
    || ('playerName' in patch && typeof patch.playerName !== 'string')
    || ('soundEnabled' in patch && typeof patch.soundEnabled !== 'boolean')
    || ('hapticsEnabled' in patch && typeof patch.hapticsEnabled !== 'boolean')
    || ('theme' in patch && !['light', 'dark', 'system'].includes(patch.theme ?? ''))) {
    throw new Error('Las preferencias no tienen un formato válido.');
  }
  return { ...patch, ...('playerName' in patch ? { playerName: normalizePlayerName(patch.playerName) } : {}) };
}

/** @returns {Readonly<AppConfig>} */
export function readConfig(raw) {
  if (raw === null) return DEFAULT_CONFIG;
  const parsed = JSON.parse(raw);
  if (!isObject(parsed) || parsed.version !== 1) throw new Error('La configuración guardada no es válida.');
  const { version: _version, ...config } = parsed;
  return Object.freeze({ ...DEFAULT_CONFIG, ...validateConfigPatch(config) });
}
