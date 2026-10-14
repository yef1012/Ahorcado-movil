import { colors } from './colors.js';

// Sólo sustituye colores del diseño aprobado. No altera medidas, fuentes,
// ilustraciones de marca ni blancos usados sobre botones verdes.
const dark = colors.dark;
const group = (values, target) => Object.fromEntries(values.split(' ').map(value => [value, target]));
const foreground = {
  ...group('#173B2C #163C20 #18361E #263228 #375646', dark.text),
  ...group('#718073 #557063 #52705F #7A867B #667B6E #5E6A60 #617063 #6D796E #6F7C71 #829084 #738075 #7A877C #69766B #6B786C #52695B #78847A #657167 #7E8A80 #819486', dark.muted),
  ...group('#086B45 #168B55 #2E7D32 #4CAF50 #255F32 #4D8F59 #286D37 #14743C #26783B', dark.primary),
  ...group('#18749A #286A8D', dark.blue),
  ...group('#B54141 #A74242', dark.danger),
  '#786332': '#E2C982',
  '#EFF6EF': '#2A4535',
};
const background = {
  ...group('#F7FCF8 #F0F9F3', dark.background),
  ...group('#FFFFFF #FFF #F8FCF9 #F1FCF4', dark.surface),
  ...group('#DFF7E8 #EDF9F1 #EDFAF1 #E3F2E4 #EDF8EE #E9F7E9 #D8EED9', dark.mint),
  ...group('#EAF9EF #E8F7E9 #DFF2E0', '#183324'),
  ...group('#C8E8CA #BFE9CF #DAF0DC', '#254D36'),
  ...group('#CDE7D5 #E3EEE4', '#2C4535'),
  ...group('#E3F3F7 #EAF6F8 #DCEEF3', dark.blueSoft),
  ...group('#FBE8E8 #F4DDDD #F7DEDE', dark.dangerSoft),
  ...group('#FBF6E8 #F0E6C8', '#3C3520'),
  'RGBA(255,255,255,0.78)': '#213B2C',
  'RGBA(255,255,255,0.75)': '#213B2C',
  'RGBA(16,49,30,0.45)': 'rgba(0,0,0,0.68)',
};
const border = {
  ...group('#DFEBE1 #DCEBDC #E4EEE4 #CFE3D4 #9FCBAE #AFD3B1 #CDE8D5 #DBEADB #E5EFE5 #E8F1EA #EDF2ED #E1E8E2 #C9D5CA #DFE9DF #FFFFFF', dark.border),
  ...group('#086B45 #168B55 #2E7D32 #4CAF50', dark.primary),
  '#B54141': dark.danger,
  'RGBA(255,255,255,0.8)': dark.border,
};

/** @param {string} preference @param {string | null} systemScheme */
export function resolveThemeMode(preference, systemScheme) {
  return preference === 'dark' || (preference === 'system' && systemScheme === 'dark') ? 'dark' : 'light';
}

/**
 * @template T
 * @param {T} value
 * @param {boolean} isDark
 * @param {'foreground' | 'background' | 'border' | 'shadow'} [role]
 * @returns {T}
 */
export function resolveThemeColor(value, isDark, role = 'foreground') {
  if (!isDark || typeof value !== 'string') return value;
  const key = value.replace(/\s/g, '').toUpperCase();
  const table = role === 'background' ? background : role === 'border' ? border : role === 'shadow' ? {} : foreground;
  return /** @type {T} */ (table[key] || value);
}

/** @template T @param {T} style @param {boolean} isDark @returns {T} */
export function resolveThemeStyle(style, isDark) {
  if (!isDark || !style || typeof style !== 'object') return style;
  return /** @type {T} */ (Object.fromEntries(Object.entries(style).map(([property, value]) => {
    if (property === 'backgroundColor') return [property, resolveThemeColor(value, true, 'background')];
    if (property.startsWith('border') && property.endsWith('Color')) return [property, resolveThemeColor(value, true, 'border')];
    if (property === 'color' || property === 'tintColor' || property === 'textDecorationColor') return [property, resolveThemeColor(value, true)];
    return [property, value];
  })));
}
