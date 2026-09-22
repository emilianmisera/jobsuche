import 'server-only'

import { createClient } from '@/lib/supabase/server'

export async function isGmailConnected(): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.from('email_accounts').select('user_id').maybeSingle()

  return data !== null
}