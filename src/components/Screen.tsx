import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeContext';

import { AppBackground } from './AppBackground';

type Props = {
  children: ReactNode;
  edges?: Edge[];
};

/**
 * Themed, safe-area-aware screen container with the app background art.
 * The art fills the full screen (edge to edge, under notches); content stays inside
 * the safe area and is capped in width so it doesn't sprawl on tablets / web.
 */
export function Screen({ children, edges = ['top'] }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppBackground />
      <SafeAreaView edges={edges} style={styles.root}>
        <View style={styles.inner}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
});
