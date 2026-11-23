import { Flower2, Sparkles, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';

import { AppText } from './AppText';

type Props = {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
  compact?: boolean;
};

/** Soft, friendly empty state with a little "illustration" made of layered circles. */
export function EmptyState({ icon: Icon = Flower2, title, message, action, compact }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={[styles.outer, { backgroundColor: colors.lightPink }]}>
        <View style={[styles.inner, { backgroundColor: colors.card }]}>
          <Icon size={30} color={colors.accent} strokeWidth={1.8} />
        </View>
        <View style={[styles.sparkle, styles.sparkleA]}>
          <Sparkles size={16} color={colors.accent} strokeWidth={2} />
        </View>
        <View style={[styles.sparkle, styles.sparkleB]}>
          <Sparkles size={11} color={colors.primary} strokeWidth={2} />
        </View>
      </View>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" secondary style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: Spacing.xxl * 1.5, paddingHorizontal: Spacing.xxl },
  compact: { paddingVertical: Spacing.xl },
  outer: {
    width: 104,
    height: 104,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  inner: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: { position: 'absolute' },
  sparkleA: { top: 6, right: 4 },
  sparkleB: { bottom: 10, left: 2 },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: 6, maxWidth: 280 },
  action: { marginTop: Spacing.lg },
});
