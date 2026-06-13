import { Teacher } from '@/components/teacher-card/TeacherCard';

import { api, unwrap } from '../client';

export interface TeacherOnboardingInput {
  specializations: string[];
  languages: string[];
  qualification: string;
  hourlyRate: number;
  bio?: string;
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

  async myProfile() {
    return unwrap(api.get('/teachers/me'));
  },
};
