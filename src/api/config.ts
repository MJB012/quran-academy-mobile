import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Base URL resolution order:
//   1. EXPO_PUBLIC_API_URL  (inlined at build time when set)
//   2. BACKEND_URL from .env (forwarded through app.config.js -> extra.backendUrl)
//   3. Platform-aware localhost default (Android emulator uses 10.0.2.2)
const extra = (Constants.expoConfig?.extra ?? {}) as { backendUrl?: string | null };

const raw = process.env.EXPO_PUBLIC_API_URL ?? extra.backendUrl;
const CONFIGURED_URL = typeof raw === 'string' ? raw.trim() : '';

function defaultBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

// Strip trailing slashes so `${baseURL}/auth/login` never doubles up.
function normalize(url: string): string {
  return url.replace(/\/+$/, '');
}

export const API_BASE_URL =
  CONFIGURED_URL.length > 0 ? normalize(CONFIGURED_URL) : defaultBaseUrl();
