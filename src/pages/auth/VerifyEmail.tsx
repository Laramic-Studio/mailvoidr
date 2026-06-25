import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

export default function VerifyEmail() {
  const nav = useNavigate();
  return (
    <AuthLayout>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
        <Mail className="h-4 w-4" />
      </div>
      <h1 className="text-2xl tracking-tight font-medium">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a verification link to <span className="font-mono text-foreground">riya@acme.com</span>. Click the link to activate your account.
      </p>
      <div className="mt-8 space-y-3">
        <button onClick={() => nav("/2fa")} data-testid="verify-continue" className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
          I've verified my email
        </button>
        <button data-testid="verify-resend" className="w-full border border-border bg-card rounded-md px-4 py-2.5 text-sm hover:bg-accent">
          Resend email
        </button>
      </div>
      <p className="mt-6 text-center text-[12.5px] text-muted-foreground">
        Wrong email? <Link to="/register" className="text-foreground hover:underline">Change it</Link>
      </p>
    </AuthLayout>
  );
}
