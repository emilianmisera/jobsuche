'use server'

import { revalidatePath } from 'next/cache'

import { STATUS_ORDER, type ApplicationStatus } from '@/lib/applications/status'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error: string | null }

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<ActionResult> {
  if (!STATUS_ORDER.includes(status)) {
    return { error: 'Unbekannter Status.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nicht angemeldet.' }
  }

  const { error } = await supabase.from('applications').update({ status }).eq('id', id)

  if (error) {
    return { error: 'Status konnte nicht geändert werden.' }
  }

  revalidatePath('/bewerbungen')
  return { error: null }
}