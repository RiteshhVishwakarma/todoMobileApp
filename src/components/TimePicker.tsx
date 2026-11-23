import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/colors';
import { useAppTheme } from '@/theme/ThemeContext';
import { parseTime, toTimeString } from '@/utils/date';

import { AppText } from './AppText';

type Props = {
  /** "HH:mm" (24h) */
  value: string | undefined;
  onChange: (value: string) => void;
};

const MINUTE_STEP = 5;

function Stepper({
  label,
  display,
  onStep,
}: {
  label: string;
  display: string;
  onStep: (delta: number) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onStep(1)}
        hitSlop={6}
        accessibilityLabel={`Increase ${label}`}
        style={[styles.stepBtn, { backgroundColor: colors.lightPink }]}>
        <ChevronUp size={16} color={colors.accent} strokeWidth={2.6} />
      </Pressable>
      <AppText variant="title" style={styles.value}>
        {display}
      </AppText>
      <Pressable
        onPress={() => onStep(-1)}
        hitSlop={6}
        accessibilityLabel={`Decrease ${label}`}
        style={[styles.stepBtn, { backgroundColor: colors.lightPink }]}>
        <ChevronDown size={16} color={colors.accent} strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}

/** Dependency-free 12h time picker with hour/minute steppers and AM/PM toggle. */
export function TimePicker({ value, onChange }: Props) {
  const { colors } = useAppTheme();
  const { hour12, minute, pm } = parseTime(value);

  const setHour = (delta: number) => {
    const next = ((hour12 - 1 + delta + 12) % 12) + 1;
    onChange(toTimeString(next, minute, pm));
  };
  const setMinute = (delta: number) => {
    const rounded = Math.round(minute / MINUTE_STEP) * MINUTE_STEP;
    const next = (rounded + delta * MINUTE_STEP + 60) % 60;
    onChange(toTimeString(hour12, next, pm));
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Stepper label="hour" display={String(hour12)} onStep={setHour} />
      <AppText variant="title" secondary>
        :
      </AppText>
      <Stepper label="minutes" display={String(minute).padStart(2, '0')} onStep={setMinute} />

      <View style={[styles.ampm, { backgroundColor: colors.lightPink }]}>
        {(['AM', 'PM'] as const).map((label) => {
          const active = (label === 'PM') === pm;
          return (
            <Pressable
              key={label}
              onPress={() => onChange(toTimeString(hour12, minute, label === 'PM'))}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.ampmItem, active && { backgroundColor: colors.card }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  stepper: { alignItems: 'center', gap: 4 },
  stepBtn: {
    width: 40,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 40, textAlign: 'center' },
  ampm: { padding: 4, borderRadius: Radius.md, gap: 4 },
  ampmItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  bold: { fontWeight: '700' },
});
