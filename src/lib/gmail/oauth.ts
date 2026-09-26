import 'server-only'

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'

function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  // In der Produktion aus der Domain gebaut, lokal aus der Env-Variable
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    (process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/gmail/callback`
      : undefined)

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth ist nicht konfiguriert.')
  }

  return { clientId, clientSecret, redirectUri }
}

export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = config()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPE,
    // offline plus consent erzwingt einen Refresh-Token, auch beim zweiten Verbinden
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })

  return `${AUTH_URL}?${params}`
}

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in: number
}

export async function exchangeCode(code: string): Promise<TokenResponse | null> {
  const { clientId, clientSecret, redirectUri } = config()

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) return null

  return response.json()
}

/** Access-Token sind eine Stunde gültig und werden nie gespeichert. */
export async function getAccessToken(refreshToken: string): Promise<string | null> {
  const { clientId, clientSecret } = config()

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) return null

  const data: TokenResponse = await response.json()
  return data.access_token
}

export async function getProfileEmail(accessToken: string): Promise<string | null> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) return null

  const data: { emailAddress?: string } = await response.json()
  return data.emailAddress ?? null
}