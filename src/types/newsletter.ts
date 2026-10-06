export const SUBSCRIBER_STATUSES = [
  'pending',
  'subscribed',
  'unsubscribed',
  'bounced',
  'complained',
] as const;

export const CAMPAIGN_STATUSES = [
  'draft',
  'scheduled',
  'in_review',
  'sending',
  'paused',
  'auto_paused',
  'sent',
  'cancelled',
  'failed',
] as const;

export const AB_STATUSES = [
  'testing',
  'waiting',
  'winner_picked',
  'needs_manual_pick',
] as const;

export const AUTO_PAUSE_REASONS = [
  'bounce_rate_threshold',
  'complaint_rate_threshold',
  'deliverability_hold',
] as const;

export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type AbStatus = (typeof AB_STATUSES)[number];
export type AutoPauseReason = (typeof AUTO_PAUSE_REASONS)[number];
export type AbVariant = 'a' | 'b';
export type AbWinnerRule = 'click_rate' | 'manual';
export type ImportColumnRole = 'email' | 'first_name' | 'last_name' | 'tags' | 'custom_field' | 'skip';

export interface PageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface NewsletterSettings {
  physical_address: string | null;
  doi_for_imports?: boolean;
  doi_imports_editable?: boolean;
  doi_imports_disabled_by?: { name: string; at: string } | null;
  pending_purge_days?: number;
  plan?: string | null;
  review_turnaround?: string | null;
  monthly_send_limit?: number | null;
  monthly_sends_used?: number | null;
  sends_per_minute?: number | null;
  first_large_send_threshold?: number | null;
  max_csv_bytes?: number | null;
}

export interface AudienceCampaignRef {
  id: string;
  name: string;
  sent_at: string | null;
}

