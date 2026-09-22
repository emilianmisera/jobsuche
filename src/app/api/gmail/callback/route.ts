import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { exchangeCode, getProfileEmail } from '@/lib/gmail/oauth'
import { createClient } from '@/lib/supabase/server'

function back(request: Request, error?: string) {
  const url = new URL('/einstellungen', request.url)
  if (error) url.searchParams.set('gmail_error', error)
  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const store = await cookies()

  const expected = store.get('gmail_oauth_state')?.value
  store.delete('gmail_oauth_state')

  if (params.get('error')) return back(request, 'abgebrochen')

  const code = params.get('code')
  const state = params.get('state')

  if (!code || !state || state !== expected) return back(request, 'ungueltig')

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return back(request, 'nicht_angemeldet')

  const tokens = await exchangeCode(code)

  if (!tokens?.refresh_token) return back(request, 'kein_token')

  const email = await getProfileEmail(tokens.access_token)

  const { error } = await supabase.from('email_accounts').upsert({
    user_id: user.id,
    email: email ?? 'unbekannt',
    refresh_token: tokens.refresh_token,
  })

  if (error) return back(request, 'speichern')

  return back(request)
}