'use client'

import { useActionState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, type AuthState } from '@/lib/auth/actions'

const initialState: AuthState = { error: null }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState)

  // Harte Navigation statt router.push, damit der Server mit frischen Cookies rendert
  useEffect(() => {
    if (state.success) window.location.assign('/bewerbungen')
  }, [state.success])

  const busy = pending || state.success === true

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-bold tracking-tight">Jobsuche</h1>
        <p className="mt-1 text-sm text-muted-foreground">Melde dich an, um fortzufahren.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </div>

          {state.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Wird angemeldet …' : 'Anmelden'}
          </Button>
        </form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
          <a href="/datenschutz" className="underline underline-offset-4 hover:text-foreground">
            Datenschutz
          </a>
        </p>
      </div>
    </main>
  )
}