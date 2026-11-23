import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIsReady } from '@/stores/appStore';
import { AppThemeProvider, useAppTheme } from '@/theme/ThemeContext';

// Keep the native splash up while saved data is restored (avoids a flash of empty screens).
SplashScreen.preventAutoHideAsync().catch(() => {});

/** Never keep the splash forever, even if storage is unexpectedly slow. */
const SPLASH_TIMEOUT_MS = 4000;

function hideSplash() {
  SplashScreen.hideAsync().catch(() => {});
}

function RootNavigator() {
  const { colors, isDark } = useAppTheme();
  const ready = useIsReady();

  useEffect(() => {
    if (ready) {
      hideSplash();
      return;
    }
    const timer = setTimeout(hideSplash, SPLASH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [colors, isDark]);

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="completed" />
        <Stack.Screen name="task-details/[id]" />
        <Stack.Screen name="add-task" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-category" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
