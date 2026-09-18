'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ApplicationsBoard } from '@/components/applications/applications-board'
import { ApplicationsTable } from '@/components/applications/applications-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ApplicationListItem } from '@/lib/applications/queries'

type ApplicationsViewsProps = {
  data: ApplicationListItem[]
  query?: string
}

export function ApplicationsViews({ data, query }: ApplicationsViewsProps) {
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

    const search = params.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }

  return (
    <Tabs value={view} onValueChange={handleChange} className="flex min-h-0 flex-1 flex-col">
      <TabsList className="shrink-0 self-start">
        <TabsTrigger value="table" className="cursor-pointer">
          Tabelle
        </TabsTrigger>
        <TabsTrigger value="board" className="cursor-pointer">
          Board
        </TabsTrigger>
      </TabsList>

    <TabsContent value="table" className="mt-6 min-h-0 flex-1 overflow-y-auto">
        <ApplicationsTable data={data} query={query} />
      </TabsContent>

      <TabsContent value="board" className="mt-6 min-h-0 flex-1">
        <ApplicationsBoard data={data} />
      </TabsContent>
    </Tabs>
  )
}