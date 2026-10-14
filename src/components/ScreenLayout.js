import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAppTheme from '../hooks/useAppTheme';
import StorageNotice from './StorageNotice';

/** @param {{children: import('react').ReactNode, contentStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>, backgroundColors?: import('expo-linear-gradient').LinearGradientProps['colors']}} props */
export default function ScreenLayout({ children, contentStyle, backgroundColors }) {
  const { styles, colors, resolveColors, resolveStyle } = useAppTheme();
  const background = backgroundColors ? resolveColors(backgroundColors) : /** @type {const} */ ([colors.background, colors.background]);
  return (
    <LinearGradient colors={background} style={styles.screen}>
      {/* Encabezados propios: proteger los cuatro bordes. */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.screenContent, resolveStyle(contentStyle)]}>
            <StorageNotice />
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
