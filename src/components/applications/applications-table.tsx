'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const [sorting, setSorting] = useState<SortingState>([])

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
                <TableHead key={header.id} className="text-muted-foreground">
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
            onClick={() => {
              const params = searchParams.toString()
              router.push(`/bewerbungen/${row.id}${params ? `?${params}` : ''}`)
            }}
            className="cursor-pointer"
          >
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id} className="py-4">
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}