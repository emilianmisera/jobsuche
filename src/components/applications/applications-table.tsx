'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'

import { StatusBadge } from '@/components/applications/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ApplicationListItem } from '@/lib/applications/queries'
import {
  formatDate,
  formatEmploymentType,
  formatFileList,
  formatRelativeDate,
} from '@/lib/format'
import { UpdateIndicator } from './update-indicator'
import { cn } from '@/lib/utils'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
})

const columnHelper = createColumnHelper<typeof features, ApplicationListItem>()

const columns = columnHelper.columns([
    columnHelper.accessor('has_update', {
    id: 'update',
    header: () => <span className="sr-only">Neu</span>,
    enableSorting: false,
    cell: (info) => (info.getValue() ? <UpdateIndicator /> : null),
  }),
  columnHelper.accessor('company', {
    header: 'Unternehmen',
  }),
  columnHelper.accessor('position', {
    header: 'Position',
  }),
  columnHelper.accessor((row) => (row.is_remote ? 'Full Remote' : (row.location ?? '-')), {
    id: 'location',
    header: 'Ort',
  }),
  columnHelper.accessor('employment_type', {
    header: 'Art',
    cell: (info) => formatEmploymentType(info.getValue()),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor('applied_at', {
    header: 'Abgesendet',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor('next_action_at', {
    header: 'nächste Aktion',
    cell: (info) => formatRelativeDate(info.getValue()),
  }),
  columnHelper.accessor(
    (row) =>
      formatFileList(
        [
          row.cv?.title,
          row.cover_letter?.title,
          ...row.attachments.map((entry) => entry.document?.title),
        ].filter((title): title is string => Boolean(title)),
      ),
    {
      id: 'files',
      header: 'Dateien',
      enableSorting: false,
    },
  ),
])

type ApplicationsTableProps = {
  data: ApplicationListItem[]
  query?: string
}

export function ApplicationsTable({ data, query }: ApplicationsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sorting, setSorting] = useState<SortingState>([])

  function detailHref(id: string) {
    const params = new URLSearchParams(searchParams)
    params.set('id', id)
    return `${pathname}?${params}`
  }

  const table = useTable({
    features,
    columns,
    data,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => row.id,
  })

  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        {query
          ? `Keine Bewerbung passt zu "${query}".`
          : 'Noch keine Bewerbungen. Leg deine erste an.'}
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted()

              return (
                                <TableHead
                  key={header.id}
                  className={cn('text-muted-foreground', header.column.id === 'update' && 'w-8 pr-0')}
                >
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <table.FlexRender header={header} />
                      <span aria-hidden className="text-xs">
                        {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : ''}
                      </span>
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows.map((row) => (
                                                  <TableRow
            key={row.id}
            onMouseEnter={() => router.prefetch(detailHref(row.id))}
            onClick={() => router.push(detailHref(row.id), { scroll: false })}
            className="cursor-pointer"
          >
            {row.getAllCells().map((cell) => (
                            <TableCell
                key={cell.id}
                className={cn('py-4', cell.column.id === 'update' && 'w-8 pr-0')}
              >
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}