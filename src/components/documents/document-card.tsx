import { FileText } from 'lucide-react'
import Link from 'next/link'

import { formatDate } from '@/lib/format'

type DocumentCardProps = {
  href: string
  title: string
  usageCount: number
  updatedAt: string
}

export function DocumentCard({ href, title, usageCount, updatedAt }: DocumentCardProps) {
  return (
    <Link
      href={href}
      className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center transition-colors hover:bg-accent"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <FileText className="size-5" />
      </span>

      <span className="font-medium break-all">{title}</span>

      <span className="text-sm text-muted-foreground">
        verwendet in {usageCount} {usageCount === 1 ? 'Bewerbung' : 'Bewerbungen'}
        <br />
        zuletzt aktualisiert: {formatDate(updatedAt)}
      </span>
    </Link>
  )
}