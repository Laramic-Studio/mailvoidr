import type { VirtualEmailTtl } from '@/constants/virtual-emails';
import type {
  EmailMessage,
  EmailMessageListResponse,
  VirtualEmail,
  VirtualEmailListResponse,
} from '@/types';
import { api } from '@/lib/api';

export interface CreateVirtualEmailPayload {
  label?: string;
  forward_to?: string;
  ttl?: VirtualEmailTtl;
}

export async function fetchVirtualEmails(search?: string): Promise<VirtualEmailListResponse> {
  const { data } = await api.get<VirtualEmailListResponse>('/virtual-emails', {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function fetchVirtualEmail(id: string): Promise<{ virtual_email: VirtualEmail }> {
  const { data } = await api.get<{ virtual_email: VirtualEmail }>(`/virtual-emails/${id}`);
  return data;
}

export async function createVirtualEmail(payload: CreateVirtualEmailPayload): Promise<{
  virtual_email: VirtualEmail;
}> {
  const { data } = await api.post<{ virtual_email: VirtualEmail }>('/virtual-emails', payload);
  return data;
}

export async function deleteVirtualEmail(id: string): Promise<void> {
  await api.delete(`/virtual-emails/${id}`);
}

export async function fetchVirtualEmailMessages(
  inboxId: string,
  search?: string,
): Promise<EmailMessageListResponse> {
  const { data } = await api.get<EmailMessageListResponse>(
    `/virtual-emails/${inboxId}/messages`,
    { params: search ? { search } : undefined },
  );
  return data;
}

export async function fetchVirtualEmailMessage(
  inboxId: string,
  messageId: string,
): Promise<{ message: EmailMessage }> {
  const { data } = await api.get<{ message: EmailMessage }>(
    `/virtual-emails/${inboxId}/messages/${messageId}`,
  );
  return data;
}

export async function fetchVirtualEmailMessageRaw(
  inboxId: string,
  messageId: string,
): Promise<string> {
  const { data } = await api.get<{ raw: string }>(
    `/virtual-emails/${inboxId}/messages/${messageId}/raw`,
  );
  return data.raw;
}

export async function deleteVirtualEmailMessage(
  inboxId: string,
  messageId: string,
): Promise<void> {
  await api.delete(`/virtual-emails/${inboxId}/messages/${messageId}`);
}

export async function downloadAttachment(id: string, filename: string): Promise<void> {
  const { data } = await api.get<Blob>(`/attachments/${id}/download`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
