import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeContext';

type Props = {
  children: ReactNode;
  edges?: Edge[];
};

/** Themed, safe-area-aware screen container. Tab screens only need the top edge. */
export function Screen({ children, edges = ['top'] }: Props) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
});
