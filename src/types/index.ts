export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  timezone?: string | null;
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
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
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

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  requests_count: number;
  last_used_at: string | null;
  created_at: string | null;
  revoked_at: string | null;
  is_revoked: boolean;
}

export interface ApiKeyListResponse {
  data: ApiKey[];
  meta: {
    available_scopes: string[];
  };
}

export interface SmtpCredential {
  id: string;
  name: string;
  host: string;
  port: number;
  encryption: string;
  username: string;
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
  status?: string;
  search?: string;
  domain?: string;
  period?: '24h' | '7d' | '30d';
}

export interface CreditPack {
  size: number;
  price_cents: number;
  price_label: string;
}

export interface CreditsSummary {
  live_sending_enabled: boolean;
  free_allowance: number;
  free_remaining: number;
  free_used: number;
  purchased_balance: number;
  total_available: number;
  billing_enabled: boolean;
  credit_packs: CreditPack[];
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  reference_id: string | null;
  created_at: string | null;
}

export interface CreditsResponse {
  credits: CreditsSummary;
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

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
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
