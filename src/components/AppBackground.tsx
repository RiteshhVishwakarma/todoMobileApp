import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

const BACKGROUND = require('@/assets/images/backgrounds/sakura-study-nook.png');

/**
 * Full-bleed decorative background.
 *
 * - `contentFit="cover"` keeps the art's aspect ratio on every screen size: it scales
 *   to fill and crops the overflow, so it never stretches or leaves empty bars.
 * - A theme veil keeps text readable (light: soft wash; dark: deep plum so the art
 *   becomes a faint texture behind light text).
 * - Purely decorative: hidden from screen readers and never intercepts touches.
 */
export function AppBackground() {
  const { colors } = useAppTheme();

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <Image
        source={BACKGROUND}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        cachePolicy="memory-disk"
        transition={0}
        accessibilityIgnoresInvertColors
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdropVeil }]} />
    </View>
  );
}
