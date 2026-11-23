import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpDown, Flower2, Gift, Search, Sprout, type LucideIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { CategoryChip } from '@/components/CategoryChip';
import { CustomHeader } from '@/components/CustomHeader';
import { EmptyState } from '@/components/EmptyState';
import { FilterTabs } from '@/components/FilterTabs';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TaskCard } from '@/components/TaskCard';
import { CATEGORIES, getCategory, isCategoryId } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/colors';
import { useTaskStore } from '@/stores/taskStore';
import { useAppTheme } from '@/theme/ThemeContext';
import type { CategoryId } from '@/types/task';
import { filterTasks, sortTasks, type SortMode, type StatusFilter } from '@/utils/tasks';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const SORT_LABELS: Record<SortMode, string> = { dueDate: 'Due date', priority: 'Priority' };

const EMPTY_COPY: Record<StatusFilter, { icon: LucideIcon; title: string; message: string }> = {
  all: { icon: Flower2, title: 'No tasks yet', message: 'Tap the + button to add your first task.' },
  active: { icon: Gift, title: 'Nothing left to do', message: 'Every task is done — treat yourself!' },
  completed: { icon: Sprout, title: 'No completed tasks', message: 'Finished tasks will bloom here.' },
};

export default function TasksScreen() {
  const { colors } = useAppTheme();
  const tasks = useTaskStore((s) => s.tasks);
  // Category filter lives in the URL so the Categories screen can link straight here.
  const params = useLocalSearchParams<{ category?: string }>();
  const category: CategoryId | undefined = isCategoryId(params.category) ? params.category : undefined;

  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('dueDate');

  const visible = useMemo(
    () => sortTasks(filterTasks(tasks, { status, query, category }), sort),
    [tasks, status, query, category, sort],
  );
  const activeCount = useMemo(() => tasks.filter((t) => !t.isCompleted).length, [tasks]);

  const setCategory = (id: CategoryId | undefined) => router.setParams({ category: id ?? '' });

  const empty = query.trim()
    ? { icon: Search, title: 'No matches', message: `Nothing found for “${query.trim()}”.` }
    : category
      ? {
          icon: getCategory(category).icon,
          title: `No ${getCategory(category).name.toLowerCase()} tasks`,
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
            onPress={() => setSort((s) => (s === 'dueDate' ? 'priority' : 'dueDate'))}
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
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              category={c}
              active={category === c.id}
              onPress={() => setCategory(category === c.id ? undefined : c.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TaskCard task={item} showDate />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState {...empty} />}
      />

      <AddTaskButton
        onPress={() =>
          router.push({ pathname: '/add-task', params: category ? { category } : {} })
        }
      />
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
});
