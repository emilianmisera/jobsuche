import { runGmailSync } from '@/lib/gmail/sync'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
// Ein Lauf kann bei vielen Mails über eine Minute dauern
export const maxDuration = 300

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET

  if (!secret) return new Response('Nicht konfiguriert.', { status: 500 })

  // Vercel sendet den Secret als Bearer-Token mit
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Nicht erlaubt.', { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: accounts, error } = await supabase.from('email_accounts').select('user_id')

  if (error) return new Response('Konten konnten nicht geladen werden.', { status: 500 })

  const results: Record<string, unknown> = {}

  for (const account of accounts ?? []) {
    try {
      results[account.user_id] = await runGmailSync(supabase, account.user_id)
    } catch (syncError) {
      // Ein defektes Konto darf die übrigen nicht blockieren
      console.error('[cron-gmail]', account.user_id, syncError)
      results[account.user_id] = { error: 'fehlgeschlagen' }
    }
  }

  return Response.json({ accounts: accounts?.length ?? 0, results })
}