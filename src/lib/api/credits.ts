import type {
  CreditTransactionsResponse,
  CreditsResponse,
  BillingUsageMetric,
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
  emails: BillingUsageMetric | null;
}> {
  const { data } = await api.post<{
    live_sending_enabled: boolean;
    message: string;
    emails: BillingUsageMetric | null;
  }>('/live-sending/enable');
  return data;
}
