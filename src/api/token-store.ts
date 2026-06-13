import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'qa.accessToken';
const REFRESH_KEY = 'qa.refreshToken';
const USER_KEY = 'qa.user';

export interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher';
}

export const TokenStore = {
  async setTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      AsyncStorage.setItem(ACCESS_KEY, accessToken),
      AsyncStorage.setItem(REFRESH_KEY, refreshToken),
    ]);
  },
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_KEY);
  },
  async setUser(user: StoredUser) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async getUser(): Promise<StoredUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  },
  async clear() {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_KEY),
      AsyncStorage.removeItem(REFRESH_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  },
};
