import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  verifyTwoFactor,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
  type TwoFactorPayload,
} from "@/lib/api/auth";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { User } from "@/types";

function applyAuthResponse(
  response: AuthResponse,
  setAccessToken: (token: string | null) => void,
): AuthResponse {
  if (response.two_factor_required && response.login_token) {
    return response;
  }

  if (response.access_token) {
    setAccessToken(response.access_token);
  }

  return response;
}

export function useMe() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    enabled: hydrated && Boolean(accessToken),
    retry: false,
  });
}

export function useAuth() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const clearWorkspace = useWorkspaceStore((s) => s.clearWorkspace);

  const meQuery = useMe();
  const user = meQuery.data ?? null;
  const isLoading = !hydrated || (Boolean(accessToken) && (meQuery.isLoading || meQuery.isFetching));
  const isAuthenticated = Boolean(accessToken) && !meQuery.isError;

  const invalidateMe = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.me });
  };

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      return applyAuthResponse(response, setAccessToken);
    },
    onSuccess: (response) => {
      if (!response.two_factor_required) {
        void invalidateMe();
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await registerRequest(payload);
      return applyAuthResponse(response, setAccessToken);
    },
    onSuccess: (response) => {
      if (!response.two_factor_required) {
        void invalidateMe();
      }
    },
  });

  const twoFactorMutation = useMutation({
    mutationFn: async (payload: TwoFactorPayload) => {
      const response = await verifyTwoFactor(payload);
      applyAuthResponse(response, setAccessToken);
    },
    onSuccess: () => {
      void invalidateMe();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession();
      clearWorkspace();
      queryClient.removeQueries({ queryKey: queryKeys.me });
      queryClient.removeQueries({ queryKey: queryKeys.onboarding.status });
    },
  });

  const setSession = (nextUser: User, token: string) => {
    setAccessToken(token);
    queryClient.setQueryData(queryKeys.me, nextUser);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    completeTwoFactor: twoFactorMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshUser: invalidateMe,
    setSession,
  };
}

export function useAuthBootstrap() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateWorkspace = useWorkspaceStore((s) => s.hydrate);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const meQuery = useMe();

  useEffect(() => {
    hydrateAuth();
    hydrateWorkspace();
  }, [hydrateAuth, hydrateWorkspace]);

  useEffect(() => {
    if (meQuery.isError) {
      clearSession();
    }
  }, [meQuery.isError, clearSession]);
}
