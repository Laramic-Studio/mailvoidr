export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  timezone?: string | null;
  avatar_url?: string | null;
  email_verified: boolean;
  two_factor_enabled?: boolean;
  onboarding_completed: boolean;
  onboarding_step?: number | null;
  selected_workspace_id: string | null;
  created_at?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  region?: string;
  use_case?: string | null;
  role?: string;
  description?: string | null;
  is_active?: boolean;
  settings?: WorkspaceSettings;
}

export interface WorkspaceSettings {
  require_two_factor: boolean;
  allow_public_invites: boolean;
  default_member_role: string;
}

export interface NotificationPreferences {
  deliverability_alerts: boolean;
  new_invitations: boolean;
  weekly_digest: boolean;
  product_updates: boolean;
  billing_alerts: boolean;
}

export interface SettingsSnapshot {
  profile: {
    name: string;
    email: string;
    timezone: string | null;
    email_verified: boolean;
    two_factor_enabled: boolean;
    avatar_url: string | null;
  };
  notifications: NotificationPreferences;
  workspace: Workspace | null;
  workspace_settings: WorkspaceSettings;
}

export interface TwoFactorSetup {
  qr_svg: string;
  otpauth_url: string;
  secret_key: string;
}

export interface WorkspaceListResponse {
  owned: Workspace[];
  member: Workspace[];
  meta?: {
    owned_workspaces: OwnedWorkspaceQuota;
  };
}

