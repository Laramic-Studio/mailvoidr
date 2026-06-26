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

export type AnalyticsExportType = 'sends' | 'engagement';

function parseFilename(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) return fallback;
  const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return match?.[1] ?? fallback;
}

export async function downloadAnalyticsExport(
  type: AnalyticsExportType,
  period: DashboardPeriod = '30d',
): Promise<void> {
  const response = await api.get(`/analytics/export/${type}`, {
    params: { period },
    responseType: 'blob',
  });

  const fallback = `mailvoidr-${type}-${period}.csv`;
  const filename = parseFilename(response.headers['content-disposition'], fallback);
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
