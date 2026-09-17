'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { ApplicationDialog } from '@/components/applications/application-dialog'
import { Button } from '@/components/ui/button'
import type { DocumentOption } from '@/lib/applications/queries'

type NewApplicationButtonProps = {
  cvs: DocumentOption[]
  coverLetters: DocumentOption[]
}

export function NewApplicationButton({ cvs, coverLetters }: NewApplicationButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Bewerbung hinzufügen
      </Button>

      <ApplicationDialog
        open={open}
        onOpenChange={setOpen}
        cvs={cvs}
        coverLetters={coverLetters}
      />
    </>
  )
}