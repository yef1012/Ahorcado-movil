import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import useAppData from '../hooks/useAppData';
import useAppTheme from '../hooks/useAppTheme';
import { persistenceStyles } from '../theme/persistenceStyles';
import useThemedStyles from '../theme/useThemedStyles';
import AppText from './AppText';

export default function StorageNotice() {
  const { hydrated, loading, error, recoveryAvailable, retry, recoverCorruptedData } = useAppData();
  const styles = useThemedStyles(persistenceStyles);
  const { colors } = useAppTheme();
  if (hydrated && !error) return null;
  const confirmRecovery = () => Alert.alert(
    'Restablecer datos dañados',
    'Se restablecerán únicamente los datos que no se pueden leer. Si las estadísticas están dañadas, se borrarán estadísticas y ranking; si la configuración está dañada, se restablecerán nombre y preferencias. Los datos que sí se pueden leer se conservarán.',
    [{ text: 'Cancelar', style: 'cancel' }, { text: 'Restablecer', style: 'destructive', onPress: () => { void recoverCorruptedData(); } }],
  );
  return (
    <View style={styles.notice} accessibilityLiveRegion="polite">
      {loading && <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando datos guardados" />}
      <AppText variant="small" style={[styles.noticeText, error && styles.error]}>{error || 'Cargando tu nombre y preferencias…'}</AppText>
      {!!error && <Pressable disabled={loading} accessibilityRole="button" onPress={() => { void retry(); }} style={styles.noticeButton}><AppText style={styles.noticeLink}>{hydrated ? 'Reintentar guardado' : 'Reintentar carga'}</AppText></Pressable>}
      {recoveryAvailable && <Pressable disabled={loading} accessibilityRole="button" onPress={confirmRecovery} style={styles.noticeButton}><AppText style={[styles.noticeLink, styles.error]}>Restablecer datos dañados</AppText></Pressable>}
    </View>
  );
}
