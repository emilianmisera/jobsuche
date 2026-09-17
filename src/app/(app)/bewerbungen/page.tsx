import { ApplicationsViews } from '@/components/applications/applications-views'
import { getApplications } from '@/lib/applications/queries'

export default async function BewerbungenPage() {
  const applications = await getApplications()

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background p-8">
      <h1 className="shrink-0 text-2xl font-bold tracking-tight">Bewerbungen</h1>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <ApplicationsViews data={applications} />
      </div>
    </div>
  )
}