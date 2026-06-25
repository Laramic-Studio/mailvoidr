import type { SearchResponse } from '@/types';
import { api } from '@/lib/api';

export async function searchDashboard(query: string): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/search', {
    params: { q: query },
  });
  return data;
}
