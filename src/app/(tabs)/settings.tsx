import Constants from 'expo-constants';
import {
  BellRing,
  ChevronRight,
  Download,
  Heart,
  Info,
  Moon,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  Volume2,
  AlarmClock,
  CircleAlert,
  CircleCheckBig,
  type LucideIcon,
} from 'lucide-react-native';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CustomHeader } from '@/components/CustomHeader';
import { Screen } from '@/components/Screen';
import { Radius, Spacing } from '@/constants/colors';
import { describeBackup, useDataManagement } from '@/hooks/use-data-management';
import { useAppStore } from '@/stores/appStore';
import { useAppTheme, type ThemePreference } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import type { NotificationPreferences } from '@/types/task';

const THEME_OPTIONS: { value: ThemePreference; label: string; Icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Smartphone },
];

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { colors, isDark } = useAppTheme();
  return (
    <View style={styles.group}>
      <AppText variant="label" secondary style={styles.groupTitle}>
        {title}
      </AppText>
      <View
        style={[
          styles.groupCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          softShadow(colors, isDark, 0.6),
        ]}>
        {children}
      </View>
    </View>
  );
}

type RowProps = {
  Icon: LucideIcon;
  label: string;
  hint?: string;
  danger?: boolean;
  last?: boolean;
  right?: ReactNode;
  onPress?: () => void;
};

function Row({ Icon, label, hint, danger, last, right, onPress }: RowProps) {
  const { colors } = useAppTheme();
  const tone = danger ? colors.priorityHigh : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
        pressed && { opacity: 0.7 },
      ]}>
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? colors.priorityHighSoft : colors.lightPink },
        ]}>
        <Icon size={17} color={tone} strokeWidth={2.2} />
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyStrong" color={danger ? colors.priorityHigh : undefined}>
          {label}
        </AppText>
        {hint ? (
          <AppText variant="caption" secondary>
            {hint}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={colors.textSecondary} /> : null)}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const notifications = useAppStore((s) => s.preferences.notifications);
  const setNotification = useAppStore((s) => s.setNotification);
  const taskCount = useAppStore((s) => s.tasks.length);
  const customCount = useAppStore((s) => s.customCategories.length);
  const data = useDataManagement();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const toggle = (key: keyof NotificationPreferences) => (value: boolean) =>
    setNotification(key, value);
  const dialog = data.dialog;
  const tasksLabel = `${taskCount} ${taskCount === 1 ? 'task' : 'tasks'}`;

  const dialogContent: Omit<ComponentProps<typeof ConfirmDialog>, 'visible' | 'onDismiss'> | null =
    !dialog
      ? null
      : dialog.kind === 'confirmClear'
        ? {
            icon: Trash2,
            tone: 'danger',
            title: 'Clear all data?',
            message: `${tasksLabel}, ${customCount} custom ${
              customCount === 1 ? 'category' : 'categories'
            } and your settings will be permanently removed. Consider exporting a backup first.`,
            actions: [
              { label: 'Cancel', onPress: data.close },
              { label: 'Clear all', variant: 'danger', onPress: data.clearAll },
            ],
          }
        : dialog.kind === 'importPreview'
          ? {
              // Merge or replace is always the user's explicit choice — never silent.
              icon: Upload,
              title: 'Import backup?',
              message: describeBackup(dialog.backup, taskCount),
              actions: [
                {
                  label: 'Add to my tasks',
                  variant: 'primary',
                  onPress: () => data.mergeImport(dialog.backup),
                },
                {
                  label: 'Replace everything',
                  variant: 'danger',
                  onPress: () => data.askReplace(dialog.backup),
                },
                { label: 'Cancel', onPress: data.close },
              ],
            }
          : dialog.kind === 'confirmReplace'
            ? {
                icon: Trash2,
                tone: 'danger',
                title: 'Replace all your data?',
                message: `Your current ${tasksLabel}, categories and settings will be replaced by the backup. This can't be undone.`,
                actions: [
                  { label: 'Cancel', onPress: data.close },
                  {
                    label: 'Replace',
                    variant: 'danger',
                    onPress: () => data.replaceImport(dialog.backup),
                  },
                ],
              }
            : {
                icon: dialog.tone === 'danger' ? CircleAlert : CircleCheckBig,
                tone: dialog.tone,
                title: dialog.title,
                message: dialog.message,
                actions: [{ label: 'OK', variant: 'primary', onPress: data.close }],
              };

  const switchProps = {
    trackColor: { false: colors.border, true: colors.primary },
    thumbColor: colors.white,
    ios_backgroundColor: colors.border,
  };

  return (
    <Screen>
      <CustomHeader title="Settings" subtitle="Make it yours" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <Group title="Appearance">
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(({ value, label, Icon }) => {
              const active = preference === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setPreference(value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.themeOption,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.lightPink : 'transparent',
                    },
                  ]}>
                  <Icon
                    size={20}
                    color={active ? colors.accent : colors.textSecondary}
                    strokeWidth={2.2}
                  />
                  <AppText
                    variant="caption"
                    color={active ? colors.accentText : colors.textSecondary}
                    style={styles.bold}>
                    {label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Group>

        {/* Notifications */}
        <Group title="Notifications">
          <Row
            Icon={BellRing}
            label="Task reminders"
            hint="Get notified before tasks are due"
            right={
              <Switch
                value={notifications.reminders}
                onValueChange={toggle('reminders')}
                {...switchProps}
              />
            }
          />
          <Row
            Icon={AlarmClock}
            label="Daily summary"
            hint="A gentle morning overview at 8:00 AM"
            right={
              <Switch value={notifications.daily} onValueChange={toggle('daily')} {...switchProps} />
            }
          />
          <Row
            Icon={Volume2}
            label="Sounds"
            last
            right={
              <Switch value={notifications.sound} onValueChange={toggle('sound')} {...switchProps} />
            }
          />
        </Group>

        {/* Data */}
        <Group title="Data Management">
          <Row
            Icon={Download}
            label="Export backup"
            hint="Save all tasks & settings as a JSON file"
            onPress={data.exportData}
            right={data.busy ? <ActivityIndicator color={colors.accent} /> : undefined}
          />
          <Row
            Icon={Upload}
            label="Import backup"
            hint="Restore from a JSON backup file"
            onPress={data.startImport}
          />
          <Row
            Icon={Trash2}
            label="Clear all data"
            danger
            last
            hint="Remove all tasks, categories & settings"
            onPress={data.askClear}
          />
        </Group>

        {/* About */}
        <Group title="About">
          <Row
            Icon={Heart}
            label="Blossom Todo"
            hint="A soft little space for your daily plans"
          />
          <Row
            Icon={Info}
            label="App version"
            last
            right={
              <AppText variant="caption" secondary style={styles.bold}>
                v{version}
              </AppText>
            }
          />
        </Group>

        <View style={styles.footer}>
          <AppText variant="caption" secondary>
            Made with
          </AppText>
          <Heart size={12} color={colors.accent} fill={colors.accent} />
          <AppText variant="caption" secondary>
            for productive, peaceful days
          </AppText>
        </View>
      </ScrollView>

      {/*
        One dialog whose content follows the flow (iOS can't reliably show a second
        Modal while the first is closing).
      */}
      {dialogContent && (
        <ConfirmDialog visible onDismiss={data.close} {...dialogContent} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  group: { marginBottom: Spacing.xl },
  groupTitle: { marginBottom: Spacing.sm, marginLeft: 4 },
  groupCard: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    minHeight: 60,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  themeRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
});
