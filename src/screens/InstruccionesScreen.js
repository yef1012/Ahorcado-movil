import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppButton from '../components/AppButton';
import AppIcon from '../components/AppIcon';
import AppText from '../components/AppText';
import ScreenHeader from '../components/ScreenHeader';
import ScreenLayout from '../components/ScreenLayout';
import { DIFFICULTIES } from '../data/gameOptions';
import useAppTheme from '../hooks/useAppTheme';
import { ROUTES } from '../navigation/routes';
import { secondaryStyles } from '../theme/secondaryStyles';
import useThemedStyles from '../theme/useThemedStyles';
import { palette } from '../theme/tokens';

const RULES = /** @type {const} */ ([
  { title: 'Elige tu desafío', text: 'Selecciona una categoría colombiana y un nivel de dificultad.', icon: 'map' },
  { title: 'Descubre las letras', text: 'Toca una letra: si aparece, se revelarán todas sus posiciones.', icon: 'check' },
  { title: 'Evita seis errores', text: 'Cada fallo completa una etapa. Al sexto, termina la partida.', icon: 'heart' },
  { title: 'Usa pistas con estrategia', text: 'La primera muestra una descripción; la segunda revela una letra. Cada una cuesta 15 puntos antes del multiplicador.', icon: 'bulb' },
  { title: 'Gana y suma puntos', text: 'Completa la palabra antes de agotar tus oportunidades.', icon: 'trophy' },
]);

export default function InstruccionesScreen({ navigation }) {
  const styles = useThemedStyles(secondaryStyles);
  const { resolveColors } = useAppTheme();
  return (
    <ScreenLayout>
      <ScreenHeader title="Cómo jugar" onBack={() => navigation.popToTop()} />
      <View style={styles.pageIntro}>
        <AppText variant="title" style={styles.introTitle}>Aprender es parte del juego</AppText>
        <AppText style={styles.introDescription}>Reglas sencillas para convertirte en experto.</AppText>
      </View>
      <View style={styles.ruleList}>
        {RULES.map((rule, index) => (
          <View style={styles.ruleCard} key={rule.title}>
            <AppText style={styles.ruleNumber} accessible={false}>{`0${index + 1}`}</AppText>
            <View style={[styles.ruleIcon, index % 2 === 1 && styles.blueIcon]}>
              <AppIcon name={rule.icon} color={index % 2 === 1 ? palette.blue : palette.primary} />
            </View>
            <View style={styles.flexText}>
              <AppText variant="label">{rule.title}</AppText>
              <AppText style={styles.ruleDescription}>{rule.text}</AppText>
            </View>
          </View>
        ))}
      </View>
      <LinearGradient colors={resolveColors([palette.mint, '#EDF9F1'])} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.difficultyInfo}>
        <View style={styles.pill}><AppText variant="eyebrow" style={styles.pillText}>NIVELES Y PUNTUACIÓN</AppText></View>
        <View style={styles.difficultySummary}>
          {DIFFICULTIES.map((level) => (
            <View key={level.id} style={styles.difficultySummaryItem}>
              <AppText style={styles.difficultyName}>{level.label}</AppText>
              <AppText style={styles.summaryDescription}>{level.letters}</AppText>
              <AppText style={styles.summaryDescription}>{level.hints === 0 ? 'Sin pistas' : `${level.hints} ${level.hints === 1 ? 'pista' : 'pistas'}`} · x{level.multiplier}</AppText>
              <AppText style={styles.summaryDescription}>{level.timeLimit ? `${level.timeLimit} s` : 'Sin límite'}</AppText>
            </View>
          ))}
        </View>
      </LinearGradient>
      <AppText style={styles.pendingNote}>+10 por aparición acertada · −5 por error · Victoria: +50 y +10 por vida restante. Al final se aplica el multiplicador del nivel.</AppText>
      <AppButton title="¡Entendido, a jugar!" icon="play" onPress={() => navigation.navigate(ROUTES.CATEGORIA)} />
    </ScreenLayout>
  );
}
