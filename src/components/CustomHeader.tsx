import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import { goBackOrHome } from '@/utils/navigation';

import { AppText } from './AppText';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function CustomHeader({ title, subtitle, showBack, right }: Props) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.row}>
      {showBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={goBackOrHome}
          style={({ pressed }) => [
            styles.back,
            { backgroundColor: colors.card, borderColor: colors.border },
            softShadow(colors, isDark, 0.6),
            pressed && styles.pressed,
          ]}>
          <ChevronLeft size={22} color={colors.text} strokeWidth={2.2} />
        </Pressable>
      )}
      <View style={styles.titles}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" secondary style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1 },
  subtitle: { marginTop: 2 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
