import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function TwoFA() {
  const nav = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const set = (i, v) => {
    const next = [...code];
    next[i] = v.slice(-1);
    setCode(next);
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  return (
    <AuthLayout>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <h1 className="text-2xl tracking-tight font-medium">Two-factor authentication</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      <form data-testid="otp-form" onSubmit={(e) => { e.preventDefault(); nav("/onboarding"); }} className="mt-8">
        <div className="grid grid-cols-6 gap-2">
          {code.map((c, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              data-testid={`otp-${i}`}
              type="text"
              maxLength={1}
              value={c}
              onChange={(e) => set(i, e.target.value)}
              className="aspect-square text-center bg-card border border-border rounded-md text-xl font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ))}
        </div>
        <button data-testid="otp-submit" type="submit" className="mt-6 w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
          Verify
        </button>
      </form>
      <button data-testid="otp-recovery" className="mt-4 w-full text-[12.5px] text-muted-foreground hover:text-foreground text-center">
        Use a recovery code instead
      </button>
    </AuthLayout>
  );
}
