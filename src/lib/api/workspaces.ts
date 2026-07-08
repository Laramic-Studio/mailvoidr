import type { InvitationPreview, PendingInvitationsResponse, Workspace, WorkspaceListResponse } from "@/types";
import { api } from "@/lib/api";

export async function fetchWorkspaces(): Promise<WorkspaceListResponse> {
  const { data } = await api.get<WorkspaceListResponse>("/workspaces");
  return data;
}

export async function createWorkspace(payload: {
  name: string;
  description?: string;
}): Promise<{ workspace: Workspace }> {
  const { data } = await api.post<{ workspace: Workspace }>("/workspaces", payload);
  return data;
}

export async function switchWorkspace(workspaceId: string): Promise<{ workspace: Workspace }> {
  const { data } = await api.post<{ workspace: Workspace }>(`/workspaces/${workspaceId}/switch`);
  return data;
}

export async function fetchInvitation(workspaceId: string): Promise<InvitationPreview> {
  const { data } = await api.get<InvitationPreview>(`/invitations/${workspaceId}`);
  return data;
}

export async function fetchInvitationByToken(token: string): Promise<InvitationPreview> {
  const { data } = await api.get<InvitationPreview>(`/invitations/token/${token}`);
  return data;
}

export async function fetchPendingInvitations(): Promise<PendingInvitationsResponse> {
  const { data } = await api.get<PendingInvitationsResponse>("/invitations/pending");
  return data;
}

export async function acceptInvitation(workspaceId: string): Promise<{
  message: string;
  workspace: Workspace;
  redirect: string;
}> {
  const { data } = await api.post<{
    message: string;
    workspace: Workspace;
    redirect: string;
  }>(`/invitations/${workspaceId}/accept`);
  return data;
}

export async function acceptInvitationByToken(token: string): Promise<{
  message: string;
  workspace: Workspace;
  redirect: string;
}> {
  const { data } = await api.post<{
    message: string;
    workspace: Workspace;
    redirect: string;
  }>(`/invitations/token/${token}/accept`);
  return data;
}

export async function declineInvitationByToken(token: string): Promise<{
  message: string;
  redirect: string;
}> {
  const { data } = await api.post<{ message: string; redirect: string }>(
    `/invitations/token/${token}/decline`,
  );
  return data;
}

export async function declineInvitation(workspaceId: string): Promise<{
  message: string;
  redirect: string;
}> {
  const { data } = await api.post<{ message: string; redirect: string }>(
    `/invitations/${workspaceId}/decline`,
  );
  return data;
}

export function flattenWorkspaces(lists: WorkspaceListResponse): Workspace[] {
  const owned = normalizeWorkspaceList(lists.owned);
  const member = normalizeWorkspaceList(lists.member);
  const seen = new Set<string>();
  const result: Workspace[] = [];

  for (const workspace of [...owned, ...member]) {
    if (!workspace?.id || seen.has(workspace.id)) {
      continue;
    }
    seen.add(workspace.id);
    result.push(workspace);
  }

  return result;
}

function normalizeWorkspaceList(value: Workspace[] | { data?: Workspace[] } | null | undefined): Workspace[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && Array.isArray(value.data)) {
    return value.data;
  }

  return [];
}
