'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ApplicationDialog } from '@/components/applications/application-dialog'
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
import { deleteApplication } from '@/lib/applications/actions'
import type { DocumentOption } from '@/lib/applications/queries'
import type { ApplicationInput } from '@/lib/applications/schema'

type ApplicationActionsProps = {
  id: string
  company: string
  values: ApplicationInput
  cvs: DocumentOption[]
  coverLetters: DocumentOption[]
}

export function ApplicationActions({
  id,
  company,
  values,
  cvs,
  coverLetters,
}: ApplicationActionsProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteApplication(id)

      if (result.error) {
        toast.error(result.error)
        return
      }

      // Erst weg von der Detailroute, dann die Liste neu laden
      router.replace('/bewerbungen')
      router.refresh()
      toast.success('Bewerbung gelöscht.')
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" aria-label="Bearbeiten" onClick={() => setEditOpen(true)} className="cursor-pointer">
        <Pencil />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Löschen"
        className="text-destructive hover:text-destructive cursor-pointer"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 />
      </Button>

      <ApplicationDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        cvs={cvs}
        coverLetters={coverLetters}
        application={{ id, values }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bewerbung löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Die Bewerbung bei {company} und ihre Aktivitäten werden dauerhaft gelöscht. Die
              verknüpften Dokumente bleiben erhalten.
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