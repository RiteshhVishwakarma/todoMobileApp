import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'label';

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  secondary?: boolean;
};

export function AppText({ variant = 'body', color, secondary, style, ...rest }: Props) {
  const { colors } = useAppTheme();
  const tone = color ?? (secondary ? colors.textSecondary : colors.text);
  return <Text style={[styles[variant], { color: tone }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  display: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2 },
  heading: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
});
