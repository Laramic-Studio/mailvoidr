import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { resendEmailOtp, verifyEmailOtp } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api";
import { Mail } from "lucide-react";

export default function VerifyEmail() {
  const nav = useNavigate();
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setDigit = (index: number, value: string) => {
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) {
      document.getElementById(`verify-otp-${index + 1}`)?.focus();
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyEmailOtp(code.join(""));
      await refreshUser();
      nav("/onboarding");
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid verification code"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setMessage(null);
    try {
      await resendEmailOtp();
      setMessage("A new verification code was sent.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not resend code"));
    }
  }

  return (
    <AuthLayout>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
        <Mail className="h-4 w-4" />
      </div>
      <h1 className="text-2xl tracking-tight font-medium">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-mono text-foreground">{user?.email ?? "your email"}</span>.
      </p>
      {error && <p className="mt-4 text-sm text-destructive" data-testid="verify-error">{error}</p>}
      {message && <p className="mt-4 text-sm text-primary" data-testid="verify-message">{message}</p>}
      <form data-testid="verify-form" onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-6 gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`verify-otp-${index}`}
              data-testid={`verify-otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => setDigit(index, e.target.value)}
              className="aspect-square text-center bg-card border border-border rounded-md text-xl font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ))}
        </div>
        <button
          data-testid="verify-continue"
          type="submit"
          disabled={loading || code.some((d) => !d)}
          className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify email"}
        </button>
      </form>
      <button
        type="button"
        onClick={handleResend}
        data-testid="verify-resend"
        className="mt-4 w-full border border-border bg-card rounded-md px-4 py-2.5 text-sm hover:bg-accent"
      >
        Resend code
      </button>
      <p className="mt-6 text-center text-[12.5px] text-muted-foreground">
        Wrong email? <Link to="/register" className="text-foreground hover:underline">Change it</Link>
      </p>
    </AuthLayout>
  );
}
