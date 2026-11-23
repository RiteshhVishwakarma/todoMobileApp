import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowUpDown,
  Check,
  Flower2,
  Gift,
  GripVertical,
  Search,
  Sprout,
  type LucideIcon,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { CategoryChip } from '@/components/CategoryChip';
import { CustomHeader } from '@/components/CustomHeader';
import { EmptyState } from '@/components/EmptyState';
import { FilterTabs } from '@/components/FilterTabs';
import { ReorderList } from '@/components/ReorderList';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { SwipeableTaskCard } from '@/components/SwipeableTaskCard';
import { Radius, Spacing } from '@/constants/colors';
import { useAppStore, useCategories } from '@/stores/appStore';
import { useAppTheme } from '@/theme/ThemeContext';
import type { CategoryId } from '@/types/task';
import { filterTasks, sortTasks, type SortMode, type StatusFilter } from '@/utils/tasks';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const SORT_LABELS: Record<SortMode, string> = {
  dueDate: 'Due date',
  priority: 'Priority',
  manual: 'My order',
};
const NEXT_SORT: Record<SortMode, SortMode> = {
  dueDate: 'priority',
  priority: 'manual',
  manual: 'dueDate',
};

const EMPTY_COPY: Record<StatusFilter, { icon: LucideIcon; title: string; message: string }> = {
  all: { icon: Flower2, title: 'No tasks yet', message: 'Tap the + button to add your first task.' },
  active: { icon: Gift, title: 'Nothing left to do', message: 'Every task is done — treat yourself!' },
  completed: { icon: Sprout, title: 'No completed tasks', message: 'Finished tasks will bloom here.' },
};

export default function TasksScreen() {
  const { colors } = useAppTheme();
  const tasks = useAppStore((s) => s.tasks);
  // Category filter lives in the URL so the Categories screen can link straight here.
  const params = useLocalSearchParams<{ category?: string }>();
  const categories = useCategories();
  const activeCategory = useMemo(
    () => categories.find((c) => c.id === params.category),
    [categories, params.category],
  );
  const category: CategoryId | undefined = activeCategory?.id;

  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  // Sort choice is saved, so "My order" is still selected after a restart.
  const sort = useAppStore((s) => s.preferences.taskSort);
  const setSort = useAppStore((s) => s.setTaskSort);
  const reorderTasks = useAppStore((s) => s.reorderTasks);
  const [reorderRequested, setReorderRequested] = useState(false);

  const visible = useMemo(
    () => sortTasks(filterTasks(tasks, { status, query, category }), sort),
    [tasks, status, query, category, sort],
  );
  const activeCount = useMemo(() => tasks.filter((t) => !t.isCompleted).length, [tasks]);
  // Reorder is offered in every sort mode whenever there are at least two tasks.
  const canReorder = visible.length > 1;
  const reordering = reorderRequested && canReorder && sort === 'manual';

  const toggleReorder = () => {
    if (reordering) {
      setReorderRequested(false);
      return;
    }
    if (sort !== 'manual') {
      // Keep exactly what's on screen as the starting "My order", then switch to it.
      reorderTasks(visible.map((t) => t.id));
      setSort('manual');
    }
    setReorderRequested(true);
  };

  const setCategory = (id: CategoryId | undefined) => router.setParams({ category: id ?? '' });

  const empty = query.trim()
    ? { icon: Search, title: 'No matches', message: `Nothing found for “${query.trim()}”.` }
    : activeCategory
      ? {
          icon: activeCategory.icon,
          title: `No ${activeCategory.name.toLowerCase()} tasks`,
          message: 'Try another filter, or add a new task.',
        }
      : EMPTY_COPY[status];

  return (
    <Screen>
      <CustomHeader
        title="My Tasks"
        subtitle={`${activeCount} active · ${tasks.length} total`}
        right={
          <Pressable
            onPress={() => {
              setSort(NEXT_SORT[sort]);
              setReorderRequested(false);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Sorted by ${SORT_LABELS[sort]}. Tap to change.`}
            style={[styles.sortBtn, { backgroundColor: colors.lightPink }]}>
            <ArrowUpDown size={14} color={colors.accent} strokeWidth={2.4} />
            <AppText variant="caption" color={colors.accentText} style={styles.bold}>
              {SORT_LABELS[sort]}
            </AppText>
          </Pressable>
        }
      />

      <View style={styles.controls}>
        <SearchBar value={query} onChangeText={setQuery} />
        <FilterTabs options={FILTERS} value={status} onChange={setStatus} />
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          <CategoryChip label="All" active={!category} onPress={() => setCategory(undefined)} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              category={c}
              active={category === c.id}
              onPress={() => setCategory(category === c.id ? undefined : c.id)}
            />
          ))}
        </ScrollView>
      </View>

      {canReorder && (
        <View style={styles.orderBar}>
          <View style={styles.orderHint}>
            <GripVertical size={15} color={colors.textSecondary} strokeWidth={2.2} />
            <AppText variant="caption" secondary numberOfLines={1} style={styles.flex}>
              {reordering
                ? 'Press & hold a task, then drag'
                : sort === 'manual'
                  ? 'Your own order'
                  : 'Arrange tasks your way'}
            </AppText>
          </View>
          {canReorder && (
            <Pressable
              onPress={toggleReorder}
              accessibilityRole="button"
              accessibilityLabel={reordering ? 'Done reordering' : 'Reorder tasks'}
              style={({ pressed }) => [
                styles.orderBtn,
                { backgroundColor: reordering ? colors.accent : colors.lightPink },
                pressed && { opacity: 0.8 },
              ]}>
              {reordering ? (
                <Check size={14} color={colors.white} strokeWidth={2.6} />
              ) : (
                <ArrowUpDown size={14} color={colors.accent} strokeWidth={2.4} />
              )}
              <AppText
                variant="caption"
                color={reordering ? colors.white : colors.accentText}
                style={styles.bold}>
                {reordering ? 'Done' : 'Reorder'}
              </AppText>
            </Pressable>
          )}
        </View>
      )}

      {reordering ? (
        <ReorderList tasks={visible} onReorder={reorderTasks} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <SwipeableTaskCard task={item} showDate />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState {...empty} />}
        />
      )}

      {!reordering && (
        <AddTaskButton
          onPress={() =>
            router.push({ pathname: '/add-task', params: category ? { category } : {} })
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: '700' },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  controls: { paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.md },
  chips: { paddingHorizontal: Spacing.xl, gap: Spacing.sm, paddingBottom: Spacing.md },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xs, paddingBottom: 110 },
  separator: { height: Spacing.md },
  flex: { flex: 1 },
  orderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  orderHint: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
});
