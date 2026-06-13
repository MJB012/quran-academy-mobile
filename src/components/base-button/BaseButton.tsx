import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Colors, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type BaseButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type BaseButtonSize = 'sm' | 'md' | 'lg';

export interface BaseButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  onPress: () => void;
  variant?: BaseButtonVariant;
  size?: BaseButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

function BaseButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  containerStyle,
  textStyle,
  ...rest
}: BaseButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const isDisabled = disabled || loading;

  const { bg, fg, border } = getVariantColors(variant, palette);
  const { paddingV, paddingH, fontSize } = getSizeStyles(size);

  return (
    <Pressable
      {...rest}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={
        variant === 'ghost' || variant === 'outline'
          ? { color: hexWithAlpha(palette.tint, 0.15), borderless: false }
          : { color: 'rgba(255,255,255,0.2)', borderless: false }
      }
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.55 : pressed && Platform.OS === 'ios' ? 0.85 : 1,
        },
        containerStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text
            numberOfLines={1}
            style={[styles.label, { color: fg, fontSize }, textStyle]}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

function getVariantColors(
  variant: BaseButtonVariant,
  palette: typeof Colors.light,
) {
  switch (variant) {
    case 'secondary':
      return {
        bg: palette.surfaceAlt,
        fg: palette.text,
        border: palette.border,
      };
    case 'outline':
      return { bg: palette.surface, fg: palette.tint, border: palette.tint };
    case 'ghost':
      return { bg: 'transparent', fg: palette.tint, border: 'transparent' };
    case 'primary':
    default:
      return { bg: palette.tint, fg: '#FFFFFF', border: palette.tint };
  }
}

function getSizeStyles(size: BaseButtonSize) {
  switch (size) {
    case 'sm':
      return { paddingV: 8, paddingH: 14, fontSize: 13 };
    case 'lg':
      return { paddingV: 16, paddingH: 22, fontSize: 17 };
    case 'md':
    default:
      return { paddingV: 12, paddingH: 18, fontSize: 15 };
  }
}

function hexWithAlpha(hex: string, alpha: number) {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
  icon: {
    marginHorizontal: 6,
  },
});

export default BaseButton;
