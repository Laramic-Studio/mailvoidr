import type { PlansResponse, PricingCurrency } from '@/types';
import { api } from '@/lib/api';

export async function fetchPlans(
  currency: PricingCurrency = 'USD',
  volume?: number,
): Promise<PlansResponse> {
  const params: Record<string, string | number> = { currency };
  if (volume) params.volume = volume;

  const { data } = await api.get<PlansResponse>('/plans', { params });
  return data;
}
