import React, { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BaseInputProps extends Omit<TextInputProps, 'onBlur'> {
  label?: string;
  error?: string;
  touched?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBlur?: (e?: any) => void;
}

const BaseInput = forwardRef<TextInput, BaseInputProps>(function BaseInput(
  {
    label,
    error,
    touched,
    containerStyle,
    inputStyle,
    labelStyle,
    leftIcon,
    rightIcon,
    secureTextEntry,
    onFocus,
    onBlur,
    editable = true,
    ...rest
  },
  ref,
) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const showError = !!error && !!touched;
  const borderColor = showError
    ? palette.danger
    : focused
      ? palette.tint
      : palette.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: palette.text }, labelStyle]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputRow,
          {
            borderColor,
            backgroundColor: palette.surfaceAlt,
            opacity: editable ? 1 : 0.6,
          },
        ]}
      >
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}

        <TextInput
          {...rest}
          ref={ref}
          editable={editable}
          secureTextEntry={hidden}
          placeholderTextColor={palette.textMuted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: palette.text }, inputStyle]}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
            style={styles.icon}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <IconSymbol
              name={hidden ? 'eye.fill' : 'eye.slash.fill'}
              size={20}
              color={palette.icon}
            />
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.icon}>{rightIcon}</View>
        ) : null}
      </View>

      {showError ? (
        <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs + 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Platform.select({ ios: 12, android: 8, default: 10 }),
  },
  icon: {
    paddingHorizontal: Spacing.xs,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
});

export default BaseInput;
