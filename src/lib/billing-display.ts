import type { BillingPlanPrice } from '@/types';
import type { PricingCurrency } from '@/lib/api/plans';
import { ANNUAL_MONTHS_CHARGED } from '@/content/marketing/pricing';

export const PRICING_CURRENCY_STORAGE_KEY = 'mailvoidr_pricing_currency';

export function readPricingCurrency(): PricingCurrency {
  const stored = localStorage.getItem(PRICING_CURRENCY_STORAGE_KEY);
  return stored === 'NGN' ? 'NGN' : 'USD';
}

export function writePricingCurrency(currency: PricingCurrency) {
  localStorage.setItem(PRICING_CURRENCY_STORAGE_KEY, currency);
}

export function formatBillingPrice(
  price: BillingPlanPrice | null | undefined,
  annual: boolean,
): string {
  if (!price || price.amount === null) return 'Custom';
  if (price.amount === 0) return price.formatted;
  if (!annual) return price.formatted;

  const yearly = Math.round(price.amount * ANNUAL_MONTHS_CHARGED);
  if (price.currency === 'NGN') return `₦${yearly.toLocaleString()}`;
  return `$${yearly.toLocaleString()}`;
}

export function billingPriceIsFree(price: BillingPlanPrice | null | undefined): boolean {
  return (price?.amount ?? null) === 0;
}

export function billingPriceIsCustom(price: BillingPlanPrice | null | undefined): boolean {
  return price?.amount === null || price?.amount === undefined;
}

export { formatVolumeLabel } from '@/content/marketing/pricing';
