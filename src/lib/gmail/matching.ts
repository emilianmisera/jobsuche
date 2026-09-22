import type { ApplicationStatus } from '@/lib/applications/status'

/** Bewerbermanagementsysteme, über die Firmen oft statt eigener Domain versenden. */
export const ATS_DOMAINS = [
  'personio.de',
  'personio.com',
  'greenhouse.io',
  'lever.co',
  'myworkdayjobs.com',
  'smartrecruiters.com',
  'join.com',
  'softgarden.io',
  'recruitee.com',
  'teamtailor.com',
  'ashbyhq.com',
  'successfactors.com',
  'bamboohr.com',
]

const JOB_KEYWORDS = [
  'bewerbung',
  'stelle',
  'position',
  'vorstellungsgespräch',
  'gespräch',
  'interview',
  'application',
  'applied',
  'candidate',
  'kandidat',
  'recruiting',
  'absage',
  'zusage',
  'angebot',
  'offer',
]

const LEGAL_SUFFIXES = /\b(gmbh|ag|se|kg|ug|inc|ltd|llc|co|group|holding)\b/g

/** Kleinbuchstaben, Rechtsform und Sonderzeichen raus, Umlaute zu Grundbuchstaben. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(LEGAL_SUFFIXES, '')
    .replace(/[^a-z0-9]/g, '')
}

export type Candidate = {
  id: string
  company: string
  status: ApplicationStatus
  gmail_thread_id: string | null
}

export type MatchStrength = 'thread' | 'domain' | 'text'

export type Match = { candidate: Candidate; strength: MatchStrength }

/**
 * Gmail-Suchanfrage. Geschweifte Klammern sind in Gmail ein ODER.
 * Firmennamen matchen überall in der Mail, ATS-Domains nur im Absender.
 */
export function buildQuery(candidates: Candidate[], afterEpochSeconds: number): string {
  const names = [...new Set(candidates.map((candidate) => candidate.company.replace(/"/g, '')))]
  const terms = [
    ...names.map((name) => `"${name}"`),
    ...ATS_DOMAINS.map((domain) => `from:${domain}`),
  ]

  return `after:${afterEpochSeconds} -in:spam -in:trash -from:me {${terms.join(' ')}}`
}

type MatchInput = {
  threadId: string
  fromName: string
  fromDomain: string
  subject: string
  snippet: string
}

/**
 * Absteigende Sicherheit: bekannter Thread, Absenderdomain, Name im Text.
 * Kandidaten müssen nach applied_at absteigend sortiert sein, damit bei zwei
 * Bewerbungen bei derselben Firma die neuere gewinnt.
 */
export function matchMessage(
  input: MatchInput,
  candidates: Candidate[],
  knownThreads: Map<string, string>,
): Match | null {
  const threadOwner = knownThreads.get(input.threadId)

  if (threadOwner) {
    const candidate = candidates.find((entry) => entry.id === threadOwner)
    if (candidate) return { candidate, strength: 'thread' }
  }

  // Kurze Namen wie "SAP" oder "test" würden überall treffen
  const usable = candidates.filter((candidate) => normalize(candidate.company).length >= 4)

  const domainLabels = input.fromDomain.split('.').map(normalize)
  const isAts = ATS_DOMAINS.some((domain) => input.fromDomain.endsWith(domain))

  if (!isAts) {
    const byDomain = usable.find((candidate) =>
      domainLabels.some((label) => label.includes(normalize(candidate.company))),
    )

    if (byDomain) return { candidate: byDomain, strength: 'domain' }
  }

  const text = `${input.fromName} ${input.subject} ${input.snippet}`.toLowerCase()
  const normalizedText = normalize(text)
  const hasKeyword = JOB_KEYWORDS.some((keyword) => text.includes(keyword))

  if (!hasKeyword) return null

  const byText = usable
    .filter((candidate) => normalizedText.includes(normalize(candidate.company)))
    // Längster Name gewinnt, sonst schlägt "Bending" vor "Bending Spoons" zu
    .sort((a, b) => normalize(b.company).length - normalize(a.company).length)[0]

  return byText ? { candidate: byText, strength: 'text' } : null
}