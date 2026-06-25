import { useQuery } from '@tanstack/react-query';
import { searchDashboard } from '@/lib/api/search';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useGlobalSearch(query: string, enabled: boolean) {
  const { user } = useAuth();
  const trimmed = query.trim();

  return useQuery({
    queryKey: queryKeys.search.global(trimmed),
    queryFn: () => searchDashboard(trimmed),
    enabled: enabled && Boolean(user?.onboarding_completed) && trimmed.length >= 1,
    staleTime: 30_000,
  });
}
