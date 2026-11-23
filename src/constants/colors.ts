export type ThemePalette = {
  primary: string;
  lightPink: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  accent: string;
  success: string;
  successSoft: string;
  border: string;
  shadow: string;
  overlay: string;
  white: string;
  priorityHigh: string;
  priorityHighSoft: string;
  priorityMedium: string;
  priorityMediumSoft: string;
  priorityLow: string;
  priorityLowSoft: string;
};

export const Colors: Record<'light' | 'dark', ThemePalette> = {
  light: {
    primary: '#F4A6C1',
    lightPink: '#FCE4EC',
    background: '#FFF7FA',
    card: '#FFFFFF',
    text: '#49343D',
    textSecondary: '#A58C98',
    accent: '#E879A5',
    success: '#A5CFA5',
    successSoft: '#EAF5EA',
    border: '#F7E1EA',
    shadow: '#E879A5',
    overlay: 'rgba(73, 52, 61, 0.35)',
    white: '#FFFFFF',
    priorityHigh: '#E06C8F',
    priorityHighSoft: '#FDE3EB',
    priorityMedium: '#D9A15B',
    priorityMediumSoft: '#FBEEDC',
    priorityLow: '#7FB08A',
    priorityLowSoft: '#E5F3E7',
  },
  dark: {
    primary: '#F4A6C1',
    lightPink: '#3A2530',
    background: '#1B1418',
    card: '#261C22',
    text: '#F8E9F0',
    textSecondary: '#B596A5',
    accent: '#F08DB6',
    success: '#93C493',
    successSoft: '#24322A',
    border: '#3A2A33',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.55)',
    white: '#FFFFFF',
    priorityHigh: '#F28FAE',
    priorityHighSoft: '#43252F',
    priorityMedium: '#E6B97C',
    priorityMediumSoft: '#3D3022',
    priorityLow: '#9CCBA5',
    priorityLowSoft: '#25352A',
  },
};

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;
