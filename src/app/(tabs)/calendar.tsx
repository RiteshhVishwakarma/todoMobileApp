import { router } from 'expo-router';
import { CalendarPlus, Moon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { CustomHeader } from '@/components/CustomHeader';
import { EmptyState } from '@/components/EmptyState';
import { cursorFor, MonthCalendar } from '@/components/MonthCalendar';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { TaskCard } from '@/components/TaskCard';
import { Radius, Spacing } from '@/constants/colors';
import { useTaskStore } from '@/stores/taskStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { formatLongDate, fromDateKey, todayKey } from '@/utils/date';
import { dateIndicators, tasksOnDate } from '@/utils/tasks';

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const today = todayKey();
  const tasks = useTaskStore((s) => s.tasks);
  const [cursor, setCursor] = useState(() => cursorFor(new Date()));
  const [selected, setSelected] = useState(today);

  const indicators = useMemo(() => dateIndicators(tasks), [tasks]);
  const selectedTasks = useMemo(() => tasksOnDate(tasks, selected), [tasks, selected]);
  const selectedDate = fromDateKey(selected);

  const goToday = () => {
    setCursor(cursorFor(new Date()));
    setSelected(today);
  };

  const addForSelected = () =>
    router.push({ pathname: '/add-task', params: { date: selected } });

  return (
    <Screen>
      <CustomHeader
        title="Calendar"
        subtitle="Plan your days with love"
        right={
          <Pressable
            onPress={goToday}
            accessibilityRole="button"
            style={[styles.todayBtn, { backgroundColor: colors.lightPink }]}>
            <AppText variant="caption" color={colors.accent} style={styles.bold}>
              Today
            </AppText>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MonthCalendar
          cursor={cursor}
          onCursorChange={setCursor}
          selected={selected}
          onSelect={setSelected}
          indicators={indicators}
        />

        <SectionHeader
          title={
            selected === today ? 'Today' : selectedDate ? formatLongDate(selectedDate) : 'Tasks'
          }
          count={selectedTasks.length}
          actionLabel="Add here"
          onAction={addForSelected}
        />
        {selectedTasks.length === 0 ? (
          <EmptyState
            compact
            icon={Moon}
            title="A free day"
            message="No tasks on this date. Time to rest and recharge."
            action={
              <Pressable
                onPress={addForSelected}
                accessibilityRole="button"
                style={[styles.addHere, { backgroundColor: colors.lightPink }]}>
                <CalendarPlus size={16} color={colors.accent} strokeWidth={2.2} />
                <AppText variant="caption" color={colors.accent} style={styles.bold}>
                  Plan something for this day
                </AppText>
              </Pressable>
            }
          />
        ) : (
          <View style={styles.list}>
            {selectedTasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </View>
        )}
      </ScrollView>

      <AddTaskButton onPress={addForSelected} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 110 },
  todayBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill },
  bold: { fontWeight: '700' },
  list: { gap: Spacing.md },
  addHere: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
});
