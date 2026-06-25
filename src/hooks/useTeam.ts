import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTeamActivity,
  fetchTeamInvitations,
  fetchTeamMembers,
  inviteTeamMembers,
  removeTeamMember,
  revokeTeamInvitation,
  updateTeamMemberRole,
  type InviteTeamMembersPayload,
} from '@/lib/api/team';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useTeamMembers(workspaceId: string | null | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.team.members(workspaceId ?? ''),
    queryFn: () => fetchTeamMembers(workspaceId!),
    enabled: Boolean(user?.onboarding_completed && workspaceId),
  });
}

export function useTeamInvitations(workspaceId: string | null | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.team.invitations(workspaceId ?? ''),
    queryFn: () => fetchTeamInvitations(workspaceId!),
    enabled: Boolean(user?.onboarding_completed && workspaceId),
  });
}

export function useTeamActivity(workspaceId: string | null | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.team.activity(workspaceId ?? ''),
    queryFn: () => fetchTeamActivity(workspaceId!),
    enabled: Boolean(user?.onboarding_completed && workspaceId),
  });
}

export function useTeamMutations(workspaceId: string | null | undefined) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    if (!workspaceId) return;
    await queryClient.invalidateQueries({ queryKey: queryKeys.team.members(workspaceId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.team.invitations(workspaceId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.team.activity(workspaceId) });
  };

  const invite = useMutation({
    mutationFn: (payload: InviteTeamMembersPayload) => inviteTeamMembers(workspaceId!, payload),
    onSuccess: invalidate,
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateTeamMemberRole(workspaceId!, userId, role),
    onSuccess: invalidate,
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => removeTeamMember(workspaceId!, userId),
    onSuccess: invalidate,
  });

  const revokeInvitation = useMutation({
    mutationFn: (invitationId: string) => revokeTeamInvitation(workspaceId!, invitationId),
    onSuccess: invalidate,
  });

  return { invite, updateRole, removeMember, revokeInvitation };
}
