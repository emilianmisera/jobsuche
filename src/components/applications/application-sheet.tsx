'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function ApplicationSheet({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  // Erst im nächsten Frame öffnen, sonst gibt es keinen Startzustand für die Animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  function closedHref() {
    const params = new URLSearchParams(searchParams)
    params.delete('id')

    const search = params.toString()
    return search ? `${pathname}?${search}` : pathname
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        // Parameter erst entfernen, wenn die Schließ-Animation durch ist
        if (!isOpen) router.replace(closedHref(), { scroll: false })
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:w-[34rem] sm:max-w-none">
        <SheetHeader className="sr-only">
          <SheetTitle>Bewerbungsdetails</SheetTitle>
        </SheetHeader>

        {children}
      </SheetContent>
    </Sheet>
  )
}