import { type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { Github, Mail } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from;
  const { login } = useAuth();
  const { loading, run } = useAsyncAction();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    await run(async () => {
      const response = await login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });

      if (response.two_factor_required && response.login_token) {
        nav("/2fa", { state: { login_token: response.login_token } });
        return;
      }

      nav(redirectTo || "/dashboard");
    }, { fallbackMessage: "Sign in failed" });
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="text-2xl tracking-tight font-medium">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your Mailvoidr workspace</p>
      </div>
      <div className="mt-8 space-y-2.5">
        <SocialBtn icon={Github} label="Continue with GitHub" disabled={loading} />
        <SocialBtn icon={Mail} label="Continue with Google" disabled={loading} />
      </div>
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={loading} className="space-y-4 border-0 p-0 m-0 min-w-0">
          <AuthField
            label="Email"
            type="email"
            name="email"
            placeholder="you@company.com"
            data-testid="field-email"
            required
            autoComplete="email"
          />
          <AuthField
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            data-testid="field-password"
            required
            autoComplete="current-password"
            rightLabel={<Link to="/forgot-password" className="text-[11.5px] text-muted-foreground hover:text-foreground">Forgot?</Link>}
          />
          <SubmitButton data-testid="login-submit" loading={loading} loadingText="Signing in…">
            Sign in
          </SubmitButton>
        </fieldset>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account? <Link to="/register" className="text-foreground hover:underline">Create one</Link>
      </p>
    </AuthLayout>
  );
}

function SocialBtn({
  icon: Icon,
  label,
  disabled,
}: {
  icon: typeof Github;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      data-testid={`social-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="w-full flex items-center justify-center gap-2 border border-border bg-card hover:bg-accent rounded-md px-4 py-2 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
