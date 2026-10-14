import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import useAppTheme from '../hooks/useAppTheme';
import { gradients } from '../theme/tokens';
import AppIcon from './AppIcon';
import AppText from './AppText';

/** @param {{title: string, onPress?: () => void, icon?: import('react').ComponentProps<typeof AppIcon>['name'], secondary?: boolean, disabled?: boolean, style?: import('react-native').StyleProp<import('react-native').ViewStyle>, accessibilityHint?: string}} props */
export default function AppButton({
  title, onPress, icon = undefined, secondary = false, disabled = false,
  style = undefined, accessibilityHint = undefined,
}) {
  const { styles, colors, resolveStyle } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title}
      accessibilityHint={accessibilityHint} accessibilityState={{ disabled }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondaryButton,
        resolveStyle(style), pressed && styles.pressed, disabled && styles.disabled]}>
      <LinearGradient colors={secondary ? [colors.surface, colors.surface] : gradients.primary}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonContent}>
        {icon && <AppIcon name={icon} size={20} color={secondary ? colors.primary : colors.onPrimary} />}
        <AppText style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</AppText>
      </LinearGradient>
    </Pressable>
  );
}
