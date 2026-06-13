import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import BaseBottomSheet from '@/components/base-bottom-sheet/BaseBottomSheet';
import BaseButton from '@/components/base-button/BaseButton';
import MultiSelectChips from '@/components/multi-select-chips/MultiSelectChips';
import { Spacing } from '@/constants/theme';

export interface EditChipsSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  label?: string;
  helperText?: string;
  options: readonly string[];
  initialValues: string[];
  minSelected?: number;
  emptyError?: string;
  onSave: (values: string[]) => void;
}

function EditChipsSheet({
  visible,
  onClose,
  title,
  subtitle,
  label,
  helperText,
  options,
  initialValues,
  minSelected = 1,
  emptyError = 'Select at least one option',
  onSave,
}: EditChipsSheetProps) {
  const [draft, setDraft] = useState<string[]>(initialValues);
  const [touched, setTouched] = useState(false);

  // Re-sync local draft when the sheet (re)opens with fresh initial values.
  useEffect(() => {
    if (visible) {
      setDraft(initialValues);
      setTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const tooFew = draft.length < minSelected;
  const error = tooFew ? emptyError : undefined;
  const sortedSame =
    draft.length === initialValues.length &&
    draft.every((d) => initialValues.includes(d));

  const handleSave = () => {
    setTouched(true);
    if (tooFew) return;
    onSave(draft);
  };

  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <MultiSelectChips
            label={label}
            helperText={helperText}
            options={options}
            values={draft}
            onChange={(v) => {
              setDraft(v);
              setTouched(true);
            }}
            error={error}
            touched={touched}
          />

          <View style={styles.actions}>
            <BaseButton
              title="Cancel"
              variant="outline"
              size="lg"
              onPress={onClose}
              containerStyle={styles.actionBtn}
            />
            <BaseButton
              title="Save"
              size="lg"
              onPress={handleSave}
              disabled={tooFew || sortedSame}
              containerStyle={styles.actionBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseBottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});

export default EditChipsSheet;
