import { DIFFICULTIES } from '../data/gameOptions.js';

export const MAX_ERRORS = 6;
export const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const WORD_CATEGORIES = ['capitales', 'animales', 'frutas', 'comidas'];

/** @typedef {{id:string, palabra:string, categoria:string, descripcion:string, dificultad:string}} GameWord */
/** @typedef {'playing'|'won'|'lost'} GameStatus */
/** @typedef {'errors'|'timeout'|null} LossReason */
/** @typedef {{type:'correct'|'incorrect'|'hint-description'|'hint-letter'|'timeout', points:number, sequence:number, letter?:string}} GameEvent */
/**
 * @typedef {object} GameState
 * @property {string} id
 * @property {GameWord} word
 * @property {string} requestedCategoryId
 * @property {string} difficultyId
 * @property {string[]} guessedLetters
 * @property {number} errors
 * @property {number} hintsUsed
 * @property {boolean} descriptionVisible
 * @property {number} subtotal
 * @property {GameStatus} status
 * @property {LossReason} reason
 * @property {number} startedAt
 * @property {number|null} finishedAt
 * @property {number|null} deadlineAt
 * @property {number|null} remainingSeconds
 * @property {number} elapsedSeconds
 * @property {GameEvent|null} lastEvent
 * @property {number|null} finalScore
 */

/** Tildes y diéresis no cambian la tecla; Ñ conserva su identidad frente a N. */
export function normalizeWord(value) {
  return String(value).toLocaleUpperCase('es').normalize('NFD')
    .replace(/N\u0303/g, 'Ñ').replace(/\p{M}/gu, '');
}

export function normalizeLetter(value) {
  const normalized = normalizeWord(value);
  return /^[A-ZÑ]$/.test(normalized) ? normalized : '';
}

export function countLetters(value) {
  return (normalizeWord(value).match(/[A-ZÑ]/g) ?? []).length;
}

function getDifficulty(difficultyId) {
  const difficulty = DIFFICULTIES.find((item) => item.id === difficultyId);
  if (!difficulty) throw new Error('El nivel de dificultad no es válido.');
  return difficulty;
}

export function isWordValidForDifficulty(word, difficultyId) {
  const difficulty = getDifficulty(difficultyId);
  const length = countLetters(word.palabra);
  return WORD_CATEGORIES.includes(word.categoria)
    && word.dificultad === difficultyId
    && length >= difficulty.minLetters
    && (difficulty.maxLetters === null || length <= difficulty.maxLetters);
}

/**
 * La selección recibe su azar desde fuera para poder comprobarse sin React.
 * Se excluye la palabra anterior siempre que quede alguna alternativa válida.
 * @param {{words:GameWord[], categoryId:string, difficultyId:string, previousWordId?:string|null, random?:()=>number}} options
 * @returns {GameWord}
 */
export function selectWord({ words, categoryId, difficultyId, previousWordId = null, random = Math.random }) {
  if (categoryId !== 'aleatoria' && !WORD_CATEGORIES.includes(categoryId)) {
    throw new Error('La categoría seleccionada no es válida.');
  }
  getDifficulty(difficultyId);
  const eligible = words.filter((word) => (categoryId === 'aleatoria' || word.categoria === categoryId)
    && isWordValidForDifficulty(word, difficultyId));
  if (!eligible.length) throw new Error('No hay palabras válidas para esta categoría y dificultad.');
  const alternatives = eligible.filter((word) => word.id !== previousWordId);
  const pool = alternatives.length ? alternatives : eligible;
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)));
  return pool[index];
}

/**
 * @param {{word:GameWord, difficultyId:string, requestedCategoryId?:string, now:number, id?:string}} options
 * @returns {GameState}
 */
export function createGame({ word, difficultyId, requestedCategoryId = word.categoria, now, id = '' }) {
  const difficulty = getDifficulty(difficultyId);
  if (!isWordValidForDifficulty(word, difficultyId)) {
    throw new Error('La palabra no corresponde a la dificultad de la partida.');
  }
  if (requestedCategoryId !== 'aleatoria' && requestedCategoryId !== word.categoria) {
    throw new Error('La palabra no corresponde a la categoría de la partida.');
  }
  return {
    id,
    word: { ...word, palabra: word.palabra.normalize('NFC').toLocaleUpperCase('es') },
    requestedCategoryId,
    difficultyId,
    guessedLetters: [],
    errors: 0,
    hintsUsed: 0,
    descriptionVisible: false,
    subtotal: 0,
    status: 'playing',
    reason: null,
    startedAt: now,
    finishedAt: null,
    deadlineAt: difficulty.timeLimit === null ? null : now + difficulty.timeLimit * 1000,
    remainingSeconds: difficulty.timeLimit,
    elapsedSeconds: 0,
    lastEvent: null,
    finalScore: null,
  };
}

