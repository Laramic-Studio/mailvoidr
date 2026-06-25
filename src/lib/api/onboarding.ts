import type { Workspace } from "@/types";
import { api } from "@/lib/api";

export interface OnboardingStatus {
  completed: boolean;
  step: number;
  workspace: Workspace | null;
  referral_source?: string | null;
}

export interface OnboardingApiKeyResult {
  api_key: {
    id: number;
    name: string;
    key_prefix: string;
  };
  plain_key: string;
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatus> {
  const { data } = await api.get<OnboardingStatus>("/onboarding/status");
  return data;
}

export async function saveOnboardingStep(step: number): Promise<{ step: number }> {
  const { data } = await api.patch<{ step: number }>("/onboarding/step", { step });
  return data;
}

export async function createOnboardingWorkspace(payload: {
  name: string;
  referral_source: string;
}): Promise<{ workspace: Workspace }> {
  const { data } = await api.post<{ workspace: Workspace }>("/onboarding/workspace", payload);
  return data;
}

export async function updateOnboardingWorkspace(payload: {
  name?: string;
  slug?: string;
  use_case?: string | null;
}): Promise<{ workspace: Workspace }> {
  const { data } = await api.patch<{ workspace: Workspace }>("/onboarding/workspace", payload);
  return data;
}

export async function createOnboardingApiKey(name = "web-app"): Promise<OnboardingApiKeyResult> {
  const { data } = await api.post<OnboardingApiKeyResult>("/onboarding/api-key", { name });
  return data;
}

export async function completeOnboarding(): Promise<{ redirect: string }> {
  const { data } = await api.post<{ redirect: string }>("/onboarding/complete");
  return data;
}
