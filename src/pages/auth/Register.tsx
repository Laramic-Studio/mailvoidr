import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { Github, Mail, Check } from "lucide-react";

export default function Register() {
  const nav = useNavigate();
  return (
    <AuthLayout>
      <div>
        <h1 className="text-2xl tracking-tight font-medium">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Start sending in under 5 minutes. No credit card required.</p>
      </div>
      <div className="mt-8 space-y-2.5">
        <button data-testid="social-github" className="w-full flex items-center justify-center gap-2 border border-border bg-card hover:bg-accent rounded-md px-4 py-2 text-sm">
          <Github className="h-3.5 w-3.5" /> Continue with GitHub
        </button>
        <button data-testid="social-google" className="w-full flex items-center justify-center gap-2 border border-border bg-card hover:bg-accent rounded-md px-4 py-2 text-sm">
          <Mail className="h-3.5 w-3.5" /> Continue with Google
        </button>
      </div>
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <form data-testid="register-form" onSubmit={(e) => { e.preventDefault(); nav("/verify-email"); }} className="space-y-4">
        <div>
          <label className="label-mono block mb-1.5">Full name</label>
          <input data-testid="field-name" type="text" defaultValue="" placeholder="Riya Mehta" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Work email</label>
          <input data-testid="field-email" type="email" defaultValue="" placeholder="you@company.com" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Password</label>
          <input data-testid="field-password" type="password" defaultValue="" placeholder="At least 10 characters" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="mt-2 text-[11.5px] text-muted-foreground space-y-0.5">
            <div className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> 10+ characters</div>
            <div className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> One uppercase letter</div>
            <div className="flex items-center gap-1.5 text-muted-foreground/60"><Check className="h-3 w-3" /> One number</div>
          </div>
        </div>
        <button data-testid="register-submit" type="submit" className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
          Create account
        </button>
        <p className="text-[11.5px] text-muted-foreground text-center">
          By signing up, you agree to our <a href="#" className="text-foreground hover:underline">Terms</a> and <a href="#" className="text-foreground hover:underline">Privacy Policy</a>.
        </p>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Already have an account? <Link to="/login" className="text-foreground hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
