import type { DashboardOverviewResponse, DashboardPeriod } from '@/types';
import { api } from '@/lib/api';

export async function fetchDashboardOverview(
  period: DashboardPeriod = '30d',
): Promise<DashboardOverviewResponse> {
  const { data } = await api.get<DashboardOverviewResponse>('/dashboard/overview', {
    params: { period },
  });
  return data;
}

export async function fetchDashboardActivity(): Promise<{
  data: DashboardOverviewResponse['activity'];
}> {
  const { data } = await api.get<{ data: DashboardOverviewResponse['activity'] }>(
    '/dashboard/activity',
  );
  return data;
}
