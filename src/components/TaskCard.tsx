import { CalendarDays, Check, CircleCheckBig, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { getCategory } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import type { Task } from '@/types/task';
import { formatRelativeDate } from '@/utils/date';

import { AppText } from './AppText';
import { PriorityBadge } from './PriorityBadge';

type Props = {
  task: Task;
  /** Show the due date next to the time (for lists that span several days). */
  showDate?: boolean;
  /** Show "Completed <date>" instead of the due info. */
  showCompletedDate?: boolean;
};

/**
 * Presentational task card. The checkbox only toggles local visual state —
 * real task management arrives in a later phase.
 */
export function TaskCard({ task, showDate, showCompletedDate }: Props) {
  const { colors, isDark } = useAppTheme();
  const [done, setDone] = useState(task.completed);
  const [scale] = useState(() => new Animated.Value(1));
  const category = getCategory(task.categoryId);
  const CategoryIcon = category.icon;

  const toggle = () => {
    setDone((d) => !d);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.8, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        softShadow(colors, isDark, 0.7),
      ]}>
      <Pressable
        onPress={toggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`Mark "${task.title}" as ${done ? 'not done' : 'done'}`}>
        <Animated.View
          style={[
            styles.checkbox,
            {
              borderColor: done ? colors.accent : colors.primary,
              backgroundColor: done ? colors.accent : 'transparent',
              transform: [{ scale }],
            },
          ]}>
          {done && <Check size={14} color={colors.white} strokeWidth={3} />}
        </Animated.View>
      </Pressable>

      <View style={styles.body}>
        <AppText
          variant="bodyStrong"
          numberOfLines={2}
          secondary={done}
          style={done && styles.strike}>
          {task.title}
        </AppText>

        <View style={styles.meta}>
          <View
            style={[
              styles.categoryChip,
              { backgroundColor: isDark ? category.darkTint : category.tint },
            ]}>
            <CategoryIcon
              size={11}
              color={isDark ? category.darkColor : category.color}
              strokeWidth={2.4}
            />
            <AppText style={styles.categoryText}>{category.name}</AppText>
          </View>

          {showCompletedDate && task.completedAt ? (
            <View style={styles.metaItem}>
              <CircleCheckBig size={13} color={colors.success} strokeWidth={2.2} />
              <AppText variant="caption" secondary>
                {formatRelativeDate(task.completedAt)}
              </AppText>
            </View>
          ) : (
            <>
              {showDate && (
                <View style={styles.metaItem}>
                  <CalendarDays size={13} color={colors.textSecondary} strokeWidth={2} />
                  <AppText variant="caption" secondary>
                    {formatRelativeDate(task.dueDate)}
                  </AppText>
                </View>
              )}
              {task.dueTime && (
                <View style={styles.metaItem}>
                  <Clock size={13} color={colors.textSecondary} strokeWidth={2} />
                  <AppText variant="caption" secondary>
                    {task.dueTime}
                  </AppText>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {!showCompletedDate && <PriorityBadge priority={task.priority} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 6 },
  strike: { textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  categoryText: { fontSize: 11, fontWeight: '600' },
});
