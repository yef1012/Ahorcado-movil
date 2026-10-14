
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import AppText from '../components/AppText';
import ScreenHeader from '../components/ScreenHeader';
import ScreenLayout from '../components/ScreenLayout';
import useAppData from '../hooks/useAppData';
import useAppTheme from '../hooks/useAppTheme';
import { secondaryStyles } from '../theme/secondaryStyles';
import { persistenceStyles } from '../theme/persistenceStyles';
import useThemedStyles from '../theme/useThemedStyles';
import { palette } from '../theme/tokens';

function SettingToggle({ title, description, icon, value, onValueChange, disabled, divider = false }) {
  const styles = useThemedStyles(secondaryStyles);
  const { colors } = useAppTheme();

  return (
    <View style={[styles.settingRow, divider && styles.settingDivider]}>
      <View style={styles.settingIcon}>
        <AppIcon name={icon} />
      </View>

      <View style={styles.flexText}>
        <AppText variant="label" style={styles.settingTitle}>
          {title}
        </AppText>
        <AppText style={styles.settingDescription}>
          {description}
        </AppText>
      </View>

      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.border,
          true: palette.primaryBright,
        }}
        thumbColor="#FFFFFF"
        accessibilityLabel={title}
      />
    </View>
  );
}

const THEMES = /** @type {const} */ ([
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
  { id: 'system', label: 'Sistema' },
]);

export default function ConfiguracionScreen({ navigation }) {
  const {
    config,
    hydrated,
    loading,
    updateConfig,
    clearStats,
  } = useAppData();

  const styles = useThemedStyles(secondaryStyles);
  const dataStyles = useThemedStyles(persistenceStyles);

  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const disabled = !hydrated || loading;

  const confirmClear = () =>
    Alert.alert(
      '¿Borrar estadísticas?',
      'Se eliminarán todas las estadísticas, rachas y el ranking local. Tu nombre y tus preferencias de sonido, vibración y tema se conservarán.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            setCleared(false);

            const saved = await clearStats();

            if (mounted.current) {
              setClearing(false);
              setCleared(saved);
            }
          },
        },
      ],
    );

  return (
    <ScreenLayout>
      <ScreenHeader
        title="Configuración"
        onBack={() => navigation.popToTop()}
      />

      <View style={styles.compactIntro}>
        <AppText variant="title" style={styles.introTitle}>
          A tu manera
        </AppText>

        <AppText style={styles.introDescription}>
          Personaliza tu experiencia de juego.
        </AppText>
      </View>

      <View style={styles.settingsGroupFirst}>
        <AppText variant="eyebrow" style={styles.groupLabel}>
          SONIDO Y RESPUESTA
        </AppText>

        <View style={styles.settingsCard}>
          <SettingToggle
            title="Sonidos"
            description="Efectos del juego"
            icon="sound"
            value={config.soundEnabled}
            disabled={disabled}
            onValueChange={value => {
              void updateConfig({ soundEnabled: value });
            }}
            divider
          />

          <SettingToggle
            title="Vibración"
            description="Respuesta al acertar, fallar y terminar"
            icon="vibrate"
            value={config.hapticsEnabled}
            disabled={disabled}
            onValueChange={value => {
              void updateConfig({ hapticsEnabled: value });
            }}
          />
        </View>
      </View>

      <View style={styles.settingsGroup}>
        <AppText variant="eyebrow" style={styles.groupLabel}>
          APARIENCIA
        </AppText>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <AppIcon name="palette" />
            </View>

            <View style={styles.flexText}>
              <AppText variant="label" style={styles.settingTitle}>
                Tema visual
              </AppText>

              <AppText style={styles.settingDescription}>
                Elige cómo quieres ver la app
              </AppText>
            </View>
          </View>

          <View
            style={styles.themePicker}
            accessibilityRole="radiogroup"
            accessibilityLabel="Tema visual"
          >
            {THEMES.map((theme) => {
              const selected = theme.id === config.theme;

              return (
                <Pressable
                  key={theme.id}
                  disabled={disabled}
                  onPress={() => {
                    void updateConfig({ theme: theme.id });
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={theme.label}
                  accessibilityState={{
                    checked: selected,
                    disabled,
                  }}
                  style={[
                    styles.themeOption,
                    selected && styles.themeOptionSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.themePreview,
                      theme.id === 'dark' && styles.themePreviewDark,
                    ]}
                  >
                    {theme.id === 'system' && (
                      <View style={styles.themePreviewHalf} />
                    )}
                  </View>

                  <AppText
                    style={[
                      styles.themeLabel,
                      selected && styles.themeLabelSelected,
                    ]}
                  >
                    {theme.label}
                  </AppText>

                  {selected && (
                    <View style={styles.themeCheck}>
                      <AppIcon
                        name="check"
                        size={15}
                        color={palette.green}
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.settingsGroup}>
        <AppText variant="eyebrow" style={styles.groupLabel}>
          DATOS
        </AppText>

        <Pressable
          disabled={disabled || clearing}
          accessibilityRole="button"
          accessibilityState={{
            disabled: disabled || clearing,
          }}
          accessibilityLabel="Borrar estadísticas y ranking"
          onPress={confirmClear}
          style={[styles.settingRow, styles.settingsCard]}
        >
          <View style={[styles.settingIcon, styles.dangerIcon]}>
            <AppIcon name="trash" color={palette.danger} />
          </View>

          <View style={styles.flexText}>
            <AppText variant="label" style={styles.settingTitle}>
              {clearing ? 'Borrando…' : 'Borrar estadísticas'}
            </AppText>

            <AppText style={styles.settingDescription}>
              Restablece estadísticas y ranking
            </AppText>
          </View>

          <AppText style={styles.deleteChevron}>›</AppText>
        </Pressable>

        {cleared && (
          <AppText
            variant="small"
            style={dataStyles.confirmation}
            accessibilityLiveRegion="polite"
          >
            Estadísticas borradas. Tu perfil y preferencias se conservaron.
          </AppText>
        )}
      </View>

      {/* INFORMACIÓN DE LA APLICACIÓN */}

      <View style={styles.aboutCard}>
        <View style={styles.miniLogo}>
          <AppText style={styles.miniLogoText}>¿A?</AppText>
        </View>

        <View style={styles.aboutCopy}>
          <AppText style={styles.aboutTitle}>
            El Ahorcado Móvil
          </AppText>

          <AppText style={styles.aboutDescription}>
            Versión 1.0.0 · Hecho en Colombia
          </AppText>

        </View>
      </View>
    </ScreenLayout>
  );
}
