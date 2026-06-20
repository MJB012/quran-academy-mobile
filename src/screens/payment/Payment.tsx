import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BookingsService, getApiErrorMessage } from '@/api';
import BaseButton from '@/components/base-button/BaseButton';
import BaseInput from '@/components/base-input/BaseInput';
import ScreenHeader from '@/components/screen-header/ScreenHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import {
  PaymentFormValues,
  formatCardNumber,
  formatExpiry,
  paymentInitialValues,
  paymentValidationSchema,
} from '@/entity/booking.entity';
import { useColorScheme } from '@/hooks/use-color-scheme';

function formatSummaryDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function Payment() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId?: string;
    teacherId?: string;
    teacherName?: string;
    teacherPrice?: string;
    date?: string;
    timeSlot?: string;
    duration?: string;
    subject?: string;
    total?: string;
  }>();

  const cardholderRef = useRef<TextInput>(null);
  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);

  const total = params.total ?? '0.00';
  const dateText = formatSummaryDate(params.date);

  const submitPayment = async (_values: PaymentFormValues, helpers: { setSubmitting: (v: boolean) => void }) => {
    try {
      if (params.bookingId) {
        await BookingsService.confirm(params.bookingId);
      }
      router.replace({
        pathname: '/booking-success',
        params: {
          teacherName: params.teacherName ?? '',
          date: dateText,
          timeSlot: params.timeSlot ?? '',
          duration: params.duration ?? '',
          subject: params.subject ?? '',
          total,
        },
      });
    } catch (err) {
      Alert.alert('Payment failed', getApiErrorMessage(err));
      helpers.setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.tint} />
      <ScreenHeader title="Payment" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Formik
          initialValues={paymentInitialValues}
          validationSchema={paymentValidationSchema}
          onSubmit={submitPayment}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
            isSubmitting,
            isValid,
            dirty,
          }) => (
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  styles.summary,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
                  },
                ]}
              >
                <Text style={[styles.summaryTitle, { color: palette.text }]}>
                  Order Summary
                </Text>
                <SummaryRow
                  label="Teacher"
                  value={params.teacherName ?? ''}
                  palette={palette}
                />
                <SummaryRow
                  label="Subject"
                  value={params.subject ?? ''}
                  palette={palette}
                />
                <SummaryRow label="Date" value={dateText} palette={palette} />
                <SummaryRow
                  label="Time"
                  value={params.timeSlot ?? ''}
                  palette={palette}
                />
                <SummaryRow
                  label="Duration"
                  value={`${params.duration ?? ''} min`}
                  palette={palette}
                />
                <View
                  style={[styles.divider, { backgroundColor: palette.border }]}
                />
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: palette.text }]}>
                    Total
                  </Text>
                  <Text style={[styles.totalValue, { color: palette.tint }]}>
                    ${total}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Card Details
              </Text>

              <BaseInput
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                keyboardType="number-pad"
                autoComplete="cc-number"
                textContentType="creditCardNumber"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => cardholderRef.current?.focus()}
                value={values.cardNumber}
                onChangeText={(t) =>
                  setFieldValue('cardNumber', formatCardNumber(t))
                }
                onBlur={handleBlur('cardNumber')}
                error={errors.cardNumber}
                touched={touched.cardNumber}
                leftIcon={
                  <IconSymbol
                    name="creditcard.fill"
                    size={18}
                    color={palette.textMuted}
                  />
                }
              />

              <BaseInput
                ref={cardholderRef}
                label="Cardholder Name"
                placeholder="Name on card"
                autoCapitalize="words"
                autoComplete="cc-name"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => expiryRef.current?.focus()}
                value={values.cardholderName}
                onChangeText={handleChange('cardholderName')}
                onBlur={handleBlur('cardholderName')}
                error={errors.cardholderName}
                touched={touched.cardholderName}
              />

              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <BaseInput
                    ref={expiryRef}
                    label="Expiry"
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    autoComplete="cc-exp"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => cvvRef.current?.focus()}
                    value={values.expiry}
                    onChangeText={(t) =>
                      setFieldValue('expiry', formatExpiry(t))
                    }
                    onBlur={handleBlur('expiry')}
                    error={errors.expiry}
                    touched={touched.expiry}
                  />
                </View>
                <View style={styles.rowItem}>
                  <BaseInput
                    ref={cvvRef}
                    label="CVV"
                    placeholder="123"
                    keyboardType="number-pad"
                    autoComplete="cc-csc"
                    secureTextEntry
                    maxLength={4}
                    returnKeyType="done"
                    onSubmitEditing={() => handleSubmit()}
                    value={values.cvv}
                    onChangeText={handleChange('cvv')}
                    onBlur={handleBlur('cvv')}
                    error={errors.cvv}
                    touched={touched.cvv}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.notice,
                  {
                    backgroundColor: `${palette.tint}14`,
                    borderColor: `${palette.tint}55`,
                  },
                ]}
              >
                <IconSymbol name="lock.fill" size={16} color={palette.tint} />
                <Text style={[styles.noticeText, { color: palette.tint }]}>
                  Your payment is secured. Stripe integration coming soon.
                </Text>
              </View>

              <BaseButton
                title={`Pay $${total}`}
                size="lg"
                loading={isSubmitting}
                onPress={() => handleSubmit()}
                disabled={!isValid || !dirty}
                containerStyle={styles.payBtn}
              />
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: typeof Colors.light;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>
        {label}
      </Text>
      <Text
        style={[styles.summaryValue, { color: palette.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
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
  summary: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  payBtn: {
    marginTop: Spacing.xs,
  },
});

export default Payment;
