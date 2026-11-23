/**
 * Backup file I/O for web (expo-file-system is native-only).
 * Export downloads a JSON file; import uses the browser file picker.
 */
import * as DocumentPicker from 'expo-document-picker';

import { backupFileName, MAX_BACKUP_BYTES, type BackupFile } from './backup';

export type ExportResult = { ok: true } | { ok: false; error: string };
export type PickResult =
  | { status: 'picked'; text: string; name: string }
  | { status: 'canceled' }
  | { status: 'error'; error: string };

export async function exportBackupFile(backup: BackupFile): Promise<ExportResult> {
  try {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFileName();
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true };
  } catch (error) {
    console.warn('[backup] export failed', error);
    return { ok: false, error: 'Could not download the backup file. Please try again.' };
  }
}

export async function pickBackupText(): Promise<PickResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', '.json', 'text/plain'],
      multiple: false,
    });
    if (result.canceled || !result.assets?.length) return { status: 'canceled' };

    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_BACKUP_BYTES) {
      return { status: 'error', error: 'This file is too large to be a Blossom Todo backup.' };
    }
    const text = asset.file ? await asset.file.text() : await (await fetch(asset.uri)).text();
    return { status: 'picked', text, name: asset.name };
  } catch (error) {
    console.warn('[backup] pick failed', error);
    return { status: 'error', error: 'Could not read that file. Please try another one.' };
  }
}
