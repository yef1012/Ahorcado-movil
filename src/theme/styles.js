import { StyleSheet } from 'react-native';
import { fonts, palette, shadows } from './tokens';

export const textVariants = StyleSheet.create({
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: palette.text },
  small: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16, color: palette.muted },
  caption: { fontFamily: fonts.body, fontSize: 9, lineHeight: 13, color: palette.muted },
  eyebrow: { fontFamily: fonts.bold, fontSize: 9, lineHeight: 14, letterSpacing: 1.5, color: palette.primaryBright },
  title: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34, letterSpacing: -1, color: palette.text },
  heading: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 25, color: palette.text },
  label: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 19, color: palette.text },
});
export function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    safeArea: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    screenContent: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 },
    creditsFooter: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', flexShrink: 0, marginTop: 'auto', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, gap: 3 },
    creditsDivider: { width: 40, height: 2, borderRadius: 1, backgroundColor: colors.border, marginBottom: 7 },
    creditsLabel: { width: '100%', textAlign: 'center', fontFamily: fonts.body, fontSize: 11, lineHeight: 16, color: colors.muted },
    creditsNames: { width: '100%', textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.primary },
    creditsInstitution: { width: '100%', textAlign: 'center', fontFamily: fonts.body, fontSize: 10, lineHeight: 15, letterSpacing: 0.6, color: colors.muted },
    header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 13 },
    headerCopy: { flex: 1, gap: 1 },
    iconButton: { minWidth: 48, minHeight: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, ...shadows.card },
    headerMark: { width: 35, height: 35, borderRadius: 12, backgroundColor: colors.buttonPrimary, alignItems: 'center', justifyContent: 'center' },
    headerMarkText: { color: colors.onPrimary, fontFamily: fonts.extraBold, fontSize: 16 },
    button: { width: '100%', borderRadius: 17, backgroundColor: colors.buttonPrimary, ...shadows.button },
    buttonContent: { minHeight: 54, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 9, borderRadius: 17 },
    buttonText: { color: colors.onPrimary, fontFamily: fonts.extraBold, fontSize: 15, textAlign: 'center', flexShrink: 1 },
    secondaryButton: { backgroundColor: colors.surface },
    secondaryButtonText: { color: colors.primary },
    pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
    disabled: { opacity: 0.55, elevation: 0 },
  });
}
