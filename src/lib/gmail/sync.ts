import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { ApplicationStatus } from '@/lib/applications/status'
import { getClassifier, redact, type Category } from '@/lib/classifier'
import {
  extractText,
  getFull,
  getMetadata,
  listMessageIds,
  parseFrom,
  readHeader,
} from '@/lib/gmail/api'
import { buildQuery, matchMessage, type Candidate, type MatchStrength } from '@/lib/gmail/matching'
import { getAccessToken } from '@/lib/gmail/oauth'
import type { Database } from '@/lib/supabase/database.types'

// Session-Client und Admin-Client haben leicht verschiedene Typen,
// die Abfragen hier sind für beide identisch.
type Supabase = SupabaseClient<Database, 'public', any>

export type SyncResult = { checked: number; matched: number; applied: number; pending: number }

const CATEGORY_STATUS: Record<Category, ApplicationStatus | null> = {
  rejection: 'rejected',
  interview: 'in_progress',
  offer: 'offer',
  acknowledgment: null,
  other: null,
}

/** Reihenfolge im Prozess. Eine Absage darf immer, alles andere nur vorwärts. */
const STATUS_RANK: Record<ApplicationStatus, number> = {
  draft: 0,
  applied: 1,
  in_progress: 2,
  offer: 3,
  rejected: 4,
}

const AUTO_APPLY_CONFIDENCE = 0.85
const FIRST_SYNC_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

function decide(
  current: ApplicationStatus,
  suggested: ApplicationStatus | null,
  confidence: number,
  strength: MatchStrength,
): 'none' | 'pending' | 'auto_applied' {
  if (!suggested || suggested === current) return 'none'

  const isForward = suggested === 'rejected' || STATUS_RANK[suggested] > STATUS_RANK[current]
  const isStrongMatch = strength !== 'text'

  return isForward && isStrongMatch && confidence >= AUTO_APPLY_CONFIDENCE
    ? 'auto_applied'
    : 'pending'
}

