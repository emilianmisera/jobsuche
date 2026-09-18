'use client'

import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { cn } from '@/lib/utils'

type SearchInputProps = {
  placeholder?: string
  className?: string
}

export function SearchInput({ placeholder = 'Search', className }: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [pending, startTransition] = useTransition()

  // Erst nach kurzer Pause in die URL schreiben, sonst rendert der Server bei jedem Tastendruck
  useEffect(() => {
    const current = searchParams.get('q') ?? ''

    if (value === current) return

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams)

      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }

      const query = params.toString()

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
      })
    }, 250)

    return () => clearTimeout(timeout)
  }, [value, searchParams, pathname, router])

  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className={cn(
          'absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground transition-opacity',
          pending && 'opacity-40',
        )}
      />

      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-full border bg-background pr-11 pl-11 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:appearance-none"
      />

      {value ? (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Suche zurücksetzen"
          className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}