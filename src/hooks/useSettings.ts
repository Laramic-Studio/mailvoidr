import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmTwoFactor,
  deleteWorkspace,
  disableTwoFactor,
  enableTwoFactor,
  fetchRecoveryCodes,
  fetchSettings,
  fetchTwoFactorStatus,
  regenerateRecoveryCodes,
  updateNotifications,
  updatePassword,
  updateProfile,
  updateWorkspace,
  updateWorkspaceSettings,
} from '@/lib/api/settings';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '@/stores/workspace-store';
import type { NotificationPreferences, WorkspaceSettings } from '@/types';

export function useSettings() {
  const { user } = useAuth();
  const workspaceId = useWorkspaceStore((s) => s.workspaceId) ?? user?.selected_workspace_id ?? '';

  return useQuery({
    queryKey: queryKeys.settings.all(workspaceId),
    queryFn: fetchSettings,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useTwoFactorStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.settings.twoFactor,
    queryFn: fetchTwoFactorStatus,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useSettingsMutations() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['settings'] });
    await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.me });
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await refreshUser();
      await invalidate();
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (payload: Partial<NotificationPreferences>) => updateNotifications(payload),
    onSuccess: invalidate,
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: ({
      workspaceId,
      ...payload
    }: {
      workspaceId: string;
      name?: string;
      slug?: string;
    }) => updateWorkspace(workspaceId, payload),
    onSuccess: invalidate,
  });

  const updateWorkspaceSettingsMutation = useMutation({
    mutationFn: ({
      workspaceId,
      ...payload
    }: { workspaceId: string } & Partial<WorkspaceSettings>) =>
      updateWorkspaceSettings(workspaceId, payload),
    onSuccess: invalidate,
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: ({
      workspaceId,
      confirmationName,
    }: {
      workspaceId: string;
      confirmationName: string;
    }) => deleteWorkspace(workspaceId, confirmationName),
    onSuccess: invalidate,
  });

  const enableTwoFactorMutation = useMutation({
    mutationFn: enableTwoFactor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.twoFactor });
    },
  });

  const confirmTwoFactorMutation = useMutation({
    mutationFn: confirmTwoFactor,
    onSuccess: async () => {
      await refreshUser();
      await invalidate();
    },
  });

  const disableTwoFactorMutation = useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: async () => {
      await refreshUser();
      await invalidate();
    },
  });

  const recoveryCodesMutation = useMutation({
    mutationFn: fetchRecoveryCodes,
  });

  const regenerateRecoveryCodesMutation = useMutation({
    mutationFn: regenerateRecoveryCodes,
  });

  return {
    updateProfile: updateProfileMutation,
    updatePassword: updatePasswordMutation,
    updateNotifications: updateNotificationsMutation,
    updateWorkspace: updateWorkspaceMutation,
    updateWorkspaceSettings: updateWorkspaceSettingsMutation,
    deleteWorkspace: deleteWorkspaceMutation,
    enableTwoFactor: enableTwoFactorMutation,
    confirmTwoFactor: confirmTwoFactorMutation,
    disableTwoFactor: disableTwoFactorMutation,
    recoveryCodes: recoveryCodesMutation,
    regenerateRecoveryCodes: regenerateRecoveryCodesMutation,
  };
}
