import { ApplicationsViews } from '@/components/applications/applications-views'
import { NewApplicationButton } from '@/components/applications/new-application-button'
import { SearchInput } from '@/components/search-input'
import { getApplications, getFormOptions } from '@/lib/applications/queries'
import { SyncButton } from '@/components/gmail/sync-button'
import { isGmailConnected } from '@/lib/gmail/queries'

export default async function BewerbungenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

    const [applications, options, gmailConnected] = await Promise.all([
    getApplications(q),
    getFormOptions(),
    isGmailConnected(),
  ])

  return (
    <>
      <div className="shrink-0 px-2 pt-2">
        <SearchInput className="max-w-2xl" />
      </div>

      <div className="m-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background p-8">
                <div className="flex shrink-0 items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Bewerbungen</h1>

          <div className="flex items-center gap-2">
            {gmailConnected ? <SyncButton /> : null}
            <NewApplicationButton cvs={options.cvs} coverLetters={options.coverLetters} />
          </div>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <ApplicationsViews data={applications} query={q} />
        </div>
      </div>
    </>
  )
}