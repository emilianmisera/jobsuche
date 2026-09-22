'use client'

import { Mail } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { disconnectGmail, syncGmail } from '@/lib/gmail/actions'
import { formatDateTime } from '@/lib/format'

type GmailConnectionProps = {
  account: { email: string; last_synced_at: string | null } | null
}

export function GmailConnection({ account }: GmailConnectionProps) {
  const [pending, startTransition] = useTransition()

    if (!account) {
    return (
      <a href="/api/gmail/connect" className={cn(buttonVariants())}>
        <Mail />
        Gmail verbinden
      </a>
    )
  }

    function handleSync() {
    startTransition(async () => {
      const response = await syncGmail()

      if (response.error || !response.result) {
        toast.error(response.error ?? 'Sync fehlgeschlagen.')
        return
      }

      const { checked, matched, applied, pending: open } = response.result

      toast.success(
        checked === 0
          ? 'Keine neuen Mails.'
          : `${checked} geprüft, ${matched} zugeordnet, ${applied} automatisch aktualisiert, ${open} zur Prüfung.`,
      )
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <span className="block truncate font-medium">{account.email}</span>
        <span className="block text-sm text-muted-foreground">
          {account.last_synced_at
            ? `zuletzt geprüft ${formatDateTime(account.last_synced_at)}`
            : 'noch nicht geprüft'}
        </span>
      </div>

           <div className="flex shrink-0 gap-2">
        <Button onClick={handleSync} disabled={pending}>
          {pending ? 'Prüft …' : 'Jetzt prüfen'}
        </Button>

        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await disconnectGmail()

              if (result.error) {
                toast.error(result.error)
                return
              }

              toast.success('Verbindung getrennt.')
            })
          }
        >
          Trennen
        </Button>
      </div>
    </div>
  )
}