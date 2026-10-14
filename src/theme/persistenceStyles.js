import { StyleSheet } from 'react-native';
import { fonts, palette } from './tokens';

export const persistenceStyles = StyleSheet.create({
  notice: { width: '100%', borderWidth: 1, borderColor: palette.border, borderRadius: 16, padding: 14, marginBottom: 14, backgroundColor: palette.surface, gap: 9 },
  noticeText: { color: palette.muted, textAlign: 'center' },
  noticeButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 9 },
  noticeLink: { color: palette.primary, fontFamily: fonts.bold, textAlign: 'center' },
  error: { color: palette.danger },
  streak: { marginTop: 12, padding: 12, backgroundColor: palette.mint, borderRadius: 14 },
  streakText: { color: palette.primary, textAlign: 'center' },
  rankingList: { gap: 9 },
  rankingRow: { minHeight: 84, padding: 12, borderRadius: 16, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  position: { width: 32, minHeight: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.mint },
  firstPosition: { backgroundColor: '#FBF6E8' },
  positionText: { color: palette.primary, fontFamily: fonts.bold },
  rankingCopy: { flex: 1, minWidth: 0, gap: 3 },
  rankingName: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 17 },
  rankingDetail: { fontSize: 9, lineHeight: 14, color: palette.muted },
  rankingScore: { maxWidth: '27%', alignItems: 'flex-end' },
  scoreValue: { fontFamily: fonts.extraBold, fontSize: 17, lineHeight: 24, color: palette.primary },
  scoreLabel: { fontSize: 8, color: palette.muted },
  confirmation: { color: palette.primary, textAlign: 'center', marginTop: 10 },
});
