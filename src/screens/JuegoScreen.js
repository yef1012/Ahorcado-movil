import { usePreventRemove } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '../components/AppButton';
import AppIcon from '../components/AppIcon';
import AppText from '../components/AppText';
import { GameHangman } from '../components/Illustrations';
import PalabraOculta from '../components/PalabraOculta';
import ScreenLayout from '../components/ScreenLayout';
import { CATEGORIES, DIFFICULTIES } from '../data/gameOptions';
import useJuego from '../hooks/useJuego';
import useAppData from '../hooks/useAppData';
import useGameFeedback from '../hooks/useGameFeedback';
import usePlayer from '../hooks/usePlayer';
import { ROUTES } from '../navigation/routes';
import { gameStyles } from '../theme/gameStyles';
import useThemedStyles from '../theme/useThemedStyles';
import useAppTheme from '../hooks/useAppTheme';
import { palette } from '../theme/tokens';
import { formatTime } from '../utils/formatTime';
import { getWordSlots, normalizeWord } from '../utils/juego';
import { toGameRecord } from '../utils/gameRecord';

const KEYBOARD = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

export default function JuegoScreen({ navigation, route }) {
  const styles = useThemedStyles(gameStyles);
  const { resolveColors } = useAppTheme();
  const { height } = useWindowDimensions();
  const [exitAction, setExitAction] = useState(
    /** @type {import('@react-navigation/native').NavigationAction | null} */ (null),
  );
  const requestedCategory = CATEGORIES.find((item) => item.id === route.params?.categoryId) ?? CATEGORIES[0];
  const requestedDifficulty = DIFFICULTIES.find((item) => item.id === route.params?.difficultyId) ?? DIFFICULTIES[1];
  const { state, category, difficulty, seleccionarLetra, usarPista } = useJuego({ categoryId: requestedCategory.id, difficultyId: requestedDifficulty.id, previousWordId: route.params?.previousWordId });
  const { recordGame } = useAppData();
  const { name } = usePlayer();
  useGameFeedback(state, state.id);
  const openedResult = useRef(false);
  const finished = state.status !== 'playing';
  const lives = 6 - state.errors;
  const hintsLeft = difficulty.hints - state.hintsUsed;
  const score = state.finalScore ?? state.subtotal * difficulty.multiplier;
  const normalizedWord = normalizeWord(state.word.palabra);
  const feedback = state.lastEvent?.type === 'correct'
    ? `¡Bien! La ${state.lastEvent.letter} está en la palabra. +${state.lastEvent.points * difficulty.multiplier} puntos`
    : state.lastEvent?.type === 'incorrect'
      ? `La ${state.lastEvent.letter} no aparece. −${5 * difficulty.multiplier} puntos`
      : state.lastEvent?.type === 'hint-description'
        ? `Pista descubierta. −${15 * difficulty.multiplier} puntos`
        : state.lastEvent?.type === 'hint-letter'
          ? `Letra ${state.lastEvent.letter} revelada. −${15 * difficulty.multiplier} puntos`
          : 'Elige una letra para comenzar';

  // Covers Android back and back gestures too. Redispatching the same action
  // after confirmation resumes the exit without prompting a second time.
  usePreventRemove(!finished, ({ data }) => {
    if (openedResult.current) {
      navigation.dispatch(data.action);
      return;
    }
    setExitAction(data.action);
  });

  useEffect(() => {
    if (!finished || openedResult.current) return;
    openedResult.current = true;
    const record = toGameRecord(state, name);
    if (record) void recordGame(record);
    navigation.replace(ROUTES.RESULTADO, {
      result: {
        ...record,
        word: state.word.palabra,
        wordId: state.word.id,
        categoryId: state.word.categoria,
        requestedCategoryId: state.requestedCategoryId,
        difficultyId: state.difficultyId,
        outcome: state.status,
        reason: state.reason,
        score: state.finalScore,
        elapsedSeconds: state.elapsedSeconds,
        lives: 6 - state.errors,
      },
    });
  }, [finished, navigation, state, name, recordGame]);

  const confirmExit = () => {
    const action = exitAction;
    setExitAction(null);
    if (action) navigation.dispatch(action);
  };

  return (
    <ScreenLayout backgroundColors={['#F7FCF8', '#F0F9F3']}>
      <View style={styles.gameHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a categoría y nivel"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <AppIcon name="back" size={22} color={palette.green} />
        </Pressable>
        <View style={styles.headerCopy}>
          <AppText variant="eyebrow" style={styles.categoryLabel}>
            {category.id === 'capitales' ? 'CAPITALES DE COLOMBIA' : category.label.toLocaleUpperCase('es')}
          </AppText>
          <AppText variant="label" style={styles.levelLabel}>
            Nivel {difficulty.label.toLocaleLowerCase('es')} · x{difficulty.multiplier}
          </AppText>
        </View>
        <View accessibilityLabel={`Puntuación: ${score}`} style={styles.scoreChip}>
          <AppIcon name="star" size={16} color={palette.primary} />
          <AppText variant="label" style={styles.scoreText}>{score}</AppText>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <AppIcon name="heart" size={19} color={palette.secondary} />
          <AppText variant="small" style={styles.statusText}>{lives} {lives === 1 ? 'vida' : 'vidas'}</AppText>
        </View>
        <View style={styles.errorDots} accessibilityLabel={`${state.errors} de 6 errores`}>
          {Array.from({ length: 6 }, (_, index) => <View key={index} style={[styles.errorDot, index < state.errors && styles.errorDotUsed]} />)}
        </View>
        <View style={styles.statusItem}>
          <AppIcon name="clock" size={18} color={palette.secondary} />
          <AppText variant="small" style={[styles.statusText, state.remainingSeconds !== null && state.remainingSeconds <= 15 && styles.timerUrgent]}>
            {state.remainingSeconds === null ? 'Sin límite' : formatTime(state.remainingSeconds)}
          </AppText>
        </View>
      </View>

      <LinearGradient
        colors={resolveColors(['#DFF7E8', '#BFE9CF'])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hangmanStage, height < 740 && styles.compactStage]}
      >
        <GameHangman errors={state.errors} width={210} height={185} />
        <View style={styles.stageShadow} />
        <View style={styles.progressLabel}>
          <AppText variant="caption" style={styles.progressText}>{state.errors} / 6 errores</AppText>
        </View>
      </LinearGradient>

      <View style={styles.wordArea}>
        <AppText variant="eyebrow" style={styles.wordPrompt}>{category.prompt}</AppText>
        <PalabraOculta slots={getWordSlots(state)} />
        <AppText variant="caption" style={styles.pendingHint}>
          {state.descriptionVisible ? state.word.descripcion : difficulty.hints ? 'Usa una pista si necesitas ayuda' : 'Este nivel no incluye pistas'}
        </AppText>
      </View>

      {/* Six columns on typical Android widths keep every key at least 48 dp.
          Narrower screens wrap into fewer columns instead of shrinking targets. */}
      <View style={styles.keyboard}>
        {KEYBOARD.map((letter) => {
          const used = state.guessedLetters.includes(letter);
          const correct = used && normalizedWord.includes(letter);
          return (
          <Pressable
            key={letter}
            disabled={finished || used}
            onPress={() => seleccionarLetra(letter)}
            accessibilityRole="button"
            accessibilityLabel={`Letra ${letter}${used ? correct ? ', correcta' : ', incorrecta' : ''}`}
            accessibilityState={{ disabled: finished || used }}
            style={({ pressed }) => [styles.keyboardKey, used && (correct ? styles.keyboardCorrect : styles.keyboardIncorrect), pressed && styles.pressed]}
          >
            <AppText variant="label" style={[styles.keyboardLetter, used && styles.keyboardUsedLetter]}>{letter}</AppText>
          </Pressable>
          );
        })}
      </View>

      <Pressable
        disabled={finished || hintsLeft <= 0}
        onPress={usarPista}
        accessibilityRole="button"
        accessibilityLabel={hintsLeft ? `Usar pista. Quedan ${hintsLeft}. Cuesta ${15 * difficulty.multiplier} puntos` : 'Sin pistas disponibles'}
        accessibilityState={{ disabled: finished || hintsLeft <= 0 }}
        style={({ pressed }) => [styles.hintButton, (finished || hintsLeft <= 0) && styles.hintDisabled, pressed && styles.pressed]}
      >
        <AppIcon name="bulb" size={20} color={palette.primary} />
        <AppText variant="small" style={styles.hintTitle}>{difficulty.hints ? 'Usar pista' : 'Sin pistas'}</AppText>
        <View style={styles.hintDivider} />
        <AppText variant="caption" style={styles.hintAvailability}>{difficulty.hints ? `${hintsLeft} ${hintsLeft === 1 ? 'disponible' : 'disponibles'} · −${15 * difficulty.multiplier} pts` : 'Nivel difícil'}</AppText>
      </Pressable>

      <AppText variant="small" accessibilityLiveRegion="polite" style={[styles.feedback, state.lastEvent?.type === 'correct' && styles.feedbackCorrect, state.lastEvent?.type === 'incorrect' && styles.feedbackIncorrect]}>{feedback}</AppText>

      <Modal visible={Boolean(exitAction)} transparent animationType="fade" onRequestClose={() => setExitAction(null)}>
        <SafeAreaView style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View accessibilityViewIsModal style={styles.exitCard}>
              <View style={styles.exitIcon}><AppIcon name="back" size={25} color={palette.primary} /></View>
              <AppText variant="heading" style={styles.exitTitle}>¿Salir de la partida?</AppText>
              <AppText variant="small" style={styles.exitDescription}>
                Perderás el progreso de esta partida y podrás elegir otra categoría y dificultad.{difficulty.timeLimit ? ' El tiempo sigue corriendo mientras decides.' : ''}
              </AppText>
              <AppButton title="Volver a categorías" onPress={confirmExit} />
              <Pressable
                accessibilityRole="button"
                onPress={() => setExitAction(null)}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              >
                <AppText variant="label" style={styles.linkText}>Continuar aquí</AppText>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScreenLayout>
  );
}
