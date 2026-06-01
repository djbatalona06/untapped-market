/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://xxxx.supabase.co */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon/public key (safe to ship to the browser). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /**
   * Comma-separated email allowlist used to bootstrap admin access before any
   * profile row has `is_admin = true`. Server-side RLS remains the source of
   * truth; this only gates client-side UI affordances.
   */
  readonly VITE_ADMIN_EMAILS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