export interface Audience {
  id: string;
  name: string;
  description: string | null;
  subscribed_count: number;
  pending_count: number;
  unsubscribed_count: number;
  bounced_count: number;
  complained_count: number;
  /** Already a percent (0.1 = 0.1%). Null when there is no sample. */
  confirmation_rate: number | null;
  suppressed_count?: number;
  last_campaign?: AudienceCampaignRef | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AudienceListResponse {
  data: Audience[];
  meta?: PageMeta;
}

export interface Subscriber {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  status: SubscriberStatus | string;
  source: string | null;
  tags: string[];
  fields: Record<string, string>;
  created_at: string | null;
}

export interface ConsentLogEntry {
  timestamp: string | null;
  ip: string | null;
  user_agent: string | null;
  source: string | null;
  form_id: string | null;
  import_id: string | null;
  consent_text_version: string | null;
  confirmed_at: string | null;
  confirmed_ip: string | null;
}

export interface SubscriberActivity {
  campaign_id: string;
  campaign_name: string;
  received_at: string | null;
  clicks: number;
}

export interface SubscriberDetail extends Subscriber {
  consent_log: ConsentLogEntry[];
  activity: SubscriberActivity[];
}

export interface SubscriberListResponse {
  data: Subscriber[];
  meta?: PageMeta & {
    counts?: Partial<Record<string, number>>;
    tags?: string[];
    can_export?: boolean;
  };
}

export interface ImportColumn {
  header: string;
  role: ImportColumnRole;
  field_name?: string | null;
}

export interface NewsletterImport {
  id: string;
  audience_id: string;
  status: 'mapping' | 'processing' | 'completed' | 'failed' | string;
  delimiter: string | null;
  headers: string[];
  preview_rows: string[][];
  max_csv_bytes: number | null;
  tags: string[];
  uploaded_count: number | null;
  added_count: number | null;
  updated_count: number | null;
  rejected_count: number | null;
  skipped_suppressed_count: number | null;
  error_report_url: string | null;
  message: string | null;
}

export interface NewsletterFormEmail {
  from_name: string;
  subject: string;
  logo_url: string | null;
  body: string;
  button_label: string;
}

export interface NewsletterFormPage {
  logo_url: string | null;
  message: string;
  redirect_url: string | null;
}

export interface NewsletterForm {
  id: string;
  name: string;
  slug: string;
  audience_id: string;
  audience_name: string | null;
  status: string;
  signups_30d: number;
  confirmation_rate: number | null;
  public_url: string | null;
  embed_html: string | null;
  first_name_enabled: boolean;
  button_label: string;
  consent_text: string;
  consent_version: number | null;
  redirect_url: string | null;
  honeypot_enabled: boolean;
  captcha_enabled: boolean;
  doi_required: boolean;
  confirmation_email: NewsletterFormEmail;
  confirmation_page: NewsletterFormPage;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NewsletterFormListResponse {
  data: NewsletterForm[];
  meta?: PageMeta;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus | string;
  audience_id: string | null;
  audience_name: string | null;
  include_tags: string[];
  exclude_tags: string[];
  eligible_count: number | null;
  pending_excluded: number | null;
  suppressed_excluded: number | null;
  total_recipients: number | null;
  sent_count: number;
  /** Workspace send cap. Used for the pre-send "At least {n} to send" floor. */
  sends_per_minute: number | null;
  /** Observed pace while sending. Never substitute the cap for this. */
  recent_sends_per_minute: number | null;
  click_rate: number | null;
  from_name: string | null;
  from_address: string | null;
  reply_to: string | null;
  subject: string | null;
  subject_b: string | null;
  preview_text: string | null;
  html: string | null;
  text: string | null;
  design_json?: unknown;
  template_id: string | null;
  template_version_id: string | null;
  ab_test_enabled: boolean;
  ab_test_share: number | null;
  ab_winner_rule: AbWinnerRule | null;
  ab_wait_hours: number | null;
  ab_status: AbStatus | string | null;
  ab_variant_a_clicks: number | null;
  ab_variant_b_clicks: number | null;
  scheduled_at: string | null;
  timezone: string | null;
  sent_at: string | null;
  requires_review: boolean;
  review_reason: string | null;
  review_turnaround: string | null;
  auto_pause_reason: string | null;
  has_unsubscribe_link: boolean | null;
  has_physical_address: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CampaignListResponse {
  data: Campaign[];
  meta?: PageMeta;
}

export interface CampaignReportVariant {
  variant: AbVariant | string;
  subject: string;
  recipients: number;
  unique_clicks: number;
  click_rate: number | null;
  winner: boolean;
}

export interface CampaignReport {
  click_rate: number | null;
  delivered_count: number;
  unsubscribed_count: number;
  bounced_count: number;
  bounced_hard_count: number | null;
  bounced_soft_count: number | null;
  complaint_rate: number | null;
  complaints_available: boolean;
  open_rate: number | null;
  unique_opens: number | null;
  ab: {
    picked_by: 'rule' | 'manual' | null;
    winner: AbVariant | string | null;
    variants: CampaignReportVariant[];
  } | null;
  top_links: Array<{ url: string; unique_clicks: number }>;
}

export interface CampaignRecipient {
  id: string;
  email: string;
  status: string;
  clicked: boolean;
  opened: boolean;
}

export interface CampaignRecipientListResponse {
  data: CampaignRecipient[];
  meta?: PageMeta;
}

export interface PublicFormPayload {
  name: string;
  tenant_name: string;
  logo_url: string | null;
  first_name_enabled: boolean;
  button_label: string;
  consent_text: string;
  honeypot_enabled: boolean;
  captcha_enabled: boolean;
}

export interface PublicSubscribeResult {
  masked_email: string;
  message: string | null;
}

export type PublicConfirmOutcome = 'confirmed' | 'already_confirmed' | 'expired' | 'pending';

export interface PublicConfirmState {
  outcome: PublicConfirmOutcome | string;
  tenant_name: string;
  logo_url: string | null;
  message: string | null;
  redirect_url: string | null;
}

export interface PublicUnsubscribeState {
  tenant_name: string;
  logo_url: string | null;
  masked_email: string;
  status: string;
  can_resubscribe: boolean;
}

export interface PublicResubscribeResult {
  masked_email: string;
  requires_confirmation: boolean;
  message: string | null;
}
