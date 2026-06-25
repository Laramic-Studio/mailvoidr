import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
      Loading…
    </div>
  );
}

function postAuthRedirect(user: NonNullable<ReturnType<typeof useAuth>["user"]>) {
  if (!user.email_verified) {
    return "/verify-email";
  }

  if (!user.onboarding_completed) {
    return "/onboarding";
  }

  return "/dashboard";
}

/** Requires a valid JWT session. */
export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Login, register, etc. — redirect away if already signed in. */
export function GuestLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    if (!user) {
      return <AuthLoading />;
    }

    return <Navigate to={postAuthRedirect(user)} replace />;
  }

  return <Outlet />;
}

/** After auth: enforce verify-email → onboarding → dashboard order. */
export function OnboardingLayout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: path }} />;
  }

  if (!user.email_verified && path !== "/verify-email") {
    return <Navigate to="/verify-email" replace />;
  }

  if (user.email_verified && !user.onboarding_completed && path !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.onboarding_completed && path === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
