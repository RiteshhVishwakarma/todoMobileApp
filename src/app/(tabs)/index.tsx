import { router } from 'expo-router';
import { ChevronRight, CircleCheckBig, Cloud, Flower2, Heart, Moon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ProgressCard } from '@/components/ProgressCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { SwipeableTaskCard } from '@/components/SwipeableTaskCard';
import { Radius, Spacing } from '@/constants/colors';
import { useAppStore } from '@/stores/appStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import { formatLongDate, greetingForHour, todayKey } from '@/utils/date';
import { overdueTasks, progress, tasksOnDate, upcomingTasks } from '@/utils/tasks';

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();
  const now = new Date();
  const today = todayKey();

  const tasks = useAppStore((s) => s.tasks);

  const { todayTasks, overdue, upcoming, completedCount, todayProgress } = useMemo(() => {
    const todays = tasksOnDate(tasks, today);
    return {
      todayTasks: todays,
      overdue: overdueTasks(tasks, today),
      upcoming: upcomingTasks(tasks, today),
      completedCount: tasks.filter((t) => t.isCompleted).length,
      todayProgress: progress(todays),
    };
  }, [tasks, today]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
          <View style={styles.headerText}>
            <AppText variant="caption" secondary>
              {greetingForHour(now.getHours())} · {formatLongDate(now)}
            </AppText>
            <View style={styles.greetingRow}>
              <AppText
                variant="display"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={styles.greetingText}>
                Hey, Beautiful!
              </AppText>
              <Heart size={24} color={colors.accent} fill={colors.accent} strokeWidth={2} />
            </View>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.lightPink }]}>
            <Flower2 size={24} color={colors.accent} strokeWidth={2} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(80)}>
          <Pressable onPress={() => router.push('/completed')} accessibilityRole="button">
            <ProgressCard completed={todayProgress.done} total={todayProgress.total} />
          </Pressable>
        </Animated.View>

        {/* Completed shortcut */}
        <Animated.View entering={FadeInDown.duration(450).delay(140)}>
          <Pressable
            onPress={() => router.push('/completed')}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.completedLink,
              { backgroundColor: colors.card, borderColor: colors.border },
              softShadow(colors, isDark, 0.5),
              pressed && { opacity: 0.8 },
            ]}>
            <View style={[styles.completedIcon, { backgroundColor: colors.successSoft }]}>
              <CircleCheckBig size={18} color={colors.success} strokeWidth={2.3} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">Completed tasks</AppText>
              <AppText variant="caption" secondary>
                {completedCount} little wins so far
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {/* Overdue (only when there is something to catch up on) */}
        {overdue.length > 0 && (
          <>
            <SectionHeader title="Overdue" count={overdue.length} />
            <View style={styles.list}>
              {overdue.map((task) => (
                <SwipeableTaskCard key={task.id} task={task} showDate />
              ))}
            </View>
          </>
        )}

        {/* Today */}
        <SectionHeader
          title="Today's Tasks"
          count={todayTasks.length}
          actionLabel="See all"
          onAction={() => router.push('/tasks')}
        />
        {todayTasks.length === 0 ? (
          <EmptyState
            compact
            icon={Cloud}
            title="Nothing planned today"
            message="Enjoy a slow day, or add something sweet to your list."
            action={<AddTaskButton variant="inline" label="Add a task" />}
          />
        ) : (
          <View style={styles.list}>
            {todayTasks.map((task, i) => (
              <Animated.View
                key={task.id}
                entering={FadeInDown.duration(400).delay(Math.min(i, 5) * 60)}>
                <SwipeableTaskCard task={task} />
              </Animated.View>
            ))}
          </View>
        )}

        {/* Upcoming */}
        <SectionHeader
          title="Upcoming"
          count={upcoming.length}
          actionLabel="Calendar"
          onAction={() => router.push('/calendar')}
        />
        {upcoming.length === 0 ? (
          <EmptyState
            compact
            icon={Moon}
            title="All clear ahead"
            message="No upcoming tasks. Your future self says thank you!"
          />
        ) : (
          <View style={styles.list}>
            {upcoming.map((task) => (
              <SwipeableTaskCard key={task.id} task={task} showDate />
            ))}
          </View>
        )}
      </ScrollView>

      <AddTaskButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 110 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  headerText: { flex: 1 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  greetingText: { flexShrink: 1 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  completedIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  list: { gap: Spacing.md },
});
