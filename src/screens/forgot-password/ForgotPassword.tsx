import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthService, getApiErrorMessage } from '@/api';
import BaseButton from '@/components/base-button/BaseButton';
import BaseInput from '@/components/base-input/BaseInput';
import Logo from '@/components/logo/Logo';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  ForgotPasswordFormValues,
  forgotPasswordInitialValues,
  forgotPasswordValidationSchema,
} from '@/entity/user.entity';
import { useColorScheme } from '@/hooks/use-color-scheme';

function ForgotPassword() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();

  const onSubmit = async (
    values: ForgotPasswordFormValues,
    helpers: {
      setErrors: (e: { email?: string }) => void;
      setSubmitting: (s: boolean) => void;
    },
  ) => {
    const email = values.email.trim();
    try {
      await AuthService.forgotPassword(email);
      router.push({
        pathname: '/otp-verification',
        params: { email, purpose: 'reset' },
      });
    } catch (err) {
      helpers.setErrors({ email: getApiErrorMessage(err, 'Could not send code') });
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
              Forgot Password
            </Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>
              Enter your email and we&apos;ll send you a verification code to
              reset your password.
            </Text>

            <Formik
              initialValues={forgotPasswordInitialValues}
              validationSchema={forgotPasswordValidationSchema}
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

                  <BaseButton
                    title="Send Code"
                    size="lg"
                    loading={isSubmitting}
                    onPress={() => handleSubmit()}
                    containerStyle={styles.submit}
                  />
                </View>
              )}
            </Formik>

            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <Text style={[styles.footerText, { color: palette.textMuted }]}>
                  Remembered your password?{' '}
                </Text>
                <Pressable onPress={() => router.back()} hitSlop={6}>
                  <Text style={[styles.footerLink, { color: palette.tint }]}>
                    Sign in
                  </Text>
                </Pressable>
              </View>
            </View>
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
  footer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});

export default ForgotPassword;
