import type { EmailMessage, EmailMessageListResponse, EmailMessageSummary, SandboxResponse } from '@/types';
import { api } from '@/lib/api';

export interface SandboxMessageFilters {
  search?: string;
  unread?: boolean;
  cursor?: string;
}

export async function fetchSandbox(): Promise<SandboxResponse> {
  const { data } = await api.get<SandboxResponse>('/sandbox');
  return data;
}

export async function enableSandbox(): Promise<SandboxResponse> {
  const { data } = await api.post<SandboxResponse>('/sandbox/enable');
  return data;
}

export async function fetchSandboxMessages(
  filters: SandboxMessageFilters = {},
): Promise<EmailMessageListResponse> {
  const { data } = await api.get<EmailMessageListResponse>('/sandbox/messages', {
    params: {
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.unread ? { unread: true } : {}),
      ...(filters.cursor ? { cursor: filters.cursor } : {}),
    },
  });
  return data;
}

export async function fetchSandboxMessageSidebar(messageId: string): Promise<EmailMessageSummary> {
  const { data } = await api.get<EmailMessageSummary>(`/sandbox/messages/${messageId}/sidebar`);
  return data;
}

export async function fetchSandboxMessage(messageId: string): Promise<{ message: EmailMessage }> {
  const { data } = await api.get<{ message: EmailMessage }>(`/sandbox/messages/${messageId}`);
  return data;
}

export async function fetchSandboxMessageRaw(messageId: string): Promise<string> {
  const { data } = await api.get<{ raw: string }>(`/sandbox/messages/${messageId}/raw`);
  return data.raw;
}

export async function markAllSandboxMessagesRead(): Promise<void> {
  await api.post('/sandbox/messages/mark-all-read');
}

export async function clearSandboxMessages(): Promise<void> {
  await api.delete('/sandbox/messages');
}
