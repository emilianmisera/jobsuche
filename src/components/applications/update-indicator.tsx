import { Info } from 'lucide-react'

import { cn } from '@/lib/utils'

export function UpdateIndicator({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex text-status-applied', className)} title="Neue Aktivität">
      <Info className="size-4" aria-hidden />
      <span className="sr-only">Neue Aktivität</span>
    </span>
  )
}