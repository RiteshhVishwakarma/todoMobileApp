import { create } from 'zustand';

import { CATEGORY_IDS } from '@/constants/categories';
import type { CategoryId, Priority, Task, TaskInput } from '@/types/task';
import { isValidDateKey, isValidTime, todayKey } from '@/utils/date';

/**
 * Global task state. In-memory only — persistence (AsyncStorage) arrives in Phase 4.
 *
 * Note for consumers (Zustand v5): select `s.tasks` and derive lists with `useMemo`.
 * Selectors that build new arrays on every call cause render loops.
 */
interface TaskState {
  tasks: Task[];
  addTask: (input: TaskInput) => Task | null;
  updateTask: (id: string, input: Partial<TaskInput>) => void;
  deleteTask: (id: string) => void;
  setCompleted: (id: string, completed: boolean) => void;
  toggleCompleted: (id: string) => void;
  clearAll: () => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
export const MAX_TITLE_LENGTH = 120;

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Trims and validates form input, filling safe defaults for bad values. */
export function sanitizeInput(input: Partial<TaskInput>): Partial<TaskInput> {
  const out: Partial<TaskInput> = {};
  if (input.title !== undefined) out.title = input.title.trim().slice(0, MAX_TITLE_LENGTH);
  if ('description' in input) out.description = input.description?.trim() || undefined;
  if (input.category !== undefined) {
    out.category = CATEGORY_IDS.includes(input.category) ? input.category : 'personal';
  }
  if (input.priority !== undefined) {
    out.priority = PRIORITIES.includes(input.priority) ? input.priority : 'medium';
  }
  if (input.dueDate !== undefined) {
    out.dueDate = isValidDateKey(input.dueDate) ? input.dueDate : todayKey();
  }
  if ('dueTime' in input) out.dueTime = isValidTime(input.dueTime) ? input.dueTime : undefined;
  if (input.reminder !== undefined) out.reminder = Boolean(input.reminder);
  return out;
}

export const useTaskStore = create<TaskState>()((set) => ({
  tasks: [],

  addTask: (input) => {
    const clean = sanitizeInput(input);
    if (!clean.title) return null;
    const task: Task = {
      id: createId(),
      title: clean.title,
      description: clean.description,
      category: (clean.category ?? 'personal') as CategoryId,
      priority: clean.priority ?? 'medium',
      dueDate: clean.dueDate ?? todayKey(),
      dueTime: clean.dueTime,
      reminder: clean.reminder ?? false,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  updateTask: (id, input) => {
    const clean = sanitizeInput(input);
    // Never allow an edit to blank out the title.
    if ('title' in clean && !clean.title) delete clean.title;
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...clean } : t)) }));
  },

  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  setCompleted: (id, completed) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              isCompleted: completed,
              completedAt: completed ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    })),

  toggleCompleted: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              isCompleted: !t.isCompleted,
              completedAt: t.isCompleted ? undefined : new Date().toISOString(),
            }
          : t,
      ),
    })),

  clearAll: () => set({ tasks: [] }),
}));

/** Looks up a single task; returns undefined when missing. */
export function useTask(id: string | undefined): Task | undefined {
  return useTaskStore((s) => (id ? s.tasks.find((t) => t.id === id) : undefined));
}
