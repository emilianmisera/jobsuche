import { DocumentsViews } from '@/components/documents/document-views'
import { getCoverLetters, getCvs } from '@/lib/documents/queries'

export default async function DokumentePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>
}) {
  const { q } = await searchParams

  const [cvs, coverLetters] = await Promise.all([getCvs(q), getCoverLetters(q)])

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl bg-background p-8">
      <h1 className="text-2xl font-bold tracking-tight">Dokumente</h1>

      <div className="mt-6">
        <DocumentsViews cvs={cvs} coverLetters={coverLetters} query={q} />
      </div>
    </div>
  )
}