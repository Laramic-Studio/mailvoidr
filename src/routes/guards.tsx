import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  inviteAcceptPath,
  postAuthDestination,
  readPendingInviteToken,
} from "@/lib/invite-flow";

export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
      Loading…
    </div>
  );
}

/** Requires a valid JWT session. */
export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}

/** Login, register, etc. — redirect away if already signed in. */
export function GuestLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    if (!user) {
      return <AuthLoading />;
    }

    const inviteToken =
      new URLSearchParams(location.search).get("invite_token") ?? readPendingInviteToken();

    return <Navigate to={postAuthDestination(user, { inviteToken })} replace />;
  }

  return <Outlet />;
}

/** After auth: enforce verify-email → invite or onboarding → dashboard. */
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
    return <Navigate to={postAuthDestination(user)} replace />;
  }

  if (user.email_verified && !user.onboarding_completed && path !== "/onboarding") {
    const invitePath = inviteAcceptPath();
    if (invitePath) {
      return <Navigate to={invitePath} replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  if (user.onboarding_completed && path === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
