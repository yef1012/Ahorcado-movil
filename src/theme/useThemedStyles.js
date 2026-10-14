import { useMemo } from 'react';

import useAppTheme from '../hooks/useAppTheme';

/** @template {Record<string, import('react-native').ViewStyle | import('react-native').TextStyle | import('react-native').ImageStyle>} T @param {T} baseStyles @returns {T} */
export default function useThemedStyles(baseStyles) {
  const theme = useAppTheme();
  return useMemo(() => {
    if (!theme.dark) return baseStyles;
    return /** @type {T} */ (Object.fromEntries(Object.entries(baseStyles).map(([name, style]) => [name, theme.resolveStyle(style)])));
  }, [baseStyles, theme]);
}
