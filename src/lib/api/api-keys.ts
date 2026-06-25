import type { ApiKeyListResponse, ApiKey } from '@/types';
import { api } from '@/lib/api';

export interface CreateApiKeyPayload {
  name: string;
  scopes?: string[];
}

export async function fetchApiKeys(): Promise<ApiKeyListResponse> {
  const { data } = await api.get<ApiKeyListResponse>('/api-keys');
  return data;
}

export async function createApiKey(payload: CreateApiKeyPayload): Promise<{
  api_key: ApiKey;
  plain_key: string;
  message: string;
}> {
  const { data } = await api.post<{
    api_key: ApiKey;
    plain_key: string;
    message: string;
  }>('/api-keys', payload);
  return data;
}

export async function rotateApiKey(id: string): Promise<{
  api_key: ApiKey;
  plain_key: string;
  message: string;
}> {
  const { data } = await api.post<{
    api_key: ApiKey;
    plain_key: string;
    message: string;
  }>(`/api-keys/${id}/rotate`);
  return data;
}

export async function revokeApiKey(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/api-keys/${id}`);
  return data;
}
