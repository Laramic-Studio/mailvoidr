import type {
  AnalyticsDomainsResponse,
  AnalyticsEngagementResponse,
  AnalyticsOverviewResponse,
  AnalyticsTemplatesResponse,
  DashboardPeriod,
} from '@/types';
import { api } from '@/lib/api';

export async function fetchAnalyticsOverview(
  period: DashboardPeriod = '30d',
): Promise<AnalyticsOverviewResponse> {
  const { data } = await api.get<AnalyticsOverviewResponse>('/analytics/overview', {
    params: { period },
  });
  return data;
}

export async function fetchAnalyticsEngagement(
  period: DashboardPeriod = '30d',
): Promise<AnalyticsEngagementResponse> {
  const { data } = await api.get<AnalyticsEngagementResponse>('/analytics/engagement', {
    params: { period },
  });
  return data;
}

export async function fetchAnalyticsDomains(
  period: DashboardPeriod = '30d',
): Promise<AnalyticsDomainsResponse> {
  const { data } = await api.get<AnalyticsDomainsResponse>('/analytics/domains', {
    params: { period },
  });
  return data;
}

export async function fetchAnalyticsTemplates(
  period: DashboardPeriod = '30d',
): Promise<AnalyticsTemplatesResponse> {
  const { data } = await api.get<AnalyticsTemplatesResponse>('/analytics/templates', {
    params: { period },
  });
  return data;
}