export async function runGmailSync(supabase: Supabase, userId: string): Promise<SyncResult> {
  const result: SyncResult = { checked: 0, matched: 0, applied: 0, pending: 0 }
  const startedAt = new Date()

  const { data: account, error: accountError } = await supabase
    .from('email_accounts')
    .select('email, refresh_token, last_synced_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (accountError) {
    throw new Error(`Gmail-Konto konnte nicht geladen werden: ${accountError.message}`)
  }

  if (!account) throw new Error('Kein Gmail-Konto verbunden.')

  const token = await getAccessToken(account.refresh_token)

  if (!token) throw new Error('Die Gmail-Verbindung ist abgelaufen. Bitte neu verbinden.')

  // Der Admin-Client im Cron umgeht RLS, deshalb überall explizit auf den User filtern
  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('id, company, status, gmail_thread_id')
    .eq('user_id', userId)
    .neq('status', 'draft')
    .order('applied_at', { ascending: false, nullsFirst: false })

  if (applicationsError) {
    throw new Error(`Bewerbungen konnten nicht geladen werden: ${applicationsError.message}`)
  }

  const candidates: Candidate[] = applications ?? []

  if (candidates.length === 0) {
    await markSynced(supabase, userId, startedAt)
    return result
  }

  // Bekannte Threads aus früheren Läufen, damit Antworten sicher zugeordnet werden
  const { data: threads } = await supabase
    .from('email_messages')
    .select('gmail_thread_id, application_id')
    .eq('user_id', userId)
    .not('application_id', 'is', null)
    .not('gmail_thread_id', 'is', null)

  const knownThreads = new Map<string, string>()

  for (const row of threads ?? []) {
    if (row.gmail_thread_id && row.application_id) {
      knownThreads.set(row.gmail_thread_id, row.application_id)
    }
  }

  for (const candidate of candidates) {
    if (candidate.gmail_thread_id) knownThreads.set(candidate.gmail_thread_id, candidate.id)
  }

  // Einen Tag Überlappung gegen Zeitversatz. Doppelte fängt der Abgleich unten ab.
  const since = account.last_synced_at
    ? new Date(account.last_synced_at).getTime() - DAY_MS
    : Date.now() - FIRST_SYNC_DAYS * DAY_MS

  const ids = await listMessageIds(token, buildQuery(candidates, Math.floor(since / 1000)))

  const { data: processed } = await supabase
    .from('email_messages')
    .select('gmail_message_id')
    .eq('user_id', userId)
    .in('gmail_message_id', ids.length > 0 ? ids : [''])

  const seen = new Set((processed ?? []).map((row) => row.gmail_message_id))
  const classifier = getClassifier()

  // Gmail liefert neueste zuerst, für eine sinnvolle Timeline älteste zuerst verarbeiten
  for (const id of ids.filter((entry) => !seen.has(entry)).reverse()) {
    result.checked += 1

    const meta = await getMetadata(token, id)
    const from = parseFrom(readHeader(meta, 'From'))
    const subject = readHeader(meta, 'Subject')
    const receivedAt = new Date(Number(meta.internalDate)).toISOString()

    const match = matchMessage(
      {
        threadId: meta.threadId,
        fromName: from.name,
        fromDomain: from.domain,
        subject,
        snippet: meta.snippet,
      },
      candidates,
      knownThreads,
    )

    if (!match) {
      // Nur merken, dass sie verarbeitet wurde. Kein Inhalt, kein Snippet.
      await supabase.from('email_messages').insert({
        user_id: userId,
        gmail_message_id: id,
        gmail_thread_id: meta.threadId,
        from_address: from.address,
        subject,
        received_at: receivedAt,
      })
      continue
    }

    result.matched += 1
    const { candidate, strength } = match

    const full = await getFull(token, id)
    const classification = await classifier
      .classify(redact(subject, extractText(full)), candidate.company)
      .catch(() => null)

    const suggested = classification ? CATEGORY_STATUS[classification.category] : null
    const confidence = classification?.confidence ?? 0
    const state = decide(candidate.status, suggested, confidence, strength)

    const { data: stored } = await supabase
      .from('email_messages')
      .insert({
        user_id: userId,
        application_id: candidate.id,
        gmail_message_id: id,
        gmail_thread_id: meta.threadId,
        from_address: from.address,
        subject,
        snippet: meta.snippet.slice(0, 200),
        received_at: receivedAt,
        suggested_status: suggested,
        confidence: classification ? confidence : null,
        state,
      })
      .select('id')
      .single()

    await supabase.from('activities').insert({
      user_id: userId,
      application_id: candidate.id,
      type: 'email_received',
      message: `Mail erhalten: ${subject || '(ohne Betreff)'}`,
      payload: { email_message_id: stored?.id ?? null, from: from.address },
      created_at: receivedAt,
    })

    knownThreads.set(meta.threadId, candidate.id)

    if (!candidate.gmail_thread_id && strength !== 'text') {
      await supabase
        .from('applications')
        .update({ gmail_thread_id: meta.threadId })
        .eq('id', candidate.id)
        .eq('user_id', userId)

      candidate.gmail_thread_id = meta.threadId
    }

    if (state === 'auto_applied' && suggested) {
      // Der Trigger schreibt den Statuswechsel selbst in die Timeline
      await supabase
        .from('applications')
        .update({ status: suggested })
        .eq('id', candidate.id)
        .eq('user_id', userId)

      candidate.status = suggested
      result.applied += 1
    }

    if (state === 'pending') result.pending += 1
  }

  await markSynced(supabase, userId, startedAt)
  return result
}

async function markSynced(supabase: Supabase, userId: string, at: Date) {
  await supabase
    .from('email_accounts')
    .update({ last_synced_at: at.toISOString() })
    .eq('user_id', userId)
}