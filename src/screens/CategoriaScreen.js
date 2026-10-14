import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppButton from '../components/AppButton';
import AppIcon from '../components/AppIcon';
import AppText from '../components/AppText';
import ScreenHeader from '../components/ScreenHeader';
import ScreenLayout from '../components/ScreenLayout';
import { CATEGORIES, DIFFICULTIES } from '../data/gameOptions';
import useAppTheme from '../hooks/useAppTheme';
import useAppData from '../hooks/useAppData';
import { ROUTES } from '../navigation/routes';
import { secondaryStyles } from '../theme/secondaryStyles';
import useThemedStyles from '../theme/useThemedStyles';
import { palette } from '../theme/tokens';

export default function CategoriaScreen({ navigation }) {
  const styles = useThemedStyles(secondaryStyles);
  const { resolveColors } = useAppTheme();
  const { hydrated, config } = useAppData();
  const canPlay = hydrated && Boolean(config.playerName);
  const [categoryId, setCategoryId] = useState('capitales');
  const [difficultyId, setDifficultyId] = useState('medio');
  const category = CATEGORIES.find((item) => item.id === categoryId) || CATEGORIES[0];
  const difficulty = DIFFICULTIES.find((item) => item.id === difficultyId) || DIFFICULTIES[1];
  const details = [
    { label: 'PALABRAS', value: difficulty.letters },
    { label: 'PISTAS', value: difficulty.hints === 0 ? 'Sin pistas' : `${difficulty.hints} ${difficulty.hints === 1 ? 'pista' : 'pistas'}` },
    { label: 'TIEMPO', value: difficulty.timeLimit ? `${difficulty.timeLimit} segundos` : 'Sin límite' },
    { label: 'BONO', value: `x${difficulty.multiplier}` },
  ];

  return (
    <ScreenLayout>
      <ScreenHeader title="Nueva partida" onBack={() => navigation.popToTop()} />
      <View style={styles.compactIntro}>
        <AppText variant="eyebrow" style={styles.step}>PASO 1 DE 2</AppText>
        <AppText variant="title" style={styles.introTitle}>Elige una categoría</AppText>
        <AppText style={styles.introDescription}>¿Sobre qué quieres jugar hoy?</AppText>
      </View>
      <View style={styles.categoryGrid} accessibilityRole="radiogroup" accessibilityLabel="Categoría">
        {CATEGORIES.map((item) => {
          const selected = item.id === categoryId;
          const random = item.id === 'aleatoria';
          return (
            <Pressable
              key={item.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${item.label}. ${item.description}`}
              onPress={() => setCategoryId(item.id)}
              style={({ pressed }) => [styles.categoryWrapper, random && styles.randomWrapper, pressed && styles.pressed]}
            >
              <LinearGradient colors={resolveColors(selected ? ['#F1FCF4', palette.mint] : [palette.surface, '#F8FCF9'])} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.categoryCard, random && styles.randomCard, selected && styles.categorySelected]}>
                <View style={styles.categoryDecoration} pointerEvents="none" />
                <View style={styles.categoryIcon}><AppIcon name={item.icon} /></View>
                <View style={random ? styles.flexText : styles.categoryCopy}>
                  <AppText variant="label" style={styles.categoryLabel}>{item.label}</AppText>
                  <AppText style={styles.categoryDescription}>{item.description}</AppText>
                </View>
                {selected && <View style={styles.categoryCheck}><AppIcon name="check" size={14} color={palette.surface} /></View>}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.difficultySelect}>
        <AppText variant="eyebrow" style={styles.step}>PASO 2 DE 2</AppText>
        <AppText variant="heading">Elige la dificultad</AppText>
        <View style={styles.difficultyTabs} accessibilityRole="radiogroup" accessibilityLabel="Dificultad">
          {DIFFICULTIES.map((item) => (
            <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: item.id === difficultyId }} onPress={() => setDifficultyId(item.id)} style={({ pressed }) => [styles.difficultyTab, item.id === difficultyId && styles.difficultyTabActive, pressed && styles.pressed]}>
              <AppText style={[styles.difficultyTabText, item.id === difficultyId && styles.difficultyTabTextActive]}>{item.label}</AppText>
            </Pressable>
          ))}
        </View>
        <View style={styles.levelDetails}>
          {details.map((detail) => (
            <View key={detail.label} style={styles.levelDetail}>
              <AppText style={styles.detailLabel}>{detail.label}</AppText>
              <AppText style={styles.detailValue}>{detail.value}</AppText>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.selectionSummary} accessibilityLiveRegion="polite">
        <AppIcon name="check" size={17} color={palette.primaryBright} />
        <View style={styles.flexText}>
          <AppText style={styles.selectionEyebrow}>SELECCIÓN ACTUAL</AppText>
          <AppText style={styles.selectionLabel}>{category.label} · {difficulty.label}</AppText>
        </View>
      </View>
      {!canPlay && <AppText style={styles.pendingNote}>Carga tu perfil en Inicio antes de jugar.</AppText>}
      <AppButton title="Comenzar partida" icon="play" disabled={!canPlay} onPress={() => navigation.navigate(ROUTES.JUEGO, { categoryId, difficultyId })} />
    </ScreenLayout>
  );
}
