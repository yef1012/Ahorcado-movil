import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createContext } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { colors } from './colors';
import { createStyles } from './styles';
import { resolveThemeColor, resolveThemeMode, resolveThemeStyle } from './themeMapping';

function createTheme(palette, navigationBase) {
  return {
    dark: navigationBase.dark,
    colors: palette,
    styles: createStyles(palette),
    /** @template T @param {T} value @param {'foreground'|'background'|'border'|'shadow'} [role] */
    mapColor: (value, role = 'foreground') => resolveThemeColor(value, navigationBase.dark, role),
    /** @param {import('expo-linear-gradient').LinearGradientProps['colors']} values @returns {import('expo-linear-gradient').LinearGradientProps['colors']} */
    resolveColors: values => [
      resolveThemeColor(values[0], navigationBase.dark, 'background'),
      resolveThemeColor(values[1], navigationBase.dark, 'background'),
      ...values.slice(2).map(value => resolveThemeColor(value, navigationBase.dark, 'background')),
    ],
    /** @template {import('react-native').ViewStyle | import('react-native').TextStyle | import('react-native').ImageStyle} T @param {import('react-native').StyleProp<T>} style */
    resolveStyle: style => resolveThemeStyle(StyleSheet.flatten(style), navigationBase.dark),
    navigation: {
      ...navigationBase,
      colors: {
        ...navigationBase.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.surface,
        text: palette.text,
        border: palette.border,
        notification: palette.notification,
      },
    },
  };
}

export const themes = {
  light: createTheme(colors.light, DefaultTheme),
  dark: createTheme(colors.dark, DarkTheme),
};

export const ThemeContext = createContext(themes.light);

/** @param {{children: import('react').ReactNode, preference?: 'light' | 'dark' | 'system'}} props */
export function ThemeProvider({ children, preference = 'light' }) {
  const systemScheme = useColorScheme();
  const mode = resolveThemeMode(preference, systemScheme);
  return (
    <ThemeContext.Provider value={themes[mode]}>
      {children}
    </ThemeContext.Provider>
  );
}
