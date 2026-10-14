import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useAppTheme from './src/hooks/useAppTheme';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { FontStatusContext } from './src/hooks/useFontStatus';
import useAppData, { AppDataProvider } from './src/hooks/useAppData';
import { GameFeedbackProvider } from './src/hooks/useGameFeedback';

function PersistentApp() {
  const { config, hydrated } = useAppData();
  return (
    <ThemeProvider preference={config.theme}>
      <GameFeedbackProvider soundEnabled={hydrated && config.soundEnabled} hapticsEnabled={hydrated && config.hapticsEnabled}>
        <AppContent />
      </GameFeedbackProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const theme = useAppTheme();

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  const [loaded, error] = useFonts({
    DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold,
    Manrope_700Bold, Manrope_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      <FontStatusContext.Provider value={{ loaded, error: Boolean(error) }}>
        <AppDataProvider>
          <PersistentApp />
        </AppDataProvider>
      </FontStatusContext.Provider>
    </SafeAreaProvider>
  );
}
