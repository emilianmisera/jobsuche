import { cn } from '@/lib/utils'
import { STATUS_CONFIG, type ApplicationStatus } from '@/lib/applications/status'

type StatusBadgeProps = {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium',
        config.bg,
        config.text,
        className,
      )}
    >
      {config.label}
    </span>
  )
}