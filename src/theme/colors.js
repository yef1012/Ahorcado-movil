import { palette } from './tokens.js';
export const colors = {
  light: { ...palette, textSecondary: palette.muted, onPrimary: '#FFFFFF', notification: palette.danger, buttonPrimary: palette.primary },
  dark: {
    background: '#0E1B15', surface: '#192D23', text: '#F0F8F2',
    muted: '#B2C5B8', textSecondary: '#B2C5B8', border: '#385943',
    primary: '#74DDA2', primaryBright: '#7ADF9F', green: '#8ADD93', secondary: '#8ADD93',
    mint: '#203F2E', lightGreen: '#345941', blue: '#8ACEEC', blueSoft: '#183641',
    danger: '#FFAAAA', dangerSoft: '#4B2428', notification: '#FFAAAA',
    onPrimary: '#FFFFFF', buttonPrimary: palette.primary,
  },
};
