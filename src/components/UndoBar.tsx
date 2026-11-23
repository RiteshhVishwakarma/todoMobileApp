import { CircleCheckBig, RotateCcw, Trash2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/colors';
import { UNDO_DURATION_MS, useUndoStore } from '@/stores/undoStore';
import { useAppTheme } from '@/theme/ThemeContext';

import { AppText } from './AppText';

/** Matches the tab bar height in (tabs)/_layout.tsx so the bar floats just above it. */
const TAB_BAR_HEIGHT = 62;
/** Leaves room for the floating + button on the right. */
const FAB_CLEARANCE = 58 + 12;

/**
 * Global snackbar: "“Buy milk” deleted · UNDO". Auto-hides after a few seconds.
 * Rendered once in the root layout so it survives navigation (e.g. delete from Details).
 */
export function UndoBar() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const entry = useUndoStore((s) => s.entry);
  const undo = useUndoStore((s) => s.undo);
  const dismiss = useUndoStore((s) => s.dismiss);

  // Restart the timer whenever a new action replaces the current one.
  useEffect(() => {
    if (!entry) return;
    const timer = setTimeout(() => dismiss(entry.id), UNDO_DURATION_MS);
    return () => clearTimeout(timer);
  }, [entry, dismiss]);

  if (!entry) return null;

  const Icon = entry.kind === 'delete' ? Trash2 : entry.kind === 'complete' ? CircleCheckBig : RotateCcw;
  const surface = isDark ? colors.lightPink : colors.text;
  const textColor = isDark ? colors.text : colors.white;
  const actionColor = isDark ? colors.accent : colors.primary;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { bottom: TAB_BAR_HEIGHT + Math.max(insets.bottom, 10) + 20, right: Spacing.lg + FAB_CLEARANCE },
      ]}>
      <Animated.View
        key={entry.id}
        entering={FadeInDown.duration(220)}
        exiting={FadeOutDown.duration(180)}
        accessibilityLiveRegion="polite"
        style={[styles.bar, { backgroundColor: surface }]}>
        <Icon size={18} color={actionColor} strokeWidth={2.2} />
        <AppText variant="caption" numberOfLines={1} style={[styles.message, { color: textColor }]}>
          {entry.message}
        </AppText>
        <Pressable
          onPress={undo}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Undo"
          style={({ pressed }) => [styles.undo, pressed && styles.pressed]}>
          <AppText style={[styles.undoText, { color: actionColor }]}>UNDO</AppText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: Spacing.lg, alignItems: 'stretch' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    borderRadius: Radius.lg,
    maxWidth: 560,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  message: { flex: 1, fontWeight: '600' },
  undo: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill },
  undoText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.6 },
  pressed: { opacity: 0.6 },
});
