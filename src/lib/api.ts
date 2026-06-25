import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorBody, AuthTokens } from '@/types';
import {
  clearAuthStorage,
  readAccessToken,
  TOKEN_STORAGE_KEY,
  WORKSPACE_STORAGE_KEY,
  writeAccessToken,
} from '@/lib/auth-storage';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://ui.test/api/v1';

export { TOKEN_STORAGE_KEY, WORKSPACE_STORAGE_KEY } from '@/lib/auth-storage';
export const REFRESH_TOKEN_STORAGE_KEY = 'mailvoidr_refresh_token';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

type TokenRefreshListener = (token: string) => void;

let refreshPromise: Promise<string | null> | null = null;
let onTokenRefreshed: TokenRefreshListener | null = null;

export function registerTokenRefreshListener(listener: TokenRefreshListener | null) {
  onTokenRefreshed = listener;
}

function isAuthRoute(url: string | undefined): boolean {
  if (!url) return false;

  return (
    url.includes('/auth/login')
    || url.includes('/auth/register')
    || url.includes('/auth/two-factor')
    || url.includes('/auth/refresh')
    || url.includes('/auth/forgot-password')
    || url.includes('/auth/reset-password')
  );
}

function redirectToLogin() {
  clearAuthStorage();

  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const currentToken = readAccessToken();

  if (!currentToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<AuthTokens>(
        `${API_URL}/auth/refresh`,
        {},
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${currentToken}`,
          },
        },
      )
      .then((response) => {
        const nextToken = response.data.access_token;

        if (!nextToken) {
          return null;
        }

        writeAccessToken(nextToken);
        onTokenRefreshed?.(nextToken);

        return nextToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const workspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);

  if (workspaceId) {
    config.headers['X-Workspace-Id'] = workspaceId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401
      && originalRequest
      && !originalRequest._retry
      && !isAuthRoute(originalRequest.url)
    ) {
      originalRequest._retry = true;

      const nextToken = await refreshAccessToken();

      if (nextToken) {
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;

        return api(originalRequest);
      }

      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;

    if (data?.errors) {
      const messages = Object.values(data.errors).flat().filter(Boolean);

      if (messages.length === 1) {
        return messages[0];
      }

      if (messages.length > 1) {
        return messages.slice(0, 2).join(' · ');
      }
    }

    return data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}

export async function checkHealth(): Promise<boolean> {
  const data = await fetchHealth();
  return data.status === 'ok';
}
