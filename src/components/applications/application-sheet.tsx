'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ApplicationActions } from '@/components/applications/application-actions'
import { ApplicationDetailContent } from '@/components/applications/application-detail-content'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ApplicationDetail, DocumentOption, Suggestion } from '@/lib/applications/queries'
import { toApplicationInput } from '@/lib/applications/schema'

type ApplicationSheetProps = {
  application: ApplicationDetail
  cvs: DocumentOption[]
  coverLetters: DocumentOption[]
  suggestions: Suggestion[]
  hasUnseen: boolean
}

export function ApplicationSheet({
  application,
  cvs,
  coverLetters,
  suggestions,
  hasUnseen,
}: ApplicationSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Die Route mountet das Sheet schon geöffnet. Base UI animiert aber nur den
  // Wechsel von geschlossen auf offen, deshalb erst im nächsten Frame öffnen.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        // Route erst verlassen, wenn die Schließ-Animation durch ist
        if (!isOpen) router.back()
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:w-[34rem] sm:max-w-none">
        <SheetHeader className="sr-only">
          <SheetTitle>
            {application.company}, {application.position}
          </SheetTitle>
        </SheetHeader>

        <div className="absolute top-3 right-14 z-10">
          <ApplicationActions
            id={application.id}
            company={application.company}
            values={toApplicationInput(application)}
            cvs={cvs}
            coverLetters={coverLetters}
          />
        </div>

        <div className="p-6 pt-16">
          <ApplicationDetailContent
            application={application}
            suggestions={suggestions}
            hasUnseen={hasUnseen}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}