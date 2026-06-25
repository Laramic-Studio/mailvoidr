import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiErrorBody } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://ui.test/api/v1";

export const TOKEN_STORAGE_KEY = "mailvoidr_access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "mailvoidr_refresh_token";
export const WORKSPACE_STORAGE_KEY = "mailvoidr_workspace_id";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const workspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (workspaceId) {
    config.headers["X-Workspace-Id"] = workspaceId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isAuthRoute = error.config?.url?.includes("/auth/login")
      || error.config?.url?.includes("/auth/register")
      || error.config?.url?.includes("/auth/two-factor");

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export async function checkHealth(): Promise<boolean> {
  const { data } = await api.get<{ status: string }>("/health");
  return data.status === "ok";
}
