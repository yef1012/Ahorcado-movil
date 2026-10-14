import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { gameStyles } from '../theme/gameStyles';
import useThemedStyles from '../theme/useThemedStyles';
import { getWordLayout } from '../utils/wordLayout';
import AppText from './AppText';

/** @param {{slots: {character: string, isLetter: boolean, revealed: boolean}[]}} props */
export default function PalabraOculta({ slots }) {
  const styles = useThemedStyles(gameStyles);
  const { width, fontScale } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const availableWidth = measuredWidth || Math.min(width - 40, 480);
  const { groups, slotWidth, slotGap } = getWordLayout(slots, availableWidth, fontScale);
  const spokenWord = slots.map((slot) => slot.isLetter ? (slot.revealed ? slot.character : 'letra oculta') : (/\s/.test(slot.character) ? 'espacio' : slot.character)).join(', ');

  return (
    <View
      style={styles.wordSlots}
      onLayout={({ nativeEvent }) => setMeasuredWidth(nativeEvent.layout.width)}
      accessible accessibilityLabel={`Palabra: ${spokenWord}`}
      accessibilityLiveRegion="polite"
    >
      {groups.map((group, groupIndex) => (
        <View key={groupIndex} style={[styles.wordGroup, { gap: slotGap }]} accessible={false}>
          {group.map((slot, index) => (
            <View key={index} style={[styles.wordSlot, { width: slotWidth, minHeight: Math.max(39, 29 * fontScale) }, !slot.isLetter && styles.wordSign]}>
              <AppText style={styles.wordLetter}>{slot.revealed ? slot.character : ''}</AppText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
