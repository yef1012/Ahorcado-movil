import { View } from 'react-native';

import useAppTheme from '../hooks/useAppTheme';
import AppText from './AppText';

export default function CreditosFooter() {
  const { styles } = useAppTheme();

  return (
    <View style={styles.creditsFooter} accessible>
      <View style={styles.creditsDivider} />
      <AppText style={styles.creditsLabel}>Desarrollado por</AppText>
      <AppText style={styles.creditsNames}>Yefry Amaya · Andrés Pérez</AppText>
      <AppText style={styles.creditsInstitution}>UNICIENCIA · 2026</AppText>
    </View>
  );
}
