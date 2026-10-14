import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import AppIcon from '../components/AppIcon';
import AppText from '../components/AppText';
import { GameLogo, PremiumGameArt } from '../components/Illustrations';
import PlayerNameModal from '../components/PlayerNameModal';
import ScreenLayout from '../components/ScreenLayout';
import usePlayer from '../hooks/usePlayer';
import useAppTheme from '../hooks/useAppTheme';
import { ROUTES } from '../navigation/routes';
import { homeStyles } from '../theme/homeStyles';
import useThemedStyles from '../theme/useThemedStyles';
import { gradients } from '../theme/tokens';

const MENU = /** @type {const} */ ([
  { title: 'Instrucciones', caption: 'Aprende las reglas', icon: 'book', route: ROUTES.INSTRUCCIONES, colors: ['#E9F7E9', '#D8EED9'], color: '#26783B' },
  { title: 'Estadísticas', caption: 'Consulta tu progreso', icon: 'chart', route: ROUTES.ESTADISTICAS, colors: ['#EAF6F8', '#DCEEF3'], color: '#286A8D' },
  { title: 'Configuración', caption: 'Personaliza tu juego', icon: 'settings', route: ROUTES.CONFIGURACION, colors: ['#FBF6E8', '#F0E6C8'], color: '#786332' },
]);

export default function InicioScreen({ navigation }) {
  const styles = useThemedStyles(homeStyles);
  const { resolveColors } = useAppTheme();
  const { name, hydrated, saveName } = usePlayer();
  const [editingName, setEditingName] = useState(false);
  const { width, height, fontScale } = useWindowDimensions();
  const showNameModal = hydrated && (!name || editingName);
  const stackMenu = width < 350 || fontScale > 1.2;
  const closeName = () => name ? setEditingName(false) : navigation.replace(ROUTES.SPLASH);

  return (
    <>
      <ScreenLayout contentStyle={styles.homeContent}>
        <View importantForAccessibility={showNameModal ? 'no-hide-descendants' : 'auto'} accessibilityElementsHidden={showNameModal}>
          <View style={styles.homeHeader}>
            <View style={styles.brandLockup}>
              <GameLogo size={48} />
              <View><AppText style={styles.brandTop}>EL AHORCADO</AppText><AppText style={styles.brandTitle}>Móvil</AppText></View>
            </View>
            <Pressable disabled={!hydrated} accessibilityRole="button" accessibilityState={{ disabled: !hydrated }} accessibilityLabel="Editar nombre del jugador" onPress={() => setEditingName(true)} style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}>
              {name ? <AppText style={styles.profileInitial}>{name.charAt(0).toLocaleUpperCase('es')}</AppText> : <AppIcon name="settings" size={19} />}
            </Pressable>
          </View>
          <View style={styles.welcome}>
            <AppText variant="eyebrow" style={styles.welcomeEyebrow}>HOLA{name ? `, ${name.toLocaleUpperCase('es')}` : ''}</AppText>
            <AppText variant="title" accessibilityRole="header" style={styles.welcomeTitle}>¿Qué palabra{'\n'}descubrimos hoy?</AppText>
          </View>
          <LinearGradient colors={resolveColors(gradients.hero)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, height < 740 && styles.heroCompact]}>
            <View pointerEvents="none" style={styles.heroRing} />
            <View style={styles.heroArt}><PremiumGameArt height={214} /></View>
            <View style={styles.colombiaLabel}>
              <View style={styles.flag}><View style={styles.flagYellow} /><View style={styles.flagBlue} /><View style={styles.flagRed} /></View>
              <AppText style={styles.colombiaText}>DESAFÍO COLOMBIANO</AppText>
            </View>
            <View style={styles.heroMessage}>
              <AppText style={styles.heroMessageEyebrow}>NUEVA PARTIDA</AppText>
              <AppText style={styles.heroMessageTitle}>Explora Colombia{'\n'}letra por letra</AppText>
            </View>
          </LinearGradient>
          <Pressable disabled={!hydrated || !name} accessibilityState={{ disabled: !hydrated || !name }} accessibilityRole="button" accessibilityLabel="Jugar ahora. Elige categoría y dificultad" onPress={() => navigation.navigate(ROUTES.CATEGORIA)} style={({ pressed }) => [styles.playWrapper, pressed && styles.pressed]}>
            <LinearGradient colors={resolveColors(gradients.play)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.playNow}>
              <View pointerEvents="none" style={styles.playInset} />
              <View style={styles.playGlyph}><AppIcon name="play" size={25} color="#14743C" /></View>
              <View style={styles.playCopy}><AppText style={styles.playTitle}>JUGAR AHORA</AppText><AppText style={styles.playCaption}>Elige categoría y dificultad</AppText></View>
              <AppIcon name="forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
          <View style={[styles.menu, stackMenu && styles.menuStack]}>
            {MENU.map((item) => (
              <Pressable key={item.route} accessibilityRole="button" onPress={() => navigation.navigate(item.route)} style={({ pressed }) => [styles.menuCard, stackMenu && styles.menuCardWide, pressed && styles.pressed]}>
                <LinearGradient colors={resolveColors(item.colors)} style={styles.menuIcon}><AppIcon name={item.icon} color={item.color} /></LinearGradient>
                <View style={[styles.menuCopy, stackMenu && styles.menuCopyWide]}><AppText style={styles.menuTitle}>{item.title}</AppText><AppText style={styles.menuCaption}>{item.caption}</AppText></View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScreenLayout>
      {showNameModal && <PlayerNameModal initialName={name} onClose={closeName} onSave={async (value) => { const saved = await saveName(value); if (saved) setEditingName(false); return saved; }} />}
    </>
  );
}
