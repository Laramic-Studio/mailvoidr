import { type FormEvent, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvitationByToken } from "@/hooks/useWorkspaces";
import { storePendingInviteToken, verifyEmailPath } from "@/lib/invite-flow";
import { startOAuth } from "@/lib/oauth";
import { Github, Mail, Check } from "lucide-react";

export default function Register() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite_token");
  const invitePreview = useInvitationByToken(inviteToken);
  const { register } = useAuth();
  const { loading, run } = useAsyncAction();

  useEffect(() => {
    if (inviteToken) {
      storePendingInviteToken(inviteToken);
    }
  }, [inviteToken]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));

    await run(async () => {
      if (inviteToken) {
        storePendingInviteToken(inviteToken);
      }

      await register({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password,
        password_confirmation: password,
        invite_token: inviteToken ?? undefined,
      });

      nav(verifyEmailPath(inviteToken));
    }, { fallbackMessage: "Registration failed" });
  }

  const loginHref = inviteToken
    ? `/login?invite_token=${encodeURIComponent(inviteToken)}`
    : "/login";

  return (
    <AuthLayout>
      <div>
        <h1 className="text-2xl tracking-tight font-medium">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {invitePreview.data?.workspace
            ? `Join ${invitePreview.data.workspace.name} on Mailvoidr.`
            : "Start sending in under 5 minutes. No credit card required."}
        </p>
      </div>
      <div className="mt-8 space-y-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => startOAuth("github", inviteToken)}
          data-testid="social-github"
          className="w-full flex items-center justify-center gap-2 border border-border bg-card hover:bg-accent rounded-md px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Github className="h-3.5 w-3.5" /> Continue with GitHub
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => startOAuth("google", inviteToken)}
          data-testid="social-google"
          className="w-full flex items-center justify-center gap-2 border border-border bg-card hover:bg-accent rounded-md px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Mail className="h-3.5 w-3.5" /> Continue with Google
        </button>
      </div>
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <form data-testid="register-form" onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={loading} className="space-y-4 border-0 p-0 m-0 min-w-0">
          <AuthField
            label="Full name"
            name="name"
            type="text"
            required
            placeholder="Riya Mehta"
            data-testid="field-name"
            autoComplete="name"
          />
          <AuthField
            label="Work email"
            name="email"
            type="email"
            required
            defaultValue={invitePreview.data?.email ?? ""}
            readOnly={Boolean(invitePreview.data?.email)}
            placeholder="you@company.com"
            data-testid="field-email"
            autoComplete="email"
          />
          <div>
            <AuthField
              label="Password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              data-testid="field-password"
              autoComplete="new-password"
            />
            <div className="mt-2 text-[11.5px] text-muted-foreground space-y-0.5">
              <div className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> 8+ characters</div>
            </div>
          </div>
          <SubmitButton data-testid="register-submit" loading={loading} loadingText="Creating account…">
            Create account
          </SubmitButton>
          <p className="text-[11.5px] text-muted-foreground text-center">
            By signing up, you agree to our <a href="#" className="text-foreground hover:underline">Terms</a> and <a href="#" className="text-foreground hover:underline">Privacy Policy</a>.
          </p>
        </fieldset>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Already have an account? <Link to={loginHref} className="text-foreground hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
