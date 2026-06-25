import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api";
import { Github, Mail } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const response = await login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });

      if (response.two_factor_required && response.login_token) {
        nav("/2fa", { state: { login_token: response.login_token } });
        return;
      }

      nav("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Sign in failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="text-2xl tracking-tight font-medium">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your Mailvoidr workspace</p>
      </div>
      <div className="mt-8 space-y-2.5">
        <SocialBtn icon={Github} label="Continue with GitHub" />
        <SocialBtn icon={Mail} label="Continue with Google" />
      </div>
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      {error && (
        <p className="mb-4 text-sm text-destructive" data-testid="login-error">{error}</p>
      )}
      <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" name="email" placeholder="you@company.com" />
        <Field
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          rightLabel={<Link to="/forgot-password" className="text-[11.5px] text-muted-foreground hover:text-foreground">Forgot?</Link>}
        />
        <button
          data-testid="login-submit"
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account? <Link to="/register" className="text-foreground hover:underline">Create one</Link>
      </p>
    </AuthLayout>
  );
}

function SocialBtn({ icon: Icon, label }: { icon: typeof Github; label: string }) {
  return (
    <button
      type="button"
      data-testid={`social-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="w-full flex items-center justify-center gap-2 border border-border bg-card hover:bg-accent rounded-md px-4 py-2 text-sm transition-colors"
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  rightLabel,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  rightLabel?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label-mono">{label}</label>
        {rightLabel}
      </div>
      <input
        data-testid={`field-${name}`}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
