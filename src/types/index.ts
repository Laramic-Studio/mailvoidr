export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
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
}

export interface VirtualEmail {
  id: string;
  address: string;
  label: string | null;
  messages: number;
  unread: number;
  ttl: string;
  forwarding: string | null;
  created: string;
}

export interface SandboxInbox {
  id: string;
  username: string;
  smtp_host: string;
  smtp_port: number;
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
