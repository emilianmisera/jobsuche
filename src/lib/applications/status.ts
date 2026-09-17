import type { Database } from '@/lib/supabase/database.types'

export type ApplicationStatus = Database['public']['Enums']['application_status']

type StatusConfig = {
  label: string
  text: string
  bg: string
  column: string
}

export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  draft: {
    label: 'draft',
    text: 'text-status-draft',
    bg: 'bg-status-draft-muted',
    column: 'bg-status-draft-muted/60',
  },
  applied: {
    label: 'beworben',
    text: 'text-status-applied',
    bg: 'bg-status-applied-muted',
    column: 'bg-status-applied-muted/60',
  },
  in_progress: {
    label: 'laufend',
    text: 'text-status-in-progress',
    bg: 'bg-status-in-progress-muted',
    column: 'bg-status-in-progress-muted/60',
  },
  rejected: {
    label: 'abgesagt',
    text: 'text-status-rejected',
    bg: 'bg-status-rejected-muted',
    column: 'bg-status-rejected-muted/60',
  },
  offer: {
    label: 'angebot',
    text: 'text-status-offer',
    bg: 'bg-status-offer-muted',
    column: 'bg-status-offer-muted/60',
  },
}

/** Reihenfolge der Board-Spalten und der Sortierung. */
export const STATUS_ORDER = [
  'draft',
  'applied',
  'in_progress',
  'rejected',
  'offer',
] as const satisfies readonly ApplicationStatus[]