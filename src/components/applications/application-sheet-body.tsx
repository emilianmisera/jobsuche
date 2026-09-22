import { ApplicationActions } from '@/components/applications/application-actions'
import { ApplicationDetailContent } from '@/components/applications/application-detail-content'
import {
  getApplication,
  getApplicationUpdates,
  type DocumentOption,
} from '@/lib/applications/queries'
import { toApplicationInput } from '@/lib/applications/schema'

type ApplicationSheetBodyProps = {
  id: string
  cvs: DocumentOption[]
  coverLetters: DocumentOption[]
}

export async function ApplicationSheetBody({ id, cvs, coverLetters }: ApplicationSheetBodyProps) {
  const [application, updates] = await Promise.all([
    getApplication(id),
    getApplicationUpdates(id),
  ])

  // Kein notFound, eine veraltete ID in der URL soll nicht die ganze Liste kippen
  if (!application) {
    return (
      <p className="p-6 pt-16 text-sm text-muted-foreground">
        Diese Bewerbung gibt es nicht mehr.
      </p>
    )
  }

  return (
    <>
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
          suggestions={updates.suggestions}
          hasUnseen={updates.hasUnseen}
        />
      </div>
    </>
  )
}