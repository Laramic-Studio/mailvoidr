import { useQuery } from '@tanstack/react-query';
import { fetchDashboardOverview } from '@/lib/api/dashboard';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';
import type { DashboardPeriod } from '@/types';

export function useDashboardOverview(period: DashboardPeriod = '30d') {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.overview(period),
    queryFn: () => fetchDashboardOverview(period),
    enabled: Boolean(user?.onboarding_completed),
  });
}
