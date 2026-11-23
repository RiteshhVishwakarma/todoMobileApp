import { Image } from 'expo-image';

const LOGO = require('@/assets/images/logo.png');

type Props = {
  /** Width and height in dp. */
  size?: number;
};

/**
 * Momo's mascot (sleepy kitty on a checkbox). Transparent PNG, so it sits on any
 * surface without a white box behind it. Decorative: hidden from screen readers.
 */
export function AppLogo({ size = 40 }: Props) {
  return (
    <Image
      source={LOGO}
      style={{ width: size, height: size }}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={0}
      accessible={false}
    />
  );
}
