// Colores de las capturas y de las reglas finales del CSS de referencia.
export const palette = {
  background: '#F7FCF8', primary: '#086B45', primaryBright: '#168B55',
  green: '#2E7D32', secondary: '#4CAF50', mint: '#DFF7E8', lightGreen: '#A5D6A7',
  text: '#173B2C', muted: '#718073', border: '#DFEBE1', surface: '#FFFFFF',
  blue: '#18749A', blueSoft: '#E3F3F7', danger: '#B54141', dangerSoft: '#FBE8E8',
};

export const fonts = {
  body: 'DMSans_400Regular', medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold', bold: 'DMSans_700Bold',
  heading: 'Manrope_700Bold', extraBold: 'Manrope_800ExtraBold',
};

export const gradients = {
  primary: /** @type {[string, string]} */ (['#168B55', '#086B45']),
  splash: /** @type {[string, string, string]} */ (['#EAF9EF', '#F7FCF8', '#DFF7E8']),
  hero: /** @type {[string, string]} */ (['#E8F7E9', '#C8E8CA']),
  play: /** @type {[string, string, string]} */ (['#15934B', '#08743B', '#17682F']),
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 20, xl: 28 };
export const radii = { small: 12, button: 17, card: 20, large: 28 };
export const shadows = {
  card: {
    shadowColor: '#254B28', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  button: {
    shadowColor: '#086B45', shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.22, shadowRadius: 15, elevation: 6,
  },
};
