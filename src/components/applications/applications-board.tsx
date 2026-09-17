'use client'

import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import { updateApplicationStatus } from '@/lib/applications/actions'
import type { ApplicationListItem } from '@/lib/applications/queries'
import { STATUS_CONFIG, STATUS_ORDER, type ApplicationStatus } from '@/lib/applications/status'
import { formatDate, formatRelativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Zweite Zeile auf der Karte, abhängig vom Status. */
function cardMeta(application: ApplicationListItem): string {
  if (application.status === 'draft') return '-'

  if (application.status === 'in_progress' && application.next_action_at) {
    return `nächste Aktion: ${formatRelativeDate(application.next_action_at)}`
  }

  return application.applied_at ? `abgesendet ${formatDate(application.applied_at)}` : '-'
}

type CardProps = {
  application: ApplicationListItem
}

function BoardCard({ application }: CardProps) {
  const router = useRouter()
  const start = useRef<{ x: number; y: number } | null>(null)

  const { ref, isDragging } = useDraggable({
    id: application.id,
    type: 'application',
  })

  return (
    <article
      ref={ref}
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY }
      }}
      onClick={(event) => {
        // Ein Drag endet auch mit einem Click. Ab 5px Bewegung war es kein Klick.
        const from = start.current
        if (!from) return

        const moved = Math.hypot(event.clientX - from.x, event.clientY - from.y)
        if (moved > 5) return

        router.push(`/bewerbungen/${application.id}?view=board`)
      }}
      className={cn(
        'cursor-grab rounded-xl border bg-background p-4 shadow-sm transition-opacity',
        isDragging && 'opacity-40',
      )}
    >
      <h3 className="font-semibold">{application.company}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{application.position}</p>
      <p className="mt-2 text-sm text-muted-foreground">{cardMeta(application)}</p>
    </article>
  )
}

type ColumnProps = {
  status: ApplicationStatus
  applications: ApplicationListItem[]
}

function BoardColumn({ status, applications }: ColumnProps) {
  const config = STATUS_CONFIG[status]
  const { ref, isDropTarget } = useDroppable({
    id: status,
    type: 'application',
  })

  return (
    <section
      ref={ref}
      aria-label={config.label}
    className={cn(
        'flex w-72 shrink-0 flex-col gap-3 overflow-y-auto rounded-2xl p-3 transition-colors',
        config.column,
        isDropTarget && 'ring-2 ring-inset',
        isDropTarget && config.text.replace('text-', 'ring-'),
      )}
    >
      <header className="flex items-center justify-between px-1">
        <span className={cn('font-semibold', config.text)}>{config.label}</span>
        <span className={cn('text-sm font-semibold', config.text)}>{applications.length}</span>
      </header>

      {applications.map((application) => (
        <BoardCard key={application.id} application={application} />
      ))}
    </section>
  )
}

type ApplicationsBoardProps = {
  data: ApplicationListItem[]
}

export function ApplicationsBoard({ data }: ApplicationsBoardProps) {
  const [optimisticData, moveApplication] = useOptimistic(
    data,
    (state: ApplicationListItem[], move: { id: string; status: ApplicationStatus }) =>
      state.map((item) => (item.id === move.id ? { ...item, status: move.status } : item)),
  )

  const [, startTransition] = useTransition()

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return

        const id = event.operation.source?.id
        const target = event.operation.target?.id

        if (typeof id !== 'string' || typeof target !== 'string') return

        const status = target as ApplicationStatus
        const current = optimisticData.find((item) => item.id === id)

        if (!current || current.status === status) return

        startTransition(async () => {
          moveApplication({ id, status })

          const result = await updateApplicationStatus(id, status)

          if (result.error) {
            toast.error(result.error)
          }
        })
      }}
    >
        <div className="-mx-8 flex h-full gap-4 overflow-x-auto px-8 pb-4">
        {STATUS_ORDER.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            applications={optimisticData.filter((item) => item.status === status)}
          />
        ))}
      </div>
    </DragDropProvider>
  )
}