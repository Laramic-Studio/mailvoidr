import { AuthLayout } from "@/components/layouts/AuthLayout";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import {
  formatWorkspaceRole,
  useInvitation,
  useInvitationMutations,
  workspaceInitials,
} from "@/hooks/useWorkspaces";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function InviteAccept() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const workspaceId = params.get("workspace");
  const { isLoading: authLoading } = useAuth();
  const { data: invitation, isLoading, isError } = useInvitation(workspaceId);
  const { accept, decline } = useInvitationMutations(workspaceId ?? "");
  const { loading: submitting, run } = useAsyncAction();

  async function handleAccept() {
    if (!workspaceId) return;

    await run(async () => {
      const result = await accept.mutateAsync();
      nav(result.redirect || "/dashboard");
    }, { fallbackMessage: "Could not accept invitation" });
  }

  async function handleDecline() {
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

  if (!workspaceId || isError || !invitation) {
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

  const { workspace, role, invited_by: invitedBy } = invitation;

  return (
    <AuthLayout side="left">
      <div className="text-center">
        <div className="h-12 w-12 rounded-md bg-primary text-primary-foreground inline-flex items-center justify-center font-mono">
          {workspaceInitials(workspace.name)}
        </div>
        <h1 className="mt-4 text-2xl tracking-tight font-medium">You&apos;ve been invited</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {invitedBy ? (
            <>
              <span className="text-foreground">{invitedBy.name}</span> invited you to join{" "}
              <span className="text-foreground font-medium">{workspace.name}</span> on Mailvoidr.
            </>
          ) : (
            <>
              Join <span className="text-foreground font-medium">{workspace.name}</span> on Mailvoidr.
            </>
          )}
        </p>
        <div className="mt-6 border border-border bg-card p-4 text-left">
          <div className="label-mono">Workspace</div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-primary/20 border border-primary/30 inline-flex items-center justify-center font-mono text-[10px]">
              {workspaceInitials(workspace.name)}
            </div>
            <div>
              <div className="text-sm">{workspace.name}</div>
              <div className="text-[11.5px] text-muted-foreground font-mono">{workspace.slug}</div>
            </div>
          </div>
          <div className="mt-4 label-mono">Your role</div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {formatWorkspaceRole(role)}
          </div>
        </div>
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
