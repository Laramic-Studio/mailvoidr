import { useEffect } from "react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import {
  formatWorkspaceRole,
  useInvitation,
  useInvitationByToken,
  useInvitationMutations,
  useInvitationTokenMutations,
  workspaceInitials,
} from "@/hooks/useWorkspaces";
import {
  inviteAcceptPath,
  storePendingInviteToken,
  storePendingInviteWorkspace,
} from "@/lib/invite-flow";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

function InvitationSummary({
  workspaceName,
  workspaceSlug,
  role,
}: {
  workspaceName: string;
  workspaceSlug: string;
  role: string;
}) {
  return (
    <div className="mt-6 border border-border bg-card p-4 text-left">
      <div className="label-mono">Workspace</div>
      <div className="mt-1.5 flex items-center gap-2.5">
        <div className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-primary/30 bg-primary/20 font-mono text-[10px]">
          {workspaceInitials(workspaceName)}
        </div>
        <div>
          <div className="text-sm">{workspaceName}</div>
          <div className="font-mono text-[11.5px] text-muted-foreground">{workspaceSlug}</div>
        </div>
      </div>
      <div className="mt-4 label-mono">Your role</div>
      <div className="mt-1.5 inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {formatWorkspaceRole(role)}
      </div>
    </div>
  );
}

export default function InviteAccept() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const workspaceId = params.get("workspace");
  const inviteToken = params.get("token");
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const workspaceInvite = useInvitation(workspaceId);
  const tokenInvite = useInvitationByToken(inviteToken);
  const invitation = inviteToken ? tokenInvite.data : workspaceInvite.data;
  const isLoading = inviteToken ? tokenInvite.isLoading : workspaceInvite.isLoading;
  const isError = inviteToken ? tokenInvite.isError : workspaceInvite.isError;
  const workspaceMutations = useInvitationMutations(workspaceId ?? "");
  const tokenMutations = useInvitationTokenMutations(inviteToken ?? "");
  const { accept, decline } = inviteToken ? tokenMutations : workspaceMutations;
  const { loading: submitting, run } = useAsyncAction();

  useEffect(() => {
    if (inviteToken) {
      storePendingInviteToken(inviteToken);
    } else if (workspaceId) {
      storePendingInviteWorkspace(workspaceId);
    }
  }, [inviteToken, workspaceId]);

  const registerHref = inviteToken
    ? `/register?invite_token=${encodeURIComponent(inviteToken)}`
    : "/register";
  const loginHref = inviteToken
    ? `/login?invite_token=${encodeURIComponent(inviteToken)}`
    : "/login";
  const loginState = workspaceId ? { from: inviteAcceptPath(null, workspaceId) } : undefined;

  async function handleAccept() {
    if (inviteToken) {
      await run(async () => {
        const result = await accept.mutateAsync();
        nav(result.redirect || "/dashboard");
      }, { fallbackMessage: "Could not accept invitation" });
      return;
    }

    if (!workspaceId) return;

    await run(async () => {
      const result = await accept.mutateAsync();
      nav(result.redirect || "/dashboard");
    }, { fallbackMessage: "Could not accept invitation" });
  }

  async function handleDecline() {
    if (inviteToken) {
      await run(async () => {
        const result = await decline.mutateAsync();
        nav(result.redirect || "/dashboard");
      }, { fallbackMessage: "Could not decline invitation" });
      return;
    }

    if (!workspaceId) return;

    await run(async () => {
      const result = await decline.mutateAsync();
      nav(result.redirect || "/dashboard");
    }, { fallbackMessage: "Could not decline invitation" });
  }

  if (authLoading || isLoading) {
    return (
      <AuthLayout side="left">
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  if ((!workspaceId && !inviteToken) || isError || !invitation) {
    if (!isAuthenticated && workspaceId && !inviteToken) {
      return (
        <AuthLayout side="left">
          <div className="text-center">
            <h1 className="mt-4 text-2xl font-medium tracking-tight">You&apos;ve been invited</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to view and accept this workspace invitation.</p>
            <Link
              to={loginHref}
              state={loginState}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in to accept
            </Link>
          </div>
        </AuthLayout>
      );
    }

    return (
      <AuthLayout side="left">
        <div className="text-center">
          <h1 className="text-2xl tracking-tight font-medium">Invitation not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invite may have expired or already been handled.
          </p>
          <button
            type="button"
            onClick={() => nav("/dashboard")}
            className="mt-6 text-sm text-primary hover:underline"
          >
            Go to dashboard
          </button>
        </div>
      </AuthLayout>
    );
  }

  const { workspace, role, invited_by: invitedBy, email, requires_signup: requiresSignup } = invitation;

  if (!isAuthenticated) {
    return (
      <AuthLayout side="left">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary font-mono text-primary-foreground">
            {workspaceInitials(workspace.name)}
          </div>
          <h1 className="mt-4 text-2xl font-medium tracking-tight">Join {workspace.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {invitedBy ? (
              <>
                <span className="text-foreground">{invitedBy.name}</span> invited you to collaborate on Mailvoidr.
              </>
            ) : (
              <>You&apos;ve been invited to collaborate on Mailvoidr.</>
            )}
            {email ? (
              <>
                {" "}
                Use <span className="font-mono text-foreground">{email}</span> when signing up.
              </>
            ) : null}
          </p>

          <InvitationSummary
            workspaceName={workspace.name}
            workspaceSlug={workspace.slug}
            role={role}
          />

          <div className="mt-6 space-y-2">
            {requiresSignup !== false ? (
              <Link
                to={registerHref}
                data-testid="invite-create-account"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create account to accept
              </Link>
            ) : (
              <Link
                to={loginHref}
                state={loginState}
                data-testid="invite-sign-in"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign in to accept
              </Link>
            )}
            {requiresSignup !== false ? (
              <p className="text-[12.5px] text-muted-foreground">
                Already have an account?{" "}
                <Link to={loginHref} state={loginState} className="text-foreground hover:underline">
                  Sign in
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout side="left">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary font-mono text-primary-foreground">
          {workspaceInitials(workspace.name)}
        </div>
        <h1 className="mt-4 text-2xl font-medium tracking-tight">You&apos;ve been invited</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {invitedBy ? (
            <>
              <span className="text-foreground">{invitedBy.name}</span> invited you to join{" "}
              <span className="font-medium text-foreground">{workspace.name}</span>.
            </>
          ) : (
            <>
              Join <span className="font-medium text-foreground">{workspace.name}</span> on Mailvoidr.
            </>
          )}
        </p>

        <InvitationSummary
          workspaceName={workspace.name}
          workspaceSlug={workspace.slug}
          role={role}
        />

        <SubmitButton
          type="button"
          data-testid="invite-accept"
          onClick={handleAccept}
          loading={submitting}
          loadingText="Accepting…"
          className="mt-6"
        >
          Accept invitation
        </SubmitButton>
        <button
          type="button"
          data-testid="invite-decline"
          disabled={submitting}
          onClick={handleDecline}
          className="mt-2 w-full text-[12.5px] text-muted-foreground hover:text-foreground disabled:opacity-60"
        >
          Decline
        </button>
      </div>
    </AuthLayout>
  );
}
