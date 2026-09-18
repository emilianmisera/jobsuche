'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCoverLetter } from '@/lib/cover-letters/actions'
import { cn } from '@/lib/utils'

export function NewCoverLetterButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [pending, startTransition] = useTransition()

  function handleCreate() {
    startTransition(async () => {
      const result = await createCoverLetter(title)

      if (result.error || !result.id) {
        toast.error(result.error ?? 'Anschreiben konnte nicht angelegt werden.')
        return
      }

      setOpen(false)
      setTitle('')
      router.push(`/anschreiben/${result.id}`)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex aspect-[3/4] flex-col cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors',
          'hover:border-foreground hover:bg-accent',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Plus className="size-5" />
        </span>
        <span className="text-sm text-muted-foreground">
          Neues Motivationsschreiben hinzufügen
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neues Motivationsschreiben</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cover-letter-title">Titel</Label>
            <Input
              id="cover-letter-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="bending_spoons-Motivation"
              autoFocus
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={pending}>
              {pending ? 'Legt an …' : 'Anlegen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}