// Efectos originales de El Ahorcado Móvil. No usa muestras de terceros.
// Ejecutar desde el proyecto: node scripts/generate-sounds.cjs
/* global __dirname */
const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const path = require('node:path');

const SAMPLE_RATE = 44100;
const definitions = {
  'correct.wav': [{ frequency: 660, seconds: 0.08 }, { frequency: 880, seconds: 0.12 }],
  'incorrect.wav': [{ frequency: 250, seconds: 0.1 }, { frequency: 190, seconds: 0.13 }],
  'win.wav': [{ frequency: 523.25, seconds: 0.12 }, { frequency: 659.25, seconds: 0.12 }, { frequency: 783.99, seconds: 0.12 }, { frequency: 1046.5, seconds: 0.3 }],
  'loss.wav': [{ frequency: 392, seconds: 0.16 }, { frequency: 329.63, seconds: 0.16 }, { frequency: 261.63, seconds: 0.3 }],
};

function createWave(notes) {
  const samples = [];
  for (const { frequency, seconds } of notes) {
    const length = Math.round(seconds * SAMPLE_RATE);
    for (let i = 0; i < length; i += 1) {
      const time = i / SAMPLE_RATE;
      // Ataque/desvanecimiento suaves, armónico tenue y margen contra recortes.
      const envelope = Math.min(1, time / 0.012) * Math.min(1, (length - 1 - i) / (SAMPLE_RATE * 0.04));
      const fundamental = Math.sin(2 * Math.PI * frequency * time);
      const harmonic = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.1;
      samples.push(Math.round((fundamental + harmonic) * envelope * 0.24 * 32767));
    }
    // Separación breve entre notas sin prolongar el efecto.
    samples.push(...new Array(Math.round(SAMPLE_RATE * 0.012)).fill(0));
  }
  const dataSize = samples.length * 2;
  const wave = Buffer.alloc(44 + dataSize);
  wave.write('RIFF', 0);
  wave.writeUInt32LE(36 + dataSize, 4);
  wave.write('WAVE', 8);
  wave.write('fmt ', 12);
  wave.writeUInt32LE(16, 16);
  wave.writeUInt16LE(1, 20); // PCM lineal.
  wave.writeUInt16LE(1, 22); // Mono.
  wave.writeUInt32LE(SAMPLE_RATE, 24);
  wave.writeUInt32LE(SAMPLE_RATE * 2, 28);
  wave.writeUInt16LE(2, 32);
  wave.writeUInt16LE(16, 34);
  wave.write('data', 36);
  wave.writeUInt32LE(dataSize, 40);
  samples.forEach((sample, index) => wave.writeInt16LE(sample, 44 + index * 2));
  return wave;
}

const directory = path.resolve(__dirname, '../assets/sounds');
fs.mkdirSync(directory, { recursive: true });
for (const [name, notes] of Object.entries(definitions)) {
  const bytes = createWave(notes);
  fs.writeFileSync(path.join(directory, name), bytes);
  console.log(`${name}: ${bytes.length} bytes, ${((bytes.length - 44) / (SAMPLE_RATE * 2)).toFixed(3)} s`);
}
