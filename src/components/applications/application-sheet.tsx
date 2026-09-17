'use client'

import { useRouter } from 'next/navigation'

import { ApplicationDetailContent } from '@/components/applications/application-detail-content'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ApplicationDetail } from '@/lib/applications/queries'

export function ApplicationSheet({ application }: { application: ApplicationDetail }) {
  const router = useRouter()

  return (
    <Sheet open onOpenChange={(open) => !open && router.back()}>
            <SheetContent side="right" className="w-full overflow-y-auto sm:w-[34rem] sm:max-w-none">
        <SheetHeader className="sr-only">
          <SheetTitle>
            {application.company}, {application.position}
          </SheetTitle>
        </SheetHeader>

        <div className="p-6">
          <ApplicationDetailContent application={application} />
        </div>
      </SheetContent>
    </Sheet>
  )
}