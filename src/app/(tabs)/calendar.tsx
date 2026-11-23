import { ChevronLeft, ChevronRight, Moon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { CustomHeader } from '@/components/CustomHeader';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { TaskCard } from '@/components/TaskCard';
import { Radius, Spacing } from '@/constants/colors';
import { DUMMY_TASKS } from '@/data/tasks';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import { formatLongDate, fromDateKey, monthName, toDateKey, todayKey } from '@/utils/date';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Returns 6×7 grid of dates (null = padding cell) for the given month. */
function buildMonth(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarScreen() {
  const { colors, isDark } = useAppTheme();
  const today = todayKey();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState(today);

  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);
  const taskDates = useMemo(() => {
    const map = new Map<string, { open: number; done: number }>();
    for (const t of DUMMY_TASKS) {
      const entry = map.get(t.dueDate) ?? { open: 0, done: 0 };
      if (t.completed) entry.done++;
      else entry.open++;
      map.set(t.dueDate, entry);
    }
    return map;
  }, []);

  const selectedTasks = DUMMY_TASKS.filter((t) => t.dueDate === selected);

  const shiftMonth = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToday = () => {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(today);
  };

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
        <View
          style={[
            styles.calendar,
            { backgroundColor: colors.card, borderColor: colors.border },
            softShadow(colors, isDark),
          ]}>
          {/* Month nav */}
          <View style={styles.monthRow}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              hitSlop={8}
              accessibilityLabel="Previous month"
              style={[styles.navBtn, { backgroundColor: colors.lightPink }]}>
              <ChevronLeft size={18} color={colors.accent} strokeWidth={2.4} />
            </Pressable>
            <AppText variant="heading">
              {monthName(cursor.month)} {cursor.year}
            </AppText>
            <Pressable
              onPress={() => shiftMonth(1)}
              hitSlop={8}
              accessibilityLabel="Next month"
              style={[styles.navBtn, { backgroundColor: colors.lightPink }]}>
              <ChevronRight size={18} color={colors.accent} strokeWidth={2.4} />
            </Pressable>
          </View>

          {/* Weekday labels */}
          <View style={styles.grid}>
            {WEEK.map((w, i) => (
              <View key={i} style={styles.cell}>
                <AppText variant="caption" secondary style={styles.bold}>
                  {w}
                </AppText>
              </View>
            ))}
          </View>

          {/* Days */}
          <View style={styles.grid}>
            {cells.map((date, i) => {
              if (!date) return <View key={`pad-${i}`} style={styles.cell} />;
              const key = toDateKey(date);
              const isSelected = key === selected;
              const isToday = key === today;
              const info = taskDates.get(key);
              return (
                <View key={key} style={styles.cell}>
                  <Pressable
                    onPress={() => setSelected(key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={formatLongDate(date)}
                    style={[
                      styles.day,
                      isToday && !isSelected && { borderColor: colors.primary, borderWidth: 1.5 },
                      isSelected && { backgroundColor: colors.accent },
                    ]}>
                    <AppText
                      variant="bodyStrong"
                      color={isSelected ? colors.white : isToday ? colors.accent : colors.text}>
                      {date.getDate()}
                    </AppText>
                    <View style={styles.dots}>
                      {info && info.open > 0 && (
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: isSelected ? colors.white : colors.accent },
                          ]}
                        />
                      )}
                      {info && info.done > 0 && (
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: isSelected ? colors.lightPink : colors.primary },
                          ]}
                        />
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={[styles.legend, { borderTopColor: colors.border }]}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              <AppText variant="caption" secondary>
                To do
              </AppText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <AppText variant="caption" secondary>
                Done
              </AppText>
            </View>
          </View>
        </View>

        <SectionHeader
          title={selected === today ? 'Today' : formatLongDate(fromDateKey(selected))}
          count={selectedTasks.length}
        />
        {selectedTasks.length === 0 ? (
          <EmptyState
            compact
            icon={Moon}
            title="A free day"
            message="No tasks on this date. Time to rest and recharge."
          />
        ) : (
          <View style={styles.list}>
            {selectedTasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </View>
        )}
      </ScrollView>

      <AddTaskButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 110 },
  todayBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill },
  bold: { fontWeight: '700' },
  calendar: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  day: {
    width: 40,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 3, height: 5, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  list: { gap: Spacing.md },
});
