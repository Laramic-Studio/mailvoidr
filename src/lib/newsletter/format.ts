import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api';
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

/** Locked queue paces. API values replace these when the payload includes them. */
export const QUEUE_GLOBAL_PER_MINUTE = 60;
export const QUEUE_WORKSPACE_PER_MINUTE = 20;
export const FIRST_LARGE_SEND_RECIPIENTS = 1000;
export const TIER_HOLD_RECIPIENTS = 5000;
export const TIER_HOLD_MAX = 'T1';
export const BOUNCE_PAUSE_PERCENT = 2;

const RAMP_FALLBACK: Record<string, { campaign: number | null; daily: number | null }> = {
  T0: { campaign: 200, daily: 500 },
  T1: { campaign: 1000, daily: 2500 },
  T2: { campaign: 5000, daily: 10000 },
  T3: { campaign: null, daily: null },
};

export function normalizeTrustTier(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.trim().toUpperCase().match(/^T[0-3]$/);
  return match ? match[0] : value.trim();
}

export function tierRank(value: string | null | undefined): number | null {
  const tier = normalizeTrustTier(value);
  const match = tier?.match(/^T(\d)$/);
  return match ? Number(match[1]) : null;
}

export function tierAtMost(tier: string | null | undefined, maxTier: string | null | undefined): boolean {
  const rank = tierRank(tier);
  const max = tierRank(maxTier);
  if (rank == null || max == null) return false;
  return rank <= max;
}

export function resolveRampCaps(input: {
  trustTier?: string | null;
  campaignCap?: number | null;
  dailyCap?: number | null;
  capsFromApi?: boolean;
}): { campaignCap: number | null; dailyCap: number | null; known: boolean } {
  if (input.capsFromApi) {
    return {
      campaignCap: input.campaignCap ?? null,
      dailyCap: input.dailyCap ?? null,
      known: true,
    };
  }
  const fallback = RAMP_FALLBACK[normalizeTrustTier(input.trustTier) ?? ''];
  if (!fallback) return { campaignCap: null, dailyCap: null, known: false };
  return { campaignCap: fallback.campaign, dailyCap: fallback.daily, known: true };
}

export function rampSummary(input: {
  trustTier?: string | null;
  campaignCap?: number | null;
  dailyCap?: number | null;
  capsFromApi?: boolean;
}): string | null {
  const tier = normalizeTrustTier(input.trustTier);
  const caps = resolveRampCaps(input);
  if (!tier && !caps.known) return null;
  const label = tier ?? 'This workspace';
  if (!caps.known) return `Trust tier ${label}. Send caps are not available yet.`;
  if (caps.campaignCap == null && caps.dailyCap == null) {
    return `Trust tier ${label}. Per-campaign and daily caps are lifted.`;
  }
  const campaign = caps.campaignCap == null ? 'no per-campaign cap' : `${formatCount(caps.campaignCap)} per campaign`;
  const daily = caps.dailyCap == null ? 'no daily cap' : `${formatCount(caps.dailyCap)} per day`;
  return `Trust tier ${label}. ${campaign}, ${daily}.`;
}

export function queueCaps(input: {
  globalPerMinute?: number | null;
  workspacePerMinute?: number | null;
}): { globalPerMinute: number; workspacePerMinute: number } {
  const globalPerMinute = positiveRate(input.globalPerMinute) ?? QUEUE_GLOBAL_PER_MINUTE;
  const workspacePerMinute = positiveRate(input.workspacePerMinute) ?? QUEUE_WORKSPACE_PER_MINUTE;
  return { globalPerMinute, workspacePerMinute };
}

function positiveRate(value: number | null | undefined): number | null {
  if (value == null || value <= 0) return null;
  return value;
}

/** Fastest pace the workspace is allowed: the tighter of the workspace and shared queues. */
export function etaQueueRate(input: {
  workspacePerMinute?: number | null;
  globalPerMinute?: number | null;
  sendsPerMinute?: number | null;
}): number {
  const queues = queueCaps({
    globalPerMinute: input.globalPerMinute,
    workspacePerMinute: positiveRate(input.workspacePerMinute) ?? positiveRate(input.sendsPerMinute),
  });
  return Math.min(queues.workspacePerMinute, queues.globalPerMinute);
}

