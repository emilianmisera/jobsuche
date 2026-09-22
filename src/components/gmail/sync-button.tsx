'use client'

import { RefreshCw } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { syncGmail } from '@/lib/gmail/actions'
import { cn } from '@/lib/utils'

export function SyncButton() {
  const [pending, startTransition] = useTransition()

  function handleSync() {
    startTransition(async () => {
      const response = await syncGmail()

      if (response.error || !response.result) {
        toast.error(response.error ?? 'Sync fehlgeschlagen.')
        return
      }

      const { checked, applied, pending: open } = response.result

      if (checked === 0) {
        toast.success('Keine neuen Mails.')
        return
      }

      const parts = [
        applied > 0 ? `${applied} automatisch aktualisiert` : null,
        open > 0 ? `${open} zur Prüfung` : null,
      ].filter(Boolean)

      toast.success(parts.length > 0 ? parts.join(', ') : `${checked} Mails geprüft, nichts Neues.`)
    })
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleSync}
      disabled={pending}
      aria-label="Postfach prüfen"
      title="Postfach prüfen"
      className="cursor-pointer"
    >
      <RefreshCw className={cn(pending && 'animate-spin')} />
    </Button>
  )
}