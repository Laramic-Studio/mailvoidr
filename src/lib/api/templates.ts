import type {
  EmailTemplate,
  TemplateCategory,
  TemplateListResponse,
  TemplatePreview,
  TemplateVariable,
  TemplateVisibility,
} from '@/types';
import { api } from '@/lib/api';

export interface CreateTemplatePayload {
  name: string;
  category: TemplateCategory;
  description?: string;
  subject: string;
  html?: string;
  text?: string;
  variables?: TemplateVariable[];
  change_notes?: string;
  visibility?: TemplateVisibility;
}

export interface UpdateTemplatePayload {
  name?: string;
  category?: TemplateCategory;
  description?: string | null;
  variables?: TemplateVariable[] | null;
  is_active?: boolean;
  visibility?: TemplateVisibility;
}

export interface CreateTemplateVersionPayload {
  subject: string;
  html?: string;
  text?: string;
  variables?: TemplateVariable[] | null;
  change_notes?: string;
}

export async function fetchTemplates(search?: string): Promise<TemplateListResponse> {
  const { data } = await api.get<TemplateListResponse>('/templates', {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function fetchTemplate(id: string): Promise<{ template: EmailTemplate }> {
  const { data } = await api.get<{ template: EmailTemplate }>(`/templates/${id}`);
  return data;
}

export async function createTemplate(payload: CreateTemplatePayload): Promise<{
  template: EmailTemplate;
  message: string;
}> {
  const { data } = await api.post<{ template: EmailTemplate; message: string }>(
    '/templates',
    payload,
  );
  return data;
}

export async function updateTemplate(
  id: string,
  payload: UpdateTemplatePayload,
): Promise<{ template: EmailTemplate; message: string }> {
  const { data } = await api.patch<{ template: EmailTemplate; message: string }>(
    `/templates/${id}`,
    payload,
  );
  return data;
}

export async function createTemplateVersion(
  id: string,
  payload: CreateTemplateVersionPayload,
): Promise<{ template: EmailTemplate; message: string }> {
  const { data } = await api.post<{ template: EmailTemplate; message: string }>(
    `/templates/${id}/versions`,
    payload,
  );
  return data;
}

export async function previewTemplate(
  id: string,
  payload?: { variables?: Record<string, string>; template_version_id?: string },
): Promise<{ preview: TemplatePreview }> {
  const { data } = await api.post<{ preview: TemplatePreview }>(
    `/templates/${id}/preview`,
    payload ?? {},
  );
  return data;
}

export async function deleteTemplate(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/templates/${id}`);
  return data;
}
