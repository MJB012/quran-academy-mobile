import React, { useEffect, useRef } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BaseOtpInputProps {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  label?: string;
  error?: string;
  touched?: boolean;
  autoFocus?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

function BaseOtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  label,
  error,
  touched,
  autoFocus = false,
  containerStyle,
}: BaseOtpInputProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const showError = !!error && !!touched;

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const updateValue = (next: string) => {
    const cleaned = next.replace(/\D/g, '').slice(0, length);
    onChange(cleaned);
    if (cleaned.length === length) {
      onComplete?.(cleaned);
    }
  };

  const handleChangeDigit = (text: string, index: number) => {
    if (text.length > 1) {
      updateValue(text.replace(/\D/g, ''));
      const paste = text.replace(/\D/g, '');
      const nextIdx = Math.min(paste.length, length - 1);
      inputRefs.current[nextIdx]?.focus();
      return;
    }
    if (!/^\d?$/.test(text)) return;

    const newDigits = [...digits];
    newDigits[index] = text;
    const joined = newDigits.join('').slice(0, length);
    updateValue(joined);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<{ key: string }>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      updateValue(newDigits.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  const focusFirstEmpty = () => {
    const idx = digits.findIndex((d) => !d);
    const target = idx === -1 ? length - 1 : idx;
    inputRefs.current[target]?.focus();
  };

  return (
    <Pressable
      onPress={focusFirstEmpty}
      style={[styles.container, containerStyle]}
      accessibilityRole="none"
    >
      {label ? (
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      ) : null}

      <View style={styles.row}>
        {digits.map((digit, i) => {
          const filled = !!digit;
          const borderColor = showError
            ? palette.danger
            : filled
              ? palette.tint
              : palette.border;
          return (
            <TextInput
              key={i}
              ref={(r) => {
                inputRefs.current[i] = r;
              }}
              value={digit}
              onChangeText={(t) => handleChangeDigit(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              textContentType={i === 0 ? 'oneTimeCode' : 'none'}
              autoComplete={i === 0 ? 'sms-otp' : 'off'}
              returnKeyType={i === length - 1 ? 'done' : 'next'}
              maxLength={Platform.OS === 'ios' ? length : 1}
              selectTextOnFocus
              style={[
                styles.box,
                {
                  borderColor,
                  backgroundColor: palette.surfaceAlt,
                  color: palette.text,
                },
              ]}
            />
          );
        })}
      </View>

      {showError ? (
        <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>
      ) : null}
    </Pressable>
  );
}

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  box: {
    flex: 1,
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Radii.md,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
});

export default BaseOtpInput;
