import { BookOpen, Briefcase, Flower2, HeartPulse, ShoppingBag } from 'lucide-react-native';

import type { Category, CategoryId } from '@/types/task';

export const CATEGORIES: Category[] = [
  {
    id: 'personal',
    name: 'Personal',
    icon: Flower2,
    color: '#E879A5',
    darkColor: '#F08DB6',
    tint: '#FCE4EC',
    darkTint: '#3A2530',
  },
  {
    id: 'work',
    name: 'Work',
    icon: Briefcase,
    color: '#9575CD',
    darkColor: '#B9A3E0',
    tint: '#EDE7F6',
    darkTint: '#2E2638',
  },
  {
    id: 'study',
    name: 'Study',
    icon: BookOpen,
    color: '#5E9BD6',
    darkColor: '#8DBDE8',
    tint: '#E3F0FB',
    darkTint: '#22303B',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: '#D9965A',
    darkColor: '#E6B97C',
    tint: '#FFF1E0',
    darkTint: '#3A2F22',
  },
  {
    id: 'health',
    name: 'Health',
    icon: HeartPulse,
    color: '#6FA97C',
    darkColor: '#9CCBA5',
    tint: '#E8F5E9',
    darkTint: '#25352A',
  },
];

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
