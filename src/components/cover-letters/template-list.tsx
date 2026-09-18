'use client'

import { Check, Pencil, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  deleteTemplate,
  renameTemplate,
  setDefaultTemplate,
} from '@/lib/cover-letters/actions'
import type { TemplateItem } from '@/lib/cover-letters/queries'
import { cn } from '@/lib/utils'

type TemplateListProps = {
  templates: TemplateItem[]
}

export function TemplateList({ templates }: TemplateListProps) {
  const [editing, setEditing] = useState<TemplateItem | null>(null)
  const [name, setName] = useState('')
  const [pending, startTransition] = useTransition()

  function run(action: () => Promise<{ error: string | null }>, success: string) {
    startTransition(async () => {
      const result = await action()

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(success)
      setEditing(null)
    })
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine Vorlage. Leg unten deine erste an.
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-2">
        {templates.map((template) => (
          <li
            key={template.id}
            className={cn(
              'flex items-center justify-between gap-4 rounded-lg border p-3',
              template.is_default && 'border-foreground',
            )}
          >
            <div className="min-w-0">
              <span className="block truncate font-medium">{template.name}</span>
              <span className="block text-sm text-muted-foreground">
                {[
                  template.signature_pdf_path ? 'Unterschrift' : null,
                  template.font_path ? 'Schrift' : null,
                ]
                  .filter(Boolean)
                  .join(', ') || 'nur Basis-PDF'}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {template.is_default ? (
                <span className="flex items-center gap-1 text-sm font-medium">
                  <Check className="size-4" />
                  Standard
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    run(() => setDefaultTemplate(template.id), 'Standardvorlage geändert.')
                  }
                >
                  Als Standard
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                aria-label="Umbenennen"
                disabled={pending}
                onClick={() => {
                  setName(template.name)
                  setEditing(template)
                }}
              >
                <Pencil />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Löschen"
                className="text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() => run(() => deleteTemplate(template.id), 'Vorlage gelöscht.')}
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vorlage umbenennen</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="template-rename">Name</Label>
            <Input
              id="template-rename"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={pending}>
              Abbrechen
            </Button>
            <Button
              disabled={pending}
              onClick={() => {
                if (editing) run(() => renameTemplate(editing.id, name), 'Name geändert.')
              }}
            >
              {pending ? 'Speichert …' : 'Speichern'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}