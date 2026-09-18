import 'server-only'

import type { QueryData } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

function templatesQuery(supabase: Supabase) {
  return supabase
    .from('cover_letter_templates')
    .select('id, name, base_pdf_path, signature_pdf_path, font_path, layout, is_default')
    .order('created_at', { ascending: false })
}

export type TemplateItem = QueryData<ReturnType<typeof templatesQuery>>[number]

export async function getTemplates(): Promise<TemplateItem[]> {
  const supabase = await createClient()
  const { data, error } = await templatesQuery(supabase)

  if (error) throw new Error(`Vorlagen konnten nicht geladen werden: ${error.message}`)

  return data
}

function coverLetterQuery(supabase: Supabase, id: string) {
  return supabase
    .from('cover_letters')
    .select(
      `
      id,
      title,
      body,
      updated_at,
      template:cover_letter_templates (id, name, layout),
      used_in:applications!applications_cover_letter_id_fkey (id, company)
    `,
    )
    .eq('id', id)
    .single()
}

export type CoverLetterDetail = QueryData<ReturnType<typeof coverLetterQuery>>

export async function getCoverLetter(id: string): Promise<CoverLetterDetail | null> {
  const supabase = await createClient()
  const { data, error } = await coverLetterQuery(supabase, id)

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Anschreiben konnte nicht geladen werden: ${error.message}`)
  }

  return data
}