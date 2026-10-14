import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

import { appStore } from '../storage';

/** @typedef {ReturnType<typeof appStore.getSnapshot> & {updateConfig: typeof appStore.updateConfig, recordGame: typeof appStore.recordGame, clearStats: typeof appStore.clearStats, retry: typeof appStore.retry, hasRecordedGame: typeof appStore.hasRecordedGame, recoverCorruptedData: typeof appStore.recoverCorruptedData}} AppData */
const AppDataContext = createContext(/** @type {AppData|null} */ (null));

export function AppDataProvider({ children }) {
  const snapshot = useSyncExternalStore(appStore.subscribe, appStore.getSnapshot, appStore.getSnapshot);
  useEffect(() => { void appStore.hydrate(); }, []);
  const value = useMemo(() => ({
    ...snapshot,
    updateConfig: appStore.updateConfig,
    recordGame: appStore.recordGame,
    clearStats: appStore.clearStats,
    retry: appStore.retry,
    hasRecordedGame: appStore.hasRecordedGame,
    recoverCorruptedData: appStore.recoverCorruptedData,
  }), [snapshot]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export default function useAppData() {
  const data = useContext(AppDataContext);
  if (!data) throw new Error('useAppData necesita AppDataProvider.');
  return data;
}
