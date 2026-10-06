import type { CampaignListTab } from '@/lib/newsletter/tabs';

export const DEFAULT_CAMPAIGN_TIMEZONE = 'Africa/Lagos';
export const AB_MIN_ELIGIBLE = 200;
export const AB_MIN_PER_VARIANT = 50;
export const CONFIRMATION_RATE_TOOLTIP =
  'Confirmed ÷ (confirmed + pending + purged) for the last 30 days.';

const PILL_GREEN =
  'border-[hsl(var(--chart-1)/0.45)] bg-[hsl(var(--chart-1)/0.12)] text-[hsl(var(--chart-1))]';
const PILL_SKY =
  'border-[hsl(var(--chart-2)/0.45)] bg-[hsl(var(--chart-2)/0.12)] text-[hsl(var(--chart-2))]';
const PILL_AMBER =
  'border-[hsl(var(--chart-3)/0.45)] bg-[hsl(var(--chart-3)/0.12)] text-[hsl(var(--chart-3))]';
const PILL_VIOLET =
  'border-[hsl(var(--chart-4)/0.45)] bg-[hsl(var(--chart-4)/0.12)] text-[hsl(var(--chart-4))]';
const PILL_ROSE =
  'border-[hsl(var(--chart-5)/0.45)] bg-[hsl(var(--chart-5)/0.12)] text-[hsl(var(--chart-5))]';
const PILL_SLATE = 'border-border bg-muted text-muted-foreground';

/** Chart-token tones from the newsletter spec. Unknown words stay slate so the label still reads. */
export const STATUS_PILL_CLASS: Record<string, string> = {
  pending: PILL_AMBER,
  subscribed: PILL_GREEN,
  unsubscribed: PILL_SLATE,
  bounced: PILL_ROSE,
  complained: PILL_ROSE,
  draft: PILL_SLATE,
  scheduled: PILL_SKY,
  in_review: PILL_VIOLET,
  sending: PILL_GREEN,
  paused: PILL_AMBER,
  auto_paused: PILL_ROSE,
  sent: PILL_GREEN,
  cancelled: PILL_SLATE,
  failed: PILL_ROSE,
  testing: PILL_SKY,
  waiting: PILL_SKY,
  winner_picked: PILL_GREEN,
  needs_manual_pick: PILL_AMBER,
  active: PILL_GREEN,
};

export function statusLabel(status: string): string {
  if (status === 'auto_paused') return 'Auto-paused';
  const words = status.replace(/_/g, ' ').trim();
  if (!words) return status;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function statusPillClass(status: string): string {
  return STATUS_PILL_CLASS[status] ?? PILL_SLATE;
}

/**
 * API rates are already percents. 0.1 displays as 0.10%. Never multiply by 100.
 * Two decimals under 1%, one decimal at 1% and above.
 */
export function formatRate(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const numeric = Number(value);
  const digits = Math.abs(numeric) < 1 ? 2 : 1;
  return `${numeric.toFixed(digits)}%`;
}

/**
 * Complaints stay "Not available yet" until ingestion is live.
 * A literal 0 is hidden unless the API marks complaints as available.
 */
export function formatComplaint(
  rate: number | null | undefined,
  available?: boolean,
): string {
  if (available === false || rate == null || Number.isNaN(Number(rate))) {
    return 'Not available yet';
  }
  if (available == null && Number(rate) === 0) return 'Not available yet';
  return formatRate(rate);
}

export function formatCount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-US');
}

function durationParts(minutes: number): { amount: number; unit: 'min' | 'h' } {
  if (minutes < 60) {
    return { amount: Math.max(1, Math.ceil(minutes)), unit: 'min' };
  }
  return { amount: Math.max(1, Math.round(minutes / 60)), unit: 'h' };
}

/** While sending: remaining ÷ recent observed rate. Null when the API has no recent rate. */
export function sendingEta(input: {
  sentCount: number;
  totalRecipients: number | null | undefined;
  recentSendsPerMinute: number | null | undefined;
}): string | null {
  if (input.totalRecipients == null) return null;
  const remaining = input.totalRecipients - input.sentCount;
  if (remaining <= 0) return null;
  const rate = input.recentSendsPerMinute;
  if (rate == null || rate <= 0) return null;
  const { amount, unit } = durationParts(remaining / rate);
  return `About ${amount} ${unit} left`;
}

