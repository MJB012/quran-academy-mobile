import { Platform } from 'react-native';

// On Android emulator localhost = 10.0.2.2; iOS simulator can use localhost.
// Override at runtime by setting EXPO_PUBLIC_API_URL in your env.
const ENV_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

function defaultBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

export const API_BASE_URL = ENV_URL && ENV_URL.length > 0 ? ENV_URL : defaultBaseUrl();
