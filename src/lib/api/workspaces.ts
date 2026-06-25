import type { InvitationPreview, Workspace, WorkspaceListResponse } from "@/types";
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
  const memberIds = new Set(lists.member.map((w) => w.id));
  const owned = lists.owned.filter((w) => !memberIds.has(w.id) || w.role === "owner");
  return [...owned, ...lists.member];
}
