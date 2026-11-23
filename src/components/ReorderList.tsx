import { GripVertical } from 'lucide-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
// Gesture-handler's ScrollView cooperates with the drag gesture (RN's own can steal touches).
import { GestureDetector, ScrollView, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Radius, Spacing } from '@/constants/colors';
import { useCategoryResolver } from '@/stores/appStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { softShadow } from '@/theme/styles';
import type { Task } from '@/types/task';

import { AppText } from './AppText';
import { PriorityBadge } from './PriorityBadge';

/** Fixed row height keeps drag math exact on every screen size. */
const ROW_HEIGHT = 64;
const GAP = Spacing.sm + 2;
const SLOT = ROW_HEIGHT + GAP;
const SPRING = { damping: 22, stiffness: 260, mass: 0.8 };
/** Hold time before a card lifts for dragging. */
const LONG_PRESS_MS = 150;

type Positions = Record<string, number>;

function toPositions(ids: string[]): Positions {
  const map: Positions = {};
  ids.forEach((id, i) => {
    map[id] = i;
  });
  return map;
}

/** Moves `id` from `from` to `to`, shifting the rows in between. Runs on the UI thread. */
function movePosition(positions: Positions, id: string, from: number, to: number): Positions {
  'worklet';
  const next: Positions = {};
  for (const key in positions) {
    const p = positions[key];
    if (key === id) next[key] = to;
    else if (from < to && p > from && p <= to) next[key] = p - 1;
    else if (from > to && p >= to && p < from) next[key] = p + 1;
    else next[key] = p;
  }
  return next;
}

type RowProps = {
  task: Task;
  index: number;
  count: number;
  positions: SharedValue<Positions>;
  onDragStart: () => void;
  onDragEnd: (positions: Positions) => void;
  onMove: (id: string, delta: -1 | 1) => void;
};

const ReorderRow = memo(function ReorderRow({
  task,
  index,
  count,
  positions,
  onDragStart,
  onDragEnd,
  onMove,
}: RowProps) {
  const { colors, isDark } = useAppTheme();
  const category = useCategoryResolver()(task.category);
  const CategoryIcon = category.icon;

  const top = useSharedValue(index * SLOT);
  const startTop = useSharedValue(0);
  const active = useSharedValue(false);

  // Follow position changes (other rows moving, or a re-sync) when not being dragged.
  // (.get()/.set() instead of .value keeps this React-Compiler friendly.)
  useAnimatedReaction(
    () => positions.get()[task.id],
    (pos, prev) => {
      if (pos === undefined || active.get() || pos === prev) return;
      top.set(withSpring(pos * SLOT, SPRING));
    },
  );

  const pan = usePanGesture({
    // Hold the card briefly, then drag. Moving before that lets the list scroll
    // normally, so dragging never fights with scrolling on phones.
    activateAfterLongPress: LONG_PRESS_MS,
    onActivate: () => {
      'worklet';
      active.set(true);
      const start = (positions.get()[task.id] ?? index) * SLOT;
      startTop.set(start);
      top.set(start);
      scheduleOnRN(onDragStart);
    },
    onUpdate: (event) => {
      'worklet';
      const maxTop = (count - 1) * SLOT;
      const y = Math.min(Math.max(startTop.get() + event.translationY, 0), maxTop);
      top.set(y);
      const target = Math.min(Math.max(Math.round(y / SLOT), 0), count - 1);
      const map = positions.get();
      const current = map[task.id];
      if (current !== undefined && target !== current) {
        positions.set(movePosition(map, task.id, current, target));
      }
    },
    onFinalize: () => {
      'worklet';
      if (!active.get()) return;
      active.set(false);
      const map = positions.get();
      top.set(withSpring((map[task.id] ?? index) * SLOT, SPRING));
      scheduleOnRN(onDragEnd, map);
    },
  });

  const rowStyle = useAnimatedStyle(() => {
    const isActive = active.get();
    return {
      top: top.get(),
      zIndex: isActive ? 10 : 1,
      transform: [{ scale: withTiming(isActive ? 1.03 : 1, { duration: 140 }) }],
      opacity: withTiming(isActive ? 0.97 : 1, { duration: 140 }),
    };
  });

  return (
    <Animated.View
      style={[styles.row, rowStyle]}
      accessible
      accessibilityLabel={`${task.title}, position ${index + 1} of ${count}`}
      accessibilityHint="Use the actions menu to move this task"
      accessibilityActions={[
        { name: 'moveUp', label: 'Move up' },
        { name: 'moveDown', label: 'Move down' },
      ]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'moveUp') onMove(task.id, -1);
        if (e.nativeEvent.actionName === 'moveDown') onMove(task.id, 1);
      }}>
      {/* The whole card is the drag target (big and easy to grab on a phone). */}
      <GestureDetector gesture={pan} touchAction="pan-y">
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
            softShadow(colors, isDark, 0.6),
          ]}>
          <View style={styles.handle}>
            <GripVertical size={20} color={colors.textSecondary} strokeWidth={2.2} />
          </View>
          <View
            style={[
              styles.catIcon,
              { backgroundColor: isDark ? category.darkTint : category.tint },
            ]}>
            <CategoryIcon
              size={15}
              color={isDark ? category.darkColor : category.color}
              strokeWidth={2.3}
            />
          </View>
          <AppText
            variant="bodyStrong"
            numberOfLines={1}
            secondary={task.isCompleted}
            style={[styles.title, task.isCompleted && styles.strike]}>
            {task.title}
          </AppText>
          <PriorityBadge priority={task.priority} />
        </View>
      </GestureDetector>
    </Animated.View>
  );
});

