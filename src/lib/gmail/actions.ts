'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

import { runGmailSync, type SyncResult } from '@/lib/gmail/sync'

export async function disconnectGmail(): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht angemeldet.' }

  const { error } = await supabase.from('email_accounts').delete().eq('user_id', user.id)

  if (error) return { error: 'Verbindung konnte nicht getrennt werden.' }

  revalidatePath('/einstellungen')
  return { error: null }
}

export async function syncGmail(): Promise<{ error: string | null; result?: SyncResult }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht angemeldet.' }

  try {
    const result = await runGmailSync(supabase, user.id)

    revalidatePath('/einstellungen')
    revalidatePath('/bewerbungen', 'layout')

    return { error: null, result }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Sync fehlgeschlagen.' }
  }
}

export async function acceptSuggestion(messageId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { data: message } = await supabase
    .from('email_messages')
    .select('application_id, suggested_status, state')
    .eq('id', messageId)
    .single()

  if (!message?.application_id || !message.suggested_status || message.state !== 'pending') {
    return { error: 'Der Vorschlag ist nicht mehr offen.' }
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: message.suggested_status })
    .eq('id', message.application_id)

  if (error) return { error: 'Status konnte nicht geändert werden.' }

  await supabase
    .from('email_messages')
    .update({ state: 'accepted', seen_at: new Date().toISOString() })
    .eq('id', messageId)

  revalidatePath('/bewerbungen', 'layout')
  return { error: null }
}

export async function dismissSuggestion(messageId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('email_messages')
    .update({ state: 'dismissed', seen_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('state', 'pending')

  if (error) return { error: 'Vorschlag konnte nicht verworfen werden.' }

  revalidatePath('/bewerbungen', 'layout')
  return { error: null }
}

/** Automatische Änderungen als gesehen markieren, sobald das Panel offen ist. */
export async function markApplicationSeen(applicationId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('email_messages')
    .update({ seen_at: new Date().toISOString() })
    .eq('application_id', applicationId)
    .eq('state', 'auto_applied')
    .is('seen_at', null)

  revalidatePath('/bewerbungen', 'layout')
}