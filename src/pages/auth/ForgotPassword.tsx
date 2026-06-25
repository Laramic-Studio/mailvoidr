import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { forgotPassword } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const value = String(form.get("email"));
    setEmail(value);

    try {
      await forgotPassword(value);
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send reset link"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-3 w-3" /> Back to sign in
      </Link>
      {!sent ? (
        <>
          <h1 className="text-2xl tracking-tight font-medium">Forgot password?</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Enter your email and we&apos;ll send a reset link.</p>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <form data-testid="forgot-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label-mono block mb-1.5">Email</label>
              <input data-testid="field-email" name="email" type="email" required className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button data-testid="forgot-submit" type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      ) : (
        <div data-testid="forgot-confirmation">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
            <Mail className="h-4 w-4" />
          </div>
          <h1 className="text-2xl tracking-tight font-medium">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for <span className="font-mono text-foreground">{email}</span>, we sent a password reset link.
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
