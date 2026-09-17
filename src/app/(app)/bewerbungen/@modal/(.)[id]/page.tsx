import { notFound } from 'next/navigation'

import { ApplicationSheet } from '@/components/applications/application-sheet'
import { getApplication, getFormOptions } from '@/lib/applications/queries'

export default async function InterceptedApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [application, options] = await Promise.all([getApplication(id), getFormOptions()])

  if (!application) notFound()

  return (
    <ApplicationSheet
      application={application}
      cvs={options.cvs}
      coverLetters={options.coverLetters}
    />
  )
}