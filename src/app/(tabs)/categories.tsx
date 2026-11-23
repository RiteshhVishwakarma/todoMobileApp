import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CategoryCard } from '@/components/CategoryCard';
import { CustomHeader } from '@/components/CustomHeader';
import { Screen } from '@/components/Screen';
import { CATEGORIES } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/colors';
import { useTaskStore } from '@/stores/taskStore';
import { useAppTheme } from '@/theme/ThemeContext';
import type { Category } from '@/types/task';
import { categoryStats } from '@/utils/tasks';

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

export default function CategoriesScreen() {
  const { colors } = useAppTheme();

  const tasks = useTaskStore((s) => s.tasks);
  const statsById = useMemo(() => categoryStats(tasks), [tasks]);
  const stats = (c: Category) => statsById[c.id] ?? { total: 0, completed: 0 };
  const openCategory = (c: Category) =>
    router.navigate({ pathname: '/tasks', params: { category: c.id } });

  const onAdd = () => Alert.alert('Add Category', 'Custom categories are coming soon.');

  // Pad the grid with the "add" tile so it sits in the last row.
  const tiles: (Category | 'add')[] = [...CATEGORIES, 'add'];

  return (
    <Screen>
      <CustomHeader title="Categories" subtitle="Organize your life, beautifully" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {chunk(tiles, 2).map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((item) =>
              item === 'add' ? (
                <Pressable
                  key="add"
                  onPress={onAdd}
                  accessibilityRole="button"
                  accessibilityLabel="Add category"
                  style={({ pressed }) => [
                    styles.addTile,
                    { borderColor: colors.primary, backgroundColor: colors.lightPink },
                    pressed && { opacity: 0.8 },
                  ]}>
                  <View style={[styles.addIcon, { backgroundColor: colors.card }]}>
                    <Plus size={22} color={colors.accent} strokeWidth={2.5} />
                  </View>
                  <AppText variant="bodyStrong" color={colors.accentText}>
                    Add Category
                  </AppText>
                </Pressable>
              ) : (
                <CategoryCard
                  key={item.id}
                  category={item}
                  {...stats(item)}
                  onPress={() => openCategory(item)}
                />
              ),
            )}
            {row.length === 1 && <View style={styles.spacer} />}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md },
  spacer: { flex: 1 },
  addTile: {
    flex: 1,
    minHeight: 170,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
