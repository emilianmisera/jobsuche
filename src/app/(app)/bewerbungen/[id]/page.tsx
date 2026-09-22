import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ApplicationActions } from '@/components/applications/application-actions'
import { ApplicationDetailContent } from '@/components/applications/application-detail-content'
import {
  getApplication,
  getApplicationUpdates,
  getFormOptions,
} from '@/lib/applications/queries'
import { toApplicationInput } from '@/lib/applications/schema'

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [application, options, updates] = await Promise.all([
    getApplication(id),
    getFormOptions(),
    getApplicationUpdates(id),
  ])

  if (!application) notFound()

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl bg-background p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/bewerbungen"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Alle Bewerbungen
        </Link>

        <ApplicationActions
          id={application.id}
          company={application.company}
          values={toApplicationInput(application)}
          cvs={options.cvs}
          coverLetters={options.coverLetters}
        />
      </div>

      <div className="max-w-2xl">
        <ApplicationDetailContent
          application={application}
          suggestions={updates.suggestions}
          hasUnseen={updates.hasUnseen}
        />
      </div>
    </div>
  )
}