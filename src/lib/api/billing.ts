import type {
  BillingCheckoutResponse,
  BillingContextResponse,
  BillingPlan,
  PlansResponse,
  PricingCurrency,
} from '@/types';
import { api } from '@/lib/api';

export async function fetchBilling(): Promise<BillingContextResponse> {
  const { data } = await api.get<BillingContextResponse>('/billing');
  return data;
}

export async function fetchBillingPlans(
  currency: PricingCurrency,
  volume: number,
): Promise<PlansResponse> {
  const { data } = await api.get<PlansResponse>('/plans', {
    params: { currency, volume },
  });
  return data;
}

export async function startBillingCheckout(payload: {
  plan_id: string;
  volume: number;
  currency: PricingCurrency;
  annual?: boolean;
}): Promise<BillingCheckoutResponse> {
  const { data } = await api.post<BillingCheckoutResponse>('/billing/checkout', payload);
  return data;
}

export async function confirmBillingCheckout(payload: {
  reference: string;
}): Promise<{
  message: string;
  plan_slug: string;
  subscription: BillingContextResponse['subscription'];
}> {
  const { data } = await api.post('/billing/checkout/confirm', payload);
  return data;
}

export type { BillingPlan };
