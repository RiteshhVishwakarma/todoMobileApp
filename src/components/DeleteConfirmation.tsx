import { Trash2 } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';

import { AppText } from './AppText';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Themed confirmation dialog. Uses a Modal instead of Alert so it also works on web.
 */
export function DeleteConfirmation({
  visible,
  title = 'Delete task?',
  message = "This can't be undone.",
  confirmLabel = 'Delete',
  onCancel,
  onConfirm,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onCancel}>
        {/* Inner Pressable swallows taps so they don't close the dialog. */}
        <Pressable style={[styles.dialog, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={[styles.icon, { backgroundColor: colors.priorityHighSoft }]}>
            <Trash2 size={24} color={colors.priorityHigh} strokeWidth={2.2} />
          </View>
          <AppText variant="heading" style={styles.center}>
            {title}
          </AppText>
          <AppText variant="body" secondary style={[styles.center, styles.message]}>
            {message}
          </AppText>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.lightPink },
                pressed && styles.pressed,
              ]}>
              <AppText variant="bodyStrong" color={colors.accent}>
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.priorityHigh },
                pressed && styles.pressed,
              ]}>
              <AppText variant="bodyStrong" color={colors.white}>
                {confirmLabel}
              </AppText>
            </Pressable>
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
    maxWidth: 340,
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
  btn: {
    flex: 1,
    height: 46,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
