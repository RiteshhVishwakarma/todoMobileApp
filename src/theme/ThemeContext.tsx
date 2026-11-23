import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { Colors, type ThemePalette } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores/appStore';
import type { ThemePreference } from '@/types/task';

export type { ThemePreference };

type ThemeContextValue = {
  colors: ThemePalette;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Resolves the saved theme preference (persisted in the app store) into a palette. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useAppStore((s) => s.preferences.theme);
  const setPreference = useAppStore((s) => s.setTheme);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved = preference === 'system' ? (systemScheme ?? 'light') : preference;
    const isDark = resolved === 'dark';
    return {
      colors: isDark ? Colors.dark : Colors.light,
      isDark,
      preference,
      setPreference,
    };
  }, [preference, systemScheme, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return ctx;
}
