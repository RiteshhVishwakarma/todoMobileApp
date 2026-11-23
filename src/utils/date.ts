const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad = (n: number) => String(n).padStart(2, '0');

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** YYYY-MM-DD in local time */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** True for a real calendar date in YYYY-MM-DD form (rejects e.g. 2026-02-31). */
export function isValidDateKey(key: unknown): key is string {
  if (typeof key !== 'string') return false;
  const m = DATE_KEY_RE.exec(key);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
}

/** Parses YYYY-MM-DD; returns null when invalid. */
export function fromDateKey(key: string): Date | null {
  if (!isValidDateKey(key)) return null;
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex] ?? '';
}

/** e.g. "Monday, November 23" */
export function formatLongDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "Today", "Tomorrow", "Yesterday", "Nov 27", or "Nov 27, 2027" for other years. */
export function formatRelativeDate(key: string | undefined): string {
  const date = key ? fromDateKey(key) : null;
  if (!date) return 'No date';
  const today = new Date();
  if (key === toDateKey(today)) return 'Today';
  if (key === toDateKey(addDays(today, 1))) return 'Tomorrow';
  if (key === toDateKey(addDays(today, -1))) return 'Yesterday';
  const base = `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
  return date.getFullYear() === today.getFullYear() ? base : `${base}, ${date.getFullYear()}`;
}

/** Local date key for an ISO timestamp, or undefined when missing/invalid. */
export function isoToDateKey(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : toDateKey(date);
}

export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value);
}

/** "HH:mm" → "9:30 AM". Returns '' for invalid input. */
export function formatTime(value: string | undefined): string {
  if (!isValidTime(value)) return '';
  const [h, m] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${suffix}`;
}

/** Builds "HH:mm" from 12h parts. */
export function toTimeString(hour12: number, minute: number, pm: boolean): string {
  const h = (hour12 % 12) + (pm ? 12 : 0);
  return `${pad(h)}:${pad(minute)}`;
}

/** Splits "HH:mm" into 12h parts (defaults to 9:00 AM when invalid). */
export function parseTime(value: string | undefined): { hour12: number; minute: number; pm: boolean } {
  if (!isValidTime(value)) return { hour12: 9, minute: 0, pm: false };
  const [h, m] = value.split(':').map(Number);
  return { hour12: h % 12 === 0 ? 12 : h % 12, minute: m, pm: h >= 12 };
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
