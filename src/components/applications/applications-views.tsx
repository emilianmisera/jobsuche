'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ApplicationsBoard } from '@/components/applications/applications-board'
import { ApplicationsTable } from '@/components/applications/applications-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ApplicationListItem } from '@/lib/applications/queries'

type ApplicationsViewsProps = {
  data: ApplicationListItem[]
}

export function ApplicationsViews({ data }: ApplicationsViewsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const view = searchParams.get('view') === 'board' ? 'board' : 'table'

  function handleChange(next: string | null) {
    if (next === null) return

    const params = new URLSearchParams(searchParams)

    if (next === 'board') {
      params.set('view', 'board')
    } else {
      params.delete('view')
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <Tabs value={view} onValueChange={handleChange} className="flex min-h-0 flex-1 flex-col">
      <TabsList className="shrink-0 self-start">
        <TabsTrigger value="table">Tabelle</TabsTrigger>
        <TabsTrigger value="board">Board</TabsTrigger>
      </TabsList>

      <TabsContent value="table" className="mt-6 min-h-0 flex-1 overflow-y-auto">
        <ApplicationsTable data={data} />
      </TabsContent>

      <TabsContent value="board" className="mt-6 min-h-0 flex-1">
        <ApplicationsBoard data={data} />
      </TabsContent>
    </Tabs>
  )
}