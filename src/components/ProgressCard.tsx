import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';

import { AppText } from './AppText';

type Props = {
  completed: number;
  total: number;
};

const SIZE = 92;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function messageFor(pct: number, total: number): string {
  if (total === 0) return 'A fresh, calm day ahead';
  if (pct === 100) return 'All done — you did amazing!';
  if (pct >= 60) return 'Almost there, keep glowing';
  if (pct >= 30) return "You're doing lovely, keep going";
  return "Let's make today beautiful";
}

export function ProgressCard({ completed, total }: Props) {
  const { colors, isDark } = useAppTheme();
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        softShadow(colors, isDark),
      ]}>
      <View style={[styles.blob, { backgroundColor: colors.lightPink }]} />

      <View style={styles.text}>
        <View style={styles.labelRow}>
          <Sparkles size={14} color={colors.accent} strokeWidth={2.2} />
          <AppText variant="label" color={colors.accentText}>
            Today&apos;s progress
          </AppText>
        </View>
        <AppText variant="title" style={styles.count}>
          {completed} of {total} tasks
        </AppText>
        <AppText variant="caption" secondary>
          {messageFor(pct, total)}
        </AppText>
      </View>

      <View style={styles.ring}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.lightPink}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.accent}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringLabel}>
          <AppText variant="heading">{pct}%</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -40,
    top: -50,
    opacity: 0.7,
  },
  text: { flex: 1, gap: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  count: { marginTop: 2 },
  ring: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ringLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