/** Before send: recipients ÷ workspace cap. Does not use a fixed or recent rate. */
export function reviewSendFloor(input: {
  totalRecipients: number | null | undefined;
  sendsPerMinute: number | null | undefined;
}): string | null {
  if (input.totalRecipients == null || input.totalRecipients <= 0) return null;
  if (input.sendsPerMinute == null || input.sendsPerMinute <= 0) return null;
  const { amount, unit } = durationParts(input.totalRecipients / input.sendsPerMinute);
  return `At least ${amount} ${unit} to send`;
}

export function perVariantCount(eligible: number, sharePercent: number): number {
  if (eligible <= 0 || sharePercent <= 0) return 0;
  return Math.floor((eligible * (sharePercent / 100)) / 2);
}

export function abTestBlockers(eligible: number, sharePercent: number): string[] {
  const reasons: string[] = [];
  if (eligible < AB_MIN_ELIGIBLE) {
    reasons.push(
      `Needs at least ${AB_MIN_ELIGIBLE} eligible subscribers (this audience has ${formatCount(eligible)}).`,
    );
  }
  const perVariant = perVariantCount(eligible, sharePercent);
  if (perVariant < AB_MIN_PER_VARIANT) {
    reasons.push(
      `Each variant needs at least ${AB_MIN_PER_VARIANT} recipients. At ${sharePercent}% this test gives ${formatCount(perVariant)} per variant.`,
    );
  }
  return reasons;
}

export function autoPauseTitle(code: string | null | undefined): string {
  switch (code) {
    case 'bounce_rate_threshold':
      return 'Bounce rate passed the limit';
    case 'complaint_rate_threshold':
      return 'Complaint rate passed the limit';
    case 'deliverability_hold':
      return 'Sending paused to protect deliverability';
    default:
      return 'Sending paused to protect deliverability';
  }
}

export function campaignReasonLine(campaign: {
  status: string;
  review_reason?: string | null;
  auto_pause_reason?: string | null;
}): string | null {
  if (campaign.status === 'in_review') {
    return campaign.review_reason?.trim() || 'Your first large send is being reviewed.';
  }
  if (campaign.status === 'paused') return 'Paused by you.';
  if (campaign.status === 'auto_paused') return autoPauseTitle(campaign.auto_pause_reason);
  return null;
}

export function inReviewMessage(turnaround: string | null | undefined): string {
  const base = 'Your first large send is being reviewed.';
  const text = turnaround?.trim();
  if (!text) return base;
  return `${base} This usually takes up to ${text}.`;
}

/** Tenants can resume a manual pause only. auto_paused is admin-only. */
export function tenantCanResume(status: string): boolean {
  return status === 'paused';
}

export type CampaignAction =
  | 'edit'
  | 'cancel'
  | 'pause'
  | 'resume'
  | 'contact_support';

export function campaignActions(status: string): CampaignAction[] {
  switch (status) {
    case 'scheduled':
      return ['edit', 'cancel'];
    case 'in_review':
      return ['cancel'];
    case 'sending':
      return ['pause'];
    case 'paused':
      return ['resume', 'cancel'];
    case 'auto_paused':
      return ['contact_support'];
    default:
      return [];
  }
}

export function audienceReceiptCopy(input: {
  eligible: number | null | undefined;
  pending: number | null | undefined;
  suppressed: number | null | undefined;
}): string | null {
  if (input.eligible == null || input.pending == null || input.suppressed == null) return null;
  return `${formatCount(input.eligible)} will receive this. ${formatCount(input.pending)} pending and ${formatCount(input.suppressed)} suppressed are left out.`;
}

export function suppressedCount(audience: {
  suppressed_count?: number;
  unsubscribed_count: number;
  bounced_count: number;
  complained_count: number;
}): number {
  if (typeof audience.suppressed_count === 'number') return audience.suppressed_count;
  return audience.unsubscribed_count + audience.bounced_count + audience.complained_count;
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) return '•••';
  if (email.includes('•')) return email;
  const [local, domain] = email.split('@');
  if (!local || !domain) return '•••';
  return `${local.charAt(0)}•••@${domain}`;
}

