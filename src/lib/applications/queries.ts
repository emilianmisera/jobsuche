import 'server-only'

import type { QueryData } from '@supabase/supabase-js'

import { sanitizeSearch } from '@/lib/search'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationStatus } from '@/lib/applications/status'

type Supabase = Awaited<ReturnType<typeof createClient>>

function applicationsQuery(supabase: Supabase, search?: string) {
  let builder = supabase
    .from('applications')
    .select(
      `
      id,
      company,
      position,
      location,
      is_remote,
      employment_type,
      status,
      applied_at,
      next_action_at,
      next_action_note,
      created_at,
      cv:documents!applications_cv_document_id_fkey (id, title),
      cover_letter:cover_letters!applications_cover_letter_id_fkey (id, title),
      attachments:application_attachments (document:documents (id, title))
    `,
    )
    .order('created_at', { ascending: false })

  const term = sanitizeSearch(search)

  if (term) {
    builder = builder.or(`company.ilike.%${term}%,position.ilike.%${term}%`)
  }

  return builder
}

type ApplicationRow = QueryData<ReturnType<typeof applicationsQuery>>[number]

/** has_update heißt: offener Vorschlag oder ungesehene automatische Änderung. */
export type ApplicationListItem = ApplicationRow & { has_update: boolean }

export async function getApplications(search?: string): Promise<ApplicationListItem[]> {
  const supabase = await createClient()

  const [{ data, error }, updates] = await Promise.all([
    applicationsQuery(supabase, search),
    supabase
      .from('email_messages')
      .select('application_id')
      .not('application_id', 'is', null)
      .or('state.eq.pending,and(state.eq.auto_applied,seen_at.is.null)'),
  ])

  if (error) {
    throw new Error(`Bewerbungen konnten nicht geladen werden: ${error.message}`)
  }

  const updated = new Set((updates.data ?? []).map((row) => row.application_id))

  return data.map((row) => ({ ...row, has_update: updated.has(row.id) }))
}

export type DocumentOption = { id: string; title: string }

export async function getFormOptions(): Promise<{
  cvs: DocumentOption[]
  coverLetters: DocumentOption[]
}> {
  const supabase = await createClient()

  const [cvs, coverLetters] = await Promise.all([
    supabase.from('documents').select('id, title').eq('type', 'cv').order('title'),
    supabase.from('cover_letters').select('id, title').order('title'),
  ])

  if (cvs.error || coverLetters.error) {
    throw new Error('Dokumente konnten nicht geladen werden.')
  }

  return { cvs: cvs.data, coverLetters: coverLetters.data }
}

function applicationQuery(supabase: Supabase, id: string) {
  return supabase
    .from('applications')
    .select(
      `
      *,
      cv:documents!applications_cv_document_id_fkey (id, title),
      cover_letter:cover_letters!applications_cover_letter_id_fkey (id, title),
      attachments:application_attachments (document:documents (id, title)),
      activities (id, type, message, payload, created_at)
    `,
    )
    .eq('id', id)
    .order('created_at', { referencedTable: 'activities', ascending: false })
    .single()
}

export type ApplicationDetail = QueryData<ReturnType<typeof applicationQuery>>

export async function getApplication(id: string): Promise<ApplicationDetail | null> {
  const supabase = await createClient()
  const { data, error } = await applicationQuery(supabase, id)

  // PGRST116 heißt "kein Treffer", das ist kein Fehler sondern ein 404
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Bewerbung konnte nicht geladen werden: ${error.message}`)
  }

  return data
}

export type Suggestion = {
  id: string
  subject: string
  suggested_status: ApplicationStatus
  confidence: number | null
  received_at: string
}

export async function getApplicationUpdates(
  applicationId: string,
): Promise<{ suggestions: Suggestion[]; hasUnseen: boolean }> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('email_messages')
    .select('id, subject, suggested_status, confidence, received_at, state')
    .eq('application_id', applicationId)
    .or('state.eq.pending,and(state.eq.auto_applied,seen_at.is.null)')
    .order('received_at', { ascending: false })

  const rows = data ?? []

  const suggestions = rows.flatMap((row) =>
    row.state === 'pending' && row.suggested_status
      ? [
          {
            id: row.id,
            subject: row.subject,
            suggested_status: row.suggested_status,
            confidence: row.confidence,
            received_at: row.received_at,
          },
        ]
      : [],
  )

  return { suggestions, hasUnseen: rows.some((row) => row.state === 'auto_applied') }
}