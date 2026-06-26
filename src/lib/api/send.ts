import type {
  BillingUsageMetric,
  EmailPreview,
  EmailSendHistoryResponse,
  EmailSendSummary,
} from '@/types';
import { api } from '@/lib/api';

export interface SendEmailPayload {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  html?: string;
  text?: string;
  reply_to?: string;
  template_id?: string;
  template_version_id?: string;
  variables?: Record<string, string>;
}

export interface PreviewEmailPayload {
  from?: string;
  subject?: string;
  html?: string;
  text?: string;
  template_id?: string;
  template_version_id?: string;
  variables?: Record<string, string>;
}

export async function sendEmail(payload: SendEmailPayload): Promise<{
  email_send: EmailSendSummary;
  message: string;
  email_usage: BillingUsageMetric | null;
}> {
  const { data } = await api.post<{
    email_send: EmailSendSummary;
    message: string;
    email_usage: BillingUsageMetric | null;
  }>('/send', payload);
  return data;
}

export async function previewEmail(payload: PreviewEmailPayload): Promise<{
  preview: EmailPreview;
}> {
  const { data } = await api.post<{ preview: EmailPreview }>('/send/preview', payload);
  return data;
}

export async function fetchSendHistory(): Promise<EmailSendHistoryResponse> {
  const { data } = await api.get<EmailSendHistoryResponse>('/send/history');
  return data;
}
