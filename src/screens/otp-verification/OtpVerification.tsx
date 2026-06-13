import { useLocalSearchParams, useRouter } from 'expo-router';
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
import BaseOtpInput from '@/components/base-otp-input/BaseOtpInput';
import Logo from '@/components/logo/Logo';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  OTP_LENGTH,
  OtpFormValues,
  otpInitialValues,
} from '@/entity/user.entity';
import { UserRole, parseUserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Yup from 'yup';

function maskEmail(email?: string): string {
  if (!email) return 'your email';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const shown = local.length <= 2 ? local[0] ?? '' : local.slice(0, 2);
  return `${shown}${'*'.repeat(Math.max(0, local.length - shown.length))}@${domain}`;
}

const otpSchema = Yup.object({
  code: Yup.string()
    .required('Please enter the verification code')
    .length(OTP_LENGTH, `Code must be ${OTP_LENGTH} digits`)
    .matches(/^\d+$/, 'Code must contain only digits'),
});

type OtpPurpose = 'signup' | 'reset';

function OtpVerification() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; purpose?: string; role?: string }>();
  const email = params.email;
  const purpose: OtpPurpose = params.purpose === 'reset' ? 'reset' : 'signup';
  const role = parseUserRole(params.role);

  const onSubmit = async (
    values: OtpFormValues,
    helpers: { setErrors: (e: { code?: string }) => void; setSubmitting: (s: boolean) => void },
  ) => {
    if (!email) {
      helpers.setErrors({ code: 'Email is missing' });
      helpers.setSubmitting(false);
      return;
    }
    try {
      const result = await AuthService.verifyOtp(email, values.code, purpose);
      if (purpose === 'reset') {
        router.replace({
          pathname: '/reset-password',
          params: { email, code: values.code },
        });
        return;
      }
      const verified = result as { user?: { firstName: string; lastName: string } };
      const displayName = verified.user
        ? `${verified.user.firstName} ${verified.user.lastName}`.trim()
        : '';
      if (role === UserRole.TEACHER) {
        router.replace({
          pathname: '/teacher-onboarding',
          params: { name: displayName },
        });
        return;
      }
      router.replace({
        pathname: '/dashboard',
        params: { role, name: displayName },
      });
    } catch (err) {
      helpers.setErrors({ code: getApiErrorMessage(err, 'Invalid verification code') });
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
              Verify Your Email
            </Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>
              Enter the {OTP_LENGTH}-digit code we sent to{' '}
              <Text style={{ fontWeight: '700', color: palette.text }}>
                {maskEmail(email)}
              </Text>
              .
            </Text>

            <Formik
              initialValues={otpInitialValues}
              validationSchema={otpSchema}
              onSubmit={onSubmit}
            >
              {({
                handleSubmit,
                setFieldValue,
                setFieldTouched,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={styles.form}>
                  <BaseOtpInput
                    length={OTP_LENGTH}
                    value={values.code}
                    onChange={(c) => {
                      setFieldValue('code', c);
                      if (c.length > 0) setFieldTouched('code', true, false);
                    }}
                    onComplete={() => {
                      setFieldTouched('code', true, false);
                      handleSubmit();
                    }}
                    autoFocus
                    error={errors.code}
                    touched={touched.code}
                  />

                  <BaseButton
                    title="Verify"
                    size="lg"
                    loading={isSubmitting}
                    onPress={() => handleSubmit()}
                    containerStyle={styles.submit}
                  />

                  <View style={styles.resendRow}>
                    <Text
                      style={[styles.footerText, { color: palette.textMuted }]}
                    >
                      Didn&apos;t receive the code?{' '}
                    </Text>
                    <Pressable onPress={() => {}} hitSlop={6}>
                      <Text
                        style={[styles.footerLink, { color: palette.tint }]}
                      >
                        Resend
                      </Text>
                    </Pressable>
                  </View>
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
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  demoNotice: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  demoText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  form: { width: '100%' },
  submit: { marginTop: Spacing.sm },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});

export default OtpVerification;
