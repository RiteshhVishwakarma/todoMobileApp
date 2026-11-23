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

/** YYYY-MM-DD in local time */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(key: string): Date {
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
  return MONTHS[monthIndex];
}

/** e.g. "Monday, November 23" */
export function formatLongDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** e.g. "Today", "Tomorrow", "Yesterday" or "Nov 27" */
export function formatRelativeDate(key: string): string {
  const today = new Date();
  if (key === toDateKey(today)) return 'Today';
  if (key === toDateKey(addDays(today, 1))) return 'Tomorrow';
  if (key === toDateKey(addDays(today, -1))) return 'Yesterday';
  const date = fromDateKey(key);
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
