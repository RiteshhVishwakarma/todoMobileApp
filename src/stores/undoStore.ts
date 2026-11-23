/**
 * Short-lived "Undo" state for destructive or accidental actions (swipe delete /
 * swipe complete). Not persisted: if the app closes before Undo, the action stays.
 */
import { AccessibilityInfo } from 'react-native';
import { create } from 'zustand';

import type { Task } from '@/types/task';

import { useAppStore } from './appStore';

export const UNDO_DURATION_MS = 5000;

export interface UndoEntry {
  /** Unique per action, so a newer action replaces the bar and resets its timer. */
  id: number;
  kind: 'delete' | 'complete' | 'restore';
  message: string;
  /** Task exactly as it was before the action. */
  snapshot: Task;
  /** Position in the task list before the action. */
  index: number;
}

interface UndoState {
  entry: UndoEntry | null;
  show: (entry: Omit<UndoEntry, 'id'>) => void;
  /** Dismisses the bar; with an id, only if that entry is still showing. */
  dismiss: (id?: number) => void;
  undo: () => void;
}

let nextId = 1;

export const useUndoStore = create<UndoState>()((set, get) => ({
  entry: null,

  show: (entry) => {
    set({ entry: { ...entry, id: nextId++ } });
    AccessibilityInfo.announceForAccessibility?.(`${entry.message}. Undo available.`);
  },

  dismiss: (id) => {
    const current = get().entry;
    if (current && (id === undefined || current.id === id)) set({ entry: null });
  },

  undo: () => {
    const current = get().entry;
    if (!current) return;
    useAppStore.getState().restoreTask(current.snapshot, current.index);
    set({ entry: null });
  },
}));

const quote = (title: string) => `“${title.length > 28 ? `${title.slice(0, 27)}…` : title}”`;

function snapshotOf(id: string): { task: Task; index: number } | null {
  const tasks = useAppStore.getState().tasks;
  const index = tasks.findIndex((t) => t.id === id);
  return index === -1 ? null : { task: tasks[index], index };
}

/** Deletes a task and offers Undo. */
export function deleteTaskWithUndo(id: string) {
  const snap = snapshotOf(id);
  if (!snap) return;
  useAppStore.getState().deleteTask(id);
  useUndoStore.getState().show({
    kind: 'delete',
    message: `${quote(snap.task.title)} deleted`,
    snapshot: snap.task,
    index: snap.index,
  });
}

/** Completes (or restores) a task and offers Undo. */
export function toggleTaskWithUndo(id: string) {
  const snap = snapshotOf(id);
  if (!snap) return;
  useAppStore.getState().toggleCompleted(id);
  const restoring = snap.task.isCompleted;
  useUndoStore.getState().show({
    kind: restoring ? 'restore' : 'complete',
    message: `${quote(snap.task.title)} ${restoring ? 'moved back to active' : 'completed'}`,
    snapshot: snap.task,
    index: snap.index,
  });
}
