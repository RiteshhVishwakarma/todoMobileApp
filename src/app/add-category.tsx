import { CircleAlert, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import {
  CATEGORY_COLOR_KEYS,
  CATEGORY_COLORS,
  CATEGORY_ICON_KEYS,
  CATEGORY_ICONS,
  DEFAULT_COLOR_KEY,
  MAX_CATEGORY_NAME_LENGTH,
  resolveCategory,
} from '@/constants/categories';
import { Radius, Spacing } from '@/constants/colors';
import { useAppStore } from '@/stores/appStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import { goBackOrHome } from '@/utils/navigation';

export default function AddCategoryScreen() {
  const { colors, isDark } = useAppTheme();
  const addCategory = useAppStore((s) => s.addCategory);
  const [name, setName] = useState('');
  const [iconKey, setIconKey] = useState('star');
  const [colorKey, setColorKey] = useState(DEFAULT_COLOR_KEY);
  const [error, setError] = useState<string | null>(null);

  const preview = resolveCategory({ id: 'preview', name: name.trim() || 'New category', iconKey, colorKey });
  const PreviewIcon = preview.icon;

  const save = () => {
    const result = addCategory({ name, iconKey, colorKey });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    goBackOrHome();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <AppText variant="title">New Category</AppText>
              <Sparkles size={20} color={colors.accent} strokeWidth={2.2} />
            </View>
            <Pressable
              onPress={goBackOrHome}
              hitSlop={10}
              accessibilityLabel="Close"
              style={[styles.close, { backgroundColor: colors.lightPink }]}>
              <X size={18} color={colors.accent} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Preview */}
          <View
            style={[
              styles.preview,
              { backgroundColor: colors.card, borderColor: colors.border },
              softShadow(colors, isDark, 0.7),
            ]}>
            <View
              style={[styles.previewIcon, { backgroundColor: isDark ? preview.darkTint : preview.tint }]}>
              <PreviewIcon
                size={26}
                color={isDark ? preview.darkColor : preview.color}
                strokeWidth={2}
              />
            </View>
            <AppText variant="heading" numberOfLines={1} style={styles.flex}>
              {preview.name}
            </AppText>
          </View>

          {/* Name */}
          <AppText variant="label" secondary style={styles.label}>
            Name *
          </AppText>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (error) setError(null);
            }}
            placeholder="e.g. Fitness, Travel, Home"
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.accent}
            maxLength={MAX_CATEGORY_NAME_LENGTH}
            returnKeyType="done"
            onSubmitEditing={save}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: error ? colors.priorityHigh : colors.border,
                color: colors.text,
              },
            ]}
          />
          {error && (
            <View style={styles.errorRow}>
              <CircleAlert size={14} color={colors.priorityHigh} />
              <AppText variant="caption" color={colors.priorityHigh}>
                {error}
              </AppText>
            </View>
          )}

          {/* Icon */}
          <AppText variant="label" secondary style={styles.label}>
            Icon
          </AppText>
          <View style={styles.grid}>
            {CATEGORY_ICON_KEYS.map((key) => {
              const Icon = CATEGORY_ICONS[key];
              const active = key === iconKey;
              return (
                <Pressable
                  key={key}
                  onPress={() => setIconKey(key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${key} icon`}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: active ? colors.lightPink : colors.card,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}>
                  <Icon size={20} color={active ? colors.accent : colors.textSecondary} strokeWidth={2} />
                </Pressable>
              );
            })}
          </View>

          {/* Color */}
          <AppText variant="label" secondary style={styles.label}>
            Color
          </AppText>
          <View style={styles.grid}>
            {CATEGORY_COLOR_KEYS.map((key) => {
              const swatch = CATEGORY_COLORS[key];
              const active = key === colorKey;
              return (
                <Pressable
                  key={key}
                  onPress={() => setColorKey(key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${key} color`}
                  style={[
                    styles.swatchRing,
                    { borderColor: active ? colors.accent : 'transparent' },
                  ]}>
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: isDark ? swatch.darkColor : swatch.color },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={goBackOrHome}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.footerBtn,
              { backgroundColor: colors.lightPink },
              pressed && styles.pressed,
            ]}>
            <AppText variant="bodyStrong" color={colors.accentText}>
              Cancel
            </AppText>
          </Pressable>
          <Pressable
            onPress={save}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.footerBtn,
              styles.saveBtn,
              { backgroundColor: colors.accent, opacity: name.trim() ? 1 : 0.6 },
              pressed && styles.pressed,
            ]}>
            <AppText variant="bodyStrong" color={colors.white}>
              Save Category
            </AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginTop: Spacing.xl, marginBottom: Spacing.sm, marginLeft: 2 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontSize: 15,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginLeft: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  footerBtn: {
    flex: 1,
    height: 50,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: { flex: 1.4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
