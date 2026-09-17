import 'server-only'

import type { QueryData } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

function applicationsQuery(supabase: Awaited<ReturnType<typeof createClient>>) {
  return supabase
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
}

export type ApplicationListItem = QueryData<ReturnType<typeof applicationsQuery>>[number]

export async function getApplications(): Promise<ApplicationListItem[]> {
  const supabase = await createClient()
  const { data, error } = await applicationsQuery(supabase)

  if (error) {
    throw new Error(`Bewerbungen konnten nicht geladen werden: ${error.message}`)
  }

  return data
}