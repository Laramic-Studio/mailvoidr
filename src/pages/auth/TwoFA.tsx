import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { OtpInput } from "@/components/auth/OtpInput";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { toastError } from "@/lib/toast";
import { ShieldCheck } from "lucide-react";

const OTP_LENGTH = 6;

export default function TwoFA() {
  const nav = useNavigate();
  const location = useLocation();
  const { completeTwoFactor } = useAuth();
  const loginToken = (location.state as { login_token?: string } | null)?.login_token;
  const { loading, run } = useAsyncAction();
  const [code, setCode] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!loginToken) {
      toastError(new Error("Session expired. Please sign in again."));
      nav("/login");
      return;
    }

    await run(async () => {
      await completeTwoFactor({ login_token: loginToken, code });
      nav("/dashboard");
    }, { fallbackMessage: "Invalid authentication code" });
  }

  return (
    <AuthLayout>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <h1 className="text-2xl tracking-tight font-medium">Two-factor authentication</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the 6-digit code from your authenticator app. You can paste the full code.
      </p>
      <form data-testid="otp-form" onSubmit={handleSubmit} className="mt-8">
        <fieldset disabled={loading} className="border-0 p-0 m-0 min-w-0">
          <OtpInput
            data-testid="otp"
            value={code}
            onChange={setCode}
            disabled={loading}
            length={OTP_LENGTH}
          />
          <SubmitButton
            data-testid="otp-submit"
            className="mt-6"
            loading={loading}
            loadingText="Verifying…"
            disabled={code.length !== OTP_LENGTH}
          >
            Verify
          </SubmitButton>
        </fieldset>
      </form>
      <button
        type="button"
        disabled={loading}
        data-testid="otp-recovery"
        className="mt-4 w-full text-[12.5px] text-muted-foreground hover:text-foreground text-center disabled:opacity-60"
      >
        Use a recovery code instead
      </button>
    </AuthLayout>
  );
}
