/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_API_URL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
}
