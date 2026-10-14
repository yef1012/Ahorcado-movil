import assert from 'node:assert/strict';
import test from 'node:test';

import { colors } from '../src/theme/colors.js';
import { palette } from '../src/theme/tokens.js';
import { resolveThemeColor, resolveThemeMode, resolveThemeStyle } from '../src/theme/themeMapping.js';

const luminance = color => {
  const channels = [1, 3, 5].map(start => Number.parseInt(color.slice(start, start + 2), 16) / 255);
  const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrast = (a, b) => {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
};

test('el tema claro conserva íntegra la paleta aprobada y los estilos originales', () => {
  for (const [key, value] of Object.entries(palette)) assert.equal(colors.light[key], value);
  const style = { width: 100, gap: 7, color: palette.text, backgroundColor: palette.surface, fontSize: 14 };
  assert.equal(resolveThemeStyle(style, false), style);
  assert.equal(resolveThemeColor('#FFFFFF', false, 'background'), '#FFFFFF');
});

test('Sistema sigue al dispositivo y las preferencias explícitas prevalecen', () => {
  assert.equal(resolveThemeMode('system', 'dark'), 'dark');
  assert.equal(resolveThemeMode('system', 'light'), 'light');
  assert.equal(resolveThemeMode('system', null), 'light');
  assert.equal(resolveThemeMode('light', 'dark'), 'light');
  assert.equal(resolveThemeMode('dark', 'light'), 'dark');
  assert.equal(resolveThemeMode('invalid', 'dark'), 'light');
});

test('oscuro cambia las superficies y textos sin cambiar geometría ni blancos sobre verde', () => {
  const style = { width: 100, minHeight: 48, borderRadius: 15, color: palette.primary, backgroundColor: palette.surface, borderColor: palette.border };
  const transformed = resolveThemeStyle(style, true);
  assert.equal(transformed.width, style.width);
  assert.equal(transformed.minHeight, style.minHeight);
  assert.equal(transformed.borderRadius, style.borderRadius);
  assert.equal(transformed.backgroundColor, colors.dark.surface);
  assert.equal(transformed.borderColor, colors.dark.border);
  assert.equal(transformed.color, colors.dark.primary);
  assert.equal(resolveThemeColor('#FFFFFF', true), '#FFFFFF');
  assert.equal(resolveThemeColor('#168B55', true, 'background'), '#168B55');
  assert.equal(resolveThemeColor('#B54141', true, 'background'), '#B54141');
  assert.equal(style.color, palette.primary);
});

test('la paleta oscura mantiene contraste de lectura y distingue errores de aciertos', () => {
  for (const foreground of [colors.dark.text, colors.dark.muted, colors.dark.primary, colors.dark.danger, colors.dark.blue]) {
    for (const background of [colors.dark.background, colors.dark.surface, colors.dark.mint]) {
      assert.ok(contrast(foreground, background) >= 4.5, `${foreground} sobre ${background}`);
    }
  }
  assert.notEqual(colors.dark.primary, colors.dark.danger);
  assert.ok(contrast(colors.dark.onPrimary, colors.dark.buttonPrimary) >= 4.5);
});

test('resolver dos veces estilos ya adaptados es estable', () => {
  const source = { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border };
  const first = resolveThemeStyle(source, true);
  assert.deepEqual(resolveThemeStyle(first, true), first);
  assert.equal(resolveThemeColor('rgba(255, 255, 255, 0.75)', true, 'background'), '#213B2C');
});
