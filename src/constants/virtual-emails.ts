export const VIRTUAL_EMAIL_TTL_OPTIONS = [
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'never', label: 'Never expire' },
] as const;

export type VirtualEmailTtl = (typeof VIRTUAL_EMAIL_TTL_OPTIONS)[number]['value'];

export function formatVirtualEmailTtl(expiresAt: string | null, isExpired?: boolean): string {
  if (isExpired) return 'Expired';
  if (!expiresAt) return 'Never';

  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - Date.now();

  if (diffMs <= 0) return 'Expired';

  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h`;

  const days = Math.ceil(hours / 24);
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function formatVirtualEmailDate(iso: string | null): string {
  if (!iso) return '—';

  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
