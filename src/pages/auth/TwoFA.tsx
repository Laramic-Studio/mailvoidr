import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export default function TwoFA() {
  const nav = useNavigate();
  const location = useLocation();
  const { completeTwoFactor } = useAuth();
  const loginToken = (location.state as { login_token?: string } | null)?.login_token;
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setDigit = (index: number, value: string) => {
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!loginToken) {
      setError("Session expired. Please sign in again.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await completeTwoFactor({ login_token: loginToken, code: code.join("") });
      nav("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid authentication code"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <h1 className="text-2xl tracking-tight font-medium">Two-factor authentication</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      {error && <p className="mt-4 text-sm text-destructive" data-testid="otp-error">{error}</p>}
      <form data-testid="otp-form" onSubmit={handleSubmit} className="mt-8">
        <div className="grid grid-cols-6 gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              data-testid={`otp-${index}`}
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
          data-testid="otp-submit"
          type="submit"
          disabled={loading || code.some((d) => !d)}
          className="mt-6 w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
      <button type="button" data-testid="otp-recovery" className="mt-4 w-full text-[12.5px] text-muted-foreground hover:text-foreground text-center">
        Use a recovery code instead
      </button>
    </AuthLayout>
  );
}
