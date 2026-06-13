import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthService, getApiErrorMessage } from '@/api';
import BaseButton from '@/components/base-button/BaseButton';
import BaseInput from '@/components/base-input/BaseInput';
import Logo from '@/components/logo/Logo';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  ResetPasswordFormValues,
  resetPasswordInitialValues,
  resetPasswordValidationSchema,
} from '@/entity/user.entity';
import { useColorScheme } from '@/hooks/use-color-scheme';

function ResetPassword() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; code?: string }>();
  const confirmPasswordRef = useRef<TextInput>(null);

  const onSubmit = async (
    values: ResetPasswordFormValues,
    helpers: {
      setErrors: (e: { password?: string }) => void;
      setSubmitting: (s: boolean) => void;
    },
  ) => {
    if (!params.email || !params.code) {
      helpers.setErrors({ password: 'Reset session expired. Please try again.' });
      helpers.setSubmitting(false);
      return;
    }
    try {
      await AuthService.resetPassword(params.email, params.code, values.password);
      Alert.alert(
        'Password Reset',
        'Your password has been reset successfully. Please sign in with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/login') }],
      );
    } catch (err) {
      helpers.setErrors({ password: getApiErrorMessage(err, 'Could not reset password') });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Logo size="lg" />
            <Text style={[styles.appName, { color: palette.tint }]}>
              Quran Academy
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: palette.surface,
                shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
              },
            ]}
          >
            <Text style={[styles.title, { color: palette.text }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>
              Create a new password for your account. Make sure both fields
              match.
            </Text>

            <Formik
              initialValues={resetPasswordInitialValues}
              validationSchema={resetPasswordValidationSchema}
              onSubmit={onSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={styles.form}>
                  <BaseInput
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
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={errors.password}
                    touched={touched.password}
                  />

                  <BaseInput
                    ref={confirmPasswordRef}
                    label="Confirm Password"
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

                  <BaseButton
                    title="Reset Password"
                    size="lg"
                    loading={isSubmitting}
                    onPress={() => handleSubmit()}
                    containerStyle={styles.submit}
                  />
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: Spacing.md,
  },
  card: {
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl + 4,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  form: { width: '100%' },
  submit: { marginTop: Spacing.sm },
});

export default ResetPassword;
