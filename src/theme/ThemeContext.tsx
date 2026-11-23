import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { Colors, type ThemePalette } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colors: ThemePalette;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * In-memory theme preference (not persisted yet — storage comes in a later phase).
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  const value = useMemo<ThemeContextValue>(() => {
    const resolved = preference === 'system' ? (systemScheme ?? 'light') : preference;
    const isDark = resolved === 'dark';
    return {
      colors: isDark ? Colors.dark : Colors.light,
      isDark,
      preference,
      setPreference,
    };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return ctx;
}
