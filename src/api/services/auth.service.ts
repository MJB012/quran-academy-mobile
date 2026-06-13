import { UserRole } from '@/enums/user-role.enum';

import { api, unwrap } from '../client';
import { StoredUser, TokenStore } from '../token-store';

export interface AuthUser extends StoredUser {}

interface AuthBundle {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface SignupBundle {
  user: AuthUser;
  otp?: string;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  password: string;
  role: UserRole;
}

async function persist(bundle: AuthBundle): Promise<AuthBundle> {
  await TokenStore.setTokens(bundle.accessToken, bundle.refreshToken);
  await TokenStore.setUser(bundle.user);
  return bundle;
}

export const AuthService = {
  async signup(input: SignupInput): Promise<SignupBundle> {
    return unwrap<SignupBundle>(api.post('/auth/signup', input));
  },

  async login(email: string, password: string): Promise<AuthBundle> {
    const data = await unwrap<AuthBundle>(api.post('/auth/login', { email, password }));
    return persist(data);
  },

  async verifyOtp(
    email: string,
    code: string,
    purpose: 'signup' | 'reset',
  ): Promise<AuthBundle | { verified: true }> {
    const data = await unwrap<AuthBundle | { verified: true }>(
      api.post('/auth/verify-otp', { email, code, purpose }),
    );
    if ('accessToken' in data) {
      await persist(data);
    }
    return data;
  },

  async forgotPassword(email: string): Promise<{ sent: boolean; otp?: string }> {
    return unwrap(api.post('/auth/forgot-password', { email }));
  },

  async resetPassword(email: string, code: string, password: string): Promise<{ reset: true }> {
    return unwrap(api.post('/auth/reset-password', { email, code, password }));
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ changed: true }> {
    return unwrap(api.post('/auth/change-password', { currentPassword, newPassword }));
  },

  async logout(): Promise<void> {
    await TokenStore.clear();
  },

  async getStoredUser() {
    return TokenStore.getUser();
  },
};
