import { router } from 'expo-router';
import { CalendarDays, Check, CircleCheckBig, Clock, RotateCcw } from 'lucide-react-native';
import { memo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { getCategory } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/colors';
import { useTaskStore } from '@/stores/taskStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import type { Task } from '@/types/task';
import { formatRelativeDate, formatTime, isoToDateKey, todayKey } from '@/utils/date';

import { AppText } from './AppText';
import { PriorityBadge } from './PriorityBadge';

type Props = {
  task: Task;
  /** Show the due date next to the time (for lists that span several days). */
  showDate?: boolean;
  /** Completed-list mode: shows completion date and a Restore button. */
  showCompletedDate?: boolean;
};

function TaskCardBase({ task, showDate, showCompletedDate }: Props) {
  const { colors, isDark } = useAppTheme();
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);
  const [scale] = useState(() => new Animated.Value(1));
  const category = getCategory(task.category);
  const CategoryIcon = category.icon;
  const done = task.isCompleted;
  const overdue = !done && task.dueDate < todayKey();
  const time = formatTime(task.dueTime);
  const completedKey = isoToDateKey(task.completedAt);

  const toggle = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.8, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    toggleCompleted(task.id);
  };

  const openDetails = () =>
    router.push({ pathname: '/task-details/[id]', params: { id: task.id } });

  return (
    <Pressable
      onPress={openDetails}
      accessibilityRole="button"
      accessibilityLabel={`Open task ${task.title}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        softShadow(colors, isDark, 0.7),
        pressed && styles.pressed,
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

          {showCompletedDate ? (
            <View style={styles.metaItem}>
              <CircleCheckBig size={13} color={colors.success} strokeWidth={2.2} />
              <AppText variant="caption" secondary>
                {completedKey ? formatRelativeDate(completedKey) : 'Done'}
              </AppText>
            </View>
          ) : (
            <>
              {showDate && (
                <View style={styles.metaItem}>
                  <CalendarDays
                    size={13}
                    color={overdue ? colors.priorityHigh : colors.textSecondary}
                    strokeWidth={2}
                  />
                  <AppText
                    variant="caption"
                    color={overdue ? colors.priorityHigh : undefined}
                    secondary={!overdue}>
                    {formatRelativeDate(task.dueDate)}
                  </AppText>
                </View>
              )}
              {time !== '' && (
                <View style={styles.metaItem}>
                  <Clock size={13} color={colors.textSecondary} strokeWidth={2} />
                  <AppText variant="caption" secondary>
                    {time}
                  </AppText>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {showCompletedDate ? (
        <Pressable
          onPress={() => toggleCompleted(task.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Restore "${task.title}"`}
          style={({ pressed }) => [
            styles.restore,
            { backgroundColor: colors.lightPink },
            pressed && styles.pressed,
          ]}>
          <RotateCcw size={13} color={colors.accent} strokeWidth={2.4} />
          <AppText style={[styles.restoreText, { color: colors.accent }]}>Restore</AppText>
        </Pressable>
      ) : (
        <PriorityBadge priority={task.priority} />
      )}
    </Pressable>
  );
}

export const TaskCard = memo(TaskCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  pressed: { opacity: 0.85 },
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
  restore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  restoreText: { fontSize: 12, fontWeight: '700' },
});
