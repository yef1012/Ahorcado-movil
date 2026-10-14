import { useContext } from 'react';

import { ThemeContext } from '../theme/ThemeProvider';

export default function useAppTheme() {
  return useContext(ThemeContext);
}
