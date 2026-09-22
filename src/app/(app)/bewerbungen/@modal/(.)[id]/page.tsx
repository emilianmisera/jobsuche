import { notFound } from 'next/navigation'

import { ApplicationSheet } from '@/components/applications/application-sheet'
import {
  getApplication,
  getApplicationUpdates,
  getFormOptions,
} from '@/lib/applications/queries'

export default async function InterceptedApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [application, options, updates] = await Promise.all([
    getApplication(id),
    getFormOptions(),
    getApplicationUpdates(id),
  ])

  if (!application) notFound()

  return (
    <ApplicationSheet
      application={application}
      cvs={options.cvs}
      coverLetters={options.coverLetters}
      suggestions={updates.suggestions}
      hasUnseen={updates.hasUnseen}
    />
  )
}