export function formatInZone(iso: string | null | undefined, timeZone?: string | null): string {
  if (!iso) return '—';
  const zone = timeZone?.trim() || DEFAULT_CAMPAIGN_TIMEZONE;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: zone,
    }).format(date);
    return `${formatted} ${zone}`;
  } catch {
    return iso;
  }
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

export function hasPhysicalAddress(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function sendRequiresReview(
  requiresReview: boolean,
  eligible: number | null | undefined,
  threshold: number | null | undefined,
): boolean {
  if (requiresReview) return true;
  if (threshold == null || eligible == null) return false;
  return eligible >= threshold;
}

export function meterOverageMessage(
  used: number | null | undefined,
  limit: number | null | undefined,
  eligible: number | null | undefined,
): string | null {
  if (used == null || limit == null || eligible == null) return null;
  if (used + eligible > limit) {
    return 'This send is over your plan’s monthly campaign sends. Upgrade before you send it.';
  }
  return null;
}

export function abPickedByLabel(picked: string | null | undefined): string {
  if (picked === 'manual') return 'Picked manually';
  if (picked === 'rule') return 'Picked by highest click rate';
  return 'Not picked yet';
}

export function doiImportCopy(settings: {
  plan?: string | null;
  doi_for_imports?: boolean;
  doi_imports_editable?: boolean;
  doi_imports_disabled_by?: { name: string; at: string } | null;
} | null | undefined): string {
  const paidToggleOff = settings?.doi_for_imports === false && settings?.doi_imports_editable !== false;
  if (paidToggleOff) {
    const name = settings?.doi_imports_disabled_by?.name;
    return name
      ? `Double opt-in is off for imports. The attestation is logged against ${name}.`
      : 'Double opt-in is off for imports. The attestation is logged against the person who turned it off.';
  }
  if (settings?.plan === 'free' || settings?.doi_imports_editable === false) {
    return 'Free plan: everyone imported gets a confirmation email and stays pending until they confirm.';
  }
  return 'Everyone imported gets a confirmation email and stays pending until they confirm.';
}

export function exportPermission(
  role: string | null | undefined,
  metaCanExport: boolean | undefined,
): { allowed: boolean; reason: string } {
  if (metaCanExport === false || (metaCanExport == null && role !== 'owner' && role !== 'admin')) {
    return { allowed: false, reason: 'Only owners and admins can export' };
  }
  return { allowed: true, reason: '' };
}

export function campaignScheduleLabel(campaign: {
  sent_at?: string | null;
  scheduled_at?: string | null;
  timezone?: string | null;
  status: string;
}): string {
  if (campaign.status === 'scheduled' || campaign.status === 'in_review') {
    return formatInZone(campaign.scheduled_at, campaign.timezone);
  }
  if (campaign.sent_at) return formatInZone(campaign.sent_at, campaign.timezone);
  if (campaign.scheduled_at) return formatInZone(campaign.scheduled_at, campaign.timezone);
  return '—';
}

export function filterCampaigns<T extends { status: string }>(
  campaigns: T[],
  tab: CampaignListTab,
): T[] {
  if (tab === 'all') return campaigns;
  return campaigns.filter((campaign) => campaignMatchesTab(campaign.status, tab));
}

export function campaignMatchesTab(status: string, tab: CampaignListTab): boolean {
  if (tab === 'all') return true;
  const groups: Record<Exclude<CampaignListTab, 'all'>, string[]> = {
    drafts: ['draft'],
    scheduled: ['scheduled', 'in_review'],
    sending: ['sending', 'paused', 'auto_paused'],
    sent: ['sent', 'cancelled', 'failed'],
  };
  return groups[tab].includes(status);
}

export function contentHasUnsubscribe(html: string, text: string): boolean {
  const blob = `${html}\n${text}`.toLowerCase();
  return blob.includes('unsubscribe') || blob.includes('{{unsubscribe');
}

export function contentHasPhysicalAddress(
  html: string,
  text: string,
  physicalAddress: string | null | undefined,
): boolean {
  if (!hasPhysicalAddress(physicalAddress)) return false;
  return `${html}\n${text}`.toLowerCase().includes(physicalAddress!.trim().toLowerCase());
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailAddress(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function manualResubscribeBlocked(status: string): boolean {
  return status === 'unsubscribed' || status === 'bounced' || status === 'complained';
}
