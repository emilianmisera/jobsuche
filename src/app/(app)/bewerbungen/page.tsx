import { ApplicationsViews } from '@/components/applications/applications-views'
import { NewApplicationDialog } from '@/components/applications/new-application-dialog'
import { getApplications, getFormOptions } from '@/lib/applications/queries'

export default async function BewerbungenPage() {
  const [applications, options] = await Promise.all([getApplications(), getFormOptions()])

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background p-8">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Bewerbungen</h1>
        <NewApplicationDialog cvs={options.cvs} coverLetters={options.coverLetters} />
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <ApplicationsViews data={applications} />
      </div>
    </div>
  )
}