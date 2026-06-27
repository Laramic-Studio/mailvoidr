import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { OtpInput } from "@/components/auth/OtpInput";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { resendEmailOtp, verifyEmailOtp } from "@/lib/api/auth";
import { fetchPendingInvitations } from "@/lib/api/workspaces";
import {
  inviteAcceptPath,
  readPendingInviteToken,
  storePendingInviteToken,
  storePendingInviteWorkspace,
} from "@/lib/invite-flow";
import { toastError, toastSuccess } from "@/lib/toast";
import { Mail } from "lucide-react";

const OTP_LENGTH = 6;

async function resolvePostVerifyDestination(inviteToken: string | null): Promise<string> {
  const token = inviteToken ?? readPendingInviteToken();
  if (token) {
    storePendingInviteToken(token);
    const invitePath = inviteAcceptPath(token);
    if (invitePath) return invitePath;
  }

  try {
    const pending = await fetchPendingInvitations();
    const first = pending.data[0];
    if (first) {
      if (first.invite_token) {
        storePendingInviteToken(first.invite_token);
        return inviteAcceptPath(first.invite_token)!;
      }
      storePendingInviteWorkspace(first.workspace_id);
      return inviteAcceptPath(null, first.workspace_id)!;
    }
  } catch {
    // Fall through to onboarding when pending invites cannot be loaded.
  }

  return "/onboarding";
}

export default function VerifyEmail() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite_token");
  const { user, refreshUser, logout } = useAuth();
  const { loading, run } = useAsyncAction();
  const [resending, setResending] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [code, setCode] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await run(async () => {
      await verifyEmailOtp(code);
      await refreshUser();
      const destination = await resolvePostVerifyDestination(inviteToken);
      nav(destination);
    }, { fallbackMessage: "Invalid verification code" });
  }

  async function handleResend() {
    setResending(true);
    setCode("");
    try {
      await resendEmailOtp();
      toastSuccess("A new verification code was sent.");
    } catch (err) {
      toastError(err, "Could not resend code");
    } finally {
      setResending(false);
    }
  }

  async function handleChangeEmail() {
    setChangingEmail(true);
    try {
      await logout();
    } catch {
      // Session is cleared in logout onSettled even when the API call fails.
    } finally {
      const href = inviteToken
        ? `/register?invite_token=${encodeURIComponent(inviteToken)}`
        : "/register";
      nav(href, { replace: true });
      setChangingEmail(false);
    }
  }

  const inputsDisabled = loading || resending || changingEmail;

  return (
    <AuthLayout>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
        <Mail className="h-4 w-4" />
      </div>
      <h1 className="text-2xl tracking-tight font-medium">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-mono text-foreground">{user?.email ?? "your email"}</span>.
        {inviteToken || readPendingInviteToken() ? (
          <> After verifying, you&apos;ll return to your workspace invitation.</>
        ) : null}
      </p>
      <form data-testid="verify-form" onSubmit={handleSubmit} className="mt-8 space-y-6">
        <fieldset disabled={inputsDisabled} className="space-y-6 border-0 p-0 m-0 min-w-0">
          <OtpInput
            data-testid="verify-otp"
            value={code}
            onChange={setCode}
            disabled={inputsDisabled}
            length={OTP_LENGTH}
          />
          <SubmitButton
            data-testid="verify-continue"
            loading={loading}
            loadingText="Verifying…"
            disabled={code.length !== OTP_LENGTH}
          >
            Verify email
          </SubmitButton>
        </fieldset>
      </form>
      <button
        type="button"
        onClick={handleResend}
        disabled={inputsDisabled}
        data-testid="verify-resend"
        className="mt-4 w-full border border-border bg-card rounded-md px-4 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>
      <p className="mt-6 text-center text-[12.5px] text-muted-foreground">
        Wrong email?{" "}
        <button
          type="button"
          onClick={handleChangeEmail}
          disabled={inputsDisabled}
          className="text-foreground hover:underline disabled:opacity-60"
        >
          {changingEmail ? "Signing out…" : "Change it"}
        </button>
      </p>
    </AuthLayout>
  );
}
