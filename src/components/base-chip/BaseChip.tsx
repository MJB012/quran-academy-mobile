import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ChipVariant = 'tint' | 'neutral' | 'warning';

export interface BaseChipProps {
  label: string;
  variant?: ChipVariant;
  size?: 'sm' | 'md';
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  leftAdornment?: React.ReactNode;
}

function BaseChip({
  label,
  variant = 'tint',
  size = 'sm',
  containerStyle,
  labelStyle,
  leftAdornment,
}: BaseChipProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const colors = (() => {
    switch (variant) {
      case 'warning':
        return { bg: '#FEF3C7', fg: '#B45309', border: '#FCD34D' };
      case 'neutral':
        return { bg: palette.surfaceAlt, fg: palette.text, border: palette.border };
      case 'tint':
      default:
        return {
          bg: `${palette.tint}14`,
          fg: palette.tint,
          border: `${palette.tint}55`,
        };
    }
  })();

  const padV = size === 'md' ? 6 : 4;
  const padH = size === 'md' ? 12 : 10;
  const fontSize = size === 'md' ? 13 : 12;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: padV,
          paddingHorizontal: padH,
        },
        containerStyle,
      ]}
    >
      {leftAdornment}
      <Text
        style={[
          styles.label,
          { color: colors.fg, fontSize, marginLeft: leftAdornment ? 4 : 0 },
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
});

export default BaseChip;
