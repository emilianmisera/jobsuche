import { notFound } from 'next/navigation'

import { ApplicationSheet } from '@/components/applications/application-sheet'
import { getApplication } from '@/lib/applications/queries'

export default async function InterceptedApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const application = await getApplication(id)

  if (!application) notFound()

  return <ApplicationSheet application={application} />
}