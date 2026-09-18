'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { NewCoverLetterButton } from '@/components/cover-letters/new-cover-letter-button'
import { CvUpload } from '@/components/documents/cv-upload'
import { DocumentCard } from '@/components/documents/document-card'
import { SearchInput } from '@/components/search-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CoverLetterListItem, CvListItem } from '@/lib/documents/queries'

/** Supabase liefert bei (count) ein Array mit einem Objekt. */
function readCount(rows: { count: number }[]): number {
  return rows[0]?.count ?? 0
}

type DocumentsViewsProps = {
  cvs: CvListItem[]
  coverLetters: CoverLetterListItem[]
  query?: string
}

export function DocumentsViews({ cvs, coverLetters, query }: DocumentsViewsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = searchParams.get('tab') === 'anschreiben' ? 'anschreiben' : 'lebenslauf'

  function handleChange(next: string | null) {
    if (next === null) return

    const params = new URLSearchParams(searchParams)

    if (next === 'anschreiben') {
      params.set('tab', 'anschreiben')
    } else {
      params.delete('tab')
    }

    const search = params.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }

  return (
    <Tabs value={tab} onValueChange={handleChange}>
      <TabsList className="self-start">
        <TabsTrigger value="lebenslauf">Lebenslauf</TabsTrigger>
        <TabsTrigger value="anschreiben">Motivationsschreiben</TabsTrigger>
      </TabsList>

      <SearchInput className="mt-6" />

      <TabsContent value="lebenslauf" className="mt-6">
        {cvs.length === 0 && query ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Kein Lebenslauf passt zu &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {cvs.map((cv) => (
              <DocumentCard
                key={cv.id}
                href={`/dokumente/${cv.id}`}
                title={cv.title}
                usageCount={readCount(cv.used_as_cv) + readCount(cv.used_as_attachment)}
                updatedAt={cv.updated_at}
              />
            ))}

            <CvUpload />
          </div>
        )}
      </TabsContent>

      <TabsContent value="anschreiben" className="mt-6">
        {coverLetters.length === 0 && query ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Kein Motivationsschreiben passt zu &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {coverLetters.map((letter) => (
              <DocumentCard
                key={letter.id}
                href={`/anschreiben/${letter.id}`}
                title={letter.title}
                usageCount={readCount(letter.used_in)}
                updatedAt={letter.updated_at}
              />
            ))}

            <NewCoverLetterButton />
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}