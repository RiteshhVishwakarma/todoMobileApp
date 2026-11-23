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
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CustomHeader } from '@/components/CustomHeader';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { Screen } from '@/components/Screen';
import { Radius, Spacing } from '@/constants/colors';
import { useTaskStore } from '@/stores/taskStore';
import { useAppTheme, type ThemePreference } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';

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
  const [notifications, setNotifications] = useState({ reminders: true, daily: true, sound: false });
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const taskCount = useTaskStore((s) => s.tasks.length);
  const clearAll = useTaskStore((s) => s.clearAll);
  const [confirmClear, setConfirmClear] = useState(false);

  const toggle = (key: keyof typeof notifications) => (value: boolean) =>
    setNotifications((n) => ({ ...n, [key]: value }));

  const switchProps = {
    trackColor: { false: colors.border, true: colors.primary },
    thumbColor: colors.white,
    ios_backgroundColor: colors.border,
  };

  const comingSoon = (what: string) => () => Alert.alert(what, 'This will be available soon.');

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
                    color={active ? colors.accent : colors.textSecondary}
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
          <Row Icon={Download} label="Export tasks" hint="Save a backup file" onPress={comingSoon('Export tasks')} />
          <Row Icon={Upload} label="Import tasks" hint="Restore from a backup" onPress={comingSoon('Import tasks')} />
          <Row
            Icon={Trash2}
            label="Clear all data"
            danger
            last
            hint={taskCount === 0 ? 'No tasks to clear' : `Remove all ${taskCount} tasks`}
            onPress={taskCount === 0 ? undefined : () => setConfirmClear(true)}
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

      <DeleteConfirmation
        visible={confirmClear}
        title="Clear all data?"
        message={`All ${taskCount} tasks will be permanently removed.`}
        confirmLabel="Clear all"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll();
          setConfirmClear(false);
        }}
      />
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
