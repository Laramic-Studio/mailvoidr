export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  two_factor_enabled?: boolean;
  selected_workspace_id: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  region?: string;
  role?: string;
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
