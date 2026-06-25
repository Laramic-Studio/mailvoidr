const TOKEN_KEY = "mailvoidr_pending_invite_token";
const WORKSPACE_KEY = "mailvoidr_pending_invite_workspace";

export function storePendingInviteToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function storePendingInviteWorkspace(workspaceId: string) {
  sessionStorage.setItem(WORKSPACE_KEY, workspaceId);
}

export function readPendingInviteToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function readPendingInviteWorkspace(): string | null {
  return sessionStorage.getItem(WORKSPACE_KEY);
}

export function clearPendingInvite() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(WORKSPACE_KEY);
}

export function inviteAcceptPath(token?: string | null, workspaceId?: string | null): string | null {
  const resolvedToken = token ?? readPendingInviteToken();
  const resolvedWorkspace = workspaceId ?? readPendingInviteWorkspace();

  if (resolvedToken) {
    return `/invite?token=${encodeURIComponent(resolvedToken)}`;
  }
  if (resolvedWorkspace) {
    return `/invite?workspace=${encodeURIComponent(resolvedWorkspace)}`;
  }
  return null;
}

export function verifyEmailPath(token?: string | null): string {
  const pending = token ?? readPendingInviteToken();
  return pending
    ? `/verify-email?invite_token=${encodeURIComponent(pending)}`
    : "/verify-email";
}

export function postAuthDestination(
  user: { email_verified: boolean; onboarding_completed: boolean },
  options?: { inviteToken?: string | null; pendingWorkspaceId?: string | null },
): string {
  const inviteToken = options?.inviteToken ?? readPendingInviteToken();
  const pendingWorkspaceId = options?.pendingWorkspaceId ?? readPendingInviteWorkspace();

  if (!user.email_verified) {
    return verifyEmailPath(inviteToken);
  }

  if (!user.onboarding_completed) {
    const invitePath = inviteAcceptPath(inviteToken, pendingWorkspaceId);
    if (invitePath) {
      return invitePath;
    }
    return "/onboarding";
  }

  return "/dashboard";
}
