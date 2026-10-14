import { Pressable, View } from 'react-native';

import useAppTheme from '../hooks/useAppTheme';
import AppIcon from './AppIcon';
import AppText from './AppText';

export default function ScreenHeader({ title, onBack }) {
  const { styles } = useAppTheme();
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button" accessibilityLabel="Volver"
        onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <AppIcon name="back" />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText variant="eyebrow">EL AHORCADO MÓVIL</AppText>
        <AppText variant="heading" accessibilityRole="header">{title}</AppText>
      </View>
      <View style={styles.headerMark} accessible={false}>
        <AppText style={styles.headerMarkText}>A</AppText>
      </View>
    </View>
  );
}
