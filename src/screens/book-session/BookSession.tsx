import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BookingsService, getApiErrorMessage } from '@/api';
import Avatar from '@/components/avatar/Avatar';
import BaseButton from '@/components/base-button/BaseButton';
import BaseDatePicker from '@/components/base-date-picker/BaseDatePicker';
import ScreenHeader from '@/components/screen-header/ScreenHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  BookingDuration,
  DURATION_OPTIONS,
  TIME_SLOTS,
  bookingInitialValues,
  bookingValidationSchema,
} from '@/entity/booking.entity';
import { useColorScheme } from '@/hooks/use-color-scheme';

function BookSession() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{
    teacherId?: string;
    teacherName?: string;
    teacherQualification?: string;
    teacherPrice?: string;
    teacherSpecializations?: string;
  }>();

  const teacherName = params.teacherName ?? 'Teacher';
  const teacherQualification = params.teacherQualification ?? '';
  const teacherPrice = Number(params.teacherPrice ?? '0');
  const specializations = useMemo(
    () =>
      (params.teacherSpecializations ?? 'Tajweed,Tafseer,Arabic Grammar')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [params.teacherSpecializations],
  );

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.tint} />
      <ScreenHeader title="Book Session" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Formik
          initialValues={{
            ...bookingInitialValues,
            subject: specializations[0] ?? '',
          }}
          validationSchema={bookingValidationSchema}
          onSubmit={async (values, helpers) => {
            if (!params.teacherId || !values.date) {
              Alert.alert('Missing details', 'Please select a date.');
              helpers.setSubmitting(false);
              return;
            }
            const total = (teacherPrice * values.duration) / 60;
            const dateOnly = [
              values.date.getFullYear(),
              String(values.date.getMonth() + 1).padStart(2, '0'),
              String(values.date.getDate()).padStart(2, '0'),
            ].join('-');
            try {
              const booking = await BookingsService.create({
                teacherId: params.teacherId,
                date: dateOnly,
                timeSlot: values.timeSlot,
                durationMins: values.duration,
                subject: values.subject,
              });
              router.push({
                pathname: '/payment',
                params: {
                  bookingId: booking.id,
                  teacherId: params.teacherId,
                  teacherName,
                  teacherPrice: String(teacherPrice),
                  date: dateOnly,
                  timeSlot: values.timeSlot,
                  duration: String(values.duration),
                  subject: values.subject,
                  total: total.toFixed(2),
                },
              });
            } catch (err) {
              Alert.alert('Could not create booking', getApiErrorMessage(err));
            } finally {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({
            handleSubmit,
            setFieldValue,
            setFieldTouched,
            values,
            errors,
            touched,
            isValid,
            dirty,
          }) => {
            const total = (teacherPrice * values.duration) / 60;
            return (
              <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  style={[
                    styles.teacherCard,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                      shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
                    },
                  ]}
                >
                  <Avatar name={teacherName} size="md" badge="star" />
                  <View style={styles.teacherBody}>
                    <Text
                      style={[styles.teacherName, { color: palette.text }]}
                      numberOfLines={1}
                    >
                      {teacherName}
                    </Text>
                    {teacherQualification ? (
                      <Text
                        style={[
                          styles.teacherQual,
                          { color: palette.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {teacherQualification}
                      </Text>
                    ) : null}
                  </View>
                  <View>
                    <Text style={[styles.price, { color: palette.tint }]}>
                      ${teacherPrice}
                    </Text>
                    <Text
                      style={[styles.priceNote, { color: palette.textMuted }]}
                    >
                      /hour
                    </Text>
                  </View>
                </View>

                <Section label="Choose Date" palette={palette}>
                  <BaseDatePicker
                    value={values.date}
                    onChange={(d) => setFieldValue('date', d)}
                    onBlur={() => setFieldTouched('date', true)}
                    minimumDate={today}
                    maximumDate={maxDate}
                    placeholder="Select a date"
                    error={errors.date as string | undefined}
                    touched={touched.date as boolean | undefined}
                  />
                </Section>

                <Section label="Choose Time" palette={palette}>
                  <View style={styles.slotGrid}>
                    {TIME_SLOTS.map((slot) => {
                      const active = values.timeSlot === slot;
                      return (
                        <Pressable
                          key={slot}
                          onPress={() => {
                            setFieldValue('timeSlot', slot);
                            setFieldTouched('timeSlot', true, false);
                          }}
                          android_ripple={{
                            color: `${palette.tint}14`,
                            borderless: false,
                          }}
                          style={[
                            styles.slot,
                            {
                              backgroundColor: active
                                ? palette.tint
                                : palette.surface,
                              borderColor: active
                                ? palette.tint
                                : palette.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.slotText,
                              {
                                color: active ? '#FFFFFF' : palette.text,
                              },
                            ]}
                          >
                            {slot}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {touched.timeSlot && errors.timeSlot ? (
                    <Text style={[styles.error, { color: palette.danger }]}>
                      {errors.timeSlot}
                    </Text>
                  ) : null}
                </Section>

                <Section label="Duration" palette={palette}>
                  <View style={styles.durationRow}>
                    {DURATION_OPTIONS.map((d) => {
                      const active = values.duration === d;
                      return (
                        <Pressable
                          key={d}
                          onPress={() =>
                            setFieldValue('duration', d as BookingDuration)
                          }
                          android_ripple={{
                            color: `${palette.tint}14`,
                            borderless: false,
                          }}
                          style={[
                            styles.durationBtn,
                            {
                              backgroundColor: active
                                ? palette.tint
                                : palette.surface,
                              borderColor: active
                                ? palette.tint
                                : palette.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.durationText,
                              { color: active ? '#FFFFFF' : palette.text },
                            ]}
                          >
                            {d} min
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Section>

                <Section label="Subject" palette={palette}>
                  <View style={styles.slotGrid}>
                    {specializations.map((sub) => {
                      const active = values.subject === sub;
                      return (
                        <Pressable
                          key={sub}
                          onPress={() => {
                            setFieldValue('subject', sub);
                            setFieldTouched('subject', true, false);
                          }}
                          android_ripple={{
                            color: `${palette.tint}14`,
                            borderless: false,
                          }}
                          style={[
                            styles.slot,
                            {
                              backgroundColor: active
                                ? palette.tint
                                : palette.surface,
                              borderColor: active
                                ? palette.tint
                                : palette.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.slotText,
                              { color: active ? '#FFFFFF' : palette.text },
                            ]}
                          >
                            {sub}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {touched.subject && errors.subject ? (
                    <Text style={[styles.error, { color: palette.danger }]}>
                      {errors.subject}
                    </Text>
                  ) : null}
                </Section>

                <View
                  style={[
                    styles.totalCard,
                    {
                      backgroundColor: `${palette.tint}0F`,
                      borderColor: `${palette.tint}55`,
                    },
                  ]}
                >
                  <View style={styles.totalRow}>
                    <Text
                      style={[styles.totalLabel, { color: palette.textMuted }]}
                    >
                      Rate
                    </Text>
                    <Text style={[styles.totalValue, { color: palette.text }]}>
                      ${teacherPrice} / hour
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text
                      style={[styles.totalLabel, { color: palette.textMuted }]}
                    >
                      Duration
                    </Text>
                    <Text style={[styles.totalValue, { color: palette.text }]}>
                      {values.duration} min
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: palette.border },
                    ]}
                  />
                  <View style={styles.totalRow}>
                    <Text
                      style={[styles.totalLabelStrong, { color: palette.text }]}
                    >
                      Total
                    </Text>
                    <Text style={[styles.totalFinal, { color: palette.tint }]}>
                      ${total.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <BaseButton
                  title="Continue to Payment"
                  size="lg"
                  leftIcon={
                    <IconSymbol
                      name="creditcard.fill"
                      size={18}
                      color="#FFFFFF"
                    />
                  }
                  onPress={() => handleSubmit()}
                  disabled={!isValid || !dirty}
                  containerStyle={styles.continueBtn}
                />
              </ScrollView>
            );
          }}
        </Formik>
      </KeyboardAvoidingView>
    </View>
  );
}

function Section({
  label,
  children,
  palette,
}: {
  label: string;
  children: React.ReactNode;
  palette: typeof Colors.light;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: palette.text }]}>
        {label}
      </Text>
      {children}
    </View>
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
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  teacherBody: {
    flex: 1,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: '800',
  },
  teacherQual: {
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  priceNote: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: -2,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  slotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  durationBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalLabelStrong: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalFinal: {
    fontSize: 22,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  continueBtn: {
    marginTop: Spacing.lg,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BookSession;
