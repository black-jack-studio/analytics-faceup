import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. ' +
      'Copy .env.example to .env.local and fill them in.',
  )
}

/**
 * Read-only Supabase client for the analytics dashboard.
 *
 * The dashboard must never mutate game data, so:
 * - Use the `anon` key, never the `service_role` key (which bypasses RLS).
 * - Enforce read-only access at the database level with RLS policies that
 *   only grant SELECT to the role backing this key (see README "Supabase
 *   read-only setup").
 * - `db.schema` defaults to `public`; override per-query if your analytics
 *   views live in a dedicated schema (e.g. `analytics`).
 */
export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  },
)
