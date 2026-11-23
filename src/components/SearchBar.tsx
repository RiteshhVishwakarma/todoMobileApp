import { Search, X } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search tasks…' }: Props) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.card, borderColor: colors.border },
        softShadow(colors, isDark, 0.5),
      ]}>
      <Search size={18} color={colors.textSecondary} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.accent}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.input, { color: colors.text }]}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityLabel="Clear search"
          style={[styles.clear, { backgroundColor: colors.lightPink }]}>
          <X size={12} color={colors.accent} strokeWidth={3} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    // Removes the browser focus ring; web-only (invalid on iOS/Android).
    ...Platform.select({ web: { outlineStyle: 'none' } as object }),
  },
  clear: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
