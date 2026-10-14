// Configuración compartida por la interfaz y el motor de partidas.
export const CATEGORIES = /** @type {const} */ ([
  { id: 'capitales', label: 'Capitales', description: 'Ciudades de Colombia', icon: 'map', prompt: 'ADIVINA LA CAPITAL' },
  { id: 'animales', label: 'Animales', description: 'Fauna colombiana', icon: 'paw', prompt: 'ADIVINA EL ANIMAL' },
  { id: 'frutas', label: 'Frutas', description: 'Sabores tropicales', icon: 'fruit', prompt: 'ADIVINA LA FRUTA' },
  { id: 'comidas', label: 'Comidas típicas', description: 'Nuestra cocina', icon: 'food', prompt: 'ADIVINA LA COMIDA' },
  { id: 'aleatoria', label: 'Aleatoria', description: 'Una sorpresa colombiana', icon: 'shuffle', prompt: 'ADIVINA LA PALABRA' },
]);

export const DIFFICULTIES = [
  { id: 'facil', label: 'Fácil', letters: '4–6 letras', minLetters: 4, maxLetters: 6, hints: 2, timeLimit: null, multiplier: 1 },
  { id: 'medio', label: 'Medio', letters: '7–9 letras', minLetters: 7, maxLetters: 9, hints: 1, timeLimit: null, multiplier: 2 },
  { id: 'dificil', label: 'Difícil', letters: '10+ letras', minLetters: 10, maxLetters: null, hints: 0, timeLimit: 90, multiplier: 3 },
];
