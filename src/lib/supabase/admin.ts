import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

/**
 * Umgeht RLS vollständig. Nur für Hintergrundjobs ohne Session,
 * niemals in einer Route, die auf Nutzereingaben reagiert.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) throw new Error('Supabase Admin ist nicht konfiguriert.')

  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}