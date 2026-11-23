import type { LucideIcon } from 'lucide-react-native';

export type Priority = 'high' | 'medium' | 'low';

export type CategoryId = 'personal' | 'work' | 'study' | 'shopping' | 'health';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: CategoryId;
  priority: Priority;
  /** Local date, YYYY-MM-DD */
  dueDate: string;
  /** Optional 24h time, HH:mm */
  dueTime?: string;
  /** Reminder preference (UI/state only for now) */
  reminder: boolean;
  isCompleted: boolean;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp, set while the task is completed */
  completedAt?: string;
}

/** Fields the user edits in the Add/Edit form. */
export type TaskInput = Pick<
  Task,
  'title' | 'description' | 'category' | 'priority' | 'dueDate' | 'dueTime' | 'reminder'
>;

export interface Category {
  id: CategoryId;
  name: string;
  icon: LucideIcon;
  /** Icon stroke color (light / dark theme) */
  color: string;
  darkColor: string;
  /** Soft tint used behind the icon (light / dark theme) */
  tint: string;
  darkTint: string;
}
