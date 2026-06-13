/**
 * Quran Academy brand palette.
 * Primary: emerald green. Background: soft mint. Surfaces: white / near-black.
 */

import { Platform } from 'react-native';

const brand = '#0FA678';
const brandDark = '#0C8C64';
const danger = '#E5484D';

export const Colors = {
  light: {
    text: '#11181C',
    textMuted: '#6B7280',
    background: '#EAF7F1',
    surface: '#FFFFFF',
    surfaceAlt: '#F4F7F8',
    tint: brand,
    tintPressed: brandDark,
    tintMuted: '#D6F2E6',
    border: '#E2E8F0',
    danger,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: brand,
  },
  dark: {
    text: '#ECEDEE',
    textMuted: '#9BA1A6',
    background: '#0B1512',
    surface: '#151A18',
    surfaceAlt: '#1C2220',
    tint: brand,
    tintPressed: brandDark,
    tintMuted: '#1E3A31',
    border: '#2A2F33',
    danger,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: brand,
  },
};

export const Brand = {
  primary: brand,
  primaryPressed: brandDark,
  backgroundLight: '#EAF7F1',
  backgroundDark: '#0B1512',
};

export const Radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
