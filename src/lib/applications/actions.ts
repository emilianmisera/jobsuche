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

function parseInput(input: ApplicationInput) {
  const parsed = applicationInputSchema.safeParse(input)

  if (parsed.success) return { values: parsed.data, errors: null } as const

  const fieldErrors: Record<string, string> = {}
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0])
    fieldErrors[key] ??= issue.message
  }

  return { values: null, errors: fieldErrors } as const
}

export async function updateApplication(
  id: string,
  input: ApplicationInput,
): Promise<CreateResult> {
  const { values, errors } = parseInput(input)

  if (!values) {
    return { error: 'Bitte prüf die markierten Felder.', fieldErrors: errors }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht angemeldet.' }

  const { error } = await supabase
    .from('applications')
    .update({
      ...values,
      applied_at: values.status === 'draft' ? null : values.applied_at,
    })
    .eq('id', id)

  if (error) return { error: 'Änderungen konnten nicht gespeichert werden.' }

  revalidatePath('/bewerbungen', 'layout')
  return { error: null }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht angemeldet.' }

  const { error } = await supabase.from('applications').delete().eq('id', id)

  if (error) return { error: 'Bewerbung konnte nicht gelöscht werden.' }

  // Kein revalidatePath hier. Das würde die Detailroute neu rendern,
  // die es gerade nicht mehr gibt. Der Client navigiert und refresht.
  return { error: null }
}