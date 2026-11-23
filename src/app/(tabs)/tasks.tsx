import { Flower2, Gift, Search, Sprout, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AddTaskButton } from '@/components/AddTaskButton';
import { CustomHeader } from '@/components/CustomHeader';
import { EmptyState } from '@/components/EmptyState';
import { FilterTabs } from '@/components/FilterTabs';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TaskCard } from '@/components/TaskCard';
import { Spacing } from '@/constants/colors';
import { DUMMY_TASKS } from '@/data/tasks';

type Filter = 'all' | 'active' | 'completed';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const EMPTY_COPY: Record<Filter, { icon: LucideIcon; title: string; message: string }> = {
  all: { icon: Flower2, title: 'No tasks yet', message: 'Tap the + button to add your first task.' },
  active: { icon: Gift, title: 'Nothing left to do', message: 'Every task is done — treat yourself!' },
  completed: { icon: Sprout, title: 'No completed tasks', message: 'Finished tasks will bloom here.' },
};

export default function TasksScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const tasks = DUMMY_TASKS.filter((t) =>
    filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true,
  )
    .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || a.dueDate.localeCompare(b.dueDate));

  const activeCount = DUMMY_TASKS.filter((t) => !t.completed).length;
  const empty = q
    ? { icon: Search, title: 'No matches', message: `Nothing found for “${query.trim()}”.` }
    : EMPTY_COPY[filter];

  return (
    <Screen>
      <CustomHeader title="My Tasks" subtitle={`${activeCount} active · ${DUMMY_TASKS.length} total`} />

      <View style={styles.controls}>
        <SearchBar value={query} onChangeText={setQuery} />
        <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TaskCard task={item} showDate />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState {...empty} />}
      />

      <AddTaskButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.lg },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xs, paddingBottom: 110 },
  separator: { height: Spacing.md },
});
