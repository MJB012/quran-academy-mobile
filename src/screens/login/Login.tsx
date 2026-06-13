import { useRouter } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthService, getApiErrorMessage } from '@/api';
import BaseButton from '@/components/base-button/BaseButton';
import BaseInput from '@/components/base-input/BaseInput';
import Logo from '@/components/logo/Logo';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  LoginFormValues,
  loginInitialValues,
  loginValidationSchema,
} from '@/entity/user.entity';
import { useColorScheme } from '@/hooks/use-color-scheme';

function Login() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);

  const onSubmit = async (
    values: LoginFormValues,
    helpers: FormikHelpers<LoginFormValues>,
  ) => {
    try {
      const { user } = await AuthService.login(values.email.trim(), values.password);
      const displayName = `${user.firstName} ${user.lastName}`.trim();
      router.replace({
        pathname: '/dashboard',
        params: { role: user.role, name: displayName },
      });
    } catch (err) {
      helpers.setErrors({ password: getApiErrorMessage(err, 'Invalid email or password') });
      helpers.setFieldTouched('password', true, false);
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
            <Text style={[styles.tagline, { color: palette.textMuted }]}>
              Learn from Expert Teachers
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
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>
              Sign in to continue your learning journey
            </Text>

            <Formik
              initialValues={loginInitialValues}
              validationSchema={loginValidationSchema}
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
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={errors.email}
                    touched={touched.email}
                  />
                  <BaseInput
                    ref={passwordRef}
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={() => handleSubmit()}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={errors.password}
                    touched={touched.password}
                  />

                  <Pressable
                    onPress={() => router.push('/forgot-password')}
                    hitSlop={6}
                    style={styles.forgotRow}
                  >
                    <Text
                      style={[styles.forgotLink, { color: palette.tint }]}
                    >
                      Forgot password?
                    </Text>
                  </Pressable>

                  <BaseButton
                    title="Sign In"
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
                  Don&apos;t have an account?{' '}
                </Text>
                <Pressable onPress={() => router.push('/signup')} hitSlop={6}>
                  <Text style={[styles.footerLink, { color: palette.tint }]}>
                    Sign up
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
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
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
  },
  form: {
    width: '100%',
  },
  submit: {
    marginTop: Spacing.sm,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Login;
