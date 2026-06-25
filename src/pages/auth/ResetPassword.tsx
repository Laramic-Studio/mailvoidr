import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { resetPassword } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api";
import { Check } from "lucide-react";

export default function ResetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));

    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: String(form.get("password_confirmation")),
      });
      nav("/login");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not reset password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl tracking-tight font-medium">Set a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Use at least 8 characters.</p>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <form data-testid="reset-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label-mono block mb-1.5">New password</label>
          <input data-testid="field-password" name="password" type="password" required minLength={8} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Confirm password</label>
          <input data-testid="field-confirm" name="password_confirmation" type="password" required minLength={8} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="text-[11.5px] text-muted-foreground space-y-0.5">
          {["8+ characters", "Matching confirmation"].map((r) => (
            <div key={r} className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> {r}</div>
          ))}
        </div>
        <button data-testid="reset-submit" type="submit" disabled={loading || !token || !email} className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}
