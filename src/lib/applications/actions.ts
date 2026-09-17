'use server'

import { revalidatePath } from 'next/cache'

import { STATUS_ORDER, type ApplicationStatus } from '@/lib/applications/status'
import { createClient } from '@/lib/supabase/server'
import { applicationInputSchema, type ApplicationInput } from '@/lib/applications/schema'

export type ActionResult = { error: string | null }
export type CreateResult = { error: string | null; fieldErrors?: Record<string, string> }

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

export async function createApplication(input: ApplicationInput): Promise<CreateResult> {
  const parsed = applicationInputSchema.safeParse(input)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}

    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      fieldErrors[key] ??= issue.message
    }

    return { error: 'Bitte prüf die markierten Felder.', fieldErrors }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nicht angemeldet.' }
  }

  const values = parsed.data

  const { error } = await supabase.from('applications').insert({
    ...values,
    user_id: user.id,
    // Entwürfe haben kein Absendedatum, den Rest setzt der Trigger.
    applied_at: values.status === 'draft' ? null : values.applied_at,
  })

  if (error) {
    return { error: 'Bewerbung konnte nicht angelegt werden.' }
  }

  revalidatePath('/bewerbungen')
  return { error: null }
}