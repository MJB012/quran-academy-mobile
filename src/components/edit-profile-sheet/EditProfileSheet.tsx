import { Formik, FormikHelpers } from 'formik';
import React, { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BaseBottomSheet from '@/components/base-bottom-sheet/BaseBottomSheet';
import BaseButton from '@/components/base-button/BaseButton';
import BaseInput from '@/components/base-input/BaseInput';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  EditProfileFormValues,
  editProfileValidationSchema,
} from '@/entity/user.entity';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface EditProfileSheetProps {
  visible: boolean;
  onClose: () => void;
  initialValues: EditProfileFormValues;
  onSave: (values: EditProfileFormValues) => void;
  onChangePassword: () => void;
}

function EditProfileSheet({
  visible,
  onClose,
  initialValues,
  onSave,
  onChangePassword,
}: EditProfileSheetProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const handleSubmit = (
    values: EditProfileFormValues,
    helpers: FormikHelpers<EditProfileFormValues>,
  ) => {
    onSave({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
    });
    helpers.setSubmitting(false);
  };

  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Update your account details"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={editProfileValidationSchema}
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
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <BaseInput
                    label="First Name"
                    placeholder="First name"
                    autoCapitalize="words"
                    autoComplete="name-given"
                    textContentType="givenName"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    error={errors.firstName}
                    touched={touched.firstName}
                  />
                </View>
                <View style={styles.rowItem}>
                  <BaseInput
                    ref={lastNameRef}
                    label="Last Name"
                    placeholder="Last name"
                    autoCapitalize="words"
                    autoComplete="name-family"
                    textContentType="familyName"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={errors.lastName}
                    touched={touched.lastName}
                  />
                </View>
              </View>

              <BaseInput
                ref={emailRef}
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit()}
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                touched={touched.email}
              />

              <Pressable
                onPress={onChangePassword}
                android_ripple={{
                  color: `${palette.tint}14`,
                  borderless: false,
                }}
                style={({ pressed }) => [
                  styles.passwordLink,
                  {
                    backgroundColor: palette.surfaceAlt,
                    borderColor: palette.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.passwordIcon,
                    { backgroundColor: `${palette.tint}22` },
                  ]}
                >
                  <IconSymbol name="lock.fill" size={18} color={palette.tint} />
                </View>
                <View style={styles.passwordBody}>
                  <Text
                    style={[styles.passwordTitle, { color: palette.text }]}
                  >
                    Change Password
                  </Text>
                  <Text
                    style={[styles.passwordSub, { color: palette.textMuted }]}
                  >
                    Update your account password
                  </Text>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={20}
                  color={palette.textMuted}
                />
              </Pressable>

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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  passwordLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  passwordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordBody: {
    flex: 1,
  },
  passwordTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  passwordSub: {
    fontSize: 12,
    marginTop: 2,
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

export default EditProfileSheet;
