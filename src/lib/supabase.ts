import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ──────────────────────────────────────────────────────────────────────────
// Supabase client with graceful degradation.
//
// When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are present the app talks to
// a real Supabase backend (auth, media storage, RLS-protected tables). When
// they're absent — local demos, CI, this PR's build — `supabase` is `null` and
// every consumer falls back to the original in-memory mock behavior. This keeps
// `npm run build` green without secrets while staying production-ready the
// moment the env vars are set in the deploy environment.
// ──────────────────────────────────────────────────────────────────────────

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Email allowlist used only to bootstrap the first admin (see vite-env.d.ts). */
export const ADMIN_EMAIL_ALLOWLIST: string[] = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Public storage bucket that holds approved strain/dispensary imagery. */
export const MEDIA_BUCKET = 'media';

/** Build a public URL for an object stored in the media bucket. */
export function mediaPublicUrl(path: string): string | undefined {
  if (!supabase || !path) return undefined;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
