import type { LucideIcon } from 'lucide-react-native';

export type Priority = 'high' | 'medium' | 'low';

/** Built-in ids ('personal', 'work', …) or `custom-…` ids for user categories. */
export type CategoryId = string;

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
  /** Position in the user's manual ("My order") arrangement — lower comes first. */
  order: number;
}

/** Fields the user edits in the Add/Edit form. */
export type TaskInput = Pick<
  Task,
  'title' | 'description' | 'category' | 'priority' | 'dueDate' | 'dueTime' | 'reminder'
>;

/** Serializable category, as stored on disk. Icons/colors are referenced by key. */
export interface CategoryRecord {
  id: CategoryId;
  name: string;
  iconKey: string;
  colorKey: string;
  /** ISO timestamp (custom categories only) */
  createdAt?: string;
}

/** Category resolved for rendering (icon component + theme colors). */
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
  isCustom: boolean;
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface NotificationPreferences {
  reminders: boolean;
  daily: boolean;
  sound: boolean;
}

/** How the Tasks list is sorted. `manual` = the user's drag-and-drop order. */
export type TaskSortMode = 'dueDate' | 'priority' | 'manual';

export interface Preferences {
  theme: ThemePreference;
  notifications: NotificationPreferences;
  taskSort: TaskSortMode;
}
