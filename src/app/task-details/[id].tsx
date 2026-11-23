import { router, useLocalSearchParams } from 'expo-router';
import {
  BellRing,
  CalendarDays,
  CircleCheckBig,
  Clock,
  Pencil,
  RotateCcw,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { CustomHeader } from '@/components/CustomHeader';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { EmptyState } from '@/components/EmptyState';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Screen } from '@/components/Screen';
import { Radius, Spacing } from '@/constants/colors';
import { useAppStore, useCategoryResolver, useTask } from '@/stores/appStore';
import { deleteTaskWithUndo } from '@/stores/undoStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import { formatRelativeDate, formatTime, isoToDateKey } from '@/utils/date';
import { goBackOrHome } from '@/utils/navigation';

function InfoRow({
  Icon,
  label,
  value,
  last,
}: {
  Icon: LucideIcon;
  label: string;
  value: ReactNode;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.infoRow,
        !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.lightPink }]}>
        <Icon size={16} color={colors.accent} strokeWidth={2.2} />
      </View>
      <AppText variant="body" secondary style={styles.flex}>
        {label}
      </AppText>
      {typeof value === 'string' ? <AppText variant="bodyStrong">{value}</AppText> : value}
    </View>
  );
}

export default function TaskDetailsScreen() {
  const { colors, isDark } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTask(id);
  const toggleCompleted = useAppStore((s) => s.toggleCompleted);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const resolveCategory = useCategoryResolver();

  if (!task) {
    // Just deleted: render an empty screen while it animates away instead of "not found".
    if (deleted) return <Screen edges={['top', 'bottom']}>{null}</Screen>;
    return (
      <Screen edges={['top', 'bottom']}>
        <CustomHeader showBack title="Task" />
        <EmptyState
          title="Task not found"
          message="It may have been deleted."
          action={<AddTaskButton variant="inline" label="Go back" onPress={goBackOrHome} />}
        />
      </Screen>
    );
  }

  const category = resolveCategory(task.category);
  const CategoryIcon = category.icon;
  const createdKey = isoToDateKey(task.createdAt);
  const completedKey = isoToDateKey(task.completedAt);

  const onDelete = () => {
    setConfirmVisible(false);
    setDeleted(true);
    goBackOrHome();
    // Undo bar appears on the screen we return to.
    deleteTaskWithUndo(task.id);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <CustomHeader
        showBack
        title="Task Details"
        right={
          <Pressable
            onPress={() => router.push({ pathname: '/add-task', params: { id: task.id } })}
            accessibilityRole="button"
            accessibilityLabel="Edit task"
            style={[styles.iconBtn, { backgroundColor: colors.lightPink }]}>
            <Pencil size={18} color={colors.accent} strokeWidth={2.2} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
            softShadow(colors, isDark),
          ]}>
          <View style={styles.badges}>
            <View
              style={[
                styles.categoryChip,
                { backgroundColor: isDark ? category.darkTint : category.tint },
              ]}>
              <CategoryIcon
                size={13}
                color={isDark ? category.darkColor : category.color}
                strokeWidth={2.4}
              />
              <AppText variant="caption" style={styles.bold}>
                {category.name}
              </AppText>
            </View>
            <PriorityBadge priority={task.priority} />
            <View
              style={[
                styles.status,
                { backgroundColor: task.isCompleted ? colors.successSoft : colors.lightPink },
              ]}>
              <AppText
                variant="caption"
                color={task.isCompleted ? colors.success : colors.accentText}
                style={styles.bold}>
                {task.isCompleted ? 'Completed' : 'Active'}
              </AppText>
            </View>
          </View>

          <AppText
            variant="title"
            secondary={task.isCompleted}
            style={[styles.title, task.isCompleted && styles.strike]}>
            {task.title}
          </AppText>
          <AppText variant="body" secondary style={styles.description}>
            {task.description || 'No description added.'}
          </AppText>
        </View>

        {/* Info */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            softShadow(colors, isDark, 0.6),
          ]}>
          <InfoRow Icon={CalendarDays} label="Due date" value={formatRelativeDate(task.dueDate)} />
          <InfoRow Icon={Clock} label="Due time" value={formatTime(task.dueTime) || 'Any time'} />
          <InfoRow Icon={BellRing} label="Reminder" value={task.reminder ? 'On' : 'Off'} />
          <InfoRow
            Icon={Sparkles}
            label="Created"
            value={createdKey ? formatRelativeDate(createdKey) : '—'}
            last={!task.isCompleted}
          />
          {task.isCompleted && (
            <InfoRow
              Icon={CircleCheckBig}
              label="Completed"
              value={completedKey ? formatRelativeDate(completedKey) : '—'}
              last
            />
          )}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => setConfirmVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Delete task"
          style={({ pressed }) => [
            styles.deleteBtn,
            { backgroundColor: colors.priorityHighSoft },
            pressed && styles.pressed,
          ]}>
          <Trash2 size={20} color={colors.priorityHigh} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          onPress={() => toggleCompleted(task.id)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: task.isCompleted ? colors.lightPink : colors.accent },
            pressed && styles.pressed,
          ]}>
          {task.isCompleted ? (
            <RotateCcw size={18} color={colors.accent} strokeWidth={2.4} />
          ) : (
            <CircleCheckBig size={18} color={colors.white} strokeWidth={2.4} />
          )}
          <AppText variant="bodyStrong" color={task.isCompleted ? colors.accentText : colors.white}>
            {task.isCompleted ? 'Mark as active' : 'Mark as done'}
          </AppText>
        </Pressable>
      </View>

      <DeleteConfirmation
        visible={confirmVisible}
        message={`“${task.title}” will be removed. This can't be undone.`}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={onDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.lg },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { padding: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  status: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill },
  title: { marginTop: Spacing.lg },
  strike: { textDecorationLine: 'line-through' },
  description: { marginTop: Spacing.sm },
  infoCard: { borderRadius: Radius.lg, borderWidth: 1 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  deleteBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
