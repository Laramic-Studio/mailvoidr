/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BYPASS_AUTH?: string;
  readonly VITE_WS_URL?: string;
  /** Unlayer project ID (free plan still shows Unlayer branding). */
  readonly VITE_UNLAYER_PROJECT_ID?: string;
  /** Google reCAPTCHA v2 site key (login/register). */
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
