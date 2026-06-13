import * as Yup from 'yup';

export const SPECIALIZATION_OPTIONS = [
  'Tajweed',
  'Tafseer',
  'Memorization (Hifz)',
  'Arabic Grammar',
  'Quranic Arabic',
  'Islamic Studies',
  'Recitation',
  'Hadith',
  'Fiqh',
  'Aqeedah',
] as const;

export const LANGUAGE_OPTIONS = [
  'Arabic',
  'English',
  'Urdu',
  'French',
  'Malay',
  'Indonesian',
  'Turkish',
  'Spanish',
  'German',
  'Hindi',
] as const;

export const BIO_MAX_LENGTH = 500;

export interface TeacherOnboardingFormValues {
  specializations: string[];
  languages: string[];
  qualification: string;
  hourlyRate: string;
  bio: string;
}

export const teacherOnboardingInitialValues: TeacherOnboardingFormValues = {
  specializations: [],
  languages: [],
  qualification: '',
  hourlyRate: '',
  bio: '',
};

const expertiseShape = {
  specializations: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Pick at least one specialization')
    .required('Pick at least one specialization'),
  languages: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Pick at least one language')
    .required('Pick at least one language'),
};

const profileShape = {
  qualification: Yup.string()
    .trim()
    .required('Qualification is required')
    .min(2, 'Qualification must be at least 2 characters')
    .max(80, 'Qualification must be at most 80 characters'),
  hourlyRate: Yup.string()
    .required('Hourly rate is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Enter a valid hourly rate')
    .test('positive', 'Hourly rate must be greater than 0', (value) => {
      const n = Number(value);
      return !Number.isNaN(n) && n > 0;
    }),
  bio: Yup.string()
    .trim()
    .max(BIO_MAX_LENGTH, `Bio must be ${BIO_MAX_LENGTH} characters or fewer`),
};

export const teacherOnboardingExpertiseSchema = Yup.object(expertiseShape);

export const teacherOnboardingProfileSchema = Yup.object(profileShape);

export const teacherOnboardingFullSchema = Yup.object({
  ...expertiseShape,
  ...profileShape,
});
