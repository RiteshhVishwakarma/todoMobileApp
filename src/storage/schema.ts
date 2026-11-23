/**
 * Persisted data shape, versioning and validation.
 *
 * Used both when restoring app state from AsyncStorage and when importing a
 * backup file, so corrupted or hand-edited data is cleaned the same way.
 */
import {
  BUILT_IN_IDS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_COLOR_KEY,
  DEFAULT_ICON_KEY,
  FALLBACK_CATEGORY_ID,
  isBuiltInCategory,
  MAX_CATEGORY_NAME_LENGTH,
  MAX_CUSTOM_CATEGORIES,
} from '@/constants/categories';
import type { CategoryRecord, Preferences, Priority, Task, ThemePreference } from '@/types/task';
import { isValidDateKey, isValidTime, isoToDateKey, todayKey } from '@/utils/date';

/** Bump when the persisted shape changes, and add a step to `migrateData`. */
export const STORAGE_VERSION = 1;
export const STORAGE_KEY = 'blossom-todo:data';

export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_ID_LENGTH = 64;

/** Everything that is saved to disk / included in backups. */
export interface PersistedData {
  tasks: Task[];
  customCategories: CategoryRecord[];
  preferences: Preferences;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  notifications: { reminders: true, daily: true, sound: false },
};

export function createDefaultData(): PersistedData {
  return {
    tasks: [],
    customCategories: [],
    preferences: cloneJson(DEFAULT_PREFERENCES),
  };
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ---------------------------------------------------------------------------
// Small type guards

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function str(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

function isoOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

export function createId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const THEMES: ThemePreference[] = ['system', 'light', 'dark'];

// ---------------------------------------------------------------------------
// Sanitizers

/**
 * Cleans one stored/imported category. Returns null when unusable.
 * Built-in ids are rejected (built-ins are not stored).
 */
export function sanitizeCategory(raw: unknown): CategoryRecord | null {
  if (!isRecord(raw)) return null;
  const id = str(raw.id, MAX_ID_LENGTH);
  const name = str(raw.name, MAX_CATEGORY_NAME_LENGTH);
  if (!id || !name || isBuiltInCategory(id)) return null;
  return {
    id,
    name,
    iconKey:
      typeof raw.iconKey === 'string' && raw.iconKey in CATEGORY_ICONS
        ? raw.iconKey
        : DEFAULT_ICON_KEY,
    colorKey:
      typeof raw.colorKey === 'string' && raw.colorKey in CATEGORY_COLORS
        ? raw.colorKey
        : DEFAULT_COLOR_KEY,
    createdAt: isoOrUndefined(raw.createdAt) ?? new Date().toISOString(),
  };
}

/**
 * Cleans one stored/imported task. Returns null when it has no usable title.
 * Missing or invalid fields get safe defaults; unknown categories fall back to Personal.
 */
export function sanitizeTask(raw: unknown, knownCategoryIds: Set<string>): Task | null {
  if (!isRecord(raw)) return null;
  const title = str(raw.title, MAX_TITLE_LENGTH);
  if (!title) return null;

  const createdAt = isoOrUndefined(raw.createdAt) ?? new Date().toISOString();
  // Accept the Phase 2 field name `completed` as well.
  const isCompleted = raw.isCompleted === true || raw.completed === true;
  const category =
    typeof raw.category === 'string' && knownCategoryIds.has(raw.category)
      ? raw.category
      : FALLBACK_CATEGORY_ID;

  return {
    id: str(raw.id, MAX_ID_LENGTH) ?? createId(),
    title,
    description: str(raw.description, MAX_DESCRIPTION_LENGTH),
    category,
    priority: PRIORITIES.includes(raw.priority as Priority) ? (raw.priority as Priority) : 'medium',
    dueDate: isValidDateKey(raw.dueDate) ? raw.dueDate : (isoToDateKey(createdAt) ?? todayKey()),
    dueTime: isValidTime(raw.dueTime) ? raw.dueTime : undefined,
    reminder: raw.reminder === true,
    isCompleted,
    createdAt,
    completedAt: isCompleted ? (isoOrUndefined(raw.completedAt) ?? createdAt) : undefined,
  };
}

export function sanitizePreferences(raw: unknown): Preferences {
  const prefs = isRecord(raw) ? raw : {};
  const notif = isRecord(prefs.notifications) ? prefs.notifications : {};
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  const d = DEFAULT_PREFERENCES;
  return {
    theme: THEMES.includes(prefs.theme as ThemePreference)
      ? (prefs.theme as ThemePreference)
      : d.theme,
    notifications: {
      reminders: bool(notif.reminders, d.notifications.reminders),
      daily: bool(notif.daily, d.notifications.daily),
      sound: bool(notif.sound, d.notifications.sound),
    },
  };
}

export interface SanitizeReport {
  data: PersistedData;
  /** Entries dropped because they were unusable (e.g. no title). */
  droppedTasks: number;
  droppedCategories: number;
}

/**
 * Validates a whole data object. Never throws: anything unusable is dropped,
 * duplicate ids inside the data are de-duplicated.
 */
export function sanitizeData(raw: unknown): SanitizeReport {
  const obj = isRecord(raw) ? raw : {};
  const rawCategories = Array.isArray(obj.customCategories) ? obj.customCategories : [];
  const rawTasks = Array.isArray(obj.tasks) ? obj.tasks : [];

  const customCategories: CategoryRecord[] = [];
  const seenCategoryIds = new Set<string>();
  for (const item of rawCategories) {
    const cat = sanitizeCategory(item);
    if (!cat || seenCategoryIds.has(cat.id) || customCategories.length >= MAX_CUSTOM_CATEGORIES) {
      continue;
    }
    seenCategoryIds.add(cat.id);
    customCategories.push(cat);
  }

  const known = knownCategoryIdSet(customCategories);
  const tasks: Task[] = [];
  const seenTaskIds = new Set<string>();
  for (const item of rawTasks) {
    const task = sanitizeTask(item, known);
    if (!task) continue;
    if (seenTaskIds.has(task.id)) task.id = createId();
    seenTaskIds.add(task.id);
    tasks.push(task);
  }

  return {
    data: { tasks, customCategories, preferences: sanitizePreferences(obj.preferences) },
    droppedTasks: rawTasks.length - tasks.length,
    droppedCategories: rawCategories.length - customCategories.length,
  };
}

export function knownCategoryIdSet(customCategories: CategoryRecord[]): Set<string> {
  return new Set<string>([
    ...BUILT_IN_IDS,
    ...customCategories.map((c) => c.id),
  ]);
}

/**
 * Upgrades data saved by an older app version to the current shape.
 * v0 → v1: no structural change; data is validated by `sanitizeData` afterwards.
 * Add `if (version < 2) { … }` steps here when the schema changes.
 */
export function migrateData(raw: unknown, _fromVersion: number): unknown {
  return raw;
}
