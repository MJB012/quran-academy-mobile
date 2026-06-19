import { Teacher } from '@/components/teacher-card/TeacherCard';

import { api, unwrap } from '../client';

export interface TeacherOnboardingInput {
  specializations: string[];
  languages: string[];
  qualification: string;
  hourlyRate: number;
  bio?: string;
}

/** Shape returned by GET /teachers/me (null when the teacher hasn't onboarded). */
export interface TeacherProfileData {
  specializations: string[];
  languages: string[];
  qualification?: string;
  hourlyRate: number;
  bio?: string;
  avgRating: number;
  studentsCount: number;
  isOnboarded: boolean;
}

interface ListResponse {
  items: Teacher[];
  total: number;
  page: number;
  limit: number;
}

export interface ListTeachersParams {
  search?: string;
  specialization?: string;
  language?: string;
  page?: number;
  limit?: number;
}

export const TeachersService = {
  async list(params: ListTeachersParams = {}): Promise<ListResponse> {
    return unwrap<ListResponse>(api.get('/teachers', { params }));
  },

  async get(id: string): Promise<Teacher> {
    return unwrap<Teacher>(api.get(`/teachers/${id}`));
  },

  async onboarding(input: TeacherOnboardingInput) {
    return unwrap(api.post('/teachers/onboarding', input));
  },

  async myProfile(): Promise<TeacherProfileData | null> {
    return unwrap<TeacherProfileData | null>(api.get('/teachers/me'));
  },
};
