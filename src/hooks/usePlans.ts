import { useQuery } from '@tanstack/react-query';
import { fetchPlans } from '@/lib/api/plans';
import type { PricingCurrency } from '@/types';
import { queryKeys } from '@/lib/query-keys';

export function usePlans(currency: PricingCurrency, volume: number) {
  return useQuery({
    queryKey: queryKeys.plans.list(currency, volume),
    queryFn: () => fetchPlans(currency, volume),
    staleTime: 60_000,
  });
}
