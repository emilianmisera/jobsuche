'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { registerCv } from '@/lib/documents/actions'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MAX_BYTES = 10 * 1024 * 1024

/** Umlaute und Sonderzeichen raus, Storage mag nur ASCII-Pfade. */
function toSafeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .toLowerCase()
}

export function CvUpload() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      toast.error('Nur PDF-Dateien sind möglich.')
      return
    }

    if (file.size > MAX_BYTES) {
      toast.error('Die Datei ist größer als 10 MB.')
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Nicht angemeldet.')
        return
      }

      const path = `${user.id}/cv/${crypto.randomUUID()}-${toSafeName(file.name)}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file, { contentType: 'application/pdf' })

      if (uploadError) {
        toast.error('Upload fehlgeschlagen.')
        return
      }

      const result = await registerCv({
        title: file.name.replace(/\.pdf$/i, ''),
        storagePath: path,
        sizeBytes: file.size,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Lebenslauf hochgeladen.')
      router.refresh()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          const file = event.dataTransfer.files?.[0]
          if (file) void handleFile(file)
        }}
        className={cn(
          'flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors',
          'hover:border-foreground hover:bg-accent',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Plus className="size-5" />
        </span>
        <span className="text-sm text-muted-foreground">
          {uploading ? 'Lädt hoch …' : 'Neuen Lebenslauf hinzufügen'}
        </span>
      </button>
    </>
  )
}