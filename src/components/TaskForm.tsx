import { BellRing, CalendarDays, CircleAlert, Clock, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { CATEGORIES } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/colors';
import { MAX_TITLE_LENGTH } from '@/stores/taskStore';
import { useAppTheme } from '@/theme/ThemeContext';
import type { Priority, TaskInput } from '@/types/task';
import {
  addDays,
  formatLongDate,
  formatTime,
  fromDateKey,
  isValidDateKey,
  toDateKey,
  todayKey,
} from '@/utils/date';

import { AppText } from './AppText';
import { CategoryChip } from './CategoryChip';
import { cursorFor, MonthCalendar } from './MonthCalendar';
import { TimePicker } from './TimePicker';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const DEFAULT_TIME = '09:00';

type Props = {
  heading: string;
  submitLabel: string;
  initial?: Partial<TaskInput>;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
};

export function TaskForm({ heading, submitLabel, initial, onSubmit, onCancel }: Props) {
  const { colors } = useAppTheme();
  const today = todayKey();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [category, setCategory] = useState(initial?.category ?? 'personal');
  const [dueDate, setDueDate] = useState(
    isValidDateKey(initial?.dueDate) ? initial.dueDate : today,
  );
  const [dueTime, setDueTime] = useState<string | undefined>(initial?.dueTime);
  const [reminder, setReminder] = useState(initial?.reminder ?? false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [cursor, setCursor] = useState(() => cursorFor(fromDateKey(dueDate) ?? new Date()));
  const [error, setError] = useState<string | null>(null);

  const quickDates = [
    { label: 'Today', key: today },
    { label: 'Tomorrow', key: toDateKey(addDays(new Date(), 1)) },
    { label: 'Next week', key: toDateKey(addDays(new Date(), 7)) },
  ];
  const isQuick = quickDates.some((d) => d.key === dueDate);
  const dueDateObj = fromDateKey(dueDate);

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please give your task a title.');
      return;
    }
    if (!isValidDateKey(dueDate)) {
      setError('Please choose a valid due date.');
      return;
    }
    onSubmit({
      title: trimmed,
      description: description.trim() || undefined,
      category,
      priority,
      dueDate,
      dueTime,
      reminder,
    });
  };

  const priorityTone = (p: Priority) =>
    ({
      high: { fg: colors.priorityHigh, bg: colors.priorityHighSoft },
      medium: { fg: colors.priorityMedium, bg: colors.priorityMediumSoft },
      low: { fg: colors.priorityLow, bg: colors.priorityLowSoft },
    })[p];

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
  ];
  const switchProps = {
    trackColor: { false: colors.border, true: colors.primary },
    thumbColor: colors.white,
    ios_backgroundColor: colors.border,
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <AppText variant="title">{heading}</AppText>
            <Sparkles size={20} color={colors.accent} strokeWidth={2.2} />
          </View>
          <Pressable
            onPress={onCancel}
            hitSlop={10}
            accessibilityLabel="Close"
            style={[styles.close, { backgroundColor: colors.lightPink }]}>
            <X size={18} color={colors.accent} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <AppText variant="label" secondary style={styles.label}>
          Title *
        </AppText>
        <TextInput
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (error && t.trim()) setError(null);
          }}
          placeholder="What would you like to do?"
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.accent}
          maxLength={MAX_TITLE_LENGTH}
          returnKeyType="done"
          onSubmitEditing={submit}
          style={[inputStyle, error ? { borderColor: colors.priorityHigh } : null]}
        />
        {error && (
          <View style={styles.errorRow}>
            <CircleAlert size={14} color={colors.priorityHigh} />
            <AppText variant="caption" color={colors.priorityHigh}>
              {error}
            </AppText>
          </View>
        )}

        {/* Description */}
        <AppText variant="label" secondary style={styles.label}>
          Description
        </AppText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add a little detail (optional)"
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.accent}
          multiline
          style={[inputStyle, styles.notes]}
        />

        {/* Priority */}
        <AppText variant="label" secondary style={styles.label}>
          Priority
        </AppText>
        <View style={styles.row}>
          {PRIORITIES.map((p) => {
            const active = p.value === priority;
            const tone = priorityTone(p.value);
            return (
              <Pressable
                key={p.value}
                onPress={() => setPriority(p.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  styles.flex,
                  {
                    backgroundColor: active ? tone.bg : colors.card,
                    borderColor: active ? tone.fg : colors.border,
                  },
                ]}>
                <View style={[styles.dot, { backgroundColor: tone.fg }]} />
                <AppText
                  variant="caption"
                  color={active ? tone.fg : colors.textSecondary}
                  style={styles.bold}>
                  {p.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Category */}
        <AppText variant="label" secondary style={styles.label}>
          Category
        </AppText>
        <View style={[styles.row, styles.wrap]}>
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              category={c}
              active={c.id === category}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </View>

        {/* Due date */}
        <AppText variant="label" secondary style={styles.label}>
          Due date
        </AppText>
        <View style={[styles.row, styles.wrap]}>
          {quickDates.map((d) => (
            <CategoryChip
              key={d.label}
              label={d.label}
              active={dueDate === d.key}
              onPress={() => {
                setDueDate(d.key);
                setShowCalendar(false);
              }}
            />
          ))}
          <CategoryChip
            label={isQuick || !dueDateObj ? 'Pick date' : formatLongDate(dueDateObj)}
            active={!isQuick || showCalendar}
            onPress={() => setShowCalendar((v) => !v)}
          />
        </View>
        <View style={styles.summary}>
          <CalendarDays size={14} color={colors.accent} />
          <AppText variant="caption" secondary>
            {dueDateObj ? formatLongDate(dueDateObj) : 'No date selected'}
          </AppText>
        </View>
        {showCalendar && (
          <View style={styles.calendarWrap}>
            <MonthCalendar
              embedded
              cursor={cursor}
              onCursorChange={setCursor}
              selected={dueDate}
              onSelect={(key) => {
                setDueDate(key);
                setShowCalendar(false);
              }}
            />
          </View>
        )}

        {/* Time + reminder */}
        <View style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <View style={[styles.toggleIcon, { backgroundColor: colors.lightPink }]}>
              <Clock size={16} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">Due time</AppText>
              <AppText variant="caption" secondary>
                {dueTime ? formatTime(dueTime) : 'Optional'}
              </AppText>
            </View>
            <Switch
              value={dueTime !== undefined}
              onValueChange={(on) => setDueTime(on ? (dueTime ?? DEFAULT_TIME) : undefined)}
              {...switchProps}
            />
          </View>
          {dueTime !== undefined && (
            <View style={styles.timeWrap}>
              <TimePicker value={dueTime} onChange={setDueTime} />
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.toggleRow}>
            <View style={[styles.toggleIcon, { backgroundColor: colors.lightPink }]}>
              <BellRing size={16} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">Reminder</AppText>
              <AppText variant="caption" secondary>
                Notifications arrive in a later update
              </AppText>
            </View>
            <Switch value={reminder} onValueChange={setReminder} {...switchProps} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.footerBtn,
            { backgroundColor: colors.lightPink },
            pressed && styles.pressed,
          ]}>
          <AppText variant="bodyStrong" color={colors.accentText}>
            Cancel
          </AppText>
        </Pressable>
        <Pressable
          onPress={submit}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.footerBtn,
            styles.saveBtn,
            { backgroundColor: colors.accent, opacity: title.trim() ? 1 : 0.6 },
            pressed && styles.pressed,
          ]}>
          <AppText variant="bodyStrong" color={colors.white}>
            {submitLabel}
          </AppText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  label: { marginTop: Spacing.xl, marginBottom: Spacing.sm, marginLeft: 2 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
  },
  notes: { minHeight: 90, textAlignVertical: 'top' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginLeft: 2 },
  row: { flexDirection: 'row', gap: Spacing.sm },
  wrap: { flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm, marginLeft: 2 },
  calendarWrap: { marginTop: Spacing.md },
  toggleCard: { marginTop: Spacing.xl, borderRadius: Radius.lg, borderWidth: 1 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.lg },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  footerBtn: {
    flex: 1,
    height: 50,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: { flex: 1.4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
