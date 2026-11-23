import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';

import { AppText } from './AppText';

export type DialogAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
};

export type DialogTone = 'accent' | 'danger' | 'success';

type Props = {
  visible: boolean;
  icon: LucideIcon;
  tone?: DialogTone;
  title: string;
  message?: string;
  children?: ReactNode;
  actions: DialogAction[];
  /** Called on backdrop tap / Android back. */
  onDismiss: () => void;
};

/**
 * Themed dialog used for confirmations and results. A Modal (not Alert) so it
 * also works on web. Two actions sit side by side; three or more stack.
 */
export function ConfirmDialog({
  visible,
  icon: Icon,
  tone = 'accent',
  title,
  message,
  children,
  actions,
  onDismiss,
}: Props) {
  const { colors } = useAppTheme();
  const toneColors = {
    accent: { fg: colors.accent, bg: colors.lightPink },
    danger: { fg: colors.priorityHigh, bg: colors.priorityHighSoft },
    success: { fg: colors.success, bg: colors.successSoft },
  }[tone];
  const stacked = actions.length > 2;

  const buttonColors = (variant: DialogAction['variant'] = 'secondary') =>
    ({
      primary: { bg: colors.accent, fg: colors.white },
      danger: { bg: colors.priorityHigh, fg: colors.white },
      secondary: { bg: colors.lightPink, fg: colors.accentText },
    })[variant];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onDismiss}>
        {/* Inner Pressable swallows taps so they don't close the dialog. */}
        <Pressable
          style={[styles.dialog, { backgroundColor: colors.card }]}
          onPress={() => {}}
          accessibilityViewIsModal>
          <View style={[styles.icon, { backgroundColor: toneColors.bg }]}>
            <Icon size={24} color={toneColors.fg} strokeWidth={2.2} />
          </View>
          <AppText variant="heading" style={styles.center} accessibilityRole="header">
            {title}
          </AppText>
          {message ? (
            <AppText variant="body" secondary style={[styles.center, styles.message]}>
              {message}
            </AppText>
          ) : null}
          {children}

          <View style={[styles.actions, stacked && styles.actionsStacked]}>
            {actions.map((action) => {
              const c = buttonColors(action.variant);
              return (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.btn,
                    !stacked && styles.btnRow,
                    { backgroundColor: c.bg },
                    pressed && styles.pressed,
                  ]}>
                  <AppText variant="bodyStrong" color={c.fg}>
                    {action.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  center: { textAlign: 'center' },
  message: { marginTop: 6 },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl, alignSelf: 'stretch' },
  actionsStacked: { flexDirection: 'column', gap: Spacing.sm },
  btn: {
    minHeight: 46,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
