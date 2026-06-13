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

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface MultiSelectChipsProps {
  label?: string;
  helperText?: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  touched?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

function MultiSelectChips({
  label,
  helperText,
  options,
  values,
  onChange,
  error,
  touched,
  containerStyle,
  labelStyle,
}: MultiSelectChipsProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const showError = !!error && !!touched;

  const toggle = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: palette.text }, labelStyle]}>
            {label}
          </Text>
          {values.length > 0 ? (
            <View
              style={[
                styles.countPill,
                { backgroundColor: `${palette.tint}22` },
              ]}
            >
              <Text style={[styles.countText, { color: palette.tint }]}>
                {values.length} selected
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {helperText ? (
        <Text style={[styles.helper, { color: palette.textMuted }]}>
          {helperText}
        </Text>
      ) : null}

      <View style={styles.chips}>
        {options.map((opt) => {
          const active = values.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => toggle(opt)}
              android_ripple={{
                color: `${palette.tint}1A`,
                borderless: false,
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${opt}, ${active ? 'selected' : 'not selected'}`}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? palette.tint : palette.surface,
                  borderColor: active ? palette.tint : palette.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {active ? (
                <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
              ) : null}
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active ? '#FFFFFF' : palette.text,
                    marginLeft: active ? 4 : 0,
                  },
                ]}
              >
                {opt}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  helper: {
    fontSize: 12,
    marginBottom: Spacing.sm,
    lineHeight: 17,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
});

export default MultiSelectChips;
