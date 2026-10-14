import { useCallback } from 'react';
import useAppData from './useAppData';

export default function usePlayer() {
  const { config, hydrated, updateConfig } = useAppData();
  const saveName = useCallback((value) => {
    const cleanName = value.trim().replace(/\s+/g, ' ').slice(0, 20);
    if (!cleanName || !hydrated) return Promise.resolve(false);
    return updateConfig({ playerName: cleanName });
  }, [hydrated, updateConfig]);
  return { name: config.playerName, hydrated, saveName };
}
