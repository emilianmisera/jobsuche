'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { deleteDocument, renameDocument } from '@/lib/documents/actions'

type DocumentActionsProps = {
  id: string
  title: string
  usageCount: number
}

export function DocumentActions({ id, title, usageCount }: DocumentActionsProps) {
  const router = useRouter()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [value, setValue] = useState(title)
  const [pending, startTransition] = useTransition()

  function handleRename() {
    startTransition(async () => {
      const result = await renameDocument(id, value)

      if (result.error) {
        toast.error(result.error)
        return
      }

      setRenameOpen(false)
      toast.success('Titel geändert.')
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDocument(id)

      if (result.error) {
        toast.error(result.error)
        return
      }

      router.replace('/dokumente')
      router.refresh()
      toast.success('Dokument gelöscht.')
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="Umbenennen"
        onClick={() => {
          setValue(title)
          setRenameOpen(true)
        }}
      >
        <Pencil />
      </Button>

      <Button
        variant="outline"
        size="icon"
        aria-label="Löschen"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 />
      </Button>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Umbenennen</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="document-title">Titel</Label>
            <Input
              id="document-title"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoFocus
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRenameOpen(false)} disabled={pending}>
              Abbrechen
            </Button>
            <Button onClick={handleRename} disabled={pending}>
              {pending ? 'Speichert …' : 'Speichern'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokument löschen</AlertDialogTitle>
            <AlertDialogDescription>
              {usageCount > 0
                ? `Dieses Dokument wird in ${usageCount} ${usageCount === 1 ? 'Bewerbung' : 'Bewerbungen'} verwendet. Dort wird es nach dem Löschen entfernt, die Bewerbungen selbst bleiben erhalten.`
                : 'Die Datei wird dauerhaft gelöscht.'}
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
    </>
  )
}