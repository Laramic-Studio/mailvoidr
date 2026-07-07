export const API_KEY_ENVIRONMENTS = ['live', 'test'] as const;

export type ApiKeyEnvironment = (typeof API_KEY_ENVIRONMENTS)[number];

export const LIVE_API_KEY_SCOPES = [
  'send.write',
  'logs.read',
  'domains.read',
  'templates.read',
  'analytics.read',
] as const;

export const TEST_API_KEY_SCOPES = [
  'sandbox.send',
  'sandbox.messages.read',
  'sandbox.messages.write',
] as const;

export const API_KEY_SCOPES = [...LIVE_API_KEY_SCOPES, ...TEST_API_KEY_SCOPES] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export const DEFAULT_LIVE_API_KEY_SCOPES: ApiKeyScope[] = ['send.write'];

export const DEFAULT_TEST_API_KEY_SCOPES: ApiKeyScope[] = ['sandbox.send'];

export function scopesForEnvironment(environment: ApiKeyEnvironment): readonly ApiKeyScope[] {
  return environment === 'test' ? TEST_API_KEY_SCOPES : LIVE_API_KEY_SCOPES;
}

export function defaultScopesForEnvironment(environment: ApiKeyEnvironment): ApiKeyScope[] {
  return environment === 'test'
    ? [...DEFAULT_TEST_API_KEY_SCOPES]
    : [...DEFAULT_LIVE_API_KEY_SCOPES];
}
