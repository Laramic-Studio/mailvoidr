import type {
  TeamActivityListResponse,
  TeamInvitationListResponse,
  TeamMemberListResponse,
  WorkspaceRoleOption,
} from '@/types';
import { api } from '@/lib/api';

export interface InviteTeamMembersPayload {
  emails: string[];
  role: string;
}

export interface InviteTeamMembersResponse {
  message: string;
  invited: number;
  skipped: string[];
  notification_failures: string[];
}

export async function fetchTeamMembers(workspaceId: string): Promise<TeamMemberListResponse> {
  const { data } = await api.get<TeamMemberListResponse>(`/workspaces/${workspaceId}/members`);
  return data;
}

export async function fetchTeamInvitations(workspaceId: string): Promise<TeamInvitationListResponse> {
  const { data } = await api.get<TeamInvitationListResponse>(`/workspaces/${workspaceId}/invitations`);
  return data;
}

export async function fetchTeamActivity(workspaceId: string): Promise<TeamActivityListResponse> {
  const { data } = await api.get<TeamActivityListResponse>(`/workspaces/${workspaceId}/activity`);
  return data;
}

export async function inviteTeamMembers(
  workspaceId: string,
  payload: InviteTeamMembersPayload,
): Promise<InviteTeamMembersResponse> {
  const { data } = await api.post<InviteTeamMembersResponse>(
    `/workspaces/${workspaceId}/invitations`,
    payload,
  );
  return data;
}

export async function updateTeamMemberRole(
  workspaceId: string,
  userId: string,
  role: string,
): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>(
    `/workspaces/${workspaceId}/members/${userId}`,
    { role },
  );
  return data;
}

export async function removeTeamMember(
  workspaceId: string,
  userId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/workspaces/${workspaceId}/members/${userId}`,
  );
  return data;
}

export async function revokeTeamInvitation(
  workspaceId: string,
  invitationId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/workspaces/${workspaceId}/invitations/${invitationId}`,
  );
  return data;
}

export type { WorkspaceRoleOption };
