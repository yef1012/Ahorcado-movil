import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useFontStatus from '../hooks/useFontStatus';
import useAppTheme from '../hooks/useAppTheme';
import { homeStyles } from '../theme/homeStyles';
import useThemedStyles from '../theme/useThemedStyles';
import AppButton from './AppButton';
import AppText from './AppText';
import { GameLogo } from './Illustrations';

export default function PlayerNameModal({ initialName = '', onSave, onClose }) {
  const styles = useThemedStyles(homeStyles);
  const { dark, mapColor } = useAppTheme();
  const [draftName, setDraftName] = useState(initialName);
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savingRef = useRef(false);
  const mounted = useRef(true);
  const { loaded } = useFontStatus();

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const save = async () => {
    if (savingRef.current) return;
    const cleanName = draftName.trim().replace(/\s+/g, ' ');
    if (!cleanName) {
      setInvalid(true);
      return;
    }
    Keyboard.dismiss();
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      const saved = await onSave(cleanName);
      if (!saved && mounted.current) setSaveError(true);
    } catch {
      if (mounted.current) setSaveError(true);
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => { if (!savingRef.current) onClose(); }}>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView style={styles.modalKeyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SafeAreaView style={styles.modalSafeArea}>
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.nameCard} accessibilityViewIsModal>
                <GameLogo size={58} />
                <AppText variant="eyebrow" style={styles.nameEyebrow}>ANTES DE COMENZAR</AppText>
                <AppText variant="heading" accessibilityRole="header" style={styles.nameTitle}>¿Cómo te llamas?</AppText>
                <AppText style={styles.nameDescription}>Usaremos tu nombre para personalizar la experiencia.</AppText>
                <AppText variant="caption" style={styles.sessionNote}>Se guardará en este dispositivo.</AppText>
                <View style={styles.nameField}>
                  <AppText style={styles.nameLabel}>NOMBRE DEL JUGADOR</AppText>
                  <TextInput
                    accessibilityLabel="Nombre del jugador"
                    value={draftName}
                    editable={!saving}
                    onChangeText={(value) => { setDraftName(value); setInvalid(false); setSaveError(false); }}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    placeholder="Escribe tu nombre" placeholderTextColor={mapColor('#819486')}
                    keyboardAppearance={dark ? 'dark' : 'light'}
                    maxLength={20} autoCapitalize="words" autoCorrect={false}
                    returnKeyType="done" onSubmitEditing={save}
                    style={[styles.nameInput, focused && styles.nameInputFocused, invalid && styles.nameInputError, !loaded && { fontFamily: undefined }]}
                  />
                  {invalid && <AppText variant="small" accessibilityLiveRegion="polite" style={styles.nameError}>Escribe tu nombre para continuar.</AppText>}
                  {saveError && <AppText variant="small" accessibilityLiveRegion="polite" style={styles.nameError}>No se pudo guardar el nombre. Reintenta.</AppText>}
                </View>
                <AppButton title={saving ? 'Guardando…' : 'Guardar y continuar'} icon="play" onPress={save} disabled={saving} />
                {!!initialName && <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving }} disabled={saving} onPress={onClose} style={styles.cancelButton}><AppText variant="small" style={styles.cancelText}>Cancelar</AppText></Pressable>}
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
