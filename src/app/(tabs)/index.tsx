import { router } from 'expo-router';
import { ChevronRight, CircleCheckBig, Cloud, Flower2, Heart, Moon } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ProgressCard } from '@/components/ProgressCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { TaskCard } from '@/components/TaskCard';
import { Radius, Spacing } from '@/constants/colors';
import { DUMMY_TASKS } from '@/data/tasks';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import { formatLongDate, greetingForHour, todayKey } from '@/utils/date';

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();
  const now = new Date();
  const today = todayKey();

  const todayTasks = DUMMY_TASKS.filter((t) => t.dueDate === today);
  const doneToday = todayTasks.filter((t) => t.completed).length;
  const upcoming = DUMMY_TASKS.filter((t) => t.dueDate > today && !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);
  const completedCount = DUMMY_TASKS.filter((t) => t.completed).length;

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
              <AppText variant="display">Hey, Beautiful!</AppText>
              <Heart size={24} color={colors.accent} fill={colors.accent} strokeWidth={2} />
            </View>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.lightPink }]}>
            <Flower2 size={24} color={colors.accent} strokeWidth={2} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(80)}>
          <Pressable onPress={() => router.push('/completed')} accessibilityRole="button">
            <ProgressCard completed={doneToday} total={todayTasks.length} />
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
          />
        ) : (
          <View style={styles.list}>
            {todayTasks.map((task, i) => (
              <Animated.View key={task.id} entering={FadeInDown.duration(400).delay(200 + i * 60)}>
                <TaskCard task={task} />
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
              <TaskCard key={task.id} task={task} showDate />
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
