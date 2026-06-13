import { Formik, FormikHelpers } from 'formik';
import React, { useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AuthService, getApiErrorMessage } from '@/api';
import BaseBottomSheet from '@/components/base-bottom-sheet/BaseBottomSheet';
import BaseButton from '@/components/base-button/BaseButton';
import BaseInput from '@/components/base-input/BaseInput';
import { Spacing } from '@/constants/theme';
import {
  ChangePasswordFormValues,
  changePasswordInitialValues,
  changePasswordValidationSchema,
} from '@/entity/user.entity';

export interface ChangePasswordSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

function ChangePasswordSheet({
  visible,
  onClose,
  onSaved,
}: ChangePasswordSheetProps) {
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleSubmit = async (
    values: ChangePasswordFormValues,
    helpers: FormikHelpers<ChangePasswordFormValues>,
  ) => {
    try {
      await AuthService.changePassword(values.currentPassword, values.newPassword);
      helpers.resetForm();
      onClose();
      onSaved?.();
      Alert.alert(
        'Password changed',
        'Your password has been updated successfully.',
      );
    } catch (err) {
      helpers.setErrors({
        currentPassword: getApiErrorMessage(err, 'Could not change password'),
      });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      title="Change Password"
      subtitle="Enter your current password and a new one"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Formik
          initialValues={changePasswordInitialValues}
          validationSchema={changePasswordValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
            isValid,
            dirty,
          }) => (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scroll}
            >
              <BaseInput
                label="Current Password"
                placeholder="Enter your current password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                value={values.currentPassword}
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
                error={errors.currentPassword}
                touched={touched.currentPassword}
              />

              <BaseInput
                ref={newPasswordRef}
                label="New Password"
                placeholder="Enter new password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                value={values.newPassword}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                error={errors.newPassword}
                touched={touched.newPassword}
              />

              <BaseInput
                ref={confirmPasswordRef}
                label="Confirm New Password"
                placeholder="Re-enter new password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit()}
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
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
                  title="Update Password"
                  size="lg"
                  loading={isSubmitting}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || !dirty}
                  containerStyle={styles.actionBtn}
                />
              </View>
            </ScrollView>
          )}
        </Formik>
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

export default ChangePasswordSheet;
