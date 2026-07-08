import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitation,
  acceptInvitationByToken,
  createWorkspace,
  declineInvitation,
  declineInvitationByToken,
  fetchInvitation,
  fetchInvitationByToken,
  fetchPendingInvitations,
  fetchWorkspaces,
  flattenWorkspaces,
  switchWorkspace,
} from "@/lib/api/workspaces";
import { clearPendingInvite } from "@/lib/invite-flow";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import { WORKSPACE_STORAGE_KEY } from "@/lib/api";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useMemo, useEffect } from "react";

export function useWorkspaces() {
  const { user } = useAuth();
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);

  const query = useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: fetchWorkspaces,
    enabled: Boolean(user?.onboarding_completed),
    refetchOnMount: true,
  });

  const workspaces = useMemo(
    () => (query.data ? flattenWorkspaces(query.data) : []),
    [query.data],
  );

  const activeWorkspaceId = useMemo(() => {
    const selectedId = workspaceId ?? user?.selected_workspace_id ?? null;
    if (selectedId) {
      return selectedId;
    }
    return workspaces[0]?.id ?? null;
  }, [workspaceId, user?.selected_workspace_id, workspaces]);

  const currentWorkspace = useMemo(() => {
    if (!activeWorkspaceId) {
      return workspaces[0] ?? null;
    }
    return workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0] ?? null;
  }, [activeWorkspaceId, workspaces]);

  useEffect(() => {
    if (user?.selected_workspace_id && user.selected_workspace_id !== workspaceId) {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, user.selected_workspace_id);
      useWorkspaceStore.setState({ workspaceId: user.selected_workspace_id });
    }
  }, [user?.selected_workspace_id, workspaceId]);

  useEffect(() => {
    if (currentWorkspace && currentWorkspace.id !== workspaceId) {
      setWorkspace(currentWorkspace);
    }
  }, [currentWorkspace, workspaceId, setWorkspace]);

  return { ...query, workspaces, currentWorkspace, activeWorkspaceId };
}

export function useWorkspaceMutations() {
  const queryClient = useQueryClient();
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const refreshUser = useAuth().refreshUser;

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    await queryClient.invalidateQueries({ queryKey: ["settings"] });
    await refreshUser();
  };

  const switchMutation = useMutation({
    mutationFn: (workspaceId: string) => switchWorkspace(workspaceId),
    onSuccess: ({ workspace }) => {
      setWorkspace(workspace);
      void invalidate();
    },
  });

  const createMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: ({ workspace }) => {
      setWorkspace(workspace);
      void invalidate();
    },
  });

  return { switchWorkspace: switchMutation, createWorkspace: createMutation };
}

export function useInvitation(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.workspaces.invitation(workspaceId ?? ""),
    queryFn: () => fetchInvitation(workspaceId!),
    enabled: Boolean(workspaceId),
    retry: false,
  });
}

export function useInvitationByToken(token: string | null) {
  return useQuery({
    queryKey: queryKeys.invitationToken(token ?? ""),
    queryFn: () => fetchInvitationByToken(token!),
    enabled: Boolean(token),
    retry: false,
  });
}

export function usePendingInvitations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.invitations.pending,
    queryFn: fetchPendingInvitations,
    enabled: Boolean(user?.email_verified),
    retry: false,
  });
}

export function useInvitationMutations(workspaceId: string) {
  const queryClient = useQueryClient();
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const refreshUser = useAuth().refreshUser;

  const accept = useMutation({
    mutationFn: () => acceptInvitation(workspaceId),
    onSuccess: async ({ workspace }) => {
      clearPendingInvite();
      setWorkspace(workspace);
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.invitations.pending });
    },
  });

  const decline = useMutation({
    mutationFn: () => declineInvitation(workspaceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    },
  });

  return { accept, decline };
}

export function useInvitationTokenMutations(token: string) {
  const queryClient = useQueryClient();
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const refreshUser = useAuth().refreshUser;

  const accept = useMutation({
    mutationFn: () => acceptInvitationByToken(token),
    onSuccess: async ({ workspace }) => {
      clearPendingInvite();
      setWorkspace(workspace);
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.invitations.pending });
    },
  });

  const decline = useMutation({
    mutationFn: () => declineInvitationByToken(token),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    },
  });

  return { accept, decline };
}

export function workspaceInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function formatWorkspaceRole(role?: string) {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}
