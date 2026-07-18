const STORAGE_KEY = 'mailvoidr_billing_intent';

export type BillingIntent = {
  volume: number;
  annual: boolean;
};

export function writeBillingIntent(intent: BillingIntent) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // ignore quota / private mode
  }
}

export function readBillingIntent(): BillingIntent | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BillingIntent>;
    if (typeof parsed.volume !== 'number' || !Number.isFinite(parsed.volume)) {
      return null;
    }
    return {
      volume: parsed.volume,
      annual: Boolean(parsed.annual),
    };
  } catch {
    return null;
  }
}

export function clearBillingIntent() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function billingPathFromIntent(intent: BillingIntent): string {
  const params = new URLSearchParams({ volume: String(intent.volume) });
  if (intent.annual) params.set('annual', '1');
  return `/dashboard/billing?${params.toString()}`;
}
