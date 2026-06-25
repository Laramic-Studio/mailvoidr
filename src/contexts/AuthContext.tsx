import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  REFRESH_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
} from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const setSession = useCallback(
    (nextUser: User, accessToken: string, refreshToken: string) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      setUser(nextUser);
    },
    [],
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  const isAuthenticated = bypassAuth || Boolean(user) || Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      setSession,
      clearSession,
    }),
    [user, isAuthenticated, isLoading, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
