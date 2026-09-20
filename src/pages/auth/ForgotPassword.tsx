import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { SubmitButton } from "@/components/SubmitButton";
import { forgotPassword } from "@/lib/api/auth";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const nav = useNavigate();
  const { loading, run } = useAsyncAction();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();

    await run(async () => {
      await forgotPassword(email);
      nav(`/verify-reset-code?email=${encodeURIComponent(email)}`);
    }, { fallbackMessage: "Could not send reset code" });
  }

  return (
    <AuthLayout>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-3 h-3" /> Back to sign in
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-2xl font-medium tracking-tight">Forgot password?</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Enter your email and we&apos;ll send a 6-digit reset code.</p>
        <form data-testid="forgot-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
          <fieldset disabled={loading} className="min-w-0 p-0 m-0 space-y-4 border-0">
            <AuthField
              label="Email"
              name="email"
              type="email"
              required
              data-testid="field-email"
              autoComplete="email"
              placeholder="example@gmail.com"
            />
            <SubmitButton data-testid="forgot-submit" loading={loading} loadingText="Sending…">
              Send reset code
            </SubmitButton>
          </fieldset>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
