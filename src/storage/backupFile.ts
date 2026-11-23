/**
 * Backup file I/O for iOS/Android (web version: backupFile.web.ts).
 * Export writes JSON to the cache folder and opens the system share sheet
 * (save to Files, Drive, email…). Import uses the system document picker.
 */
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { backupFileName, MAX_BACKUP_BYTES, type BackupFile } from './backup';

export type ExportResult = { ok: true } | { ok: false; error: string };
export type PickResult =
  | { status: 'picked'; text: string; name: string }
  | { status: 'canceled' }
  | { status: 'error'; error: string };

export async function exportBackupFile(backup: BackupFile): Promise<ExportResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      return { ok: false, error: 'Sharing is not available on this device.' };
    }
    const file = new File(Paths.cache, backupFileName());
    if (file.exists) file.delete();
    file.create();
    await file.write(JSON.stringify(backup, null, 2));
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: 'Save your Blossom Todo backup',
    });
    return { ok: true };
  } catch (error) {
    console.warn('[backup] export failed', error);
    return { ok: false, error: 'Could not create the backup file. Please try again.' };
  }
}

export async function pickBackupText(): Promise<PickResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      // Android often reports .json as octet-stream, so allow any file and validate content.
      type: ['application/json', 'text/plain', 'application/octet-stream', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.length) return { status: 'canceled' };

    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_BACKUP_BYTES) {
      return { status: 'error', error: 'This file is too large to be a Blossom Todo backup.' };
    }
    const text = await new File(asset.uri).text();
    return { status: 'picked', text, name: asset.name };
  } catch (error) {
    console.warn('[backup] pick failed', error);
    return { status: 'error', error: 'Could not read that file. Please try another one.' };
  }
}
