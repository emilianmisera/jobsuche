import { z } from 'zod'

import { STATUS_ORDER } from '@/lib/applications/status'

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
}