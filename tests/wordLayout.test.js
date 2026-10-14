import assert from 'node:assert/strict';
import test from 'node:test';

import { PALABRAS } from '../src/data/palabras.js';
import { createGame, getWordSlots } from '../src/utils/juego.js';
import { getWordLayout } from '../src/utils/wordLayout.js';

// Pruebas del cálculo en dp: no renderizan fuentes, Yoga ni SVG nativos y no
// prueban la apariencia o las pulsaciones en un dispositivo Android.
const usefulWidths = [280, 320, 372]; // Ventanas de 320, 360 y 412 dp, menos 40 dp.
const fontScales = [1, 1.3, 2];
const slotsFor = (word) => getWordSlots(createGame({ word, difficultyId: word.dificultad, now: 0 }));

for (const availableWidth of usefulWidths) {
  for (const fontScale of fontScales) {
    test(`todo el banco cabe en grupos de ${availableWidth} dp con escala ${fontScale}`, () => {
      assert.ok(PALABRAS.length >= 60);
      for (const word of PALABRAS) {
        const slots = slotsFor(word);
        const { groups, slotWidth, slotGap } = getWordLayout(slots, availableWidth, fontScale);
        const context = `${word.palabra}: ${availableWidth} dp, escala ${fontScale}`;

        assert.ok(slotWidth >= 28, `Casilla menor de 28 dp: ${context}`);
        assert.ok(slotWidth >= Math.ceil(22 * fontScale), `Casilla insuficiente para la escala: ${context}`);
        assert.ok(groups.length > 0, context);
        assert.deepEqual(groups.flat(), slots.filter((slot) => !/\s/.test(slot.character)), `Cambió el orden de las letras: ${context}`);

        for (const group of groups) {
          const groupWidth = group.length * slotWidth + (group.length - 1) * slotGap;
          assert.ok(groupWidth <= availableWidth, `Grupo de ${groupWidth} dp desborda: ${context}`);
          assert.ok(group.length > 0, context);
          assert.ok(group.every((slot) => !/\s/.test(slot.character)), context);
          // Los objetos mantienen su posición original. Un grupo nunca puede
          // saltarse un espacio para unir el final de una palabra con otra.
          const start = slots.indexOf(group[0]);
          assert.deepEqual(group, slots.slice(start, start + group.length), `Se perdió un espacio entre palabras: ${context}`);
        }
      }
    });
  }
}

test('los espacios separan palabras y una palabra larga se reparte sin perder letras', () => {
  const word = PALABRAS.find((item) => item.id === 'capitales-san-jose-del-guaviare');
  assert.ok(word);
  const slots = slotsFor(word);
  const normal = getWordLayout(slots, 280, 1);
  const large = getWordLayout(slots, 280, 2);
  const textGroups = (layout) => layout.groups.map((group) => group.map((slot) => slot.character).join(''));
  assert.deepEqual(textGroups(normal), ['SAN', 'JOSÉ', 'DEL', 'GUAVIARE']);
  assert.deepEqual(textGroups(large), ['SAN', 'JOSÉ', 'DEL', 'GUAVI', 'ARE']);
  assert.ok(large.slotWidth > normal.slotWidth);
});

test('el cálculo conserva signos visibles y no los convierte en letras ocultas', () => {
  const word = { id: 'signos', palabra: 'AJÍ, CON-PAN!', categoria: 'comidas', dificultad: 'medio', descripcion: 'Caso de prueba con signos.' };
  const slots = slotsFor(word);
  const { groups } = getWordLayout(slots, 280, 1);
  assert.deepEqual(groups.map((group) => group.map((slot) => slot.character).join('')), ['AJÍ,', 'CON-PAN!']);
  const signs = groups.flat().filter((slot) => !slot.isLetter);
  assert.deepEqual(signs.map((slot) => slot.character), [',', '-', '!']);
  assert.ok(signs.every((slot) => slot.revealed));
  // PalabraOculta aplica wordSign (sin subrayado) a estos slots; esta prueba
  // verifica los datos que recibe, no la pintura del componente nativo.
});

test('el cálculo no modifica las casillas ni su estado de revelado', () => {
  const slots = slotsFor(PALABRAS[0]);
  slots[0].revealed = true;
  const snapshot = structuredClone(slots);
  slots.forEach(Object.freeze);
  Object.freeze(slots);
  const layout = getWordLayout(slots, 280, 1.3);
  assert.deepEqual(slots, snapshot);
  assert.equal(layout.groups[0][0], slots[0]);
  assert.equal(layout.groups[0][0].revealed, true);
});

test('una entrada vacía no crea grupos ni anchos inválidos', () => {
  const layout = getWordLayout([], 280, 1);
  assert.deepEqual(layout.groups, []);
  assert.ok(Number.isFinite(layout.slotWidth));
  assert.ok(layout.slotWidth >= 28);
});
