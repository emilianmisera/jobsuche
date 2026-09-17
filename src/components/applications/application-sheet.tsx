'use client'

import { useRouter } from 'next/navigation'

import { ApplicationActions } from '@/components/applications/application-actions'
import { ApplicationDetailContent } from '@/components/applications/application-detail-content'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toApplicationInput } from '@/lib/applications/schema'
import type { ApplicationDetail, DocumentOption } from '@/lib/applications/queries'

type ApplicationSheetProps = {
  application: ApplicationDetail
  cvs: DocumentOption[]
  coverLetters: DocumentOption[]
}

export function ApplicationSheet({ application, cvs, coverLetters }: ApplicationSheetProps) {
  const router = useRouter()

  return (
    <Sheet open onOpenChange={(open) => !open && router.back()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:w-[34rem] sm:max-w-none">
        <SheetHeader className="sr-only">
          <SheetTitle>
            {application.company}, {application.position}
          </SheetTitle>
        </SheetHeader>

        {/* Auf Höhe des X-Buttons, rechts genug Platz für ihn lassen */}
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
          <ApplicationDetailContent application={application} />
        </div>
      </SheetContent>
    </Sheet>
  )
}