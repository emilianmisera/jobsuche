import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CoverLetterEditor } from '@/components/cover-letters/cover-letter-editor'
import { getCoverLetter } from '@/lib/cover-letters/queries'

export default async function AnschreibenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const letter = await getCoverLetter(id)

  if (!letter) notFound()

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background p-8">
      <Link
        href="/dokumente?tab=anschreiben"
        className="mb-6 flex shrink-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Alle Dokumente
      </Link>

      <CoverLetterEditor letter={letter} />
    </div>
  )
}