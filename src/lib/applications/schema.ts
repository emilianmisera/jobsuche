import { z } from 'zod'

import { STATUS_ORDER, type ApplicationStatus } from '@/lib/applications/status'

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'mini_job', 'fixed_term'] as const

/** Leerer String wird zu null, damit die DB keine Leerstrings speichert. */
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : value))
  .nullable()

export const applicationInputSchema = z.object({
  company: z.string().trim().min(1, 'Unternehmen ist erforderlich.'),
  position: z.string().trim().min(1, 'Position ist erforderlich.'),
  job_link: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^https?:\/\//.test(value),
      'Der Link muss mit http:// oder https:// beginnen.',
    )
    .transform((value) => (value === '' ? null : value))
    .nullable(),
  location: optionalText,
  is_remote: z.boolean(),
  employment_type: z.enum(EMPLOYMENT_TYPES).nullable(),
    status: z.enum(STATUS_ORDER),
  applied_at: optionalText,
  cv_document_id: z.string().uuid().nullable(),
  cover_letter_id: z.string().uuid().nullable(),
  notes: optionalText,
    next_action_at: optionalText,
  next_action_note: optionalText,
})

export type ApplicationInput = z.input<typeof applicationInputSchema>
export type ApplicationValues = z.output<typeof applicationInputSchema>

export const EMPTY_APPLICATION: ApplicationInput = {
  company: '',
  position: '',
  job_link: '',
  location: '',
  is_remote: false,
  employment_type: 'full_time',
  status: 'draft',
  applied_at: '',
  cv_document_id: null,
  cover_letter_id: null,
  notes: '',
    next_action_at: '',
  next_action_note: '',
}

/** Struktur statt Import, damit die Datei client-tauglich bleibt. */
type ApplicationRow = {
  company: string
  position: string
  job_link: string | null
  location: string | null
  is_remote: boolean
  employment_type: ApplicationValues['employment_type']
  status: ApplicationStatus
  applied_at: string | null
  next_action_at: string | null
  next_action_note: string | null
  cv_document_id: string | null
  cover_letter_id: string | null
  notes: string | null
}

/** DB-Zeile in Formularwerte übersetzen, null wird zu leerem String. */
export function toApplicationInput(row: ApplicationRow): ApplicationInput {
  return {
    company: row.company,
    position: row.position,
    job_link: row.job_link ?? '',
    location: row.location ?? '',
    is_remote: row.is_remote,
    employment_type: row.employment_type,
    status: row.status,
    applied_at: row.applied_at ?? '',
    next_action_at: row.next_action_at ?? '',
    next_action_note: row.next_action_note ?? '',
    cv_document_id: row.cv_document_id,
    cover_letter_id: row.cover_letter_id,
    notes: row.notes ?? '',
  }
}