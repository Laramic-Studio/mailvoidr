import type {
  TemplateMarketplaceItem,
  TemplateMarketplaceListResponse,
  TemplatePreview,
} from '@/types';
import { api } from '@/lib/api';

export async function fetchTemplateMarketplace(params?: {
  search?: string;
  category?: string;
  page?: number;
}): Promise<TemplateMarketplaceListResponse> {
  const { data } = await api.get<TemplateMarketplaceListResponse>('/template-marketplace', {
    params,
  });
  return data;
}

export async function fetchTemplateMarketplaceItem(
  id: string,
): Promise<{ template: TemplateMarketplaceItem }> {
  const { data } = await api.get<{ template: TemplateMarketplaceItem }>(
    `/template-marketplace/${id}`,
  );
  return data;
}

export async function previewMarketplaceTemplate(
  id: string,
  payload?: { variables?: Record<string, string> },
): Promise<{ preview: TemplatePreview }> {
  const { data } = await api.post<{ preview: TemplatePreview }>(
    `/template-marketplace/${id}/preview`,
    payload ?? {},
  );
  return data;
}

export async function addMarketplaceTemplateToLibrary(id: string): Promise<{
  template: import('@/types').EmailTemplate;
  message: string;
}> {
  const { data } = await api.post<{
    template: import('@/types').EmailTemplate;
    message: string;
  }>(`/template-marketplace/${id}/add`);
  return data;
}
