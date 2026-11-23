import {
  BookOpen,
  Briefcase,
  Coffee,
  Dumbbell,
  Flower2,
  Gift,
  HeartPulse,
  House,
  Music,
  Palette,
  PawPrint,
  Plane,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

import type { Category, CategoryRecord } from '@/types/task';

/** Icons a category can use. Stored by key so categories stay serializable. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  flower: Flower2,
  briefcase: Briefcase,
  book: BookOpen,
  bag: ShoppingBag,
  health: HeartPulse,
  home: House,
  fitness: Dumbbell,
  travel: Plane,
  music: Music,
  art: Palette,
  coffee: Coffee,
  pets: PawPrint,
  money: Wallet,
  gift: Gift,
  star: Star,
  sparkles: Sparkles,
};
export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);
export const DEFAULT_ICON_KEY = 'sparkles';

type Swatch = Pick<Category, 'color' | 'darkColor' | 'tint' | 'darkTint'>;

/** Soft pastel swatches for categories (light + dark variants). */
export const CATEGORY_COLORS: Record<string, Swatch> = {
  pink: { color: '#E879A5', darkColor: '#F08DB6', tint: '#FCE4EC', darkTint: '#3A2530' },
  lavender: { color: '#9575CD', darkColor: '#B9A3E0', tint: '#EDE7F6', darkTint: '#2E2638' },
  blue: { color: '#5E9BD6', darkColor: '#8DBDE8', tint: '#E3F0FB', darkTint: '#22303B' },
  peach: { color: '#D9965A', darkColor: '#E6B97C', tint: '#FFF1E0', darkTint: '#3A2F22' },
  green: { color: '#6FA97C', darkColor: '#9CCBA5', tint: '#E8F5E9', darkTint: '#25352A' },
  coral: { color: '#E0796B', darkColor: '#F0A094', tint: '#FDE8E4', darkTint: '#3B2522' },
  mint: { color: '#4FA89A', darkColor: '#86CCBF', tint: '#E0F4F1', darkTint: '#1F3330' },
  berry: { color: '#B0467A', darkColor: '#E08AB4', tint: '#F6E1EC', darkTint: '#3A2230' },
};
export const CATEGORY_COLOR_KEYS = Object.keys(CATEGORY_COLORS);
export const DEFAULT_COLOR_KEY = 'pink';

export const BUILT_IN_CATEGORIES: CategoryRecord[] = [
  { id: 'personal', name: 'Personal', iconKey: 'flower', colorKey: 'pink' },
  { id: 'work', name: 'Work', iconKey: 'briefcase', colorKey: 'lavender' },
  { id: 'study', name: 'Study', iconKey: 'book', colorKey: 'blue' },
  { id: 'shopping', name: 'Shopping', iconKey: 'bag', colorKey: 'peach' },
  { id: 'health', name: 'Health', iconKey: 'health', colorKey: 'green' },
];
export const BUILT_IN_IDS = BUILT_IN_CATEGORIES.map((c) => c.id);
/** Tasks in a deleted / unknown category fall back here. */
export const FALLBACK_CATEGORY_ID = 'personal';

export const MAX_CATEGORY_NAME_LENGTH = 24;
export const MAX_CUSTOM_CATEGORIES = 30;

export function isBuiltInCategory(id: string): boolean {
  return BUILT_IN_IDS.includes(id);
}

/** Turns a stored record into something renderable, with safe icon/color fallbacks. */
export function resolveCategory(record: CategoryRecord): Category {
  const swatch = CATEGORY_COLORS[record.colorKey] ?? CATEGORY_COLORS[DEFAULT_COLOR_KEY];
  return {
    id: record.id,
    name: record.name,
    icon: CATEGORY_ICONS[record.iconKey] ?? CATEGORY_ICONS[DEFAULT_ICON_KEY],
    ...swatch,
    isCustom: !isBuiltInCategory(record.id),
  };
}

export const BUILT_IN_RESOLVED: Category[] = BUILT_IN_CATEGORIES.map(resolveCategory);
