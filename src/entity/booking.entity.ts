import * as Yup from 'yup';

export const DURATION_OPTIONS = [30, 60, 90] as const;
export type BookingDuration = (typeof DURATION_OPTIONS)[number];

export const TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
] as const;

export interface BookingFormValues {
  date: Date | null;
  timeSlot: string;
  duration: BookingDuration;
  subject: string;
}

export const bookingInitialValues: BookingFormValues = {
  date: null,
  timeSlot: '',
  duration: 60,
  subject: '',
};

export const bookingValidationSchema = Yup.object({
  date: Yup.date()
    .nullable()
    .typeError('Select a valid date')
    .required('Please choose a date')
    .test('not-past', 'Date cannot be in the past', (value) => {
      if (!value) return true;
      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      return value.getTime() >= today.getTime();
    }),
  timeSlot: Yup.string().required('Please pick a time slot'),
  duration: Yup.number()
    .oneOf([...DURATION_OPTIONS], 'Invalid duration')
    .required('Please pick a duration'),
  subject: Yup.string().required('Please choose a subject'),
});

export interface PaymentFormValues {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cvv: string;
}

export const paymentInitialValues: PaymentFormValues = {
  cardNumber: '',
  cardholderName: '',
  expiry: '',
  cvv: '',
};

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidExpiry(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const mm = parseInt(match[1], 10);
  const yy = parseInt(match[2], 10);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const fullYear = 2000 + yy;
  const cardExpiry = new Date(fullYear, mm, 0, 23, 59, 59);
  return cardExpiry.getTime() >= now.getTime();
}

export const paymentValidationSchema: Yup.ObjectSchema<PaymentFormValues> =
  Yup.object({
    cardholderName: Yup.string()
      .trim()
      .required('Cardholder name is required')
      .min(2, 'Name must be at least 2 characters'),
    cardNumber: Yup.string()
      .required('Card number is required')
      .test('card-length', 'Card number must be 16 digits', (value) => {
        const digits = (value ?? '').replace(/\D/g, '');
        return digits.length === 16;
      }),
    expiry: Yup.string()
      .required('Expiry is required')
      .test('expiry-format', 'Enter valid expiry (MM/YY)', (value) =>
        isValidExpiry(value ?? ''),
      ),
    cvv: Yup.string()
      .required('CVV is required')
      .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  });
