import { createContext, useContext } from 'react';

export const FontStatusContext = createContext({ loaded: false, error: false });

export default function useFontStatus() {
  return useContext(FontStatusContext);
}
