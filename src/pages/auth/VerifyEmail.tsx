import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { OtpInput } from "@/components/auth/OtpInput";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { resendEmailOtp, verifyEmailOtp } from "@/lib/api/auth";
import { toastError, toastSuccess } from "@/lib/toast";
import { Mail } from "lucide-react";

const OTP_LENGTH = 6;

export default function VerifyEmail() {
  const nav = useNavigate();
  const { user, refreshUser } = useAuth();
  const { loading, run } = useAsyncAction();
  const [resending, setResending] = useState(false);
  const [code, setCode] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await run(async () => {
      await verifyEmailOtp(code);
      await refreshUser();
      nav("/onboarding");
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

  const inputsDisabled = loading || resending;

  return (
    <AuthLayout>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
        <Mail className="h-4 w-4" />
      </div>
      <h1 className="text-2xl tracking-tight font-medium">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-mono text-foreground">{user?.email ?? "your email"}</span>.
        You can paste the full code into the first box.
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
        Wrong email? <Link to="/register" className="text-foreground hover:underline">Change it</Link>
      </p>
    </AuthLayout>
  );
}
