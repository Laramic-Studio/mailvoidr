export const TOKEN_STORAGE_KEY = 'mailvoidr_access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'mailvoidr_refresh_token';
export const WORKSPACE_STORAGE_KEY = 'mailvoidr_workspace_id';

export function readAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function writeAccessToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}
