/**
 * The single AsyncStorage adapter used by Zustand's `persist` middleware.
 *
 * - Skips writes when the serialized data hasn't changed.
 * - Coalesces bursts of changes into one write (short debounce), and flushes
 *   immediately when the app goes to the background so nothing is lost.
 * - If stored data is corrupted, keeps a copy under a separate key instead of
 *   overwriting it, then starts fresh.
 * - Never throws into the UI; errors are reported via `onStorageError`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

const WRITE_DELAY_MS = 250;

/** Server-side render on web has no storage — behave as empty. */
const isServer = Platform.OS === 'web' && typeof window === 'undefined';

type ErrorHandler = (error: unknown, operation: 'read' | 'write' | 'remove') => void;
let errorHandler: ErrorHandler = (error, op) => console.warn(`[storage] ${op} failed`, error);

export function onStorageError(handler: ErrorHandler) {
  errorHandler = handler;
}

const lastWritten = new Map<string, string>();
const pending = new Map<string, string>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function writeNow(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
    lastWritten.set(key, value);
    if (pending.get(key) === value) pending.delete(key);
  } catch (error) {
    // Leave it pending so the next flush retries.
    errorHandler(error, 'write');
  }
}

/** Writes any queued changes immediately. Safe to call any time. */
export async function flushPendingWrites(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  await Promise.all([...pending.entries()].map(([key, value]) => writeNow(key, value)));
}

function scheduleFlush() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flushPendingWrites();
  }, WRITE_DELAY_MS);
}

// Flush when the app is backgrounded / the tab is hidden, so a quick close never loses data.
if (!isServer) {
  AppState.addEventListener('change', (state) => {
    if (state !== 'active') void flushPendingWrites();
  });
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void flushPendingWrites();
    });
    window.addEventListener('pagehide', () => void flushPendingWrites());
  }
}

export function createPersistStorage<S>(): PersistStorage<S> {
  return {
    async getItem(name) {
      if (isServer) return null;
      let raw: string | null;
      try {
        raw = await AsyncStorage.getItem(name);
      } catch (error) {
        errorHandler(error, 'read');
        return null;
      }
      if (raw === null) return null; // first launch

      try {
        const parsed = JSON.parse(raw) as StorageValue<S>;
        lastWritten.set(name, raw);
        return parsed;
      } catch (error) {
        // Corrupted: preserve the raw text so it can be recovered, then start clean.
        errorHandler(error, 'read');
        try {
          await AsyncStorage.setItem(`${name}:corrupt:${Date.now()}`, raw);
        } catch {
          // Nothing more we can do; the app still works with defaults.
        }
        return null;
      }
    },

    setItem(name, value) {
      if (isServer) return;
      let serialized: string;
      try {
        serialized = JSON.stringify(value);
      } catch (error) {
        errorHandler(error, 'write');
        return;
      }
      // Unchanged since the last write (or already queued) → no disk write.
      if (serialized === (pending.get(name) ?? lastWritten.get(name))) return;
      pending.set(name, serialized);
      scheduleFlush();
    },

    async removeItem(name) {
      if (isServer) return;
      pending.delete(name);
      lastWritten.delete(name);
      try {
        await AsyncStorage.removeItem(name);
      } catch (error) {
        errorHandler(error, 'remove');
      }
    },
  };
}
