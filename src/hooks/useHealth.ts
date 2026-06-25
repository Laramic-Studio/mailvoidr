import { useQuery } from "@tanstack/react-query";
import { checkHealth } from "@/lib/api";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: checkHealth,
    retry: 1,
    staleTime: 30_000,
  });
}
