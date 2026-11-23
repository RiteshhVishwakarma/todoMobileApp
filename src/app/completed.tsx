import { router } from 'expo-router';
import { PartyPopper, Sprout } from 'lucide-react-native';
import { FlatList, StyleSheet, View } from 'react-native';

import { AddTaskButton } from '@/components/AddTaskButton';
import { AppText } from '@/components/AppText';
import { CustomHeader } from '@/components/CustomHeader';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TaskCard } from '@/components/TaskCard';
import { Radius, Spacing } from '@/constants/colors';
import { DUMMY_TASKS } from '@/data/tasks';
import { useAppTheme } from '@/theme/ThemeContext';

export default function CompletedScreen() {
  const { colors } = useAppTheme();
  const completed = DUMMY_TASKS.filter((t) => t.completed).sort((a, b) =>
    (b.completedAt ?? '').localeCompare(a.completedAt ?? ''),
  );

  return (
    <Screen edges={['top', 'bottom']}>
      <CustomHeader showBack title="Completed" subtitle="Celebrate your little wins" />

      <FlatList
        data={completed}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TaskCard task={item} showCompletedDate />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          completed.length > 0 ? (
            <View style={[styles.banner, { backgroundColor: colors.successSoft }]}>
              <View style={[styles.bannerIcon, { backgroundColor: colors.card }]}>
                <PartyPopper size={22} color={colors.success} strokeWidth={2} />
              </View>
              <View style={styles.flex}>
                <AppText variant="heading">
                  {completed.length} tasks completed
                </AppText>
                <AppText variant="caption" secondary>
                  Proud of you — keep blooming
                </AppText>
              </View>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            icon={Sprout}
            title="No completed tasks yet"
            message="Finish a task and it will bloom here."
            action={<AddTaskButton variant="inline" label="Plan something" onPress={() => router.push('/add-task')} />}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  separator: { height: Spacing.md },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
});
