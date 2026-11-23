/**
 * Backup format, parsing/validation and merge logic (pure — no file I/O).
 */
import { BUILT_IN_CATEGORIES, MAX_CUSTOM_CATEGORIES } from '@/constants/categories';
import type { CategoryRecord, Task } from '@/types/task';
import { sortTasks } from '@/utils/tasks';

import {
  createId,
  isRecord,
  migrateData,
  sanitizeData,
  STORAGE_VERSION,
  withSequentialOrder,
  type PersistedData,
} from './schema';

export const BACKUP_APP_ID = 'blossom-todo';
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  schemaVersion: number;
  exportedAt: string;
  data: PersistedData;
}

export function buildBackup(data: PersistedData): BackupFile {
  return {
    app: BACKUP_APP_ID,
    schemaVersion: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function backupFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `blossom-todo-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

export type ParseResult =
  | {
      ok: true;
      data: PersistedData;
      exportedAt?: string;
      /** Entries that were unusable and skipped. */
      droppedTasks: number;
      droppedCategories: number;
    }
  | { ok: false; error: string };

/** Validates a backup file's text. Never throws. */
export function parseBackup(text: string): ParseResult {
  if (text.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: 'This file is too large to be a Blossom Todo backup.' };
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file isn't valid JSON. It may be damaged or not a backup." };
  }
  if (!isRecord(json)) {
    return { ok: false, error: "This file doesn't look like a Blossom Todo backup." };
  }

  // Accept our wrapped format, or a bare data object with a tasks array.
  const wrapped = json.app === BACKUP_APP_ID && isRecord(json.data);
  if (!wrapped && !Array.isArray(json.tasks)) {
    return { ok: false, error: "This file doesn't look like a Blossom Todo backup." };
  }
  const version = typeof json.schemaVersion === 'number' ? json.schemaVersion : 0;
  if (version > STORAGE_VERSION) {
    return {
      ok: false,
      error: 'This backup was made by a newer version of the app. Please update to import it.',
    };
  }

  const payload = migrateData(wrapped ? json.data : json, version);
  const report = sanitizeData(payload);
  return {
    ok: true,
    data: report.data,
    exportedAt: typeof json.exportedAt === 'string' ? json.exportedAt : undefined,
    droppedTasks: report.droppedTasks,
    droppedCategories: report.droppedCategories,
  };
}

export interface MergeStats {
  addedTasks: number;
  /** Identical tasks already present — not imported again. */
  skippedDuplicates: number;
  /** Different tasks whose id clashed — imported with a fresh id. */
  reassignedIds: number;
  addedCategories: number;
  /** Imported categories matched to an existing one with the same name. */
  matchedCategories: number;
}

const sameTask = (a: Task, b: Task) =>
  a.title === b.title &&
  (a.description ?? '') === (b.description ?? '') &&
  a.category === b.category &&
  a.priority === b.priority &&
  a.dueDate === b.dueDate &&
  (a.dueTime ?? '') === (b.dueTime ?? '') &&
  a.isCompleted === b.isCompleted &&
  a.createdAt === b.createdAt;

const nameKey = (name: string) => name.trim().toLowerCase();

/**
 * Adds imported data to existing data without overwriting anything:
 * - existing tasks/categories/preferences are kept as they are;
 * - identical tasks are skipped, id clashes get a new id;
 * - categories with the same name are merged into the existing one.
 */
export function mergeData(
  current: PersistedData,
  incoming: PersistedData,
): { data: PersistedData; stats: MergeStats } {
  const stats: MergeStats = {
    addedTasks: 0,
    skippedDuplicates: 0,
    reassignedIds: 0,
    addedCategories: 0,
    matchedCategories: 0,
  };

  // --- Categories
  const categories: CategoryRecord[] = [...current.customCategories];
  const byName = new Map<string, string>();
  for (const c of [...BUILT_IN_CATEGORIES, ...categories]) byName.set(nameKey(c.name), c.id);
  const usedIds = new Set(categories.map((c) => c.id));
  const remap = new Map<string, string>();

  for (const cat of incoming.customCategories) {
    const existingId = byName.get(nameKey(cat.name));
    if (existingId) {
      remap.set(cat.id, existingId);
      stats.matchedCategories++;
      continue;
    }
    if (categories.length >= MAX_CUSTOM_CATEGORIES) {
      remap.set(cat.id, 'personal');
      continue;
    }
    const id = usedIds.has(cat.id) ? createId('custom-') : cat.id;
    remap.set(cat.id, id);
    usedIds.add(id);
    byName.set(nameKey(cat.name), id);
    categories.push({ ...cat, id });
    stats.addedCategories++;
  }

  // --- Tasks
  const tasks: Task[] = [...current.tasks];
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const imported: Task[] = [];

  for (const raw of incoming.tasks) {
    const task = { ...raw, category: remap.get(raw.category) ?? raw.category };
    const existing = byId.get(task.id);
    if (existing && sameTask(existing, task)) {
      stats.skippedDuplicates++;
      continue;
    }
    if (existing) {
      task.id = createId();
      stats.reassignedIds++;
    }
    byId.set(task.id, task);
    imported.push(task);
    stats.addedTasks++;
  }

  // Manual order: imported tasks first (in their own order), then existing ones,
  // renumbered so positions never collide.
  const merged = withSequentialOrder([
    ...sortTasks(imported, 'manual'),
    ...sortTasks(tasks, 'manual'),
  ]);

  return {
    data: {
      tasks: merged,
      customCategories: categories,
      preferences: current.preferences,
    },
    stats,
  };
}
