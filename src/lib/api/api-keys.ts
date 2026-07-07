import type { ApiKeyEnvironment, ApiKeyListResponse, ApiKey } from '@/types';
import { api } from '@/lib/api';

export interface CreateApiKeyPayload {
  name: string;
  environment: ApiKeyEnvironment;
  scopes?: string[];
}

export async function fetchApiKeys(environment?: ApiKeyEnvironment): Promise<ApiKeyListResponse> {
  const { data } = await api.get<ApiKeyListResponse>('/api-keys', {
    params: environment ? { environment } : undefined,
  });
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

export async function revealApiKey(
  id: string,
  password: string,
): Promise<{ plain_key: string }> {
  const { data } = await api.post<{ plain_key: string }>(`/api-keys/${id}/reveal`, {
    password,
  });
  return data;
}
