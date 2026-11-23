import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import type { Category } from '@/types/task';

import { AppText } from './AppText';

type Props = {
  /** Omit for an "All" chip. */
  category?: Category;
  label?: string;
  active: boolean;
  onPress: () => void;
};

/** Selectable pill used for category pickers and filters. */
export function CategoryChip({ category, label, active, onPress }: Props) {
  const { colors, isDark } = useAppTheme();
  const Icon = category?.icon;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.lightPink : colors.card,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}>
      {Icon && category && (
        <Icon
          size={15}
          color={active ? colors.accent : isDark ? category.darkColor : category.color}
          strokeWidth={2.2}
        />
      )}
      <AppText
        variant="caption"
        color={active ? colors.accent : colors.text}
        style={styles.label}>
        {label ?? category?.name ?? 'All'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  label: { fontWeight: '700' },
});
