import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import { formatLongDate, monthName, toDateKey, todayKey } from '@/utils/date';

import { AppText } from './AppText';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export type MonthCursor = { year: number; month: number };

export function cursorFor(date: Date): MonthCursor {
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function shiftCursor({ year, month }: MonthCursor, delta: number): MonthCursor {
  return cursorFor(new Date(year, month + delta, 1));
}

/** Date cells for a month, padded with nulls so weeks line up. */
function buildMonth(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type Props = {
  cursor: MonthCursor;
  onCursorChange: (cursor: MonthCursor) => void;
  selected: string;
  onSelect: (dateKey: string) => void;
  /** Optional per-date task counts — shows dots and a legend. */
  indicators?: Map<string, { open: number; done: number }>;
  /** Flat style for embedding inside a form. */
  embedded?: boolean;
};

export function MonthCalendar({
  cursor,
  onCursorChange,
  selected,
  onSelect,
  indicators,
  embedded,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const today = todayKey();
  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);

  return (
    <View
      style={[
        styles.calendar,
        { backgroundColor: colors.card, borderColor: colors.border },
        !embedded && softShadow(colors, isDark),
      ]}>
      <View style={styles.monthRow}>
        <Pressable
          onPress={() => onCursorChange(shiftCursor(cursor, -1))}
          hitSlop={8}
          accessibilityLabel="Previous month"
          style={[styles.navBtn, { backgroundColor: colors.lightPink }]}>
          <ChevronLeft size={18} color={colors.accent} strokeWidth={2.4} />
        </Pressable>
        <AppText variant="heading">
          {monthName(cursor.month)} {cursor.year}
        </AppText>
        <Pressable
          onPress={() => onCursorChange(shiftCursor(cursor, 1))}
          hitSlop={8}
          accessibilityLabel="Next month"
          style={[styles.navBtn, { backgroundColor: colors.lightPink }]}>
          <ChevronRight size={18} color={colors.accent} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEK.map((w, i) => (
          <View key={i} style={styles.cell}>
            <AppText variant="caption" secondary style={styles.bold}>
              {w}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, i) => {
          if (!date) return <View key={`pad-${i}`} style={styles.cell} />;
          const key = toDateKey(date);
          const isSelected = key === selected;
          const isToday = key === today;
          const info = indicators?.get(key);
          return (
            <View key={key} style={styles.cell}>
              <Pressable
                onPress={() => onSelect(key)}
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
                {indicators && (
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
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      {indicators && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
