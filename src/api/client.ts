import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL } from './config';
import { TokenStore } from './token-store';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await TokenStore.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = await TokenStore.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    const data = res.data?.data ?? res.data;
    if (data?.accessToken && data?.refreshToken) {
      await TokenStore.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    }
  } catch {
    await TokenStore.clear();
  }
  return null;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }
    original._retried = true;
    refreshPromise = refreshPromise ?? refreshTokens();
    const newToken = await refreshPromise;
    refreshPromise = null;
    if (!newToken) return Promise.reject(error);
    original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
    return api.request(original);
  },
);

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> | T }>): Promise<T> {
  const res = await promise;
  const body = res.data as ApiEnvelope<T> | T;
  if (body && typeof body === 'object' && 'success' in (body as object) && 'data' in (body as object)) {
    return (body as ApiEnvelope<T>).data;
  }
  return body as T;
}

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[]; error?: string } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
