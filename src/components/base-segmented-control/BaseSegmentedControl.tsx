import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

export interface BaseSegmentedControlProps<T extends string> {
  label?: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

function BaseSegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  touched,
  disabled = false,
  containerStyle,
  labelStyle,
}: BaseSegmentedControlProps<T>) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const showError = !!error && !!touched;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: palette.text }, labelStyle]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.group,
          {
            backgroundColor: palette.surfaceAlt,
            borderColor: showError ? palette.danger : palette.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled }}
              android_ripple={{
                color: active ? 'rgba(255,255,255,0.2)' : `${palette.tint}26`,
                borderless: false,
              }}
              style={[
                styles.option,
                active && { backgroundColor: palette.tint },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: active ? '#FFFFFF' : palette.text },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {showError ? (
        <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>
      ) : null}
    </View>
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
  group: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: 4,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.sm,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
});

export default BaseSegmentedControl;