export interface OwnedWorkspaceQuota {
  used: number;
  limit: number | null;
  remaining: number | null;
  can_create: boolean;
  plan_slug: string;
  blocked_reason?: string | null;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface InvitationPreview {
  workspace: Workspace;
  role: string;
  invited_by: UserSummary | null;
  invited_at: string | null;
  email?: string;
  requires_signup?: boolean;
}

export interface PendingInvitation {
  workspace_id: string;
  role: string;
  invited_at: string | null;
  invite_token: string | null;
  workspace: Workspace;
}

export interface PendingInvitationsResponse {
  data: PendingInvitation[];
}

export interface WorkspaceRoleOption {
  value: string;
  label: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  role_label: string;
  joined_at: string | null;
  last_active_at: string | null;
  membership_id: string | null;
}

export interface TeamMemberListResponse {
  data: TeamMember[];
    meta: {
    can_manage: boolean;
    can_invite: boolean;
    invite_blocked_reason?: string | null;
    default_member_role: string;
    roles_enabled: boolean;
    assignable_roles: WorkspaceRoleOption[];
  };
}

export interface TeamInvitation {
  id: string;
  type?: 'member' | 'email';
  user_id: string | null;
  email: string;
  name: string | null;
  role: string;
  role_label: string;
  invited_at: string | null;
  expires_at: string | null;
  invited_by_id: string;
}

export interface TeamInvitationListResponse {
  data: TeamInvitation[];
}

export interface TeamActivity {
  id: string;
  event: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
  actor: UserSummary | null;
}

export interface TeamActivityListResponse {
  data: TeamActivity[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface VirtualEmail {
  id: string;
  email_address: string;
  label: string | null;
  forward_to: string | null;
  messages_count: number;
  unread_count: number;
  expires_at: string | null;
  is_expired: boolean;
  is_active: boolean;
  created_at: string | null;
}

export interface VirtualEmailListResponse {
  data: VirtualEmail[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  formatted_size: string;
}

export interface EmailHeader {
  key: string;
  value: string;
}

export interface EmailAnalysis {
  status: 'pending' | 'completed' | 'failed';
  spam_score: number | null;
  spam_rating: 'pass' | 'warning' | 'fail' | null;
  spam_rules: Array<{
    id: string;
    description: string;
    points: number;
    status: 'pass' | 'warn' | 'fail';
  }>;
  html_support_score: number | null;
  html_issues_count: number;
  html_checks: Array<{
    client: string;
    platform: 'desktop' | 'mobile' | 'web';
    support_score: number;
    status: 'pass' | 'warn' | 'fail';
  }>;
  html_issues: Array<{
    element: string;
    client: string;
    message: string;
    status: 'warn' | 'fail';
  }>;
  analyzed_at: string | null;
}

export interface EmailMessageSummary {
  id: string;
  subject: string | null;
  from: string | null;
  to: string | null;
  preview: string | null;
  is_read: boolean;
  attachments_count: number;
  created_at: string | null;
  spam_score?: number | null;
  html_support_score?: number | null;
}

export interface EmailMessage extends EmailMessageSummary {
  cc?: string | null;
  bcc?: string | null;
  html_body?: string | null;
  text_body?: string | null;
  size?: number;
  formatted_size?: string;
  attachments?: EmailAttachment[];
  headers?: EmailHeader[];
  analysis?: EmailAnalysis | null;
}

export interface EmailMessageListResponse {
  data: EmailMessageSummary[];
  meta: {
    per_page: number;
    next_cursor?: string | null;
    prev_cursor?: string | null;
    current_page?: number;
    last_page?: number;
    total?: number;
  };
}

export interface SandboxInbox {
  id: string;
  name: string;
  username: string;
  password: string;
  smtp_host: string;
  smtp_port: number;
  messages_count: number;
  unread_count: number;
  is_active: boolean;
  created_at: string | null;
}

export interface SandboxStats {
  messages_last_24h: number;
}

export interface SandboxResponse {
  inbox: SandboxInbox | null;
  stats: SandboxStats | null;
}

export interface DomainDnsRecord {
  type: string;
  name: string;
  host?: string;
  value: string;
  purpose: string;
  note?: string;
}

export interface DomainRecordStatus {
  ownership: 'pass' | 'pending' | 'fail';
  spf: 'pass' | 'pending' | 'fail';
  dkim: 'pass' | 'pending' | 'fail';
}

export interface VerifiedDomain {
  id: string;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  ownership_verified: boolean;
  dkim_verified: boolean;
  spf_verified: boolean;
  verified_at: string | null;
  last_checked_at: string | null;
  created_at: string | null;
  dns_records: DomainDnsRecord[];
  records: DomainRecordStatus;
}

export interface DomainListResponse {
  data: VerifiedDomain[];
}

export interface WhitelistedSendingIp {
  id: string;
  ip_address: string;
  label: string | null;
  created_at: string | null;
}

export interface WhitelistedIpListResponse {
  data: WhitelistedSendingIp[];
}

export interface ApiKey {
  id: string;
  name: string;
  environment: 'live' | 'test';
  key_prefix: string;
  scopes: string[];
  requests_count: number;
  last_used_at: string | null;
  created_at: string | null;
  revoked_at: string | null;
  is_revoked: boolean;
  can_reveal: boolean;
}

export interface ApiKeyListResponse {
  data: ApiKey[];
  meta: {
    available_scopes: {
      live: string[];
      test: string[];
    };
    can_create_live: boolean;
    can_create_test: boolean;
  };
}

export interface SmtpCredential {
  id: string;
  name: string;
  host: string;
  port: number;
  alt_ports?: number[];
  encryption: string;
  username: string;
  password?: string;
  region: string;
  is_active: boolean;
  enabled_at: string | null;
  created_at: string | null;
}

export interface SmtpCredentialResponse {
  live_sending_enabled: boolean;
  credential: SmtpCredential | null;
}

export interface EmailSendSummary {
  id: string;
  from: string;
  recipient: string | null;
  recipients_count: number;
  subject: string | null;
  status: string;
  source: string;
  queued_at: string | null;
  sent_at: string | null;
  created_at: string | null;
}

export interface EmailSendHistoryResponse {
  data: EmailSendSummary[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface EmailSendLog {
  id: string;
  message_id: string | null;
  from: string;
  recipient: string | null;
  recipients: string[];
  domain: string;
  subject: string | null;
  status: string;
  source: string;
  error_message: string | null;
  response: string | null;
  queued_at: string | null;
  sent_at: string | null;
  bounced_at: string | null;
  created_at: string | null;
}

export interface EmailSendTimelineEvent {
  event: string;
  label: string;
  occurred_at: string;
  payload: Record<string, unknown> | null;
}

export interface EmailSendLogListResponse {
  data: EmailSendLog[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface EmailSendLogDetailResponse {
  email_send: EmailSendLog;
  timeline: EmailSendTimelineEvent[];
}

export interface SendLogFilters {
  status?: string | string[];
  search?: string;
  domain?: string;
  period?: '24h' | '7d' | '30d';
  page?: number;
}

export interface BillingUsageMetric {
  used: number;
  limit: number | null;
  remaining: number | null;
}

export interface CreditsSummary {
  live_sending_enabled: boolean;
  emails: BillingUsageMetric | null;
}

export interface CreditsResponse {
  credits: CreditsSummary;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  reference_id: string | null;
  created_at: string | null;
}

export interface CreditTransactionsResponse {
  data: CreditTransaction[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface EmailPreview {
  subject: string;
  from: string | null;
  html: string;
}

export type TemplateCategory = 'transactional' | 'marketing';

export type TemplateVisibility = 'public' | 'private';

export interface TemplateVariable {
  key: string;
  label?: string | null;
  default?: string | null;
  required?: boolean;
}

export interface TemplateVersion {
  id: string;
  version: number;
  subject: string;
  html_body?: string | null;
  text_body?: string | null;
  variables?: TemplateVariable[] | null;
  change_notes?: string | null;
  created_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  description?: string | null;
  variables?: TemplateVariable[] | null;
  is_active: boolean;
  visibility: TemplateVisibility;
  source_template_id?: string | null;
  published_at?: string | null;
  version_count?: number;
  sends_count?: number;
  subject?: string | null;
  current_version?: TemplateVersion | null;
  versions?: TemplateVersion[];
  created_at: string;
  updated_at: string;
}

export interface TemplateListResponse {
  data: EmailTemplate[];
}

export interface TemplateMarketplaceItem {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  description?: string | null;
  variables?: TemplateVariable[] | null;
  subject?: string | null;
  installs_count?: number;
  author?: {
    id: number;
    name: string;
  } | null;
  published_at?: string | null;
  current_version?: TemplateVersion | null;
  in_library: boolean;
}

export interface TemplateMarketplaceListResponse {
  data: TemplateMarketplaceItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface TemplatePreview {
  subject: string;
  html: string | null;
  text: string | null;
  variables: Record<string, string>;
  template_version_id: string;
}

export type WebhookStatus = 'active' | 'paused';

export interface WebhookEventOption {
  key: string;
  label: string;
  dispatchable: boolean;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret_prefix: string;
  events: string[];
  status: WebhookStatus;
  description?: string | null;
  success_rate?: number | null;
  deliveries_count?: number;
  last_delivery_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookEndpointListResponse {
  data: WebhookEndpoint[];
  meta: {
    available_events: WebhookEventOption[];
  };
}

export interface WebhookDelivery {
  id: string;
  webhook_endpoint_id: string;
  event: string;
  payload: Record<string, unknown>;
  status_code: number | null;
  response?: string | null;
  attempts: number;
  duration_ms: number | null;
  created_at: string;
  endpoint?: {
    id: string;
    url: string;
  };
}

export interface WebhookDeliveryListResponse {
  data: WebhookDelivery[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export type DashboardPeriod = '24h' | '7d' | '30d' | '90d';

export interface DashboardStat {
  key: string;
  label: string;
  value: string;
  delta: string | null;
  trend: 'up' | 'down';
  series: number[] | null;
}

export interface DashboardChartPoint {
  date: string;
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  delivery_rate: number;
  bounce_rate: number;
}

export interface DashboardDeliveryBreakdownItem {
  key: string;
  label: string;
  percent: number;
  tone: 'primary' | 'error' | 'info';
}

export interface DashboardRecentSend {
  id: string;
  recipient: string | null;
  subject: string | null;
  template: string | null;
  status: string;
  created_at: string | null;
}

export interface DashboardTopDomain {
  domain: string;
  sent: number;
  delivered: number;
}

export interface DashboardTopTemplate {
  id: string;
  name: string;
  sent: number;
  open: number | null;
}

export interface DashboardActivityItem {
  id: string;
  type: string;
  summary: string;
  actor: string;
  occurred_at: string | null;
}

export interface DashboardOverviewResponse {
  period: DashboardPeriod;
  stats: DashboardStat[];
  chart: {
    summary: {
      total_sent: number;
      delivery_rate: number;
    };
    series: DashboardChartPoint[];
  };
  delivery_breakdown: DashboardDeliveryBreakdownItem[];
  recent_sends: DashboardRecentSend[];
  top_domains: DashboardTopDomain[];
  top_templates: DashboardTopTemplate[];
  activity: DashboardActivityItem[];
  live_sending_enabled: boolean;
  usage: BillingUsage;
}

export interface AnalyticsSummary {
  total_sent: number;
  delivery_rate: number;
  open_rate: number | null;
  click_rate: number | null;
  bounce_rate: number;
  complaint_rate: number | null;
}

export interface AnalyticsVolumePoint {
  date: string;
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
}

export interface AnalyticsOverviewResponse {
  period: DashboardPeriod;
  summary: AnalyticsSummary;
  volume_chart: AnalyticsVolumePoint[];
  bounce_chart: Array<{ date: string; bounced: number; failed: number }>;
}

export interface AnalyticsEngagementResponse {
  period: DashboardPeriod;
  available: boolean;
  summary: {
    open_rate: number | null;
    click_rate: number | null;
    opens: number;
    clicks: number;
    total_open_events: number;
    total_click_events: number;
  };
  engagement_chart: Array<{ date: string; opens: number; clicks: number }>;
  providers: Array<{ name: string; value: number }>;
  devices: Array<{ name: string; value: number }>;
  geography: {
    available: boolean;
    data: Array<{ code: string; country: string; events: number; pct: number }>;
  };
}

export interface AnalyticsDomainRow {
  domain: string;
  sent: number;
  delivered: number;
  delivered_rate: number;
  bounced: number;
  bounce_rate: number;
}

export interface AnalyticsTemplateRow {
  id: string;
  name: string;
  sent: number;
  open_rate: number | null;
  click_rate: number | null;
}

export interface AnalyticsDomainsResponse {
  period: DashboardPeriod;
  data: AnalyticsDomainRow[];
}

export interface AnalyticsTemplatesResponse {
  period: DashboardPeriod;
  data: AnalyticsTemplateRow[];
}

export type SearchGroupType = 'sends' | 'templates' | 'domains' | 'virtual_emails';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
}

export interface SearchGroup {
  type: SearchGroupType;
  label: string;
  items: SearchResultItem[];
}

export interface SearchResponse {
  query: string;
  groups: SearchGroup[];
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string | null;
  data: Record<string, unknown>;
}

export interface NotificationsListResponse {
  data: AppNotification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    unread_count: number;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export type ApiEnvelope<T> = {
  data: T;
};

export interface BillingRegion {
  provider: 'paystack';
  currency: 'USD' | 'NGN';
  label: string;
  usd_ngn_rate: number;
}

export interface BillingPlanPrice {
  currency: string;
  amount: number | null;
  amount_minor: number | null;
  formatted: string;
  usd_amount: number | null;
}

export interface BillingPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  included_emails: number | null;
  limits: Record<string, unknown> | null;
  popular: boolean;
  price: BillingPlanPrice;
  quoted: boolean;
}

export interface BillingQuote {
  volume: number;
  tier_slug: string;
  price: BillingPlanPrice;
}

export interface PlansResponse {
  region: BillingRegion;
  quote: BillingQuote | null;
  plans: BillingPlan[];
}

export interface BillingCheckoutResponse {
  checkout_url: string;
  provider: 'paystack';
  currency: PricingCurrency;
  reference: string;
}

export interface BillingSubscription {
  id: string;
  status: string;
  is_active?: boolean;
  needs_renewal?: boolean;
  provider: string | null;
  currency: string;
  monthly_volume: number | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
}

export interface BillingUsage {
  plan_slug: string;
  emails: BillingUsageMetric;
  domains: BillingUsageMetric;
  virtual_inboxes: BillingUsageMetric;
  team_members: BillingUsageMetric;
}

export interface BillingContextResponse {
  payment_options: BillingRegion[];
  live_sending_enabled: boolean;
  subscription: BillingSubscription | null;
  plan: BillingPlan | null;
  usage: BillingUsage;
}

export type PricingCurrency = 'USD' | 'NGN';
