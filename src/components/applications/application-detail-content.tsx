import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { StatusBadge } from '@/components/applications/status-badge'
import type { ApplicationDetail } from '@/lib/applications/queries'
import { STATUS_CONFIG, type ApplicationStatus } from '@/lib/applications/status'
import { formatDate, formatDateTime, formatEmploymentType } from '@/lib/format'

type ActivityPayload = { from?: ApplicationStatus; to?: ApplicationStatus }

function activityText(type: string, message: string, payload: unknown): string {
  if (type !== 'status_changed') return message

  const { from, to } = (payload ?? {}) as ActivityPayload
  if (!from || !to) return message

  return `Status von ${STATUS_CONFIG[from].label} auf ${STATUS_CONFIG[to].label}`
}

type ApplicationDetailContentProps = {
  application: ApplicationDetail
}

export function ApplicationDetailContent({ application }: ApplicationDetailContentProps) {
    const documents = [
    application.cv
      ? { ...application.cv, kind: 'Lebenslauf', href: `/dokumente/${application.cv.id}` }
      : null,
    application.cover_letter
      ? {
          ...application.cover_letter,
          kind: 'Motivationsschreiben',
          // Anschreiben liegen in einer eigenen Tabelle und damit auf einer eigenen Route
          href: `/anschreiben/${application.cover_letter.id}`,
        }
      : null,
    ...application.attachments
      .map((entry) => entry.document)
      .filter((document) => document !== null)
      .map((document) => ({
        ...document,
        kind: 'Anhang',
        href: `/dokumente/${document.id}`,
      })),
  ].filter((entry) => entry !== null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{application.company}</h2>
        <p className="mt-1 text-lg text-muted-foreground">{application.position}</p>
        <div className="mt-3">
          <StatusBadge status={application.status} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Detail label="Ort">
          {application.is_remote ? 'Full Remote' : (application.location ?? '-')}
        </Detail>
        <Detail label="Art">{formatEmploymentType(application.employment_type)}</Detail>

        {application.status === 'draft' ? null : (
          <Detail label="beworben am">{formatDate(application.applied_at)}</Detail>
        )}

        {application.next_action_at ? (
          <Detail label="nächste Aktion">
            {formatDate(application.next_action_at)}
            {application.next_action_note ? (
              <span className="block text-muted-foreground">{application.next_action_note}</span>
            ) : null}
          </Detail>
        ) : null}
      </dl>

      {application.job_link ? (
        <section>
          <h3 className="font-semibold">Job Link</h3>
          <a
            href={application.job_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-primary underline-offset-4 hover:underline"
          >
            {application.job_link}
          </a>
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section>
          <h3 className="font-semibold">Dokumente</h3>
          <ul className="mt-2 space-y-2">
            {documents.map((document) => (
              <li key={document.id}>
                                <Link
                  href={document.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-l-4 border-l-primary p-3 hover:bg-accent"
                >
                  <span>
                    <span className="block font-medium">{document.title}</span>
                    <span className="block text-sm text-muted-foreground">{document.kind}</span>
                  </span>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {application.notes ? (
        <section>
          <h3 className="font-semibold">Notizen</h3>
          <p className="mt-2 rounded-lg border p-3 text-sm whitespace-pre-wrap">
            {application.notes}
          </p>
        </section>
      ) : null}

            <section>
        <h3 className="font-semibold">Aktivität</h3>

        <ol className="mt-3">
          {application.activities.map((activity) => (
            <li
              key={activity.id}
              className="relative flex gap-3 pb-5 last:pb-0 after:absolute after:top-4 after:bottom-0 after:left-[3px] after:w-px after:bg-border last:after:hidden"
            >
              <span
                aria-hidden
                className="relative z-10 mt-1.5 size-2 shrink-0 rounded-full bg-foreground ring-4 ring-background"
              />
              <span>
                <time className="block text-sm text-muted-foreground">
                  {formatDateTime(activity.created_at)}
                </time>
                <span className="block">
                  {activityText(activity.type, activity.message, activity.payload)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold">{label}</dt>
      <dd className="mt-1 text-muted-foreground">{children}</dd>
    </div>
  )
}