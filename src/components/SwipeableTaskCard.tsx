import { CircleCheckBig, RotateCcw, Trash2, type LucideIcon } from 'lucide-react-native';
import { memo, useRef, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  Extrapolation,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { Radius } from '@/constants/colors';
import { deleteTaskWithUndo, toggleTaskWithUndo } from '@/stores/undoStore';
import { useAppTheme } from '@/theme/ThemeContext';

import { AppText } from './AppText';
import { TaskCard } from './TaskCard';

/** How far the card travels to reveal an action; passing ~70% of it commits. */
const ACTION_WIDTH = 92;
const COMMIT_THRESHOLD = 64;

type ActionProps = {
  progress: SharedValue<number>;
  side: 'left' | 'right';
  Icon: LucideIcon;
  label: string;
  color: string;
};

/** Colored panel revealed behind the card; the icon grows as you swipe. */
function SwipeAction({ progress, side, Icon, label, color }: ActionProps) {
  const { colors } = useAppTheme();
  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0.6, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.6, 1.05], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View
      // Visual only — screen readers use the card's accessibility actions instead.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={[
        styles.action,
        side === 'left' ? styles.actionLeft : styles.actionRight,
        { backgroundColor: color },
      ]}>
      <Animated.View style={[styles.actionContent, iconStyle]}>
        <Icon size={22} color={colors.white} strokeWidth={2.4} />
        <AppText style={[styles.actionLabel, { color: colors.white }]}>{label}</AppText>
      </Animated.View>
    </View>
  );
}

type Props = ComponentProps<typeof TaskCard>;

/**
 * TaskCard with swipe gestures:
 * - swipe right → mark done (or restore a completed task)
 * - swipe left  → delete
 * Both offer Undo. Tapping the card / checkbox works exactly as before.
 */
function SwipeableTaskCardBase(props: Props) {
  const { colors } = useAppTheme();
  const swipeRef = useRef<SwipeableMethods>(null);
  const { task } = props;
  const done = task.isCompleted;

  const onOpen = (direction: SwipeDirection) => {
    if (direction === SwipeDirection.RIGHT) {
      // Snap back, then toggle — the card stays in lists that show both states.
      swipeRef.current?.close();
      toggleTaskWithUndo(task.id);
    } else {
      deleteTaskWithUndo(task.id);
    }
  };

  return (
    <Animated.View exiting={FadeOut.duration(180)}>
      <ReanimatedSwipeable
        ref={swipeRef}
        friction={1.5}
        leftThreshold={COMMIT_THRESHOLD}
        rightThreshold={COMMIT_THRESHOLD}
        overshootLeft={false}
        overshootRight={false}
        // Ignore small horizontal jitter while scrolling vertically.
        // (Library bounds: left offset must be ≥ 0, right offset must be ≤ 0.)
        dragOffsetFromLeft={14}
        dragOffsetFromRight={-14}
        onSwipeableOpen={onOpen}
        renderLeftActions={(progress) => (
          <SwipeAction
            progress={progress}
            side="left"
            Icon={done ? RotateCcw : CircleCheckBig}
            label={done ? 'Restore' : 'Done'}
            color={done ? colors.accent : colors.success}
          />
        )}
        renderRightActions={(progress) => (
          <SwipeAction
            progress={progress}
            side="right"
            Icon={Trash2}
            label="Delete"
            color={colors.priorityHigh}
          />
        )}>
        <TaskCard {...props} />
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

export const SwipeableTaskCard = memo(SwipeableTaskCardBase);

const styles = StyleSheet.create({
  action: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.lg,
  },
  actionLeft: { marginRight: 8 },
  actionRight: { marginLeft: 8 },
  actionContent: { alignItems: 'center', gap: 4 },
  actionLabel: { fontSize: 12, fontWeight: '700' },
});
