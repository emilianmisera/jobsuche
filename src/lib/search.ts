/**
 * Zeichen entfernen, die die PostgREST-Filtersyntax oder LIKE-Patterns brechen.
 * Gibt null zurück, wenn nichts Brauchbares übrig bleibt.
 */
export function sanitizeSearch(value: string | undefined): string | null {
  if (!value) return null

  const cleaned = value.replace(/[%_,()"\\*]/g, ' ').trim()

  return cleaned.length > 0 ? cleaned : null
}