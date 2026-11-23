import { Pressable, StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';

import { AppText } from './AppText';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Pill-style segmented control. */
export function FilterTabs<T extends string>({ options, value, onChange }: Props<T>) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.lightPink }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && { backgroundColor: colors.card }]}>
            <AppText
              variant="caption"
              color={active ? colors.accent : colors.textSecondary}
              style={styles.label}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', padding: 4, borderRadius: Radius.pill },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  label: { fontWeight: '700' },
});
