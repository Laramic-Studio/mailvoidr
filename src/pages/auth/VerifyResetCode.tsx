import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { OtpInput } from "@/components/auth/OtpInput";
import { SubmitButton } from "@/components/SubmitButton";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { forgotPassword, verifyPasswordResetCode } from "@/lib/api/auth";
import { toastError, toastSuccess } from "@/lib/toast";
import { ArrowLeft, Mail } from "lucide-react";

const OTP_LENGTH = 6;

export default function VerifyResetCode() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { loading, run } = useAsyncAction();
  const [resending, setResending] = useState(false);
  const [code, setCode] = useState("");

  const email = params.get("email") ?? "";

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await run(async () => {
      const token = await verifyPasswordResetCode(email, code);
      nav(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, { replace: true });
    }, { fallbackMessage: "Invalid or expired code" });
  }

  async function handleResend() {
    setResending(true);
    setCode("");
    try {
      await forgotPassword(email);
      toastSuccess("If this email exist you should receieve a reset password code.");
    } catch (err) {
      toastError(err, "Could not resend code");
    } finally {
      setResending(false);
    }
  }

  const disabled = loading || resending;

  return (
    <AuthLayout>
      <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-3 h-3" /> Use a different email
      </Link>
      {/* <div className="inline-flex items-center justify-center w-10 h-10 mb-5 border rounded-md bg-primary/15 border-primary/30 text-primary">
        <Mail className="w-4 h-4" />
      </div> */}
      <h1 className="text-2xl font-medium tracking-tight">Enter reset code</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        If an account exists for <span className="font-mono text-foreground">{email}</span>, we sent a 6-digit code.
      </p>
      <form data-testid="verify-reset-form" onSubmit={handleSubmit} className="mt-8 space-y-6">
        <fieldset disabled={disabled} className="min-w-0 p-0 m-0 space-y-6 border-0">
          <OtpInput
            data-testid="verify-reset-otp"
            value={code}
            onChange={setCode}
            disabled={disabled}
            length={OTP_LENGTH}
          />
          <SubmitButton
            data-testid="verify-reset-continue"
            loading={loading}
            loadingText="Verifying…"
            disabled={code.length !== OTP_LENGTH}
          >
            Continue
          </SubmitButton>
        </fieldset>
      </form>
      <button
        type="button"
        onClick={handleResend}
        disabled={disabled}
        data-testid="verify-reset-resend"
        className="mt-4 w-full border border-border bg-card rounded-md px-4 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>
    </AuthLayout>
  );
}
