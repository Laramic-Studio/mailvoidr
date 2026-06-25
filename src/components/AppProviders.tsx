import { useAuthBootstrap } from "@/hooks/useAuth";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  return children;
}
