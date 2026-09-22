'use client'

import { Mail } from 'lucide-react'
import { useEffect, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import type { Suggestion } from '@/lib/applications/queries'
import { STATUS_CONFIG } from '@/lib/applications/status'
import { formatDate } from '@/lib/format'
import { acceptSuggestion, dismissSuggestion, markApplicationSeen } from '@/lib/gmail/actions'

type ApplicationSuggestionsProps = {
  applicationId: string
  suggestions: Suggestion[]
  hasUnseen: boolean
}

export function ApplicationSuggestions({
  applicationId,
  suggestions,
  hasUnseen,
}: ApplicationSuggestionsProps) {
  const [pending, startTransition] = useTransition()

  // Nur wenn wirklich etwas ungesehen ist, sonst revalidiert jedes Öffnen die Liste
  useEffect(() => {
    if (hasUnseen) void markApplicationSeen(applicationId)
  }, [applicationId, hasUnseen])

  if (suggestions.length === 0) return null

  function run(action: () => Promise<{ error: string | null }>, success: string) {
    startTransition(async () => {
      const result = await action()

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(success)
    })
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="rounded-xl border border-status-applied/30 bg-status-applied-muted p-4"
        >
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-status-applied" aria-hidden />

            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">
                Mail vom {formatDate(suggestion.received_at)}
              </p>
              <p className="mt-0.5 font-medium break-words">{suggestion.subject}</p>
              <p className="mt-2 text-sm">
                Vorschlag: Status auf{' '}
                <span className="font-semibold">
                  {STATUS_CONFIG[suggestion.suggested_status].label}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2 pl-7">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => run(() => acceptSuggestion(suggestion.id), 'Status übernommen.')}
            >
              Übernehmen
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => run(() => dismissSuggestion(suggestion.id), 'Vorschlag verworfen.')}
            >
              Verwerfen
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}