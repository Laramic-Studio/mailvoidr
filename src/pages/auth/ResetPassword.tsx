import { type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { SubmitButton } from "@/components/SubmitButton";
import { resetPassword } from "@/lib/api/auth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { Check } from "lucide-react";

export default function ResetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { loading, run } = useAsyncAction();

  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));

    await run(async () => {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: String(form.get("password_confirmation")),
      });
      nav("/login");
    }, {
      fallbackMessage: "Could not reset password",
      successMessage: "Password updated. You can sign in now.",
    });
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl tracking-tight font-medium">Set a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Use at least 8 characters.</p>
      <form data-testid="reset-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
        <fieldset disabled={loading} className="space-y-4 border-0 p-0 m-0 min-w-0">
          <AuthField
            label="New password"
            name="password"
            type="password"
            required
            minLength={8}
            data-testid="field-password"
            autoComplete="new-password"
          />
          <AuthField
            label="Confirm password"
            name="password_confirmation"
            type="password"
            required
            minLength={8}
            data-testid="field-confirm"
            autoComplete="new-password"
          />
          <div className="text-[11.5px] text-muted-foreground space-y-0.5">
            {["8+ characters", "Matching confirmation"].map((r) => (
              <div key={r} className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> {r}</div>
            ))}
          </div>
          <SubmitButton
            data-testid="reset-submit"
            loading={loading}
            loadingText="Resetting…"
            disabled={!token || !email}
          >
            Reset password
          </SubmitButton>
        </fieldset>
      </form>
    </AuthLayout>
  );
}
