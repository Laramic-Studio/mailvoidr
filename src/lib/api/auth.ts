import type { AuthTokens, LoginResponse, User } from "@/types";
import { api } from "@/lib/api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TwoFactorPayload {
  login_token: string;
  code: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export type AuthResponse = LoginResponse & {
  two_factor_required?: boolean;
  login_token?: string;
};

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function verifyTwoFactor(payload: TwoFactorPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/two-factor/challenge", payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function refreshToken(): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/refresh");
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function verifyEmailOtp(code: string): Promise<User> {
  const { data } = await api.post<{ user: User }>("/auth/email/verify-otp", { code });
  return data.user;
}

export async function resendEmailOtp(): Promise<void> {
  await api.post("/auth/email/resend-otp");
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await api.post("/auth/reset-password", payload);
}
