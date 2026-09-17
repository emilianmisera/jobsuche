'use client'

import { ApplicationsBoard } from '@/components/applications/applications-board'
import { ApplicationsTable } from '@/components/applications/applications-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ApplicationListItem } from '@/lib/applications/queries'

type ApplicationsViewsProps = {
  data: ApplicationListItem[]
}

export function ApplicationsViews({ data }: ApplicationsViewsProps) {
  return (
    <Tabs defaultValue="table" className="flex min-h-0 flex-1 flex-col">
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