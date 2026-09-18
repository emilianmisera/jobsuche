'use client'

import { Download, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { LayoutControls } from '@/components/cover-letters/layout-controls'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { deleteCoverLetter, updateCoverLetter } from '@/lib/cover-letters/actions'
import { parseLayout } from '@/lib/cover-letters/layout'
import type { CoverLetterDetail } from '@/lib/cover-letters/queries'
import { cn } from '@/lib/utils'

type CoverLetterEditorProps = {
  letter: CoverLetterDetail
}

export function CoverLetterEditor({ letter }: CoverLetterEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(letter.title)
  const [body, setBody] = useState(letter.body)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  // Zählt hoch, damit der iframe die neue Version lädt statt der gecachten
  const [pdfVersion, setPdfVersion] = useState(0)

  const dirty = title !== letter.title || body !== letter.body

  function handleSave() {
    if (!dirty) return

    startTransition(async () => {
      const result = await updateCoverLetter(letter.id, { title, body })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Gespeichert.')
      setPdfVersion((current) => current + 1)
      router.refresh()
    })
  }

  // Cmd+S abfangen, sonst will der Browser die Seite speichern
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, title, body])

  // Warnen, wenn ungespeicherte Änderungen verloren gehen würden
  useEffect(() => {
    if (!dirty) return

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCoverLetter(letter.id)

      if (result.error) {
        toast.error(result.error)
        return
      }

      router.replace('/dokumente?tab=anschreiben')
      router.refresh()
      toast.success('Anschreiben gelöscht.')
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-4">
                <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Titel"
          className="h-auto max-w-lg rounded-md border-0 bg-transparent px-2 py-1 -ml-2 text-3xl font-bold tracking-tight shadow-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-0"
        />

        <div className="flex items-center gap-2">
          <a
            href={`/api/anschreiben/${letter.id}/pdf?download`}
            className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
            aria-label="Herunterladen"
          >
            <Download />
          </a>

          <Button
            variant="outline"
            size="icon"
            aria-label="Löschen"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
          </Button>

          <Button onClick={handleSave} disabled={pending || !dirty}>
            {pending ? 'Speichert …' : 'Speichern'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="mt-6 flex min-h-0 flex-1 flex-col">
        <TabsList className="shrink-0 self-start">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6 flex min-h-0 flex-1 flex-col gap-4">
          {dirty ? (
            <p className="shrink-0 text-sm text-muted-foreground">
              Die Vorschau zeigt den gespeicherten Stand. Speichern, um Änderungen zu sehen.
            </p>
          ) : null}

          <LayoutControls
            templateId={letter.template.id}
            initial={parseLayout(letter.template.layout)}
            onSaved={() => setPdfVersion((current) => current + 1)}
          />

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border">
            <iframe
              key={pdfVersion}
              src={`/api/anschreiben/${letter.id}/pdf?v=${pdfVersion}`}
              title="Vorschau"
              className="size-full"
            />
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-6 flex min-h-0 flex-1 flex-col">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-label="Fließtext"
            placeholder={'Liebes Team,\n\n…\n\nMit freundlichen Grüßen\nEMILIAN MISERA'}
            className="min-h-96 flex-1 resize-none font-mono text-sm leading-relaxed"
          />
          <p className="mt-2 shrink-0 text-sm text-muted-foreground">
            Anrede, Fließtext und Grußformel. Die Unterschrift kommt aus der Vorlage und
            wandert mit.
          </p>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anschreiben löschen</AlertDialogTitle>
            <AlertDialogDescription>
              {letter.used_in.length > 0
                ? `Wird in ${letter.used_in.length} ${letter.used_in.length === 1 ? 'Bewerbung' : 'Bewerbungen'} verwendet. Dort wird es entfernt, die Bewerbungen bleiben.`
                : 'Das Anschreiben wird dauerhaft gelöscht.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
            >
              {pending ? 'Löscht …' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}