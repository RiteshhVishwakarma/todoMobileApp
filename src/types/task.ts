import type { LucideIcon } from 'lucide-react-native';

export type Priority = 'high' | 'medium' | 'low';

export type CategoryId = 'personal' | 'work' | 'study' | 'shopping' | 'health';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  categoryId: CategoryId;
  priority: Priority;
  /** Local date in YYYY-MM-DD format */
  dueDate: string;
  /** Display time, e.g. "9:30 AM" */
  dueTime?: string;
  completed: boolean;
  /** Local date in YYYY-MM-DD format */
  completedAt?: string;
};

export type Category = {
  id: CategoryId;
  name: string;
  icon: LucideIcon;
  /** Icon stroke color (light / dark theme) */
  color: string;
  darkColor: string;
  /** Soft tint used behind the icon (light / dark theme) */
  tint: string;
  darkTint: string;
};