type Props = {
  tasks: Task[];
  /** Called once per drop with the full visible list in its new order. */
  onReorder: (orderedIds: string[]) => void;
};

/**
 * Drag-and-drop list: hold the ⋮⋮ handle and move a task up or down.
 * Screen-reader users get "Move up / Move down" actions instead.
 */
export function ReorderList({ tasks, onReorder }: Props) {
  const ids = tasks.map((t) => t.id);
  const idsKey = ids.join('|');
  const positions = useSharedValue<Positions>(toPositions(ids));
  const [dragging, setDragging] = useState(false);

  // Re-sync whenever the list itself changes (saved order, filters, edits).
  useEffect(() => {
    positions.set(toPositions(idsKey ? idsKey.split('|') : []));
  }, [idsKey, positions]);

  const onDragStart = useCallback(() => setDragging(true), []);

  const onDragEnd = useCallback(
    (finalPositions: Positions) => {
      setDragging(false);
      const list = idsKey ? idsKey.split('|') : [];
      const ordered = [...list].sort(
        (a, b) => (finalPositions[a] ?? 0) - (finalPositions[b] ?? 0),
      );
      if (ordered.join('|') !== idsKey) onReorder(ordered);
    },
    [idsKey, onReorder],
  );

  const onMove = useCallback(
    (id: string, delta: -1 | 1) => {
      const list = idsKey ? idsKey.split('|') : [];
      const from = list.indexOf(id);
      const to = from + delta;
      if (from === -1 || to < 0 || to >= list.length) return;
      const next = [...list];
      [next[from], next[to]] = [next[to], next[from]];
      onReorder(next);
    },
    [idsKey, onReorder],
  );

  return (
    <ScrollView
      scrollEnabled={!dragging}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={{ height: Math.max(tasks.length * SLOT - GAP, 0) }}>
        {tasks.map((task, index) => (
          <ReorderRow
            key={task.id}
            task={task}
            index={index}
            count={tasks.length}
            positions={positions}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onMove={onMove}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xs, paddingBottom: 110 },
  row: { position: 'absolute', left: 0, right: 0, height: ROW_HEIGHT },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingRight: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  handle: {
    width: 40,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
  strike: { textDecorationLine: 'line-through' },
});
