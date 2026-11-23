import { router } from 'expo-router';
import { CalendarDays, Clock, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { CATEGORIES } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import type { CategoryId, Priority } from '@/types/task';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

/**
 * "Quick Add" sheet — UI only. Saving simply closes the sheet for now.
 */
export default function AddTaskModal() {
  const { colors, isDark } = useAppTheme();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<CategoryId>('personal');

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/index'));

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

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <AppText variant="title">New Task</AppText>
              <Sparkles size={20} color={colors.accent} strokeWidth={2.2} />
            </View>
            <Pressable
              onPress={close}
              hitSlop={10}
              accessibilityLabel="Close"
              style={[styles.close, { backgroundColor: colors.lightPink }]}>
              <X size={18} color={colors.accent} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText variant="label" secondary style={styles.label}>
            Title
          </AppText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What would you like to do?"
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.accent}
            style={inputStyle}
          />

          <AppText variant="label" secondary style={styles.label}>
            Notes
          </AppText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a little detail (optional)"
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.accent}
            multiline
            style={[inputStyle, styles.notes]}
          />

          <AppText variant="label" secondary style={styles.label}>
            Priority
          </AppText>
          <View style={styles.chips}>
            {PRIORITIES.map((p) => {
              const active = p.value === priority;
              const tone = priorityTone(p.value);
              return (
                <Pressable
                  key={p.value}
                  onPress={() => setPriority(p.value)}
                  style={[
                    styles.chip,
                    styles.flex,
                    {
                      backgroundColor: active ? tone.bg : colors.card,
                      borderColor: active ? tone.fg : colors.border,
                    },
                  ]}>
                  <View style={[styles.dot, { backgroundColor: tone.fg }]} />
                  <AppText variant="caption" color={active ? tone.fg : colors.textSecondary} style={styles.bold}>
                    {p.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="label" secondary style={styles.label}>
            Category
          </AppText>
          <View style={[styles.chips, styles.wrap]}>
            {CATEGORIES.map((c) => {
              const active = c.id === category;
              const Icon = c.icon;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.lightPink : colors.card,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}>
                  <Icon
                    size={15}
                    color={active ? colors.accent : isDark ? c.darkColor : c.color}
                    strokeWidth={2.2}
                  />
                  <AppText variant="caption" color={active ? colors.accent : colors.text} style={styles.bold}>
                    {c.name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="label" secondary style={styles.label}>
            When
          </AppText>
          <View style={styles.chips}>
            <View style={[styles.when, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <CalendarDays size={16} color={colors.accent} />
              <AppText variant="caption" style={styles.bold}>
                Today
              </AppText>
            </View>
            <View style={[styles.when, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Clock size={16} color={colors.accent} />
              <AppText variant="caption" style={styles.bold}>
                6:00 PM
              </AppText>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <AddTaskButton variant="inline" label="Add Task" onPress={close} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  chips: { flexDirection: 'row', gap: Spacing.sm },
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
  when: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, paddingTop: Spacing.sm },
});
