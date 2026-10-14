import assert from 'node:assert/strict';
import test from 'node:test';

import { DIFFICULTIES } from '../src/data/gameOptions.js';
import { PALABRAS } from '../src/data/palabras.js';
import {
  ALPHABET,
  MAX_ERRORS,
  countLetters,
  createGame,
  gameReducer,
  getWordSlots,
  isWordValidForDifficulty,
  normalizeLetter,
  normalizeWord,
  selectWord,
} from '../src/utils/juego.js';

const easy = { id: 'frutas-mamon', palabra: 'MAMÓN', categoria: 'frutas', descripcion: 'Fruto de pulpa agridulce.', dificultad: 'facil' };
const medium = { id: 'frutas-guanabana', palabra: 'GUANÁBANA', categoria: 'frutas', descripcion: 'Fruto de pulpa blanca.', dificultad: 'medio' };
const hard = { id: 'capitales-barranquilla', palabra: 'BARRANQUILLA', categoria: 'capitales', descripcion: 'Capital del Atlántico.', dificultad: 'dificil' };
const start = (word = easy, now = 1000) => createGame({ word, difficultyId: word.dificultad, now });
const guess = (state, letter, now = 2000) => gameReducer(state, { type: 'letter', letter, now });
const hint = (state, now = 2000) => gameReducer(state, { type: 'hint', now });
const tick = (state, now) => gameReducer(state, { type: 'tick', now });
const complete = (state, now = 2000) => [...new Set(normalizeWord(state.word.palabra).match(/[A-ZÑ]/g))]
  .reduce((current, letter) => guess(current, letter, now), state);

test('alfabeto español: 27 teclas únicas, incluidas N y Ñ', () => {
  assert.equal(ALPHABET.length, 27);
  assert.equal(new Set(ALPHABET).size, 27);
  assert.ok(ALPHABET.includes('N'));
  assert.ok(ALPHABET.includes('Ñ'));
});

test('normalización: acentos, diéresis y Ñ compuesta/descompuesta', () => {
  assert.equal(normalizeWord('áéíóúü ñ n'), 'AEIOUU Ñ N');
  assert.equal(normalizeWord('N\u0303 A\u0301'), 'Ñ A');
  assert.equal(normalizeLetter('ñ'), 'Ñ');
  assert.equal(normalizeLetter('n'), 'N');
  assert.equal(normalizeLetter('Ó'), 'O');
  assert.equal(normalizeLetter('AB'), '');
  assert.equal(normalizeLetter('!'), '');
  assert.equal(countLetters('PIÑA, PAN-Á!'), 8);
  assert.equal(countLetters('  SAN ANDRÉS  '), 9);
});

test('un acierto revela cada aparición y suma 10 por cada una inmediatamente', () => {
  const previous = start();
  const next = guess(previous, 'm');
  assert.deepEqual(next.guessedLetters, ['M']);
  assert.equal(next.errors, 0);
  assert.equal(next.subtotal, 20);
  assert.equal(next.lastEvent.type, 'correct');
  assert.equal(next.lastEvent.points, 20);
  assert.deepEqual(getWordSlots(next).filter((slot) => slot.revealed).map((slot) => slot.character), ['M', 'M']);
  assert.equal(previous.subtotal, 0, 'el reducer no modifica el estado anterior');
  assert.deepEqual(previous.guessedLetters, []);
});

test('un fallo suma exactamente un error, resta 5 y conserva cinco vidas', () => {
  const state = guess(start(), 'B');
  assert.equal(state.errors, 1);
  assert.equal(MAX_ERRORS - state.errors, 5);
  assert.equal(state.subtotal, -5, 'no se introduce un mínimo de cero ajeno a las reglas');
  assert.equal(state.lastEvent.type, 'incorrect');
});

test('repetir una letra correcta, incorrecta o acentuada no cobra ni resta de nuevo', () => {
  let state = guess(start(), 'O');
  assert.equal(guess(state, 'ó'), state);
  state = guess(state, 'B');
  assert.equal(guess(state, 'b'), state);
  assert.equal(state.errors, 1);
  assert.equal(state.subtotal, 5);
  assert.equal(guess(state, '?'), state);
});

