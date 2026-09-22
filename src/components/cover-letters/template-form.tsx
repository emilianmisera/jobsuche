'use client'

import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerTemplate } from '@/lib/cover-letters/actions'
import { createClient } from '@/lib/supabase/client'

function toSafeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .toLowerCase()
}

type FilePickerProps = {
  label: string
  hint: string
  accept: string
  required?: boolean
  file: File | null
  onChange: (file: File | null) => void
}

function FilePicker({ label, hint, accept, required, file, onChange }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? ' *' : null}
      </Label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="cursor-pointer">
          <Upload />
          Datei wählen
        </Button>

        <span className="min-w-0 truncate text-sm text-muted-foreground">
          {file ? file.name : 'keine Datei gewählt'}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

export function TemplateForm() {
  const router = useRouter()
  const [name, setName] = useState('Standard')
  const [base, setBase] = useState<File | null>(null)
  const [signature, setSignature] = useState<File | null>(null)
  const [font, setFont] = useState<File | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit() {
    if (!base) {
      toast.error('Die Basis-PDF fehlt.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Nicht angemeldet.')
        return
      }

      const templateId = crypto.randomUUID()
      const prefix = `${user.id}/templates/${templateId}`

      async function upload(file: File, folder: string): Promise<string | null> {
        const path = `${prefix}/${folder}-${toSafeName(file.name)}`
        const { error } = await supabase.storage.from('documents').upload(path, file)
        return error ? null : path
      }

      const basePath = await upload(base, 'base')

      if (!basePath) {
        toast.error('Upload der Basis-PDF fehlgeschlagen.')
        return
      }

      const signaturePath = signature ? await upload(signature, 'signature') : null
      const fontPath = font ? await upload(font, 'font') : null

      const result = await registerTemplate({
        id: templateId,
        name,
        basePdfPath: basePath,
        signaturePath,
        fontPath,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Vorlage gespeichert.')
      setBase(null)
      setSignature(null)
      setFont(null)
      router.refresh()
    })
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label htmlFor="template-name">Name</Label>
        <Input id="template-name" value={name} onChange={(event) => setName(event.target.value)} />
      </div>

      <FilePicker
        label="Basis-PDF"
        required
        accept="application/pdf"
        hint="Dein Figma-Export mit allem außer Anrede, Fließtext, Grußformel und Unterschrift."
        file={base}
        onChange={setBase}
      />

      <FilePicker
        label="Unterschrift"
        accept="image/png,application/pdf"
        hint="PNG mit transparentem Hintergrund, eng um die Striche beschnitten."
        file={signature}
        onChange={setSignature}
      />

      <FilePicker
        label="Schrift"
        accept=".otf,.ttf,font/otf,font/ttf"
        hint="SF Pro als OTF oder TTF. Ohne Schrift fällt der Renderer auf Helvetica zurück und kann keine Umlaute."
        file={font}
        onChange={setFont}
      />

      <Button onClick={handleSubmit} disabled={pending || !base} className="cursor-pointer">
        {pending ? 'Lädt hoch …' : 'Vorlage speichern'}
      </Button>
    </div>
  )
}