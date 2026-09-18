'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTemplateLayout } from '@/lib/cover-letters/actions'
import type { CoverLetterLayout } from '@/lib/cover-letters/layout'

const FIELDS = [
  { group: 'body', key: 'x', label: 'Text links' },
  { group: 'body', key: 'y', label: 'Text oben' },
  { group: 'body', key: 'width', label: 'Textbreite' },
  { group: 'body', key: 'fontSize', label: 'Schriftgröße' },
  { group: 'body', key: 'lineHeight', label: 'Zeilenhöhe' },
  { group: 'signature', key: 'width', label: 'Signatur breit' },
  { group: 'signature', key: 'gapAbove', label: 'Abstand Signatur' },
] as const

type LayoutControlsProps = {
  templateId: string
  initial: CoverLetterLayout
  onSaved: () => void
}

export function LayoutControls({ templateId, initial, onSaved }: LayoutControlsProps) {
  const [layout, setLayout] = useState(initial)
  const [pending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateTemplateLayout(templateId, layout)

      if (result.error) {
        toast.error(result.error)
        return
      }

      onSaved()
      toast.success('Layout gespeichert.')
    })
  }

  return (
    <details className="shrink-0 rounded-xl border p-4">
      <summary className="cursor-pointer text-sm font-medium">Layout anpassen</summary>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        {FIELDS.map((field) => (
          <div key={`${field.group}-${field.key}`} className="w-28 space-y-1">
            <Label htmlFor={`${field.group}-${field.key}`} className="text-xs">
              {field.label}
            </Label>
            <Input
              id={`${field.group}-${field.key}`}
              type="number"
              step="0.5"
              value={layout[field.group][field.key as keyof (typeof layout)[typeof field.group]]}
              onChange={(event) =>
                setLayout((current) => ({
                  ...current,
                  [field.group]: {
                    ...current[field.group],
                    [field.key]: Number(event.target.value),
                  },
                }))
              }
            />
          </div>
        ))}

        <Button variant="outline" onClick={handleSave} disabled={pending}>
          {pending ? 'Speichert …' : 'Übernehmen'}
        </Button>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Punkte, Ursprung unten links. Größeres Y schiebt den Text nach oben. Gilt für alle
        Anschreiben.
      </p>
    </details>
  )
}