test('seis errores terminan en derrota y bloquean cualquier evento posterior', () => {
  const state = ['B', 'C', 'D', 'E', 'F', 'G'].reduce((current, letter) => guess(current, letter), start());
  assert.equal(state.status, 'lost');
  assert.equal(state.reason, 'errors');
  assert.equal(state.errors, 6);
  assert.equal(state.finalScore, -30);
  assert.equal(guess(state, 'A', 3000), state);
  assert.equal(hint(state, 3000), state);
  assert.equal(tick(state, 999999), state);
});

test('completar gana, suma una sola vez el bono de victoria y vidas', () => {
  const state = complete(guess(start(), 'B'), 6500);
  assert.equal(state.status, 'won');
  assert.equal(state.errors, 1);
  assert.equal(state.subtotal, 50 - 5 + 50 + 5 * 10);
  assert.equal(state.finalScore, 145);
  assert.equal(state.elapsedSeconds, 5);
  assert.equal(state.finishedAt, 6500);
  assert.equal(guess(state, 'N', 9000), state);
  assert.equal(tick(state, 99000), state);
});

test('multiplicador final aplicado al subtotal completo en los tres niveles', () => {
  for (const word of [easy, medium, hard]) {
    const state = complete(start(word));
    const multiplier = DIFFICULTIES.find((item) => item.id === word.dificultad).multiplier;
    assert.equal(state.subtotal, countLetters(word.palabra) * 10 + 50 + 60);
    assert.equal(state.finalScore, state.subtotal * multiplier);
  }
});

test('Fácil: primera pista muestra descripción; segunda revela todas las apariciones de una letra nueva', () => {
  const first = hint(start());
  assert.equal(first.descriptionVisible, true);
  assert.equal(first.hintsUsed, 1);
  assert.equal(first.subtotal, -15);
  assert.deepEqual(first.guessedLetters, []);
  const second = hint(first);
  assert.equal(second.hintsUsed, 2);
  assert.equal(second.subtotal, -30);
  assert.equal(second.lastEvent.type, 'hint-letter');
  assert.equal(second.lastEvent.letter, 'M');
  assert.deepEqual(second.guessedLetters, ['M']);
  assert.equal(getWordSlots(second).filter((slot) => slot.revealed).length, 2);
  assert.equal(guess(second, 'M'), second, 'la letra regalada no permite cobrar +10 después');
  assert.equal(hint(second), second, 'las pistas agotadas no descuentan de nuevo');
});

test('la segunda pista omite letras ya descubiertas y no recibe puntos por acierto', () => {
  let state = guess(start(), 'M');
  state = hint(hint(state));
  assert.equal(state.lastEvent.letter, 'A');
  assert.equal(state.subtotal, 20 - 15 - 15);
  assert.deepEqual(state.guessedLetters, ['M', 'A']);
});

test('una pista puede completar la palabra y ganar con su descuento y bono correctos', () => {
  const word = { ...easy, id: 'frutas-pina', palabra: 'PIÑA' };
  let state = ['P', 'I', 'Ñ'].reduce((current, letter) => guess(current, letter), start(word));
  state = hint(hint(state));
  assert.equal(state.status, 'won');
  assert.equal(state.subtotal, 30 - 30 + 50 + 60);
  assert.equal(state.finalScore, 110);
  assert.equal(state.lastEvent.letter, 'A');
  assert.equal(hint(state), state);
});

test('Medio permite una sola descripción y Difícil no permite pistas', () => {
  const state = hint(start(medium));
  assert.equal(state.hintsUsed, 1);
  assert.equal(state.descriptionVisible, true);
  assert.deepEqual(state.guessedLetters, []);
  assert.equal(hint(state), state);
  const difficult = start(hard);
  assert.equal(hint(difficult), difficult);
});

test('los espacios y signos se ven de inicio; tildes y Ñ no bloquean una victoria', () => {
  const word = { ...medium, palabra: 'SAN ANDRÉS', categoria: 'capitales' };
  let state = start(word);
  assert.equal(getWordSlots(state).find((slot) => slot.character === ' ').revealed, true);
  state = complete(state);
  assert.equal(state.status, 'won');
  assert.ok(getWordSlots(state).every((slot) => slot.revealed));
  assert.ok(getWordSlots(state).some((slot) => slot.character === 'É' && slot.normalized === 'E'));
  let pineapple = start({ ...easy, palabra: 'PIÑA' });
  pineapple = guess(pineapple, 'N');
  assert.equal(pineapple.errors, 1);
  assert.equal(getWordSlots(pineapple).find((slot) => slot.character === 'Ñ').revealed, false);
  pineapple = complete(pineapple);
  assert.equal(pineapple.status, 'won');
  assert.equal(pineapple.errors, 1);
});

