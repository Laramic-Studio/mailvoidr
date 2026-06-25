import type {
  CreditTransactionsResponse,
  CreditsResponse,
} from '@/types';
import { api } from '@/lib/api';

export async function fetchCredits(): Promise<CreditsResponse> {
  const { data } = await api.get<CreditsResponse>('/credits');
  return data;
}

export async function fetchCreditTransactions(): Promise<CreditTransactionsResponse> {
  const { data } = await api.get<CreditTransactionsResponse>('/credits/transactions');
  return data;
}

export async function enableLiveSending(): Promise<{
  live_sending_enabled: boolean;
  message: string;
  credits: CreditsResponse['credits'];
}> {
  const { data } = await api.post<{
    live_sending_enabled: boolean;
    message: string;
    credits: CreditsResponse['credits'];
  }>('/live-sending/enable');
  return data;
}

export async function createCreditCheckout(packSize: number): Promise<{ checkout_url: string }> {
  const { data } = await api.post<{ checkout_url: string }>('/credits/checkout', {
    pack_size: packSize,
  });
  return data;
}

export async function confirmCreditCheckout(sessionId: string): Promise<{
  message: string;
  pack_size: number;
  credits: CreditsResponse['credits'];
}> {
  const { data } = await api.post<{
    message: string;
    pack_size: number;
    credits: CreditsResponse['credits'];
  }>('/credits/checkout/confirm', { session_id: sessionId });
  return data;
}
