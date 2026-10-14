import { LinearGradient } from 'expo-linear-gradient';
import { View, useWindowDimensions } from 'react-native';

import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import { GameLogo, PremiumGameArt } from '../components/Illustrations';
import ScreenLayout from '../components/ScreenLayout';
import useFontStatus from '../hooks/useFontStatus';
import useAppTheme from '../hooks/useAppTheme';
import { ROUTES } from '../navigation/routes';
import { homeStyles } from '../theme/homeStyles';
import useThemedStyles from '../theme/useThemedStyles';
import { gradients } from '../theme/tokens';

export default function SplashScreen({ navigation }) {
  const styles = useThemedStyles(homeStyles);
  const { resolveColors } = useAppTheme();
  const { loaded, error } = useFontStatus();
  const { height } = useWindowDimensions();
  const ready = loaded || error;

  return (
    <ScreenLayout backgroundColors={gradients.splash} contentStyle={[styles.splashContent, { minHeight: Math.max(700, height - 60) }]}>
      <View pointerEvents="none" style={styles.splashTopRing} />
      <View pointerEvents="none" style={styles.splashBottomRing} />
      <View style={styles.logoShadow}><GameLogo size={78} /></View>
      <View style={styles.splashCopy}>
        <AppText variant="eyebrow" style={styles.splashOverline}>UN RETO HECHO EN COLOMBIA</AppText>
        <AppText variant="title" accessibilityRole="header" style={styles.splashTitle}>El Ahorcado{'\n'}<AppText variant="title" style={[styles.splashTitle, styles.splashTitleAccent]}>Móvil</AppText></AppText>
        <AppText style={styles.splashDescription}>Palabras, cultura y diversión en cada partida.</AppText>
      </View>
      <View style={styles.splashArt}><PremiumGameArt height={235} /></View>
      <View style={styles.loadingBlock}>
        <View style={styles.loadingLabels}>
          <AppText style={styles.loadingLabel}>{ready ? 'EXPERIENCIA LISTA' : 'CARGANDO EXPERIENCIA'}</AppText>
          <AppText style={styles.loadingLabel}>{ready ? '100%' : '0%'}</AppText>
        </View>
        <View style={styles.loadingTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: ready ? 100 : 0 }} accessibilityLabel="Carga de tipografías">
          <LinearGradient colors={resolveColors(['#46C878', '#086B45'])} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.loadingFill, { width: ready ? '100%' : '0%' }]} />
        </View>
      </View>
      <AppButton title="ENTRAR AL JUEGO" icon="play" disabled={!ready} onPress={() => navigation.replace(ROUTES.INICIO)} />
      {error && <AppText variant="small" style={styles.fontError}>No se pudieron cargar las fuentes. Puedes continuar con la tipografía del dispositivo.</AppText>}
    </ScreenLayout>
  );
}
