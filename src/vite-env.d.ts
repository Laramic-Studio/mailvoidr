/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BYPASS_AUTH?: string;
  readonly VITE_WS_URL?: string;
  /** Unlayer project ID (free plan still shows Unlayer branding). */
  readonly VITE_UNLAYER_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
