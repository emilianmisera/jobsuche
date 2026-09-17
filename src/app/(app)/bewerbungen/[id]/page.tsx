import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ApplicationDetailContent } from '@/components/applications/application-detail-content'
import { getApplication } from '@/lib/applications/queries'

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const application = await getApplication(id)

  if (!application) notFound()

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl bg-background p-8">
      <Link
        href="/bewerbungen"
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Alle Bewerbungen
      </Link>

      <div className="max-w-2xl">
        <ApplicationDetailContent application={application} />
      </div>
    </div>
  )
}