import type { SmtpCredential, SmtpCredentialResponse } from '@/types';
import { api } from '@/lib/api';

export async function fetchSmtpCredentials(): Promise<SmtpCredentialResponse> {
  const { data } = await api.get<SmtpCredentialResponse>('/smtp-credentials');
  return data;
}

export async function enableSmtpCredentials(): Promise<{
  credential: SmtpCredential;
  password: string;
  message: string;
}> {
  const { data } = await api.post<{
    credential: SmtpCredential;
    password: string;
    message: string;
  }>('/smtp-credentials');
  return data;
}

export async function rotateSmtpPassword(id: string): Promise<{
  credential: SmtpCredential;
  password: string;
  message: string;
}> {
  const { data } = await api.post<{
    credential: SmtpCredential;
    password: string;
    message: string;
  }>(`/smtp-credentials/${id}/rotate-password`);
  return data;
}
