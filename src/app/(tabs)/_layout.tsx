import { Tabs } from 'expo-router/js-tabs';
import {
  CalendarDays,
  House,
  LayoutGrid,
  ListTodo,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';
import { Platform, StyleSheet, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeContext';

function TabIcon({ Icon, color, focused, pill }: {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
  pill: string;
}) {
  return (
    <View style={[styles.iconPill, focused && { backgroundColor: pill }]}>
      <Icon size={21} color={color} strokeWidth={focused ? 2.4 : 2} />
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  const icon = (Icon: LucideIcon) =>
    function TabBarIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
      return (
        <TabIcon
          Icon={Icon}
          color={typeof color === 'string' ? color : colors.textSecondary}
          focused={focused}
          pill={colors.lightPink}
        />
      );
    };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 62 + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
          ...Platform.select({ android: { elevation: 0 } }),
        },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon(House) }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: icon(ListTodo) }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: icon(CalendarDays) }} />
      <Tabs.Screen
        name="categories"
        options={{ title: 'Categories', tabBarIcon: icon(LayoutGrid) }}
      />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon(Settings) }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11, fontWeight: '600', marginTop: 4 },
});
