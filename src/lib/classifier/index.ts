import 'server-only'

export const CATEGORIES = ['rejection', 'interview', 'offer', 'acknowledgment', 'other'] as const

export type Category = (typeof CATEGORIES)[number]
export type Classification = { category: Category; confidence: number }

export interface Classifier {
  classify(input: string, company: string): Promise<Classification | null>
}

const SYSTEM_PROMPT = `Du klassifizierst E-Mails, die ein Bewerber von Unternehmen erhält.
Antworte ausschließlich mit JSON im Format {"category": "...", "confidence": 0.0}.

Kategorien:
- rejection: Absage, die Bewerbung wird nicht weiterverfolgt
- interview: Einladung zu Gespräch, Call, Test oder nächster Runde
- offer: Jobangebot oder Vertragsangebot
- acknowledgment: Eingangsbestätigung, Bewerbung ist angekommen
- other: alles andere, etwa Newsletter oder Rückfragen

confidence ist deine Sicherheit zwischen 0 und 1. Im Zweifel niedrig bewerten.`

/**
 * Reduziert eine Mail auf das Nötige. Zitierter Verlauf, Signaturen,
 * Links, Adressen und Telefonnummern verlassen den Server nicht.
 */
export function redact(subject: string, body: string): string {
  const cleaned = body
    .split(/^\s*(>|Am .* schrieb|On .* wrote|-----\s*Ursprüngliche)/m)[0]
    .split(/^--\s*$/m)[0]
    .replace(/https?:\/\/\S+/g, '[link]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]')
    .replace(/\+?\d[\d\s/()-]{8,}\d/g, '[telefon]')
    .replace(/\s+/g, ' ')
    .trim()

  return `Betreff: ${subject}\n\n${cleaned.slice(0, 600)}`
}

function parse(raw: string): Classification | null {
  // Reasoning-Modelle schreiben gelegentlich Text vor oder nach das JSON
  const json = raw.match(/\{[\s\S]*\}/)?.[0]

  if (!json) return null

  try {
    const data = JSON.parse(json) as { category?: string; confidence?: number }

    if (!CATEGORIES.includes(data.category as Category)) return null

    const confidence = Math.min(1, Math.max(0, Number(data.confidence) || 0))
    return { category: data.category as Category, confidence }
  } catch {
    return null
  }
}

function userPrompt(input: string, company: string): string {
  return `Unternehmen: ${company}\n\n${input}`
}

const groq: Classifier = {
  async classify(input, company) {
    if (!process.env.GROQ_API_KEY) {
      console.error('[classifier] GROQ_API_KEY fehlt')
      return null
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? 'openai/gpt-oss-20b',
        temperature: 0,
        // Klassifizierung braucht kaum Nachdenken, spart Zeit und Tokens
        reasoning_effort: 'low',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt(input, company) },
        ],
      }),
    })

    if (!response.ok) {
      console.error('[classifier] Groq', response.status, await response.text())
      return null
    }

    const data = await response.json()
    const content: string = data.choices?.[0]?.message?.content ?? ''
    const parsed = parse(content)

    if (!parsed) console.error('[classifier] Antwort nicht lesbar', content)

    return parsed
  },
}

const ollama: Classifier = {
  async classify(input, company) {
    const response = await fetch(`${process.env.OLLAMA_URL ?? 'http://localhost:11434'}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL ?? 'qwen2.5:3b',
        stream: false,
        format: 'json',
        options: { temperature: 0 },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt(input, company) },
        ],
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    return parse(data.message?.content ?? '')
  },
}

export function getClassifier(): Classifier {
  return process.env.CLASSIFIER_PROVIDER === 'ollama' ? ollama : groq
}