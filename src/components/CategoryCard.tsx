import { ChevronRight, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import type { Category } from '@/types/task';

import { AppText } from './AppText';

type Props = {
  category: Category;
  total: number;
  completed: number;
  onPress?: () => void;
  /** Shown for custom categories only. */
  onDelete?: () => void;
};

export function CategoryCard({ category, total, completed, onPress, onDelete }: Props) {
  const { colors, isDark } = useAppTheme();
  const tint = isDark ? category.darkTint : category.tint;
  const iconColor = isDark ? category.darkColor : category.color;
  const Icon = category.icon;
  const pct = total === 0 ? 0 : completed / total;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, ${total} tasks`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        softShadow(colors, isDark, 0.7),
        pressed && styles.pressed,
      ]}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: tint }]}>
          <Icon size={24} color={iconColor} strokeWidth={2} />
        </View>
        {onDelete ? (
          <Pressable
            onPress={onDelete}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Delete category ${category.name}`}
            style={({ pressed }) => [
              styles.deleteBtn,
              { backgroundColor: colors.priorityHighSoft },
              pressed && styles.pressed,
            ]}>
            <Trash2 size={14} color={colors.priorityHigh} strokeWidth={2.2} />
          </Pressable>
        ) : (
          <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />
        )}
      </View>

      <AppText variant="heading" numberOfLines={1} style={styles.name}>
        {category.name}
      </AppText>
      <AppText variant="caption" secondary>
        {total} {total === 1 ? 'task' : 'tasks'}
      </AppText>

      <View style={[styles.track, { backgroundColor: colors.lightPink }]}>
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${pct * 100}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 2,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { marginBottom: 2 },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { height: 6, borderRadius: 3, marginTop: Spacing.md, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
