import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { TeachersService, getApiErrorMessage } from '@/api';
import BaseButton from '@/components/base-button/BaseButton';
import BaseInput from '@/components/base-input/BaseInput';
import MultiSelectChips from '@/components/multi-select-chips/MultiSelectChips';
import ScreenHeader from '@/components/screen-header/ScreenHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  BIO_MAX_LENGTH,
  LANGUAGE_OPTIONS,
  SPECIALIZATION_OPTIONS,
  TeacherOnboardingFormValues,
  teacherOnboardingExpertiseSchema,
  teacherOnboardingFullSchema,
  teacherOnboardingInitialValues,
} from '@/entity/teacher-onboarding.entity';
import { UserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TOTAL_STEPS = 2;

function TeacherOnboarding() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const teacherName = params.name ?? 'Teacher';

  const [step, setStep] = useState<1 | 2>(1);

  const hourlyRateRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);

  const goToDashboard = (profileComplete: boolean) => {
    router.replace({
      pathname: '/dashboard',
      params: {
        role: UserRole.TEACHER,
        name: teacherName,
        profileComplete: profileComplete ? 'true' : 'false',
      },
    });
  };

  const skipForNow = () => {
    Alert.alert(
      'Skip profile setup?',
      'You can complete your profile later from the Profile screen, but students may not find you until your specializations and languages are filled in.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        {
          text: 'Skip for Now',
          style: 'destructive',
          onPress: () => goToDashboard(false),
        },
      ],
    );
  };

  // Hardware back: step 2 → step 1, step 1 → confirm skip.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 2) {
        setStep(1);
        return true;
      }
      skipForNow();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onSubmit = async (
    values: TeacherOnboardingFormValues,
    helpers: FormikHelpers<TeacherOnboardingFormValues>,
  ) => {
    try {
      await TeachersService.onboarding({
        specializations: values.specializations,
        languages: values.languages,
        qualification: values.qualification.trim(),
        hourlyRate: Number(values.hourlyRate),
        bio: values.bio.trim() || undefined,
      });
      goToDashboard(true);
    } catch (err) {
      Alert.alert('Could not save profile', getApiErrorMessage(err));
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const headerLeftIcon = step === 1 ? 'xmark' : 'chevron.left';
  const onHeaderBack = () => {
    if (step === 2) setStep(1);
    else skipForNow();
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.tint} />
      <ScreenHeader
        title="Set Up Your Profile"
        leftIcon={headerLeftIcon}
        onBack={onHeaderBack}
        rightActions={[
          {
            label: 'Skip',
            onPress: skipForNow,
            accessibilityLabel: 'Skip onboarding',
          },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Formik<TeacherOnboardingFormValues>
          initialValues={teacherOnboardingInitialValues}
          validationSchema={
            step === 1
              ? teacherOnboardingExpertiseSchema
              : teacherOnboardingFullSchema
          }
          onSubmit={onSubmit}
          validateOnMount
        >
          {(formik) => (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <ProgressIndicator step={step} palette={palette} />

              <Text style={[styles.welcome, { color: palette.tint }]}>
                Welcome, {teacherName.split(' ')[0]} 👋
              </Text>

              {step === 1 ? (
                <Step1Expertise formik={formik} palette={palette} />
              ) : (
                <Step2Profile
                  formik={formik}
                  palette={palette}
                  hourlyRateRef={hourlyRateRef}
                  bioRef={bioRef}
                />
              )}

              <View style={styles.actions}>
                {step === 1 ? (
                  <BaseButton
                    title="Continue"
                    size="lg"
                    onPress={async () => {
                      const errors = await formik.validateForm();
                      formik.setTouched({
                        specializations: true,
                        languages: true,
                      });
                      if (!errors.specializations && !errors.languages) {
                        setStep(2);
                      }
                    }}
                    disabled={
                      formik.values.specializations.length === 0 ||
                      formik.values.languages.length === 0
                    }
                    rightIcon={
                      <IconSymbol
                        name="chevron.right"
                        size={18}
                        color="#FFFFFF"
                      />
                    }
                  />
                ) : (
                  <BaseButton
                    title="Finish Setup"
                    size="lg"
                    loading={formik.isSubmitting}
                    onPress={() => formik.handleSubmit()}
                    disabled={!formik.isValid}
                  />
                )}

                <Pressable
                  onPress={skipForNow}
                  hitSlop={6}
                  style={styles.skipBtn}
                >
                  <Text style={[styles.skipText, { color: palette.textMuted }]}>
                    Skip for now
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </View>
  );
}

function ProgressIndicator({
  step,
  palette,
}: {
  step: 1 | 2;
  palette: typeof Colors.light;
}) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressRow}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: palette.tint },
          ]}
        />
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor:
                step >= 2 ? palette.tint : `${palette.tint}33`,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressLabel, { color: palette.textMuted }]}>
        Step {step} of {TOTAL_STEPS}
      </Text>
    </View>
  );
}

