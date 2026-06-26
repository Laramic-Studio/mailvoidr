export type OAuthProvider = "github" | "google";

/** Laravel web origin (OAuth routes live outside `/api/v1`). */
export function appOrigin(): string {
  const api = import.meta.env.VITE_API_URL ?? "http://ui.test/api/v1";
  return api.replace(/\/api\/v1\/?$/, "");
}

export function oauthRedirectUrl(provider: OAuthProvider, inviteToken?: string | null): string {
  const url = new URL(`${appOrigin()}/auth/${provider}/redirect`);
  if (inviteToken) {
    url.searchParams.set("invite_token", inviteToken);
  }
  return url.toString();
}

export function startOAuth(provider: OAuthProvider, inviteToken?: string | null): void {
  window.location.assign(oauthRedirectUrl(provider, inviteToken));
}
