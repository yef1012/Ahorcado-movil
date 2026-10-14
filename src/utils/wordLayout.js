/** @typedef {{character: string, isLetter: boolean, revealed: boolean}} WordSlot */

const SLOT_GAP = 5;

/**
 * Agrupa las casillas sin mezclar palabras separadas por espacios. Si una
 * palabra es demasiado larga, la divide en grupos que caben en el ancho útil.
 * Este cálculo no mide glifos ni sustituye una revisión visual en Android.
 * @param {WordSlot[]} slots
 * @param {number} availableWidth Ancho útil medido del contenedor, en dp.
 * @param {number} fontScale Escala de texto del dispositivo.
 */
export function getWordLayout(slots, availableWidth, fontScale = 1) {
  const minimumSize = Math.max(28, Math.ceil(22 * fontScale));
  const capacity = Math.max(1, Math.floor((availableWidth + SLOT_GAP) / (minimumSize + SLOT_GAP)));
  /** @type {WordSlot[][]} */
  const words = [[]];
  slots.forEach((slot) => {
    if (/\s/.test(slot.character)) words.push([]);
    else words[words.length - 1].push(slot);
  });
  const longest = Math.max(1, ...words.map((word) => word.length));
  const columns = Math.min(longest, capacity);
  const slotWidth = Math.min(Math.max(36, minimumSize), Math.floor((availableWidth - (columns - 1) * SLOT_GAP) / columns));
  const groups = words.flatMap((word) => {
    /** @type {WordSlot[][]} */
    const chunks = [];
    for (let offset = 0; offset < word.length; offset += capacity) chunks.push(word.slice(offset, offset + capacity));
    return chunks;
  });
  return { groups, slotWidth, slotGap: SLOT_GAP };
}