test('Fácil y Medio no tienen cuenta regresiva ni derrota por duración', () => {
  for (const word of [easy, medium]) {
    const state = tick(start(word), 999999999);
    assert.equal(state.deadlineAt, null);
    assert.equal(state.remainingSeconds, null);
    assert.equal(state.status, 'playing');
    assert.equal(state.finalScore, null);
  }
});

test('Difícil empieza en 90 segundos y vence exactamente en el plazo', () => {
  let state = start(hard);
  assert.equal(state.remainingSeconds, 90);
  assert.equal(state.deadlineAt, 91000);
  state = tick(state, 90999);
  assert.equal(state.remainingSeconds, 1);
  assert.equal(state.status, 'playing');
  state = tick(state, 91000);
  assert.equal(state.status, 'lost');
  assert.equal(state.reason, 'timeout');
  assert.equal(state.remainingSeconds, 0);
  assert.equal(state.elapsedSeconds, 90);
  assert.equal(state.finishedAt, 91000);
  assert.equal(state.finalScore, 0);
});

test('reanudar tras segundo plano vence por el plazo original, sin tiempo extra', () => {
  const state = tick(start(hard), 9999999);
  assert.equal(state.status, 'lost');
  assert.equal(state.reason, 'timeout');
  assert.equal(state.elapsedSeconds, 90);
  assert.equal(state.finishedAt, 91000);
});

test('la última letra justo al vencer no puede ganar ni sumar puntos antes del próximo tick', () => {
  let state = start(hard);
  for (const letter of ['B', 'A', 'R', 'N', 'Q', 'U', 'I']) state = guess(state, letter, 90000);
  assert.equal(state.status, 'playing');
  const subtotalBeforeDeadline = state.subtotal;
  const justInTime = guess(state, 'L', 90999);
  assert.equal(justInTime.status, 'won');
  const expired = guess(state, 'L', 91000);
  assert.equal(expired.status, 'lost');
  assert.equal(expired.reason, 'timeout');
  assert.equal(expired.subtotal, subtotalBeforeDeadline);
  assert.equal(expired.guessedLetters.includes('L'), false);
  assert.equal(expired.finalScore, subtotalBeforeDeadline * 3);
  assert.equal(hint(state, 91000).reason, 'timeout');
});

test('la derrota aplica el multiplicador también a los descuentos', () => {
  const state = ['C', 'D', 'E', 'F', 'G', 'H'].reduce((current, letter) => guess(current, letter), start(hard));
  assert.equal(state.reason, 'errors');
  assert.equal(state.subtotal, -30);
  assert.equal(state.finalScore, -90);
});

test('selección filtra categoría/nivel y excluye la palabra anterior si existe alternativa', () => {
  const alternate = { ...easy, id: 'frutas-pina', palabra: 'PIÑA' };
  const words = [easy, alternate, medium, hard];
  assert.equal(selectWord({ words, categoryId: 'frutas', difficultyId: 'facil', previousWordId: easy.id, random: () => 0 }).id, alternate.id);
  assert.equal(selectWord({ words, categoryId: 'capitales', difficultyId: 'dificil', previousWordId: hard.id, random: () => 0 }).id, hard.id);
  assert.equal(selectWord({ words, categoryId: 'frutas', difficultyId: 'medio', random: () => 0 }).id, medium.id);
});

test('Aleatoria incluye las cuatro categorías sin aceptar categorías ni longitudes inválidas', () => {
  const words = [
    easy,
    { ...easy, id: 'capitales-tunja', palabra: 'TUNJA', categoria: 'capitales' },
    { ...easy, id: 'animales-danta', palabra: 'DANTA', categoria: 'animales' },
    { ...easy, id: 'comidas-arepa', palabra: 'AREPA', categoria: 'comidas' },
    { ...easy, id: 'invalid-category', categoria: 'inexistente' },
    { ...easy, id: 'invalid-length', palabra: 'GUANÁBANA' },
  ];
  const picked = [0, 0.25, 0.5, 0.75].map((value) => selectWord({ words, categoryId: 'aleatoria', difficultyId: 'facil', random: () => value }).categoria);
  assert.equal(new Set(picked).size, 4);
  assert.throws(() => selectWord({ words, categoryId: 'inexistente', difficultyId: 'facil' }), /categoría/);
  assert.throws(() => selectWord({ words, categoryId: 'frutas', difficultyId: 'medio' }), /No hay palabras/);
});

