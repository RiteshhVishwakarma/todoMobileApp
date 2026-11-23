/**
 * The app's single source of truth: tasks, custom categories and preferences.
 * Persisted to AsyncStorage (see storage/persistStorage.ts) and restored on launch.
 *
 * Zustand v5 note: select stable slices (`s.tasks`) and derive lists with `useMemo`;
 * selectors that build new arrays on every call cause render loops.
 */
import { useMemo, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  BUILT_IN_CATEGORIES,
  BUILT_IN_RESOLVED,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_COLOR_KEY,
  DEFAULT_ICON_KEY,
  FALLBACK_CATEGORY_ID,
  isBuiltInCategory,
  MAX_CATEGORY_NAME_LENGTH,
  MAX_CUSTOM_CATEGORIES,
  resolveCategory,
} from '@/constants/categories';
import { mergeData, type MergeStats } from '@/storage/backup';
import { flushPendingWrites, createPersistStorage } from '@/storage/persistStorage';
import {
  createDefaultData,
  createId,
  knownCategoryIdSet,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  migrateData,
  sanitizeData,
  STORAGE_KEY,
  STORAGE_VERSION,
  type PersistedData,
} from '@/storage/schema';
import type {
  Category,
  CategoryRecord,
  NotificationPreferences,
  Priority,
  Task,
  TaskInput,
  ThemePreference,
} from '@/types/task';
import { isValidDateKey, isValidTime, todayKey } from '@/utils/date';

export { MAX_TITLE_LENGTH };

export type CategoryInput = Pick<CategoryRecord, 'name' | 'iconKey' | 'colorKey'>;
export type ImportMode = 'merge' | 'replace';

interface AppState extends PersistedData {
  /** True once saved data has been restored (or there was none). Not persisted. */
  hasHydrated: boolean;

  addTask: (input: TaskInput) => Task | null;
  updateTask: (id: string, input: Partial<TaskInput>) => void;
  deleteTask: (id: string) => void;
  setCompleted: (id: string, completed: boolean) => void;
  toggleCompleted: (id: string) => void;
  /**
   * Puts a task snapshot back (used by Undo). Replaces the task if it still exists,
   * otherwise re-inserts it at `index`.
   */
  restoreTask: (task: Task, index?: number) => void;

  addCategory: (
    input: CategoryInput,
  ) => { ok: true; category: CategoryRecord } | { ok: false; error: string };
  deleteCategory: (id: string) => void;

  setTheme: (theme: ThemePreference) => void;
  setNotification: (key: keyof NotificationPreferences, value: boolean) => void;

