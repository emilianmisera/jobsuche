'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { DEFAULT_LAYOUT } from '@/lib/cover-letters/layout'
import { parseLayout, type CoverLetterLayout } from '@/lib/cover-letters/layout'

export type CoverLetterResult = { error: string | null; id?: string }

export async function registerTemplate(input: {
  id: string
  name: string
  basePdfPath: string
  signaturePath: string | null
  fontPath: string | null
}): Promise<CoverLetterResult> {
  const name = input.name.trim() || 'Standard'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht angemeldet.' }

  for (const path of [input.basePdfPath, input.signaturePath, input.fontPath]) {
    if (path && !path.startsWith(`${user.id}/`)) return { error: 'Ungültiger Pfad.' }
  }

  // Erste Vorlage wird automatisch zur Standardvorlage
  const { count } = await supabase
    .from('cover_letter_templates')
    .select('id', { count: 'exact', head: true })

  const { error } = await supabase.from('cover_letter_templates').insert({
    id: input.id,
    user_id: user.id,
    name,
    base_pdf_path: input.basePdfPath,
    signature_pdf_path: input.signaturePath,
    font_path: input.fontPath,
    layout: DEFAULT_LAYOUT,
    is_default: (count ?? 0) === 0,
  })

  if (error) return { error: 'Vorlage konnte nicht gespeichert werden.' }

  revalidatePath('/einstellungen')
  revalidatePath('/dokumente')
  return { error: null, id: input.id }
}

export async function createCoverLetter(title: string): Promise<CoverLetterResult> {
  const trimmed = title.trim()

  if (!trimmed) return { error: 'Der Titel darf nicht leer sein.' }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht angemeldet.' }

  // Standardvorlage, sonst die neueste
  const { data: template } = await supabase
    .from('cover_letter_templates')
    .select('id')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!template) {
    return { error: 'Leg zuerst unter Settings eine Anschreiben-Vorlage an.' }
  }

  const { data, error } = await supabase
    .from('cover_letters')
    .insert({
      user_id: user.id,
      template_id: template.id,
      title: trimmed,
      body: '',
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Anschreiben konnte nicht angelegt werden.' }

  revalidatePath('/dokumente')
  return { error: null, id: data.id }
}

export async function updateCoverLetter(
  id: string,
  input: { title: string; body: string },
): Promise<CoverLetterResult> {
  const title = input.title.trim()

  if (!title) return { error: 'Der Titel darf nicht leer sein.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('cover_letters')
    .update({ title, body: input.body })
    .eq('id', id)

  if (error) return { error: 'Änderungen konnten nicht gespeichert werden.' }

  revalidatePath('/dokumente')
  revalidatePath(`/anschreiben/${id}`)
  revalidatePath('/bewerbungen', 'layout')
  return { error: null }
}

export async function deleteCoverLetter(id: string): Promise<CoverLetterResult> {
  const supabase = await createClient()

  const { error } = await supabase.from('cover_letters').delete().eq('id', id)

  if (error) return { error: 'Anschreiben konnte nicht gelöscht werden.' }

  revalidatePath('/dokumente')
  revalidatePath('/bewerbungen', 'layout')
  return { error: null }
}

export async function updateTemplateLayout(
  templateId: string,
  layout: CoverLetterLayout,
): Promise<CoverLetterResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cover_letter_templates')
    .update({ layout: parseLayout(layout) })
    .eq('id', templateId)

  if (error) return { error: 'Layout konnte nicht gespeichert werden.' }

  revalidatePath('/anschreiben', 'layout')
  return { error: null }
}

export async function setDefaultTemplate(templateId: string): Promise<CoverLetterResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht angemeldet.' }

  // Der Unique-Index erlaubt nur eine Standardvorlage pro User,
  // deshalb zuerst alle zurücksetzen.
  const { error: resetError } = await supabase
    .from('cover_letter_templates')
    .update({ is_default: false })
    .eq('user_id', user.id)
    .eq('is_default', true)

  if (resetError) return { error: 'Standardvorlage konnte nicht geändert werden.' }

  const { error } = await supabase
    .from('cover_letter_templates')
    .update({ is_default: true })
    .eq('id', templateId)

  if (error) return { error: 'Standardvorlage konnte nicht geändert werden.' }

  revalidatePath('/einstellungen')
  return { error: null }
}

export async function renameTemplate(
  templateId: string,
  name: string,
): Promise<CoverLetterResult> {
  const trimmed = name.trim()

  if (!trimmed) return { error: 'Der Name darf nicht leer sein.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('cover_letter_templates')
    .update({ name: trimmed })
    .eq('id', templateId)

  if (error) return { error: 'Name konnte nicht geändert werden.' }

  revalidatePath('/einstellungen')
  return { error: null }
}

export async function deleteTemplate(templateId: string): Promise<CoverLetterResult> {
  const supabase = await createClient()

  // Anschreiben verweisen mit on delete restrict, das würde sonst
  // als Constraint-Fehler durchschlagen statt als klare Meldung.
  const { count } = await supabase
    .from('cover_letters')
    .select('id', { count: 'exact', head: true })
    .eq('template_id', templateId)

  if ((count ?? 0) > 0) {
    return {
      error: `Die Vorlage wird von ${count} ${count === 1 ? 'Anschreiben' : 'Anschreiben'} genutzt. Häng die erst um.`,
    }
  }

  const { data: template } = await supabase
    .from('cover_letter_templates')
    .select('base_pdf_path, signature_pdf_path, font_path')
    .eq('id', templateId)
    .single()

  const { error } = await supabase
    .from('cover_letter_templates')
    .delete()
    .eq('id', templateId)

  if (error) return { error: 'Vorlage konnte nicht gelöscht werden.' }

  if (template) {
    const paths = [
      template.base_pdf_path,
      template.signature_pdf_path,
      template.font_path,
    ].filter((path): path is string => Boolean(path))

    await supabase.storage.from('documents').remove(paths)
  }

  revalidatePath('/einstellungen')
  return { error: null }
}