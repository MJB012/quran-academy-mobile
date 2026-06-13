import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
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

export interface BaseDatePickerProps {
  label?: string;
  value?: Date | null;
  onChange: (date: Date) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function BaseDatePicker({
  label,
  value,
  onChange,
  onBlur,
  placeholder = 'Select date',
  error,
  touched,
  disabled = false,
  minimumDate,
  maximumDate,
  containerStyle,
  inputStyle,
  labelStyle,
}: BaseDatePickerProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(value ?? null);

  const showError = !!error && !!touched;
  const borderColor = showError ? palette.danger : palette.border;

  const open = () => {
    if (disabled) return;
    setTempDate(value ?? new Date());
    setShow(true);
  };

  const dismiss = () => {
    setShow(false);
    onBlur?.();
  };

  const onAndroidChange = (event: DateTimePickerEvent, d?: Date) => {
    setShow(false);
    onBlur?.();
    if (event.type === 'set' && d) {
      onChange(d);
    }
  };

  const onIosChange = (_: DateTimePickerEvent, d?: Date) => {
    if (d) setTempDate(d);
  };

  const confirmIos = () => {
    if (tempDate) onChange(tempDate);
    setShow(false);
    onBlur?.();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: palette.text }, labelStyle]}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={open}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Date picker'}
        style={[
          styles.inputRow,
          {
            borderColor,
            backgroundColor: palette.surfaceAlt,
            opacity: disabled ? 0.6 : 1,
          },
          inputStyle,
        ]}
      >
        <Text
          style={[
            styles.valueText,
            { color: value ? palette.text : palette.textMuted },
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <IconSymbol name="calendar" size={20} color={palette.icon} />
      </Pressable>

      {showError ? (
        <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>
      ) : null}

      {Platform.OS === 'android' && show ? (
        <DateTimePicker
          value={value ?? maximumDate ?? new Date()}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={onAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' && show ? (
        <Modal transparent visible animationType="slide" onRequestClose={dismiss}>
          <Pressable style={styles.iosBackdrop} onPress={dismiss} />
          <View style={[styles.iosSheet, { backgroundColor: palette.surface }]}>
            <View style={[styles.iosHeader, { borderBottomColor: palette.border }]}>
              <Pressable onPress={dismiss} hitSlop={10}>
                <Text style={[styles.iosAction, { color: palette.textMuted }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={confirmIos} hitSlop={10}>
                <Text style={[styles.iosAction, { color: palette.tint }]}>
                  Done
                </Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempDate ?? new Date()}
              mode="date"
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={onIosChange}
              themeVariant={scheme}
            />
          </View>
        </Modal>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  valueText: {
    fontSize: 15,
    flex: 1,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
  iosBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosSheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingBottom: Spacing.lg,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iosAction: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default BaseDatePicker;
