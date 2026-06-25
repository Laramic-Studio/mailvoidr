import type {
  WebhookDelivery,
  WebhookDeliveryListResponse,
  WebhookEndpoint,
  WebhookEndpointListResponse,
} from '@/types';
import { api } from '@/lib/api';

export interface CreateWebhookPayload {
  url: string;
  events: string[];
  description?: string;
}

export interface UpdateWebhookPayload {
  url?: string;
  events?: string[];
  description?: string | null;
  status?: 'active' | 'paused';
}

export async function fetchWebhooks(): Promise<WebhookEndpointListResponse> {
  const { data } = await api.get<WebhookEndpointListResponse>('/webhooks');
  return data;
}

export async function createWebhook(payload: CreateWebhookPayload): Promise<{
  webhook: WebhookEndpoint;
  plain_secret: string;
  message: string;
}> {
  const { data } = await api.post<{
    webhook: WebhookEndpoint;
    plain_secret: string;
    message: string;
  }>('/webhooks', payload);
  return data;
}

export async function updateWebhook(
  id: string,
  payload: UpdateWebhookPayload,
): Promise<{ webhook: WebhookEndpoint; message: string }> {
  const { data } = await api.patch<{ webhook: WebhookEndpoint; message: string }>(
    `/webhooks/${id}`,
    payload,
  );
  return data;
}

export async function deleteWebhook(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/webhooks/${id}`);
  return data;
}

export async function rotateWebhookSecret(id: string): Promise<{
  webhook: WebhookEndpoint;
  plain_secret: string;
  message: string;
}> {
  const { data } = await api.post<{
    webhook: WebhookEndpoint;
    plain_secret: string;
    message: string;
  }>(`/webhooks/${id}/rotate-secret`);
  return data;
}

export async function testWebhook(
  id: string,
  event: string,
): Promise<{ delivery: WebhookDelivery; message: string }> {
  const { data } = await api.post<{ delivery: WebhookDelivery; message: string }>(
    `/webhooks/${id}/test`,
    { event },
  );
  return data;
}

export async function fetchWebhookDeliveries(
  webhookId?: string,
): Promise<WebhookDeliveryListResponse> {
  const { data } = await api.get<WebhookDeliveryListResponse>(
    webhookId ? `/webhooks/${webhookId}/deliveries` : '/webhooks/deliveries',
  );
  return data;
}

export async function replayWebhookDelivery(id: string): Promise<{
  delivery: WebhookDelivery;
  message: string;
}> {
  const { data } = await api.post<{ delivery: WebhookDelivery; message: string }>(
    `/webhooks/deliveries/${id}/replay`,
  );
  return data;
}
