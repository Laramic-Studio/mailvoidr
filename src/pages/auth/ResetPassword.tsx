import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export default function ResetPassword() {
  const nav = useNavigate();
  return (
    <AuthLayout>
      <h1 className="text-2xl tracking-tight font-medium">Set a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Make sure it's at least 10 characters and different from your previous one.</p>
      <form data-testid="reset-form" onSubmit={(e) => { e.preventDefault(); nav("/login"); }} className="mt-8 space-y-4">
        <div>
          <label className="label-mono block mb-1.5">New password</label>
          <input data-testid="field-password" type="password" defaultValue="" placeholder="••••••••••" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Confirm password</label>
          <input data-testid="field-confirm" type="password" defaultValue="" placeholder="••••••••••" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="text-[11.5px] text-muted-foreground space-y-0.5">
          {["10+ characters", "One uppercase letter", "One number", "Different from previous password"].map((r) => (
            <div key={r} className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> {r}</div>
          ))}
        </div>
        <button data-testid="reset-submit" type="submit" className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
          Reset password
        </button>
      </form>
    </AuthLayout>
  );
}