test('no se inicia una palabra fuera de su nivel o categoría', () => {
  assert.equal(isWordValidForDifficulty(easy, 'facil'), true);
  assert.equal(isWordValidForDifficulty(easy, 'medio'), false);
  assert.throws(() => createGame({ word: easy, difficultyId: 'medio', now: 0 }), /dificultad/);
  assert.throws(() => start({ ...easy, palabra: 'GUANÁBANA' }), /dificultad/);
  assert.throws(() => createGame({ word: easy, difficultyId: 'facil', requestedCategoryId: 'capitales', now: 0 }), /categoría/);
  assert.throws(() => isWordValidForDifficulty(easy, 'otro'), /dificultad/);
});

test('reiniciar limpia letras, errores, pistas, puntaje, eventos y tiempos', () => {
  const played = hint(guess(start(), 'B'));
  const nextWord = { ...easy, id: 'frutas-pina', palabra: 'PIÑA' };
  const state = gameReducer(played, { type: 'restart', word: nextWord, now: 555000 });
  assert.equal(state.word.id, nextWord.id);
  assert.deepEqual(state.guessedLetters, []);
  assert.equal(state.errors, 0);
  assert.equal(state.hintsUsed, 0);
  assert.equal(state.descriptionVisible, false);
  assert.equal(state.subtotal, 0);
  assert.equal(state.status, 'playing');
  assert.equal(state.finalScore, null);
  assert.equal(state.lastEvent, null);
  assert.equal(state.finishedAt, null);
  assert.equal(state.startedAt, 555000);
  assert.equal(state.elapsedSeconds, 0);
  const expired = tick(start(hard), 999999);
  const hardRestart = gameReducer(expired, { type: 'restart', word: hard, now: 888000 });
  assert.equal(hardRestart.status, 'playing');
  assert.equal(hardRestart.remainingSeconds, 90);
  assert.equal(hardRestart.deadlineAt, 978000);
});

test('banco real: mínimo 15 por categoría, tres niveles válidos, IDs únicos y descripciones', () => {
  assert.ok(PALABRAS.length >= 60);
  assert.equal(new Set(PALABRAS.map((word) => word.id)).size, PALABRAS.length);
  for (const categoryId of ['capitales', 'animales', 'frutas', 'comidas']) {
    const categoryWords = PALABRAS.filter((word) => word.categoria === categoryId);
    assert.ok(categoryWords.length >= 15, categoryId);
    assert.equal(new Set(categoryWords.map((word) => normalizeWord(word.palabra))).size, categoryWords.length);
    for (const difficulty of DIFFICULTIES) {
      assert.ok(categoryWords.some((word) => word.dificultad === difficulty.id), `${categoryId}/${difficulty.id}`);
    }
  }
  for (const word of PALABRAS) {
    assert.equal(word.palabra, word.palabra.toLocaleUpperCase('es'));
    assert.ok(word.descripcion.trim().length > 0, word.id);
    assert.ok(isWordValidForDifficulty(word, word.dificultad), word.id);
    assert.equal(complete(start(word)).status, 'won', word.id);
  }
});

test('todas las combinaciones reales y Aleatoria admiten otra partida válida sin repetición inmediata', () => {
  for (const categoryId of ['capitales', 'animales', 'frutas', 'comidas', 'aleatoria']) {
    for (const difficulty of DIFFICULTIES) {
      const first = selectWord({ words: PALABRAS, categoryId, difficultyId: difficulty.id, random: () => 0 });
      const second = selectWord({ words: PALABRAS, categoryId, difficultyId: difficulty.id, previousWordId: first.id, random: () => 0 });
      assert.notEqual(first.id, second.id, `${categoryId}/${difficulty.id}`);
      assert.ok(isWordValidForDifficulty(second, difficulty.id));
      const state = createGame({ word: second, difficultyId: difficulty.id, requestedCategoryId: categoryId, now: 0 });
      assert.equal(state.requestedCategoryId, categoryId);
      assert.equal(state.errors, 0);
      assert.equal(state.status, 'playing');
    }
  }
});
