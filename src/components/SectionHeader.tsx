import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';

import { AppText } from './AppText';

type Props = {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, count, actionLabel, onAction }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <AppText variant="heading">{title}</AppText>
        {count !== undefined && (
          <View style={[styles.count, { backgroundColor: colors.lightPink }]}>
            <AppText style={[styles.countText, { color: colors.accentText }]}>{count}</AppText>
          </View>
        )}
      </View>
      {actionLabel && (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <AppText variant="caption" color={colors.accentText} style={styles.action}>
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  count: { paddingHorizontal: 8, paddingVertical: 1, borderRadius: 999 },
  countText: { fontSize: 12, fontWeight: '700' },
  action: { fontWeight: '700' },
});
