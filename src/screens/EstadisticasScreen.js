import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import AppIcon from '../components/AppIcon';
import AppText from '../components/AppText';
import ScreenHeader from '../components/ScreenHeader';
import ScreenLayout from '../components/ScreenLayout';
import useAppData from '../hooks/useAppData';
import useAppTheme from '../hooks/useAppTheme';
import { CATEGORIES, DIFFICULTIES } from '../data/gameOptions';
import { secondaryStyles } from '../theme/secondaryStyles';
import { persistenceStyles } from '../theme/persistenceStyles';
import useThemedStyles from '../theme/useThemedStyles';
import { palette } from '../theme/tokens';

const METRICS = /** @type {const} */ ([
  { label: 'Partidas', icon: 'play', field: 'played' },
  { label: 'Victorias', icon: 'trophy', field: 'won' },
  { label: 'Derrotas', icon: 'heart', field: 'lost' },
  { label: 'Mejor racha', icon: 'star', field: 'bestStreak' },
]);

export default function EstadisticasScreen({ navigation }) {
  const { stats, ranking, hydrated } = useAppData();
  const styles = useThemedStyles(secondaryStyles);
  const dataStyles = useThemedStyles(persistenceStyles);
  const { resolveColors } = useAppTheme();
  const circumference = 2 * Math.PI * 16;

  return (
    <ScreenLayout>
      <ScreenHeader title="Estadísticas" onBack={() => navigation.popToTop()} />
      <LinearGradient colors={resolveColors([palette.primaryBright, palette.primary])} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statsHero}>
        <View style={styles.flexText}>
          <AppText style={styles.statsEyebrow}>PORCENTAJE DE VICTORIAS</AppText>
          <AppText style={styles.statsPercentage}>{hydrated ? stats.winPercentage : '—'}<AppText style={styles.statsPercentSign}>%</AppText></AppText>
          <AppText style={styles.statsCaption}>{!hydrated ? 'Cargando tus resultados' : stats.played ? 'Tu progreso, partida a partida' : 'Aún no hay partidas terminadas'}</AppText>
        </View>
        <Svg width={91} height={91} viewBox="0 0 42 42" accessible={false}>
          <Circle cx={21} cy={21} r={16} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={4} />
          {hydrated && stats.winPercentage > 0 && <Circle cx={21} cy={21} r={16} fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeDasharray={[circumference * stats.winPercentage / 100, circumference]} rotation={-90} origin="21,21" />}
        </Svg>
      </LinearGradient>
      <View style={styles.statGrid}>
        {METRICS.map((metric) => (
          <View key={metric.label} style={styles.statCard}>
            <AppIcon name={metric.icon} size={18} color={palette.secondary} />
            <AppText style={styles.statValue}>{hydrated ? stats[metric.field] : '—'}</AppText>
            <AppText style={styles.statLabel}>{metric.label}</AppText>
          </View>
        ))}
      </View>
      <View style={dataStyles.streak}>
        <AppText variant="small" style={dataStyles.streakText}>Racha actual: {hydrated ? stats.currentStreak : '—'} {stats.currentStreak === 1 ? 'victoria' : 'victorias'}</AppText>
      </View>
      <View style={styles.sectionTitle}>
        <View style={styles.flexText}>
          <AppText variant="eyebrow">CLASIFICACIÓN LOCAL</AppText>
          <AppText variant="heading" style={styles.rankingHeading}>Mejores puntajes</AppText>
        </View>
        <View style={styles.topBadge}><AppText style={styles.topBadgeText}>Top 10</AppText></View>
      </View>
      {ranking.length ? (
        <View style={dataStyles.rankingList}>
          {ranking.map((entry, index) => (
            <View key={entry.id} style={dataStyles.rankingRow}>
              <View style={[dataStyles.position, index === 0 && dataStyles.firstPosition]}><AppText style={dataStyles.positionText}>{index + 1}</AppText></View>
              <View style={dataStyles.rankingCopy}>
                <AppText style={dataStyles.rankingName}>{entry.playerName}</AppText>
                <AppText style={dataStyles.rankingDetail}>{CATEGORIES.find(item => item.id === entry.categoryId)?.label} · {DIFFICULTIES.find(item => item.id === entry.difficultyId)?.label}</AppText>
                <AppText style={dataStyles.rankingDetail}>{entry.outcome === 'won' ? 'Victoria' : 'Derrota'} · {new Date(entry.finishedAt).toLocaleDateString('es-CO')}</AppText>
              </View>
              <View style={dataStyles.rankingScore}><AppText style={dataStyles.scoreValue}>{entry.score}</AppText><AppText style={dataStyles.scoreLabel}>PUNTOS</AppText></View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyRanking}>
          <View style={styles.emptyRankingIcon}><AppIcon name="trophy" size={28} /></View>
          <AppText variant="label" style={styles.centerText}>{hydrated ? 'Tu próxima partida cuenta' : 'Cargando la clasificación'}</AppText>
          <AppText style={styles.emptyDescription}>{hydrated ? 'Completa una partida para ver aquí tus mejores resultados.' : 'Tus datos guardados aparecerán al terminar la lectura.'}</AppText>
        </View>
      )}
    </ScreenLayout>
  );
}
