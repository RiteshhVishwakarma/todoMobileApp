import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';

import { AppText } from './AppText';

type Props = {
  /** "fab" floats bottom-right; "inline" is a full-width pill button. */
  variant?: 'fab' | 'inline';
  label?: string;
  onPress?: () => void;
};

export function AddTaskButton({ variant = 'fab', label = 'Add Task', onPress }: Props) {
  const { colors, isDark } = useAppTheme();
  const handlePress = onPress ?? (() => router.push('/add-task'));

  if (variant === 'inline') {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.inline,
          { backgroundColor: colors.accent },
          softShadow(colors, isDark, 1.4),
          pressed && styles.pressed,
        ]}>
        <Plus size={18} color={colors.white} strokeWidth={2.6} />
        <AppText variant="bodyStrong" color={colors.white}>
          {label}
        </AppText>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: colors.accent },
        softShadow(colors, isDark, 2),
        pressed && styles.pressed,
      ]}>
      <Plus size={26} color={colors.white} strokeWidth={2.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: Radius.pill,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.95 }] },
});
