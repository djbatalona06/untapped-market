import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// When env vars are missing (local dev without Supabase configured), we expose a
// stub client that throws on use so the UI can still run on mock data.
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
    : (new Proxy(
        {},
        {
          get() {
            throw new Error(
              '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. Copy .env.example to .env.local.',
            )
          },
        },
      ) as ReturnType<typeof createClient>)

export const isSupabaseConfigured = Boolean(url && anonKey)
