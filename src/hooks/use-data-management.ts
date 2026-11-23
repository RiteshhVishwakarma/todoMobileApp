import { useState } from 'react';

import { buildBackup, parseBackup, type ParseResult } from '@/storage/backup';
import { exportBackupFile, pickBackupText } from '@/storage/backupFile';
import type { PersistedData } from '@/storage/schema';
import { getDataSnapshot, useAppStore } from '@/stores/appStore';

type ValidBackup = Extract<ParseResult, { ok: true }>;

export type DataDialog =
  | { kind: 'importPreview'; backup: ValidBackup }
  | { kind: 'confirmReplace'; backup: ValidBackup }
  | { kind: 'confirmClear' }
  | { kind: 'notice'; tone: 'success' | 'danger'; title: string; message: string };

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Export / import / clear flows for the Settings screen. */
export function useDataManagement() {
  const importData = useAppStore((s) => s.importData);
  const clearAllData = useAppStore((s) => s.clearAllData);
  const [dialog, setDialog] = useState<DataDialog | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => setDialog(null);
  const notice = (tone: 'success' | 'danger', title: string, message: string) =>
    setDialog({ kind: 'notice', tone, title, message });

  const exportData = async () => {
    if (busy) return;
    setBusy(true);
    const result = await exportBackupFile(buildBackup(getDataSnapshot()));
    setBusy(false);
    if (!result.ok) notice('danger', 'Export failed', result.error);
  };

  const startImport = async () => {
    if (busy) return;
    setBusy(true);
    const picked = await pickBackupText();
    setBusy(false);
    if (picked.status === 'canceled') return;
    if (picked.status === 'error') {
      notice('danger', 'Import failed', picked.error);
      return;
    }
    const parsed = parseBackup(picked.text);
    if (!parsed.ok) {
      notice('danger', "Can't import this file", parsed.error);
      return;
    }
    if (parsed.data.tasks.length === 0 && parsed.data.customCategories.length === 0) {
      notice('danger', 'Nothing to import', 'This backup has no tasks or categories.');
      return;
    }
    setDialog({ kind: 'importPreview', backup: parsed });
  };

  const applyImport = (data: PersistedData, mode: 'merge' | 'replace') => {
    const stats = importData(data, mode);
    if (mode === 'replace') {
      notice(
        'success',
        'Backup restored',
        `Restored ${plural(stats.addedTasks, 'task')} and ${plural(stats.addedCategories, 'custom category', 'custom categories')}.`,
      );
      return;
    }
    const parts = [`Added ${plural(stats.addedTasks, 'task')}`];
    if (stats.addedCategories) parts.push(plural(stats.addedCategories, 'new category', 'new categories'));
    if (stats.skippedDuplicates) parts.push(`skipped ${stats.skippedDuplicates} already in your list`);
    if (stats.reassignedIds) parts.push(`${stats.reassignedIds} kept as separate copies`);
    notice('success', 'Import complete', `${parts.join(', ')}.`);
  };

  return {
    dialog,
    busy,
    close,
    exportData,
    startImport,
    mergeImport: (backup: ValidBackup) => applyImport(backup.data, 'merge'),
    askReplace: (backup: ValidBackup) => setDialog({ kind: 'confirmReplace', backup }),
    replaceImport: (backup: ValidBackup) => applyImport(backup.data, 'replace'),
    askClear: () => setDialog({ kind: 'confirmClear' }),
    clearAll: async () => {
      await clearAllData();
      notice('success', 'All data cleared', 'Your app is fresh and ready for new plans.');
    },
  };
}

/** Human summary of what a backup contains. */
export function describeBackup(backup: ValidBackup, currentTaskCount: number): string {
  const { tasks, customCategories } = backup.data;
  const lines = [
    `This backup has ${plural(tasks.length, 'task')}` +
      (customCategories.length
        ? ` and ${plural(customCategories.length, 'custom category', 'custom categories')}.`
        : '.'),
  ];
  if (backup.exportedAt) {
    const date = new Date(backup.exportedAt);
    if (!Number.isNaN(date.getTime())) lines.push(`Saved on ${date.toLocaleDateString()}.`);
  }
  const skipped = backup.droppedTasks + backup.droppedCategories;
  if (skipped) lines.push(`${plural(skipped, 'damaged entry', 'damaged entries')} will be skipped.`);
  lines.push(
    currentTaskCount > 0
      ? `“Add to my tasks” keeps your current ${plural(currentTaskCount, 'task')}.`
      : 'You have no tasks yet, so nothing will be lost.',
  );
  return lines.join(' ');
}
