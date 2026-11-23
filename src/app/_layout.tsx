import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from '@/components/splash/AnimatedSplash';
import { UndoBar } from '@/components/UndoBar';
import { useIsReady } from '@/stores/appStore';
import { AppThemeProvider, useAppTheme } from '@/theme/ThemeContext';

// Keep the native splash up while saved data is restored (avoids a flash of empty screens).
SplashScreen.preventAutoHideAsync().catch(() => {});
// A short cross-fade into the animated intro (its first frame matches the native splash).
SplashScreen.setOptions({ fade: true, duration: 150 });

/** Never keep the splash forever, even if storage is unexpectedly slow. */
const SPLASH_TIMEOUT_MS = 4000;

function hideSplash() {
  SplashScreen.hideAsync().catch(() => {});
}

function RootNavigator() {
  const { colors, isDark } = useAppTheme();
  const ready = useIsReady();
  // Animated intro, once per app start (native only: the web has no splash screen).
  const [showIntro, setShowIntro] = useState(Platform.OS !== 'web');

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
      <UndoBar />
      {showIntro && <AnimatedSplash ready={ready} onFinish={() => setShowIntro(false)} />}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    // Required for swipe gestures (react-native-gesture-handler).
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <RootNavigator />
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
