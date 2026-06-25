import type {
  NotificationPreferences,
  SettingsSnapshot,
  TwoFactorSetup,
  User,
  Workspace,
  WorkspaceSettings,
} from '@/types';
import { api } from '@/lib/api';

export async function fetchSettings(): Promise<SettingsSnapshot> {
  const { data } = await api.get<SettingsSnapshot>('/settings');
  return data;
}

export async function updateProfile(payload: {
  name?: string;
  email?: string;
  timezone?: string | null;
}): Promise<{ user: User; message: string }> {
  const { data } = await api.patch<{ user: User; message: string }>('/auth/me', payload);
  return data;
}

export async function updatePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>('/auth/password', payload);
  return data;
}

export async function updateNotifications(
  payload: Partial<NotificationPreferences>,
): Promise<{ notifications: NotificationPreferences; message: string }> {
  const { data } = await api.patch<{ notifications: NotificationPreferences; message: string }>(
    '/settings/notifications',
    payload,
  );
  return data;
}

export async function updateWorkspace(
  workspaceId: string,
  payload: {
    name?: string;
    slug?: string;
    description?: string | null;
    settings?: Partial<WorkspaceSettings>;
  },
): Promise<{ workspace: Workspace }> {
  const { data } = await api.patch<{ workspace: Workspace }>(`/workspaces/${workspaceId}`, payload);
  return data;
}

export async function updateWorkspaceSettings(
  workspaceId: string,
  payload: Partial<WorkspaceSettings>,
): Promise<{ workspace_settings: WorkspaceSettings; workspace: Workspace; message: string }> {
  const { data } = await api.patch<{
    workspace_settings: WorkspaceSettings;
    workspace: Workspace;
    message: string;
  }>(`/settings/workspaces/${workspaceId}`, payload);
  return data;
}

export async function deleteWorkspace(
  workspaceId: string,
  confirmationName: string,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/settings/workspaces/${workspaceId}`, {
    data: { confirmation_name: confirmationName },
  });
  return data;
}

export async function fetchTwoFactorStatus(): Promise<{
  two_factor: { enabled: boolean; pending_confirmation: boolean };
}> {
  const { data } = await api.get<{ two_factor: { enabled: boolean; pending_confirmation: boolean } }>(
    '/settings/two-factor',
  );
  return data;
}

export async function enableTwoFactor(): Promise<{
  setup: TwoFactorSetup;
  message: string;
}> {
  const { data } = await api.post<{ setup: TwoFactorSetup; message: string }>(
    '/settings/two-factor/enable',
  );
  return data;
}

export async function confirmTwoFactor(code: string): Promise<{ message: string; user: User }> {
  const { data } = await api.post<{ message: string; user: User }>('/settings/two-factor/confirm', {
    code,
  });
  return data;
}

export async function disableTwoFactor(password: string): Promise<{ message: string; user: User }> {
  const { data } = await api.delete<{ message: string; user: User }>('/settings/two-factor', {
    data: { password },
  });
  return data;
}

export async function fetchRecoveryCodes(): Promise<{ recovery_codes: string[] }> {
  const { data } = await api.get<{ recovery_codes: string[] }>('/settings/two-factor/recovery-codes');
  return data;
}

export async function regenerateRecoveryCodes(password: string): Promise<{
  recovery_codes: string[];
  message: string;
}> {
  const { data } = await api.post<{ recovery_codes: string[]; message: string }>(
    '/settings/two-factor/recovery-codes',
    { password },
  );
  return data;
}
