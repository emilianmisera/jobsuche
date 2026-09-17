import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'

import type { Database } from '@/lib/supabase/database.types'

const EMPLOYMENT_LABELS: Record<Database['public']['Enums']['employment_type'], string> = {
  full_time: 'Vollzeit',
  part_time: 'Teilzeit',
  mini_job: 'Minijob',
  fixed_term: 'befristet',
}

export function formatEmploymentType(
  value: Database['public']['Enums']['employment_type'] | null,
): string {
  return value ? EMPLOYMENT_LABELS[value] : '-'
}

/** Datum als 08.09.2026, null wird zum Gedankenstrich. */
export function formatDate(value: string | null): string {
  if (!value) return '-'

  const date = parseISO(value)
  return isValid(date) ? format(date, 'dd.MM.yyyy') : '-'
}

/** Relativ zu heute, für die Spalte "nächste Aktion". */
export function formatRelativeDate(value: string | null): string {
  if (!value) return '-'

  const date = parseISO(value)
  if (!isValid(date)) return '-'

  const days = differenceInCalendarDays(date, new Date())

  if (days === 0) return 'heute'
  if (days === 1) return 'morgen'
  if (days === -1) return 'gestern'
  if (days > 1) return `in ${days} Tagen`

  return `vor ${Math.abs(days)} Tagen`
}

/** "CV_english-1, + 1 mehr" wie im Design. */
export function formatFileList(titles: string[]): string {
  if (titles.length === 0) return '-'
  if (titles.length <= 2) return titles.join(', ')

  return `${titles.slice(0, 2).join(', ')}, + ${titles.length - 2} mehr`
}