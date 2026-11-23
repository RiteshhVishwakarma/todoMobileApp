import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import type { Priority } from '@/types/task';

import { AppText } from './AppText';

const LABELS: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' };

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { colors } = useAppTheme();
  const palette = {
    high: { fg: colors.priorityHigh, bg: colors.priorityHighSoft },
    medium: { fg: colors.priorityMedium, bg: colors.priorityMediumSoft },
    low: { fg: colors.priorityLow, bg: colors.priorityLowSoft },
  }[priority];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <View style={[styles.dot, { backgroundColor: palette.fg }]} />
      <AppText style={[styles.text, { color: palette.fg }]}>{LABELS[priority]}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700' },
});
