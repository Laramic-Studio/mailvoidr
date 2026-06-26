import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { fetchMe } from "@/lib/api/auth";
import { postAuthDestination } from "@/lib/invite-flow";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";

export default function OAuthCallback() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    window.history.replaceState(null, "", window.location.pathname);

    const errorMessage = params.get("error");
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    if (params.get("two_factor_required") === "true") {
      const loginToken = params.get("login_token");
      if (!loginToken) {
        setError("Missing login session. Please sign in again.");
        return;
      }

      nav("/2fa", { replace: true, state: { login_token: loginToken } });
      return;
    }

    const token = params.get("access_token");
    if (!token) {
      setError("No access token received. Please try signing in again.");
      return;
    }

    setAccessToken(token);

    fetchMe()
      .then((user) => {
        queryClient.setQueryData(queryKeys.me, user);
        nav(postAuthDestination(user), { replace: true });
      })
      .catch(() => {
        setAccessToken(null);
        setError("Signed in but could not load your profile. Please try again.");
      });
  }, [nav, queryClient, setAccessToken]);

  if (error) {
    return (
      <AuthLayout>
        <h1 className="text-2xl tracking-tight font-medium">Sign in failed</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          <Link to="/login" className="text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <p className="text-sm text-muted-foreground">Completing sign in…</p>
    </AuthLayout>
  );
}
