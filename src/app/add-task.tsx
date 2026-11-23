import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTaskButton } from '@/components/AddTaskButton';
import { EmptyState } from '@/components/EmptyState';
import { TaskForm } from '@/components/TaskForm';
import { isCategoryId } from '@/constants/categories';
import { useTask, useTaskStore } from '@/stores/taskStore';
import { useAppTheme } from '@/theme/ThemeContext';
import type { TaskInput } from '@/types/task';
import { isValidDateKey } from '@/utils/date';
import { goBackOrHome } from '@/utils/navigation';

type Params = {
  /** When present, the form edits this task. */
  id?: string;
  /** Prefill for new tasks, e.g. from the Calendar or a category. */
  date?: string;
  category?: string;
};

/** Add/Edit task sheet. `/add-task` creates; `/add-task?id=…` edits. */
export default function AddTaskModal() {
  const { colors } = useAppTheme();
  const { id, date, category } = useLocalSearchParams<Params>();
  const existing = useTask(id);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const isEdit = Boolean(id);

  const initial: Partial<TaskInput> = existing ?? {
    dueDate: isValidDateKey(date) ? date : undefined,
    category: isCategoryId(category) ? category : undefined,
  };

  const handleSubmit = (input: TaskInput) => {
    if (isEdit && existing) updateTask(existing.id, input);
    else addTask(input);
    goBackOrHome();
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.root, { backgroundColor: colors.background }]}>
      {isEdit && !existing ? (
        <EmptyState
          title="Task not found"
          message="It may have been deleted."
          action={<AddTaskButton variant="inline" label="Go back" onPress={goBackOrHome} />}
        />
      ) : (
        <TaskForm
          heading={isEdit ? 'Edit Task' : 'New Task'}
          submitLabel={isEdit ? 'Save Changes' : 'Save Task'}
          initial={initial}
          onSubmit={handleSubmit}
          onCancel={goBackOrHome}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
