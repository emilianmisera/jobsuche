import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DocumentActions } from '@/components/documents/documents-actions'
import { buttonVariants } from '@/components/ui/button'
import { getCv } from '@/lib/documents/queries'
import { cn } from '@/lib/utils'

export default async function DokumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const document = await getCv(id)

  if (!document) notFound()

  const usageCount =
    (document.used_as_cv[0]?.count ?? 0) + (document.used_as_attachment[0]?.count ?? 0)

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background p-8">
      <Link
        href="/dokumente"
        className="mb-6 flex shrink-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Alle Dokumente
      </Link>

      <div className="flex shrink-0 items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight break-all">{document.title}</h1>

        <div className="flex items-center gap-2">
          {document.signedUrl ? (
            <a
              href={document.signedUrl}
              download
              className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
              aria-label="Herunterladen"
            >
              <Download />
            </a>
          ) : null}

          <DocumentActions id={document.id} title={document.title} usageCount={usageCount} />
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-hidden rounded-xl border">
        {document.signedUrl ? (
          <iframe src={document.signedUrl} title={document.title} className="size-full" />
        ) : (
          <p className="p-8 text-sm text-muted-foreground">
            Die Datei liegt nicht im Storage. Wahrscheinlich ein Platzhalter aus dem Seed.
          </p>
        )}
      </div>
    </div>
  )
}