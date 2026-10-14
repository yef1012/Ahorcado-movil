import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import AppButton from '../components/AppButton';
import AppIcon from '../components/AppIcon';
import AppText from '../components/AppText';
import { VictoryConfetti } from '../components/Illustrations';
import ScreenLayout from '../components/ScreenLayout';
import { CATEGORIES, DIFFICULTIES } from '../data/gameOptions';
import { ROUTES } from '../navigation/routes';
import { gameStyles } from '../theme/gameStyles';
import useThemedStyles from '../theme/useThemedStyles';
import useAppTheme from '../hooks/useAppTheme';
import { palette } from '../theme/tokens';
import { formatTime } from '../utils/formatTime';
import useAppData from '../hooks/useAppData';

const RESULT_METRICS = /** @type {const} */ ([
  { label: 'Puntos', icon: 'star' },
  { label: 'Tiempo', icon: 'clock' },
  { label: 'Vidas', icon: 'heart' },
]);

export default function ResultadoScreen({ navigation, route }) {
  const styles = useThemedStyles(gameStyles);
  const { resolveColors } = useAppTheme();
  const result = route.params?.result;
  const { recordGame, hasRecordedGame, error } = useAppData();
  useEffect(() => {
    if (result?.id) void recordGame(result);
  }, [result, recordGame]);
  if (!result) {
    return (
      <ScreenLayout contentStyle={styles.resultContent}>
        <AppText variant="title" style={styles.resultTitle}>Sin partida terminada</AppText>
        <AppText style={styles.pendingResultNote}>Elige una categoría para comenzar a jugar.</AppText>
        <AppButton title="Nueva partida" icon="play" onPress={() => navigation.popTo(ROUTES.CATEGORIA)} />
      </ScreenLayout>
    );
  }
  const won = result.outcome === 'won';
  const category = CATEGORIES.find((item) => item.id === result.categoryId) ?? CATEGORIES[0];
  const difficulty = DIFFICULTIES.find((item) => item.id === result.difficultyId) ?? DIFFICULTIES[1];
  const metricValues = [result.score, formatTime(result.elapsedSeconds), result.lives];

  const playAgain = () => {
    navigation.replace(ROUTES.JUEGO, {
      categoryId: result.requestedCategoryId ?? category.id,
      difficultyId: difficulty.id,
      previousWordId: result.wordId,
    });
  };

  return (
    <ScreenLayout backgroundColors={['#DFF2E0', '#F7FCF8', '#F7FCF8']} contentStyle={styles.resultContent}>
      {won && <View pointerEvents="none" style={styles.confettiLayer}><VictoryConfetti /></View>}
      <View style={[styles.badgeRing, !won && styles.defeatRing]}>
        <LinearGradient
          colors={resolveColors(won ? ['#46C878', '#086B45'] : ['#FFFFFF', '#F7DEDE'])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultBadge}
        >
          <AppIcon name={won ? 'trophy' : 'heart'} size={44} color={won ? '#FFFFFF' : '#A74242'} />
        </LinearGradient>
      </View>
      <AppText variant="eyebrow" style={styles.resultEyebrow}>{won ? 'DESAFÍO COMPLETADO' : 'FIN DE LA RONDA'}</AppText>
      <AppText variant="title" style={[styles.resultTitle, !won && styles.defeatTitle]}>
        {won ? '¡LO LOGRASTE!' : 'SE TERMINÓ LA PARTIDA'}
      </AppText>
      <AppText variant="body" style={styles.resultSubtitle}>
        {won ? 'Descubriste la palabra correcta' : result.reason === 'timeout' ? 'Se agotaron los 90 segundos' : 'Alcanzaste los seis errores'}
      </AppText>

      <View style={styles.answerCard}>
        <AppText variant="caption" style={styles.answerEyebrow}>LA PALABRA ERA</AppText>
        <AppText variant="title" style={[styles.answerWord, result.word.length > 9 && styles.answerWordLong]}>{result.word}</AppText>
        <AppText variant="small" style={styles.answerCategory}>{category.label} · {difficulty.label}</AppText>
      </View>
      <View style={styles.resultMetrics}>
        {RESULT_METRICS.map(({ label, icon }, index) => (
          <View key={label} style={styles.resultMetric} accessibilityLabel={`${label}: ${metricValues[index]}`}>
            <AppIcon name={icon} size={23} color={palette.secondary} />
            <AppText variant="label" style={styles.metricValue}>{metricValues[index]}</AppText>
            <AppText variant="caption" style={styles.metricLabel}>{label}</AppText>
          </View>
        ))}
      </View>
      <AppText variant="caption" style={styles.pendingResultNote}>
        {hasRecordedGame(result.id) ? 'Resultado guardado en este dispositivo' : error ? 'El resultado sigue pendiente de guardar.' : 'Guardando resultado…'}
      </AppText>
      <View style={styles.streakCard}>
        <View style={styles.streakIcon}><AppIcon name={won ? 'trophy' : 'bulb'} size={23} color={palette.green} /></View>
        <View style={styles.streakCopy}>
          <AppText variant="label" style={styles.streakTitle}>{won ? '¡Gran conocimiento!' : 'Consejo para la próxima'}</AppText>
          <AppText variant="small" style={styles.streakSubtitle}>
            {won ? 'Sigue explorando palabras de Colombia' : 'Comienza por las vocales y busca patrones'}
          </AppText>
        </View>
      </View>
      <AppButton title={won ? 'Jugar de nuevo' : 'Reintentar'} icon="play" onPress={playAgain} />
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.popTo(ROUTES.INICIO)}
        style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
      >
        <AppText variant="label" style={styles.linkText}>Volver al inicio</AppText>
      </Pressable>
    </ScreenLayout>
  );
}