export function queuePaceCopy(input: {
  globalPerMinute?: number | null;
  workspacePerMinute?: number | null;
  sendsPerMinute?: number | null;
}): string {
  const queues = queueCaps({
    globalPerMinute: input.globalPerMinute,
    workspacePerMinute: positiveRate(input.workspacePerMinute) ?? positiveRate(input.sendsPerMinute),
  });
  return `Workspace queue ${formatCount(queues.workspacePerMinute)}/min. Shared queue ${formatCount(queues.globalPerMinute)}/min.`;
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

/** Before send: recipients ÷ the tighter queue cap. Does not use the recent rate. */
export function reviewSendFloor(input: {
  totalRecipients: number | null | undefined;
  sendsPerMinute?: number | null;
  workspacePerMinute?: number | null;
  globalPerMinute?: number | null;
}): string | null {
  if (input.totalRecipients == null || input.totalRecipients <= 0) return null;
  const rate = etaQueueRate(input);
  if (rate <= 0) return null;
  const { amount, unit } = durationParts(input.totalRecipients / rate);
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

export function formatPolicyPercent(value: number): string {
  if (Number.isInteger(value)) return `${value}%`;
  return formatRate(value);
}

export function autoPauseTitle(
  code: string | null | undefined,
  policy?: { bouncePausePercent?: number | null; complaintPausePercent?: number | null },
): string {
  const bounce = policy?.bouncePausePercent ?? BOUNCE_PAUSE_PERCENT;
  const complaint = policy?.complaintPausePercent;
  switch (code) {
    case 'bounce_rate_threshold':
      return `Bounce rate passed ${formatPolicyPercent(bounce)}`;
    case 'complaint_rate_threshold':
      return complaint == null
        ? 'Complaint rate passed the limit'
        : `Complaint rate passed ${formatPolicyPercent(complaint)}`;
    case 'deliverability_hold':
      return 'Sending paused to protect deliverability';
    default:
      return 'Sending paused to protect deliverability';
  }
}

export function complaintWarningCopy(policy?: {
  complaintWarnPercent?: number | null;
  complaintPausePercent?: number | null;
}): string {
  const warn = policy?.complaintWarnPercent;
  const pause = policy?.complaintPausePercent;
  if (warn != null && pause != null) {
    return `Complaint rate is in the warning band. Warnings start at ${formatPolicyPercent(warn)} and sending pauses at ${formatPolicyPercent(pause)}.`;
  }
  if (warn != null) {
    return `Complaint rate reached the warning level (${formatPolicyPercent(warn)}).`;
  }
  return 'Complaint rate is in the warning band.';
}

export function deliverabilityPolicyCopy(policy?: {
  bouncePausePercent?: number | null;
  complaintWarnPercent?: number | null;
  complaintPausePercent?: number | null;
}): string[] {
  const bounce = policy?.bouncePausePercent ?? BOUNCE_PAUSE_PERCENT;
  const lines = [`Campaigns pause when the bounce rate reaches ${formatPolicyPercent(bounce)}.`];
  const warn = policy?.complaintWarnPercent;
  const pause = policy?.complaintPausePercent;
  if (warn != null && pause != null) {
    lines.push(`Complaints warn at ${formatPolicyPercent(warn)} and pause at ${formatPolicyPercent(pause)}.`);
  } else if (pause != null) {
    lines.push(`Campaigns pause when the complaint rate reaches ${formatPolicyPercent(pause)}.`);
  } else if (warn != null) {
    lines.push(`Complaints warn at ${formatPolicyPercent(warn)}.`);
  }
  return lines;
}

export function campaignReasonLine(
  campaign: {
    status: string;
    review_reason?: string | null;
    auto_pause_reason?: string | null;
    eligible_count?: number | null;
    total_recipients?: number | null;
    trust_tier?: string | null;
  },
  policy?: { bouncePausePercent?: number | null; complaintPausePercent?: number | null },
): string | null {
  if (campaign.status === 'in_review') {
    return largeSendReviewCopy({
      eligible: campaign.eligible_count ?? campaign.total_recipients,
      trustTier: campaign.trust_tier,
      reviewReason: campaign.review_reason,
    });
  }
  if (campaign.status === 'paused') return 'Paused by you.';
  if (campaign.status === 'auto_paused') return autoPauseTitle(campaign.auto_pause_reason, policy);
  return null;
}

export type LargeSendKind = 'tier' | 'first';

export function largeSendDecision(input: {
  eligible?: number | null;
  requiresReview?: boolean;
  trustTier?: string | null;
  firstThreshold?: number | null;
  tierHoldThreshold?: number | null;
  tierHoldMax?: string | null;
  firstLargeSendCompleted?: boolean | null;
}): { hold: boolean; kind: LargeSendKind | null } {
  const first = input.firstThreshold ?? FIRST_LARGE_SEND_RECIPIENTS;
  const tierLine = input.tierHoldThreshold ?? TIER_HOLD_RECIPIENTS;
  const maxTier = input.tierHoldMax ?? TIER_HOLD_MAX;
  const eligible = input.eligible;
  if (eligible != null && eligible >= tierLine && tierAtMost(input.trustTier, maxTier)) {
    return { hold: true, kind: 'tier' };
  }
  const firstOpen = input.firstLargeSendCompleted === false
    || (input.firstLargeSendCompleted !== true && tierAtMost(input.trustTier, maxTier));
  if (eligible != null && eligible >= first && firstOpen) {
    return { hold: true, kind: 'first' };
  }
  if (input.requiresReview) return { hold: true, kind: 'first' };
  return { hold: false, kind: null };
}

export function largeSendReviewCopy(input: {
  eligible?: number | null;
  trustTier?: string | null;
  reviewReason?: string | null;
  firstThreshold?: number | null;
  tierHoldThreshold?: number | null;
  tierHoldMax?: string | null;
  requiresReview?: boolean;
  firstLargeSendCompleted?: boolean | null;
}): string {
  const reason = input.reviewReason?.trim();
  if (reason) return reason;
  const decision = largeSendDecision({ ...input, requiresReview: input.requiresReview ?? true });
  if (decision.kind === 'tier') {
    const line = input.tierHoldThreshold ?? TIER_HOLD_RECIPIENTS;
    const max = normalizeTrustTier(input.tierHoldMax) ?? TIER_HOLD_MAX;
    return `Sends of ${formatCount(line)} or more stay in review while your trust tier is ${max} or below.`;
  }
  const first = input.firstThreshold ?? FIRST_LARGE_SEND_RECIPIENTS;
  return `Sends of ${formatCount(first)} or more go to review the first time.`;
}

export function inReviewMessage(turnaround: string | null | undefined, reason?: string | null): string {
  const base = reason?.trim() || 'Your first large send is being reviewed.';
  const text = turnaround?.trim();
  if (!text || base.includes(text)) return base;
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

export function sendRequiresReview(input: {
  requiresReview?: boolean;
  eligible?: number | null;
  trustTier?: string | null;
  firstThreshold?: number | null;
  tierHoldThreshold?: number | null;
  tierHoldMax?: string | null;
  firstLargeSendCompleted?: boolean | null;
}): boolean {
  return largeSendDecision(input).hold;
}

/** Free plan meters subscribers. Campaign sends stay off this card. */
export function subscriberMeterCopy(
  used: number | null | undefined,
  limit: number | null | undefined,
): string {
  const pace = 'Campaign sends are unlimited and follow the workspace send rate.';
  if (typeof used === 'number' && typeof limit === 'number') {
    return `${formatCount(used)} of ${formatCount(limit)} subscribers. ${pace}`;
  }
  if (typeof used === 'number') {
    return `${formatCount(used)} subscribers. This plan does not cap subscribers. ${pace}`;
  }
  if (typeof limit === 'number') {
    return `Subscriber limit ${formatCount(limit)}. ${pace}`;
  }
  return 'Subscriber limits are not available yet.';
}

export function subscriberMeterKnown(
  used: number | null | undefined,
  limit: number | null | undefined,
): boolean {
  return used !== undefined || limit !== undefined;
}

/** Shown before add/import when the workspace is already at the subscriber cap. */
export function subscriberCapNotice(
  used: number | null | undefined,
  limit: number | null | undefined,
): string | null {
  if (typeof used !== 'number' || typeof limit !== 'number' || used < limit) return null;
  return `This workspace is at ${formatCount(used)} of ${formatCount(limit)} subscribers. Adding another one needs a higher plan.`;
}

/** 402 from add or import. Prefer the API message; the fallback names the subscriber cap. */
export function subscriberPlanLimitMessage(error: unknown): string | null {
  if (getApiErrorStatus(error) !== 402) return null;
  return getApiErrorMessage(
    error,
    'This workspace has reached its subscriber limit. Upgrade to add more subscribers.',
  );
}

export function campaignNeedsPhysicalAddress(
  campaignUs: boolean | null | undefined,
  audienceUs: boolean | null | undefined,
): boolean {
  return campaignUs === true || audienceUs === true;
}

export const US_ADDRESS_REQUIRED_COPY =
  'This campaign includes United States recipients. Add a physical mailing address before you send.';

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

/** Platform from-domain. Any @*.mailvoidr.com address is allowed without DNS verification. */
export const MAILVOIDR_FROM_DOMAIN = 'app.mailvoidr.com';

export function isEmailAddress(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isMailvoidrSendingDomain(domain: string): boolean {
  const value = domain.trim().toLowerCase().replace(/\.$/, '');
  return value === 'mailvoidr.com' || value.endsWith('.mailvoidr.com');
}

function sendingDomainAllowed(domain: string, allowedDomains: string[]): boolean {
  if (isMailvoidrSendingDomain(domain)) return true;
  const value = domain.trim().toLowerCase();
  return allowedDomains.some((item) => item.trim().toLowerCase() === value);
}

/**
 * Mailbox plus the chosen domain. A typed address is kept when its domain is
 * Mailvoidr or verified. Otherwise the selected domain is used, so an
 * unverified address can still send from Mailvoidr.
 */
export function composeCampaignFromAddress(mailbox: string, domain: string, allowedDomains: string[] = []): string {
  const selected = domain.trim();
  const typed = mailbox.trim().replace(/\s+/g, '');
  if (!typed) return '';
  if (!typed.includes('@')) {
    if (!selected) return '';
    return `${typed}@${selected}`;
  }
  const at = typed.lastIndexOf('@');
  const local = typed.slice(0, at);
  const typedDomain = typed.slice(at + 1);
  if (!local) return '';
  if (sendingDomainAllowed(typedDomain, allowedDomains)) return `${local}@${typedDomain.toLowerCase()}`;
  if (selected && sendingDomainAllowed(selected, allowedDomains)) return `${local}@${selected}`;
  return `${local}@${typedDomain}`;
}

export function campaignContentError(input: {
  fromName: string;
  mailbox: string;
  domain: string;
  subject: string;
  allowedDomains: string[];
}): string | null {
  const missing: string[] = [];
  if (!input.fromName.trim()) missing.push('from name');
  if (!input.subject.trim()) missing.push('subject');
  const address = composeCampaignFromAddress(input.mailbox, input.domain, input.allowedDomains);
  if (!address) {
    if (input.mailbox.trim()) {
      return 'Choose app.mailvoidr.com, or verify a sending domain.';
    }
    missing.push('from address');
  } else if (!isEmailAddress(address)) {
    return 'Enter a valid from address.';
  } else {
    const host = address.slice(address.lastIndexOf('@') + 1);
    if (!sendingDomainAllowed(host, input.allowedDomains)) {
      return 'Sender domain is not verified. Choose app.mailvoidr.com, or verify this domain.';
    }
  }
  if (missing.length === 0) return null;
  const labels = missing.map((item, index) => (index === 0 ? item.charAt(0).toUpperCase() + item.slice(1) : item));
  if (labels.length === 1) return `${labels[0]} is required.`;
  const last = labels[labels.length - 1];
  return `${labels.slice(0, -1).join(', ')}, and ${last} are required.`;
}

export function importFinishedCopy(job: {
  added_count: number | null;
  updated_count: number | null;
  rejected_count: number | null;
  doi_required?: boolean;
  message?: string | null;
}): string {
  const summary = `Import finished. ${formatCount(job.added_count)} added, ${formatCount(job.updated_count)} updated, ${formatCount(job.rejected_count)} rejected.`;
  const waiting = job.doi_required ? ' New contacts stay pending until they confirm the email.' : '';
  const detail = job.message ? ` ${job.message}` : '';
  return `${summary}${waiting}${detail}`;
}

export function manualResubscribeBlocked(status: string): boolean {
  return status === 'unsubscribed' || status === 'bounced' || status === 'complained';
}
