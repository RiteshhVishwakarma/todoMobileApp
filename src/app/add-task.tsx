import { useLocalSearchParams } from 'expo-router';

import { AddTaskButton } from '@/components/AddTaskButton';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TaskForm } from '@/components/TaskForm';
import { useAppStore, useCategories, useTask } from '@/stores/appStore';
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
  const { id, date, category } = useLocalSearchParams<Params>();
  const existing = useTask(id);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const categories = useCategories();
  const isEdit = Boolean(id);

  const initial: Partial<TaskInput> = existing ?? {
    dueDate: isValidDateKey(date) ? date : undefined,
    category: categories.some((c) => c.id === category) ? category : undefined,
  };

  const handleSubmit = (input: TaskInput) => {
    if (isEdit && existing) updateTask(existing.id, input);
    else addTask(input);
    goBackOrHome();
  };

  return (
    <Screen edges={['top', 'bottom']}>
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
    </Screen>
  );
}
