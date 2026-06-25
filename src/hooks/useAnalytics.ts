import { useQuery } from '@tanstack/react-query';
import {
  fetchAnalyticsDomains,
  fetchAnalyticsEngagement,
  fetchAnalyticsOverview,
  fetchAnalyticsTemplates,
} from '@/lib/api/analytics';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';
import type { DashboardPeriod } from '@/types';

export function useAnalyticsOverview(period: DashboardPeriod = '30d') {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.overview(period),
    queryFn: () => fetchAnalyticsOverview(period),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useAnalyticsEngagement(period: DashboardPeriod = '30d') {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.engagement(period),
    queryFn: () => fetchAnalyticsEngagement(period),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useAnalyticsDomains(period: DashboardPeriod = '30d') {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.domains(period),
    queryFn: () => fetchAnalyticsDomains(period),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useAnalyticsTemplates(period: DashboardPeriod = '30d') {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.templates(period),
    queryFn: () => fetchAnalyticsTemplates(period),
    enabled: Boolean(user?.onboarding_completed),
  });
}