  /** Applies validated backup data. Merge never overwrites existing data. */
  importData: (incoming: PersistedData, mode: ImportMode) => MergeStats;
  /** Resets everything (tasks, categories, preferences) to a fresh install. */
  clearAllData: () => Promise<void>;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

/** Trims and validates form input, filling safe defaults for bad values. */
function sanitizeInput(
  input: Partial<TaskInput>,
  knownCategories: Set<string>,
): Partial<TaskInput> {
  const out: Partial<TaskInput> = {};
  if (input.title !== undefined) out.title = input.title.trim().slice(0, MAX_TITLE_LENGTH);
  if ('description' in input) {
    out.description = input.description?.trim().slice(0, MAX_DESCRIPTION_LENGTH) || undefined;
  }
  if (input.category !== undefined) {
    out.category = knownCategories.has(input.category) ? input.category : FALLBACK_CATEGORY_ID;
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

/** Applies `fn` to one task; returns the same array when nothing changed (no re-render/write). */
function updateOne(tasks: Task[], id: string, fn: (t: Task) => Task): Task[] {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return tasks;
  const next = fn(tasks[index]);
  if (next === tasks[index]) return tasks;
  const copy = tasks.slice();
  copy[index] = next;
  return copy;
}

const pickData = (s: PersistedData): PersistedData => ({
  tasks: s.tasks,
  customCategories: s.customCategories,
  preferences: s.preferences,
});

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedData>(
    (set, get) => ({
      ...createDefaultData(),
      hasHydrated: false,

      // ---------------------------------------------------------------- tasks
      addTask: (input) => {
        const clean = sanitizeInput(input, knownCategoryIdSet(get().customCategories));
        if (!clean.title) return null;
        const task: Task = {
          id: createId(),
          title: clean.title,
          description: clean.description,
          category: clean.category ?? FALLBACK_CATEGORY_ID,
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
        const clean = sanitizeInput(input, knownCategoryIdSet(get().customCategories));
        // Never allow an edit to blank out the title.
        if ('title' in clean && !clean.title) delete clean.title;
        set((s) => ({ tasks: updateOne(s.tasks, id, (t) => ({ ...t, ...clean })) }));
      },

      deleteTask: (id) =>
        set((s) =>
          s.tasks.some((t) => t.id === id) ? { tasks: s.tasks.filter((t) => t.id !== id) } : s,
        ),

      setCompleted: (id, completed) =>
        set((s) => ({
          tasks: updateOne(s.tasks, id, (t) =>
            t.isCompleted === completed
              ? t
              : {
                  ...t,
                  isCompleted: completed,
                  completedAt: completed ? new Date().toISOString() : undefined,
                },
          ),
        })),

      toggleCompleted: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) get().setCompleted(id, !task.isCompleted);
      },

      restoreTask: (task, index = 0) =>
        set((s) => {
          const existing = s.tasks.findIndex((t) => t.id === task.id);
          if (existing !== -1) {
            const copy = s.tasks.slice();
            copy[existing] = task;
            return { tasks: copy };
          }
          // Its category may have been deleted in the meantime.
          const safe = knownCategoryIdSet(s.customCategories).has(task.category)
            ? task
            : { ...task, category: FALLBACK_CATEGORY_ID };
          const copy = s.tasks.slice();
          copy.splice(Math.min(Math.max(index, 0), copy.length), 0, safe);
          return { tasks: copy };
        }),

      // ----------------------------------------------------------- categories
      addCategory: (input) => {
        const name = input.name.trim().slice(0, MAX_CATEGORY_NAME_LENGTH);
        const { customCategories } = get();
        if (!name) return { ok: false, error: 'Please give your category a name.' };
        const taken = [...BUILT_IN_CATEGORIES, ...customCategories].some(
          (c) => c.name.toLowerCase() === name.toLowerCase(),
        );
        if (taken) return { ok: false, error: 'You already have a category with this name.' };
        if (customCategories.length >= MAX_CUSTOM_CATEGORIES) {
          return { ok: false, error: `You can have up to ${MAX_CUSTOM_CATEGORIES} custom categories.` };
        }
        const category: CategoryRecord = {
          id: createId('custom-'),
          name,
          iconKey: input.iconKey in CATEGORY_ICONS ? input.iconKey : DEFAULT_ICON_KEY,
          colorKey: input.colorKey in CATEGORY_COLORS ? input.colorKey : DEFAULT_COLOR_KEY,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ customCategories: [...s.customCategories, category] }));
        return { ok: true, category };
      },

      deleteCategory: (id) => {
        if (isBuiltInCategory(id)) return;
        set((s) => ({
          customCategories: s.customCategories.filter((c) => c.id !== id),
          // Keep the tasks — move them to the fallback category.
          tasks: s.tasks.map((t) => (t.category === id ? { ...t, category: FALLBACK_CATEGORY_ID } : t)),
        }));
      },

      // ---------------------------------------------------------- preferences
      setTheme: (theme) =>
        set((s) =>
          s.preferences.theme === theme ? s : { preferences: { ...s.preferences, theme } },
        ),

      setNotification: (key, value) =>
        set((s) =>
          s.preferences.notifications[key] === value
            ? s
            : {
                preferences: {
                  ...s.preferences,
                  notifications: { ...s.preferences.notifications, [key]: value },
                },
              },
        ),

      // ----------------------------------------------------------------- data
      importData: (incoming, mode) => {
        if (mode === 'replace') {
          set(sanitizeData(incoming).data);
          return {
            addedTasks: incoming.tasks.length,
            skippedDuplicates: 0,
            reassignedIds: 0,
            addedCategories: incoming.customCategories.length,
            matchedCategories: 0,
          };
        }
        const { data, stats } = mergeData(pickData(get()), incoming);
        set(data);
        return stats;
      },

      clearAllData: async () => {
        set(createDefaultData());
        await flushPendingWrites();
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createPersistStorage<PersistedData>(),
      // Only data is saved — never actions or the hydration flag.
      partialize: pickData,
      migrate: (persisted, version) => migrateData(persisted, version) as PersistedData,
      // Validate whatever was on disk before it reaches the UI.
      merge: (persisted, current) => ({ ...current, ...sanitizeData(persisted).data }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.warn('[storage] restore failed, starting fresh', error);
        useAppStore.setState({ hasHydrated: true });
      },
    },
  ),
);

/** Current data snapshot (for export). */
export function getDataSnapshot(): PersistedData {
  return pickData(useAppStore.getState());
}

// ------------------------------------------------------------------- hooks

/** Looks up a single task; undefined when missing. */
export function useTask(id: string | undefined): Task | undefined {
  return useAppStore((s) => (id ? s.tasks.find((t) => t.id === id) : undefined));
}

/** Built-in + custom categories, resolved for rendering. */
export function useCategories(): Category[] {
  const custom = useAppStore((s) => s.customCategories);
  return useMemo(() => [...BUILT_IN_RESOLVED, ...custom.map(resolveCategory)], [custom]);
}

/** Returns a lookup that resolves any category id (unknown ids → Personal). */
export function useCategoryResolver(): (id: string | undefined) => Category {
  const categories = useCategories();
  return useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]));
    const fallback = map.get(FALLBACK_CATEGORY_ID) ?? categories[0];
    return (id) => (id ? (map.get(id) ?? fallback) : fallback);
  }, [categories]);
}

const subscribeNoop = () => () => {};

/**
 * True once saved data is restored and we're rendering on the client.
 * Screens wait for this so they never flash an empty state before data loads.
 */
export function useIsReady(): boolean {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const hydrated = useAppStore((s) => s.hasHydrated);
  return isClient && hydrated;
}
