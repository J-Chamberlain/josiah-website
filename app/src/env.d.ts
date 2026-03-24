/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly SANITY_PROJECT_ID?: string;
  readonly SANITY_DATASET?: string;
  readonly SANITY_API_VERSION?: string;
  readonly SANITY_READ_TOKEN?: string;
  readonly SANITY_FETCH_TIMEOUT_MS?: string;
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly RESEND_API_KEY?: string;
  readonly EMAIL_FROM?: string;
  readonly AUTHOR_EMAIL?: string;
  readonly MODERATION_SIGNING_SECRET?: string;
  readonly SUBSCRIBE_SIGNING_SECRET?: string;
  readonly SANITY_WEBHOOK_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
