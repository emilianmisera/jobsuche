'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type DocumentResult = { error: string | null }

export async function registerCv(input: {
  title: string
  storagePath: string
  sizeBytes: number
}): Promise<DocumentResult> {
  const title = input.title.trim()

  if (!title) return { error: 'Der Titel darf nicht leer sein.' }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nicht angemeldet.' }

  // Pfad gegen den eigenen Prefix prüfen, damit die Action keine fremden
  // Dateien registrieren kann, selbst wenn sie direkt aufgerufen wird.
  if (!input.storagePath.startsWith(`${user.id}/`)) {
    return { error: 'Ungültiger Pfad.' }
  }

  const { error } = await supabase.from('documents').insert({
    user_id: user.id,
    type: 'cv',
    title,
    storage_path: input.storagePath,
    mime_type: 'application/pdf',
    size_bytes: input.sizeBytes,
  })

  if (error) {
    // Verwaiste Datei wieder entfernen, sonst liegt sie ohne DB-Zeile im Bucket
    await supabase.storage.from('documents').remove([input.storagePath])
    return { error: 'Lebenslauf konnte nicht gespeichert werden.' }
  }

  revalidatePath('/dokumente')
  revalidatePath('/bewerbungen', 'layout')
  return { error: null }
}

export async function renameDocument(id: string, title: string): Promise<DocumentResult> {
  const trimmed = title.trim()

  if (!trimmed) return { error: 'Der Titel darf nicht leer sein.' }

  const supabase = await createClient()
  const { error } = await supabase.from('documents').update({ title: trimmed }).eq('id', id)

  if (error) return { error: 'Titel konnte nicht geändert werden.' }

  revalidatePath('/dokumente')
  revalidatePath('/bewerbungen', 'layout')
  return { error: null }
}

export async function deleteDocument(id: string): Promise<DocumentResult> {
  const supabase = await createClient()

  const { data: document, error: readError } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (readError || !document) return { error: 'Dokument nicht gefunden.' }

  const { error } = await supabase.from('documents').delete().eq('id', id)

  if (error) return { error: 'Dokument konnte nicht gelöscht werden.' }

  // Storage räumt nicht automatisch mit auf. Schlägt das fehl, bleibt nur
  // eine verwaiste Datei zurück, die DB ist trotzdem konsistent.
  await supabase.storage.from('documents').remove([document.storage_path])

  revalidatePath('/dokumente')
  revalidatePath('/bewerbungen', 'layout')
  return { error: null }
}