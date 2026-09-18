import 'server-only'

import type { QueryData } from '@supabase/supabase-js'

import { sanitizeSearch } from '@/lib/search'
import { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

function cvsQuery(supabase: Supabase, search?: string) {
  let builder = supabase
    .from('documents')
    .select(
      `
      id,
      title,
      storage_path,
      size_bytes,
      created_at,
      updated_at,
      used_as_cv:applications!applications_cv_document_id_fkey (count),
      used_as_attachment:application_attachments (count)
    `,
    )
    .eq('type', 'cv')
    .order('created_at', { ascending: false })

  const term = sanitizeSearch(search)

  if (term) {
    builder = builder.ilike('title', `%${term}%`)
  }

  return builder
}

export type CvListItem = QueryData<ReturnType<typeof cvsQuery>>[number]

export async function getCvs(search?: string): Promise<CvListItem[]> {
  const supabase = await createClient()
  const { data, error } = await cvsQuery(supabase, search)

  if (error) throw new Error(`Lebensläufe konnten nicht geladen werden: ${error.message}`)

  return data
}

function coverLettersQuery(supabase: Supabase, search?: string) {
  let builder = supabase
    .from('cover_letters')
    .select(
      `
      id,
      title,
      updated_at,
      used_in:applications!applications_cover_letter_id_fkey (count)
    `,
    )
    .order('created_at', { ascending: false })

  const term = sanitizeSearch(search)

  if (term) {
    builder = builder.ilike('title', `%${term}%`)
  }

  return builder
}

export type CoverLetterListItem = QueryData<ReturnType<typeof coverLettersQuery>>[number]

export async function getCoverLetters(search?: string): Promise<CoverLetterListItem[]> {
  const supabase = await createClient()
  const { data, error } = await coverLettersQuery(supabase, search)

  if (error) throw new Error(`Anschreiben konnten nicht geladen werden: ${error.message}`)

  return data
}

export type CvDetail = CvListItem & { signedUrl: string }

export async function getCv(id: string): Promise<CvDetail | null> {
  const supabase = await createClient()

  // Ohne Suchbegriff, hier zählt nur die ID
  const { data, error } = await cvsQuery(supabase).eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Lebenslauf konnte nicht geladen werden: ${error.message}`)
  }

  // Der Bucket ist privat, die Datei braucht eine signierte URL.
  const signed = await supabase.storage
    .from('documents')
    .createSignedUrl(data.storage_path, 60 * 60)

  return { ...data, signedUrl: signed.data?.signedUrl ?? '' }
}