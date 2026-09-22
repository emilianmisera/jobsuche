import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { buildAuthUrl } from '@/lib/gmail/oauth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new Response('Nicht angemeldet.', { status: 401 })

  // Zufälliger State gegen CSRF, wird im Callback gegengeprüft
  const state = crypto.randomUUID()
  const store = await cookies()

  store.set('gmail_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  })

  return NextResponse.redirect(buildAuthUrl(state))
}