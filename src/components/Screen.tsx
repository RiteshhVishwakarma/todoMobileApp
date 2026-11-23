import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useIsReady } from '@/stores/appStore';
import { useAppTheme } from '@/theme/ThemeContext';

import { AppBackground } from './AppBackground';
import { AppLogo } from './AppLogo';
import { AppText } from './AppText';

type Props = {
  children: ReactNode;
  edges?: Edge[];
};

function LoadingState() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.loading} accessibilityRole="progressbar" accessibilityLabel="Loading your tasks">
      <View style={[styles.loadingIcon, { backgroundColor: colors.card }]}>
        <AppLogo size={52} />
      </View>
      <ActivityIndicator color={colors.accent} />
      <AppText variant="caption" secondary>
        Loading your tasks…
      </AppText>
    </View>
  );
}

/**
 * Themed, safe-area-aware screen container with the app background art.
 * The art fills the full screen (edge to edge, under notches); content stays inside
 * the safe area and is capped in width so it doesn't sprawl on tablets / web.
 *
 * Until saved data is restored, a loading state is shown instead of the content,
 * so screens never flash an empty state before the user's tasks appear.
 */
export function Screen({ children, edges = ['top'] }: Props) {
  const { colors } = useAppTheme();
  const ready = useIsReady();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppBackground />
      <SafeAreaView edges={edges} style={styles.root}>
        <View style={styles.inner}>{ready ? children : <LoadingState />}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
