import { Platform, type ViewStyle } from 'react-native';

import type { ThemePalette } from '@/constants/colors';

/** Soft, pink-tinted card shadow that stays subtle in dark mode. */
export function softShadow(colors: ThemePalette, isDark: boolean, strength = 1): ViewStyle {
  if (isDark) return {};
  return Platform.select<ViewStyle>({
    web: { boxShadow: `0px 6px 18px rgba(232, 121, 165, ${0.1 * strength})` },
    default: {
      shadowColor: colors.shadow,
      shadowOpacity: 0.1 * strength,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3 * strength,
    },
  }) as ViewStyle;
}
