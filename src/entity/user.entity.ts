import * as Yup from 'yup';

import { UserRole } from '@/enums/user-role.enum';

export interface DemoCredential {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: 'student@gmail.com',
    password: '123456',
    role: UserRole.STUDENT,
    name: 'Ahmed Ali',
  },
  {
    email: 'teacher@gmail.com',
    password: '123456',
    role: UserRole.TEACHER,
    name: 'Sheikh Muhammad Ibrahim',
  },
];

export function matchDemoCredentials(
  email: string,
  password: string,
): DemoCredential | null {
  const normalized = email.trim().toLowerCase();
  return (
    DEMO_CREDENTIALS.find(
      (c) => c.email === normalized && c.password === password,
    ) ?? null
  );
}

export const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const emailField = Yup.string()
  .trim()
  .required('Email is required')
  .matches(EMAIL_REGEX, 'Enter a valid email address');

const nameField = (label: string) =>
  Yup.string()
    .trim()
    .required(`${label} is required`)
    .min(2, `${label} must be at least 2 characters`);

const passwordField = Yup.string()
  .required('Password is required')
  .min(6, 'Password must be at least 6 characters')
  .matches(/[a-z]/, 'Password must include a lowercase letter')
  .matches(/[A-Z]/, 'Password must include an uppercase letter');

const confirmPasswordField = Yup.string()
  .required('Please confirm your password')
  .oneOf([Yup.ref('password')], 'Passwords do not match');

const dobField = Yup.date()
  .nullable()
  .typeError('Enter a valid date')
  .required('Date of birth is required')
  .test(
    'not-future',
    'Date of birth cannot be in the future',
    (value) => {
      if (!value) return true;
      const now = new Date();
      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      return value.getTime() <= endOfToday.getTime();
    },
  );

export interface LoginFormValues {
  email: string;
  password: string;
}

export const loginInitialValues: LoginFormValues = {
  email: '',
  password: '',
};

export const loginValidationSchema: Yup.ObjectSchema<LoginFormValues> = Yup.object({
  email: emailField,
  password: Yup.string().required('Password is required'),
});

export interface StudentSignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  dob: Date | null;
  password: string;
  confirmPassword: string;
}

export const studentSignupInitialValues: StudentSignupFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  dob: null,
  password: '',
  confirmPassword: '',
};

export const studentSignupValidationSchema = Yup.object({
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  email: emailField,
  dob: dobField,
  password: passwordField,
  confirmPassword: confirmPasswordField,
});

export interface TeacherSignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  dob: Date | null;
  password: string;
  confirmPassword: string;
}

export const teacherSignupInitialValues: TeacherSignupFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  dob: null,
  password: '',
  confirmPassword: '',
};

export const teacherSignupValidationSchema = Yup.object({
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  email: emailField,
  dob: dobField,
  password: passwordField,
  confirmPassword: confirmPasswordField,
});

export const OTP_LENGTH = 6;
export const DEMO_OTP = '123456';

export interface ForgotPasswordFormValues {
  email: string;
}

export const forgotPasswordInitialValues: ForgotPasswordFormValues = {
  email: '',
};

export const forgotPasswordValidationSchema: Yup.ObjectSchema<ForgotPasswordFormValues> =
  Yup.object({
    email: emailField,
  });

export interface OtpFormValues {
  code: string;
}

export const otpInitialValues: OtpFormValues = {
  code: '',
};

export const otpValidationSchema: Yup.ObjectSchema<OtpFormValues> = Yup.object({
  code: Yup.string()
    .required('Please enter the verification code')
    .length(OTP_LENGTH, `Code must be ${OTP_LENGTH} digits`)
    .matches(/^\d+$/, 'Code must contain only digits')
    .test(
      'matches-demo',
      'Invalid verification code',
      (value) => value === DEMO_OTP,
    ),
});

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export const resetPasswordInitialValues: ResetPasswordFormValues = {
  password: '',
  confirmPassword: '',
};

export const resetPasswordValidationSchema: Yup.ObjectSchema<ResetPasswordFormValues> =
  Yup.object({
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: confirmPasswordField,
  });

export const DEMO_CURRENT_PASSWORD = '123456';

export interface EditProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
}

export const editProfileValidationSchema: Yup.ObjectSchema<EditProfileFormValues> =
  Yup.object({
    firstName: nameField('First name'),
    lastName: nameField('Last name'),
    email: emailField,
  });

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePasswordInitialValues: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export const changePasswordValidationSchema: Yup.ObjectSchema<ChangePasswordFormValues> =
  Yup.object({
    currentPassword: Yup.string()
      .required('Current password is required')
      .test(
        'is-current',
        'Current password is incorrect',
        (value) => value === DEMO_CURRENT_PASSWORD,
      ),
    newPassword: Yup.string()
      .required('New password is required')
      .min(6, 'Password must be at least 6 characters')
      .notOneOf(
        [Yup.ref('currentPassword')],
        'New password must be different from current password',
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your new password')
      .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
  });
