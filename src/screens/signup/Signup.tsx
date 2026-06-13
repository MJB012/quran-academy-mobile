import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik, FormikHelpers } from 'formik';
import React, { useMemo, useRef } from 'react';
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
import BaseDatePicker from '@/components/base-date-picker/BaseDatePicker';
import BaseInput from '@/components/base-input/BaseInput';
import Logo from '@/components/logo/Logo';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  StudentSignupFormValues,
  TeacherSignupFormValues,
  studentSignupInitialValues,
  studentSignupValidationSchema,
  teacherSignupInitialValues,
  teacherSignupValidationSchema,
} from '@/entity/user.entity';
import { UserRole, parseUserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SignupValues = StudentSignupFormValues | TeacherSignupFormValues;

function Signup() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const role = useMemo(() => parseUserRole(params.role), [params.role]);
  const isTeacher = role === UserRole.TEACHER;

  const initialValues = useMemo<SignupValues>(
    () => (isTeacher ? teacherSignupInitialValues : studentSignupInitialValues),
    [isTeacher],
  );

  const schema = useMemo(
    () => (isTeacher ? teacherSignupValidationSchema : studentSignupValidationSchema),
    [isTeacher],
  );

  const onSubmit = async (
    values: SignupValues,
    helpers: FormikHelpers<SignupValues>,
  ) => {
    try {
      const dobIso = values.dob ? new Date(values.dob).toISOString() : '';
      await AuthService.signup({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        dob: dobIso,
        password: values.password,
        role,
      });
      router.replace({
        pathname: '/otp-verification',
        params: { email: values.email.trim(), purpose: 'signup', role },
      });
    } catch (err) {
      helpers.setErrors({ email: getApiErrorMessage(err, 'Could not create account') });
      helpers.setFieldTouched('email', true, false);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const today = useMemo(() => new Date(), []);

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
              Start Your Learning Journey
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
              Create {isTeacher ? 'Teacher' : 'Student'} Account
            </Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>
              {isTeacher
                ? 'Register to host sessions with your students'
                : 'Register to book sessions with our teachers'}
            </Text>

            <Formik<SignupValues>
              initialValues={initialValues}
              enableReinitialize
              validationSchema={schema}
              onSubmit={onSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={styles.form}>
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
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={errors.email}
                    touched={touched.email}
                  />

                  <BaseDatePicker
                    label="Date of Birth"
                    placeholder="Select your date of birth"
                    value={values.dob}
                    maximumDate={today}
                    onChange={(d) => setFieldValue('dob', d)}
                    onBlur={() => setFieldTouched('dob', true)}
                    error={errors.dob as string | undefined}
                    touched={touched.dob as boolean | undefined}
                  />

                  <BaseInput
                    ref={passwordRef}
                    label="Password"
                    placeholder="Create a password"
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
                    placeholder="Confirm your password"
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
                    title="Create Account"
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
                  Already have an account?{' '}
                </Text>
                <Pressable onPress={() => router.replace('/login')} hitSlop={6}>
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  submit: {
    marginTop: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Signup;
