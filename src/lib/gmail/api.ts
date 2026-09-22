import 'server-only'

const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me'

type Header = { name: string; value: string }

type Part = {
  mimeType?: string
  body?: { data?: string }
  parts?: Part[]
  headers?: Header[]
}

export type GmailMessage = {
  id: string
  threadId: string
  snippet: string
  internalDate: string
  payload: Part & { headers: Header[] }
}

async function gmail<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`Gmail-Anfrage fehlgeschlagen (${response.status}).`)

  return response.json()
}

export async function listMessageIds(token: string, query: string, max = 50): Promise<string[]> {
  const params = new URLSearchParams({ q: query, maxResults: String(max) })
  const data = await gmail<{ messages?: { id: string }[] }>(token, `/messages?${params}`)

  return data.messages?.map((message) => message.id) ?? []
}

/** Nur Header und Googles Kurzvorschau, kein Text. */
export function getMetadata(token: string, id: string): Promise<GmailMessage> {
  const params = new URLSearchParams({ format: 'metadata' })

  for (const name of ['From', 'Subject']) params.append('metadataHeaders', name)

  return gmail<GmailMessage>(token, `/messages/${id}?${params}`)
}

/** Vollständige Nachricht. Wird nur für bereits zugeordnete Mails geladen. */
export function getFull(token: string, id: string): Promise<GmailMessage> {
  return gmail<GmailMessage>(token, `/messages/${id}?format=full`)
}

export function readHeader(message: GmailMessage, name: string): string {
  const match = message.payload.headers.find(
    (header) => header.name.toLowerCase() === name.toLowerCase(),
  )

  return match?.value ?? ''
}

export function parseFrom(value: string): { name: string; address: string; domain: string } {
  const match = value.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>/)

  const address = (match ? match[2] : value).trim().toLowerCase()
  const name = (match ? match[1] : '').trim()
  const domain = address.split('@')[1] ?? ''

  return { name, address, domain }
}

function decode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

function findPart(part: Part, mimeType: string): Part | null {
  if (part.mimeType === mimeType && part.body?.data) return part

  for (const child of part.parts ?? []) {
    const found = findPart(child, mimeType)
    if (found) return found
  }

  return null
}

function htmlToText(html: string): string {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/** Reiner Text, HTML nur als Rückfall. Anhänge werden nie angefasst. */
export function extractText(message: GmailMessage): string {
  const plain = findPart(message.payload, 'text/plain')
  if (plain?.body?.data) return decode(plain.body.data)

  const html = findPart(message.payload, 'text/html')
  if (html?.body?.data) return htmlToText(decode(html.body.data))

  return ''
}