function Step1Expertise({
  formik,
  palette,
}: {
  formik: FormikProps<TeacherOnboardingFormValues>;
  palette: typeof Colors.light;
}) {
  const { values, setFieldValue, setFieldTouched, errors, touched } = formik;
  return (
    <>
      <Text style={[styles.stepTitle, { color: palette.text }]}>
        Your Expertise
      </Text>
      <Text style={[styles.stepSub, { color: palette.textMuted }]}>
        Pick the subjects you teach and the languages you can teach in. This
        helps students discover you.
      </Text>

      <MultiSelectChips
        label="Specializations"
        helperText="Choose all that apply (at least one required)."
        options={SPECIALIZATION_OPTIONS}
        values={values.specializations}
        onChange={(v) => {
          setFieldValue('specializations', v);
          setFieldTouched('specializations', true, false);
        }}
        error={errors.specializations as string | undefined}
        touched={touched.specializations as boolean | undefined}
      />

      <MultiSelectChips
        label="Languages"
        helperText="Languages you can teach in."
        options={LANGUAGE_OPTIONS}
        values={values.languages}
        onChange={(v) => {
          setFieldValue('languages', v);
          setFieldTouched('languages', true, false);
        }}
        error={errors.languages as string | undefined}
        touched={touched.languages as boolean | undefined}
      />
    </>
  );
}

function Step2Profile({
  formik,
  palette,
  hourlyRateRef,
  bioRef,
}: {
  formik: FormikProps<TeacherOnboardingFormValues>;
  palette: typeof Colors.light;
  hourlyRateRef: React.RefObject<TextInput | null>;
  bioRef: React.RefObject<TextInput | null>;
}) {
  const { values, handleChange, handleBlur, errors, touched } = formik;
  const bioCount = values.bio.length;
  return (
    <>
      <Text style={[styles.stepTitle, { color: palette.text }]}>
        Your Profile
      </Text>
      <Text style={[styles.stepSub, { color: palette.textMuted }]}>
        Add a few details students will see on your profile.
      </Text>

      <BaseInput
        label="Qualification"
        placeholder="e.g., PhD in Islamic Studies"
        autoCapitalize="words"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => hourlyRateRef.current?.focus()}
        value={values.qualification}
        onChangeText={handleChange('qualification')}
        onBlur={handleBlur('qualification')}
        error={errors.qualification}
        touched={touched.qualification}
      />

      <BaseInput
        ref={hourlyRateRef}
        label="Hourly Rate (USD)"
        placeholder="25"
        keyboardType="decimal-pad"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => bioRef.current?.focus()}
        value={values.hourlyRate}
        onChangeText={handleChange('hourlyRate')}
        onBlur={handleBlur('hourlyRate')}
        error={errors.hourlyRate}
        touched={touched.hourlyRate}
      />

      <BaseInput
        ref={bioRef}
        label="Bio"
        placeholder="Tell students about your teaching style and experience (optional)"
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        maxLength={BIO_MAX_LENGTH}
        inputStyle={styles.bioInput}
        value={values.bio}
        onChangeText={handleChange('bio')}
        onBlur={handleBlur('bio')}
        error={errors.bio}
        touched={touched.bio}
      />
      <Text
        style={[styles.bioCounter, { color: palette.textMuted }]}
      >{`${bioCount} / ${BIO_MAX_LENGTH}`}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  progressWrap: {
    marginBottom: Spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  welcome: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  stepSub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  bioInput: {
    minHeight: 120,
    paddingTop: Platform.select({ ios: 12, android: 8, default: 10 }),
  },
  bioCounter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    fontWeight: '600',
    marginTop: -Spacing.md + 2,
    marginBottom: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  skipBtn: {
    marginTop: Spacing.md,
    paddingVertical: 6,
    paddingHorizontal: Radii.md,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default TeacherOnboarding;
