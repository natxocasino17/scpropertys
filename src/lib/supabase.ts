import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Prefix that isolates THIS website's data inside a shared Supabase project. */
export const DB_PREFIX = (import.meta.env.VITE_DB_PREFIX as string | undefined) || 'sc_'

/** Table names (prefixed so they never collide with your other websites). */
export const TABLES = {
  properties: `${DB_PREFIX}properties`,
  leads: `${DB_PREFIX}leads`,
  settings: `${DB_PREFIX}settings`,
  notes: `${DB_PREFIX}property_notes`,
}

/** Storage bucket name (Supabase buckets can't contain "_", so we use "-"). */
export const STORAGE_BUCKET = `${DB_PREFIX.replace(/_/g, '-')}media`

/** Private bucket for admin-only files (plans, PDFs). Not publicly readable. */
export const STORAGE_PRIVATE_BUCKET = `${DB_PREFIX.replace(/_/g, '-')}private`

/** Is Supabase configured? If not, the site runs in beautiful demo mode. */
export const isSupabaseConfigured = Boolean(url && anonKey)

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!_client) {
    _client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return _client
}