/** @param {GameState} state */
export function getWordSlots(state) {
  return Array.from(state.word.palabra, (character) => {
    const normalized = normalizeLetter(character);
    const isLetter = Boolean(normalized);
    return { character, normalized, isLetter, revealed: !isLetter || state.guessedLetters.includes(normalized) };
  });
}

/** @param {GameState} state */
function isComplete(state) {
  return getWordSlots(state).every((slot) => slot.revealed);
}

/** @param {GameState} state */
function updateTime(state, now) {
  const elapsedSeconds = Math.max(0, Math.floor((now - state.startedAt) / 1000));
  const remainingSeconds = state.deadlineAt === null ? null : Math.max(0, Math.ceil((state.deadlineAt - now) / 1000));
  if (elapsedSeconds === state.elapsedSeconds && remainingSeconds === state.remainingSeconds) return state;
  return { ...state, elapsedSeconds, remainingSeconds };
}

/**
 * @param {GameState} state
 * @param {'won'|'lost'} status
 * @param {LossReason} reason
 * @param {number} now
 * @returns {GameState}
 */
function finishGame(state, status, reason, now) {
  const subtotal = state.subtotal + (status === 'won' ? 50 + (MAX_ERRORS - state.errors) * 10 : 0);
  return {
    ...updateTime(state, now),
    status,
    reason,
    subtotal,
    finishedAt: now,
    finalScore: subtotal * getDifficulty(state.difficultyId).multiplier,
  };
}

/**
 * Todas las transiciones son atómicas. La hora llega en cada evento, por lo que
 * tocar una letra antes de que se ejecute el próximo tick no permite saltarse
 * el plazo. No se limita la puntuación a cero: el documento admite descuentos.
 * @param {GameState} state
 * @param {{type:'letter'|'hint'|'tick', now:number, letter?:string}|{type:'restart', now:number, word:GameWord, id?:string}} action
 * @returns {GameState}
 */
export function gameReducer(state, action) {
  if (action.type === 'restart') {
    return createGame({ word: action.word, difficultyId: state.difficultyId, requestedCategoryId: state.requestedCategoryId, now: action.now, id: action.id });
  }
  if (state.status !== 'playing') return state;

  if (state.deadlineAt !== null && action.now >= state.deadlineAt) {
    return finishGame({
      ...state,
      lastEvent: { type: 'timeout', points: 0, sequence: (state.lastEvent?.sequence ?? 0) + 1 },
    }, 'lost', 'timeout', state.deadlineAt);
  }

  if (action.type === 'tick') return updateTime(state, action.now);

  if (action.type === 'letter') {
    const letter = normalizeLetter(action.letter ?? '');
    if (!letter || state.guessedLetters.includes(letter)) return state;
    const appearances = Array.from(normalizeWord(state.word.palabra)).filter((character) => character === letter).length;
    const points = appearances > 0 ? appearances * 10 : -5;
    /** @type {GameState} */
    const next = {
      ...updateTime(state, action.now),
      guessedLetters: [...state.guessedLetters, letter],
      errors: state.errors + (appearances > 0 ? 0 : 1),
      subtotal: state.subtotal + points,
      lastEvent: { type: appearances > 0 ? 'correct' : 'incorrect', letter, points, sequence: (state.lastEvent?.sequence ?? 0) + 1 },
    };
    if (next.errors === MAX_ERRORS) return finishGame(next, 'lost', 'errors', action.now);
    return isComplete(next) ? finishGame(next, 'won', null, action.now) : next;
  }

  if (action.type === 'hint') {
    if (state.hintsUsed >= getDifficulty(state.difficultyId).hints) return state;
    const firstHint = state.hintsUsed === 0;
    const missingLetter = getWordSlots(state).find((slot) => slot.isLetter && !slot.revealed)?.normalized;
    if (!firstHint && !missingLetter) return state;
    /** @type {GameState} */
    const next = {
      ...updateTime(state, action.now),
      hintsUsed: state.hintsUsed + 1,
      descriptionVisible: true,
      subtotal: state.subtotal - 15,
      // La letra dada por una pista no obtiene +10 por aparición: no fue un
      // acierto del teclado. Queda usada para impedir cobrarla después.
      guessedLetters: firstHint ? state.guessedLetters : [...state.guessedLetters, /** @type {string} */ (missingLetter)],
      lastEvent: {
        type: firstHint ? 'hint-description' : 'hint-letter',
        ...(firstHint ? {} : { letter: missingLetter }),
        points: -15,
        sequence: (state.lastEvent?.sequence ?? 0) + 1,
      },
    };
    return isComplete(next) ? finishGame(next, 'won', null, action.now) : next;
  }

  return state;
}
