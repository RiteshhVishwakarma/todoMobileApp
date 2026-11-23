import type { CategoryId, Priority, Task } from '@/types/task';
import { isoToDateKey } from '@/utils/date';

export type StatusFilter = 'all' | 'active' | 'completed';
export type SortMode = 'dueDate' | 'priority';

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Due date + time as a sortable string; tasks without a time sort to the end of their day. */
const dueKey = (t: Task) => `${t.dueDate} ${t.dueTime ?? '99:99'}`;

const byDue = (a: Task, b: Task) => dueKey(a).localeCompare(dueKey(b));
const byPriority = (a: Task, b: Task) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];

/** Sorts without mutating. Active tasks always come before completed ones. */
export function sortTasks(tasks: Task[], mode: SortMode = 'dueDate'): Task[] {
  return [...tasks].sort(
    (a, b) =>
      Number(a.isCompleted) - Number(b.isCompleted) ||
      (mode === 'priority' ? byPriority(a, b) || byDue(a, b) : byDue(a, b) || byPriority(a, b)),
  );
}

export function filterTasks(
  tasks: Task[],
  { status = 'all', query = '', category }: { status?: StatusFilter; query?: string; category?: CategoryId },
): Task[] {
  const q = query.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      (status === 'all' || (status === 'active' ? !t.isCompleted : t.isCompleted)) &&
      (!category || t.category === category) &&
      (!q ||
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false)),
  );
}

export function tasksOnDate(tasks: Task[], dateKey: string): Task[] {
  return sortTasks(tasks.filter((t) => t.dueDate === dateKey));
}

export function upcomingTasks(tasks: Task[], today: string, limit = 5): Task[] {
  return sortTasks(tasks.filter((t) => !t.isCompleted && t.dueDate > today)).slice(0, limit);
}

export function overdueTasks(tasks: Task[], today: string): Task[] {
  return sortTasks(tasks.filter((t) => !t.isCompleted && t.dueDate < today));
}

/** Completed tasks, most recently completed first. */
export function completedTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => t.isCompleted)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
}

export function progress(tasks: Task[]): { done: number; total: number; percent: number } {
  const total = tasks.length;
  const done = tasks.filter((t) => t.isCompleted).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function categoryStats(tasks: Task[]): Record<CategoryId, { total: number; completed: number }> {
  const stats = {} as Record<CategoryId, { total: number; completed: number }>;
  for (const t of tasks) {
    const entry = (stats[t.category] ??= { total: 0, completed: 0 });
    entry.total++;
    if (t.isCompleted) entry.completed++;
  }
  return stats;
}

/** Map of date key → open/done counts, used for calendar indicators. */
export function dateIndicators(tasks: Task[]): Map<string, { open: number; done: number }> {
  const map = new Map<string, { open: number; done: number }>();
  for (const t of tasks) {
    const entry = map.get(t.dueDate) ?? { open: 0, done: 0 };
    if (t.isCompleted) entry.done++;
    else entry.open++;
    map.set(t.dueDate, entry);
  }
  return map;
}

export function completedDateKey(task: Task): string | undefined {
  return isoToDateKey(task.completedAt);
}
