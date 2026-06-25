import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { SubmitButton } from "@/components/SubmitButton";
import { forgotPassword } from "@/lib/api/auth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const { loading, run } = useAsyncAction();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = String(form.get("email"));
    setEmail(value);

    await run(async () => {
      await forgotPassword(value);
      setSent(true);
    }, { fallbackMessage: "Could not send reset link" });
  }

  return (
    <AuthLayout>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-3 w-3" /> Back to sign in
      </Link>
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl tracking-tight font-medium">Forgot password?</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Enter your email and we&apos;ll send a reset link.</p>
            <form data-testid="forgot-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
              <fieldset disabled={loading} className="space-y-4 border-0 p-0 m-0 min-w-0">
                <AuthField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  data-testid="field-email"
                  autoComplete="email"
                />
                <SubmitButton data-testid="forgot-submit" loading={loading} loadingText="Sending…">
                  Send reset link
                </SubmitButton>
              </fieldset>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="confirmation"
            data-testid="forgot-confirmation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary mb-5">
              <Mail className="h-4 w-4" />
            </div>
            <h1 className="text-2xl tracking-tight font-medium">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              If an account exists for <span className="font-mono text-foreground">{email}</span>, we sent a password reset link.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
