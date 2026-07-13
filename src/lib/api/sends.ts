import type {
  EmailSendLogDetailResponse,
  EmailSendLogListResponse,
  SendLogFilters,
} from '@/types';
import { api } from '@/lib/api';

export async function fetchSends(filters: SendLogFilters = {}): Promise<EmailSendLogListResponse> {
  const params = new URLSearchParams();

  const statuses = (Array.isArray(filters.status) ? filters.status : [filters.status])
    .filter((status): status is string => Boolean(status) && status !== 'all');

  if (statuses.length > 0) {
    params.set('status', statuses.join(','));
  }
  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }
  if (filters.domain && filters.domain !== 'all') {
    params.set('domain', filters.domain);
  }
  if (filters.period) {
    params.set('period', filters.period);
  }
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }

  const query = params.toString();
  const { data } = await api.get<EmailSendLogListResponse>(`/sends${query ? `?${query}` : ''}`);
  return data;
}

export async function fetchSendDetail(id: string): Promise<EmailSendLogDetailResponse> {
  const { data } = await api.get<EmailSendLogDetailResponse>(`/sends/${id}`);
  return data;
}

export async function retrySend(id: string): Promise<{ email_send: EmailSendLogDetailResponse['email_send']; message: string }> {
  const { data } = await api.post<{ email_send: EmailSendLogDetailResponse['email_send']; message: string }>(
    `/sends/${id}/retry`,
  );
  return data;
}
