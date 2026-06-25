export const API_KEY_SCOPES = [
  'send.write',
  'logs.read',
  'domains.read',
  'templates.read',
  'analytics.read',
  'inboxes.write',
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export const DEFAULT_API_KEY_SCOPES: ApiKeyScope[] = ['send.write'];
