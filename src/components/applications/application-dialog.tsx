'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createApplication, updateApplication } from '@/lib/applications/actions'
import type { DocumentOption } from '@/lib/applications/queries'
import { EMPTY_APPLICATION, type ApplicationInput } from '@/lib/applications/schema'
import { STATUS_CONFIG, STATUS_ORDER, type ApplicationStatus } from '@/lib/applications/status'
import { cn } from '@/lib/utils'


const EMPLOYMENT_OPTIONS = [
  { value: 'full_time', label: 'Vollzeit' },
  { value: 'part_time', label: 'Teilzeit' },
  { value: 'mini_job', label: 'Minijob' },
  { value: 'fixed_term', label: 'befristet' },
] as const

const STATUS_OPTIONS = STATUS_ORDER.map((status) => ({
  value: status,
  label: STATUS_CONFIG[status].label,
}))

const NONE = '__none__'

type ApplicationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cvs: DocumentOption[]
  coverLetters: DocumentOption[]
  /** Gesetzt heißt Bearbeiten, leer heißt Anlegen. */
  application?: { id: string; values: ApplicationInput }
}

export function ApplicationDialog({
  open,
  onOpenChange,
  cvs,
  coverLetters,
  application,
}: ApplicationDialogProps) {
  const initial = application?.values ?? EMPTY_APPLICATION

  const [step, setStep] = useState<1 | 2>(1)
  const [values, setValues] = useState<ApplicationInput>(initial)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  function set<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      const { [key as string]: _removed, ...rest } = current
      return rest
    })
  }

  function setStatus(status: ApplicationStatus) {
    setValues((current) => ({
      ...current,
      status,
      // Entwürfe haben kein Absendedatum
      applied_at: status === 'draft' ? '' : current.applied_at,
    }))
  }

   function reset() {
    setValues(initial)
    setFieldErrors({})
    setStep(1)
    useEffect(() => {
    if (!open) return

    setValues(initial)
    setFieldErrors({})
    setStep(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) reset()
      useEffect(() => {
    if (!open) return

    setValues(initial)
    setFieldErrors({})
    setStep(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  }

    function handleSubmit() {
    startTransition(async () => {
      const result = application
        ? await updateApplication(application.id, values)
        : await createApplication(values)

      if (result.error) {
        setFieldErrors(result.fieldErrors ?? {})
        if (result.fieldErrors?.company || result.fieldErrors?.position) {
          setStep(1)
        }
        toast.error(result.error)
        return
      }

      toast.success(application ? 'Änderungen gespeichert.' : 'Bewerbung angelegt.')
      onOpenChange(false)
    })
  }

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{application ? 'Bewerbung bearbeiten' : 'Neue Bewerbung'}</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <Field label="Unternehmen" required error={fieldErrors.company}>
              <Input
                value={values.company}
                onChange={(event) => set('company', event.target.value)}
                autoFocus
              />
            </Field>

            <Field label="Position" required error={fieldErrors.position}>
              <Input
                value={values.position}
                onChange={(event) => set('position', event.target.value)}
              />
            </Field>

            <Field label="Job Link" error={fieldErrors.job_link}>
              <Input
                value={values.job_link ?? ''}
                onChange={(event) => set('job_link', event.target.value)}
                placeholder="https://"
              />
            </Field>

            <div className="grid grid-cols-2 items-end gap-4">
              <Field label="Ort">
                <Input
                  value={values.location ?? ''}
                  onChange={(event) => set('location', event.target.value)}
                  disabled={values.is_remote}
                />
              </Field>

              <label className="flex h-9 items-center gap-2 text-sm">
                <Checkbox
                  checked={values.is_remote}
                  onCheckedChange={(checked) => set('is_remote', checked === true)}
                />
                Remote
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Art">
                <OptionSelect
                  value={values.employment_type}
                  options={[...EMPLOYMENT_OPTIONS]}
                  noneLabel="keine Angabe"
                  onChange={(value) =>
                    set('employment_type', value as ApplicationInput['employment_type'])
                  }
                />
              </Field>

              <Field label="Status">
                <OptionSelect
                  value={values.status}
                  options={STATUS_OPTIONS}
                  onChange={(value) => {
                    if (value !== null) setStatus(value as ApplicationStatus)
                  }}
                />
              </Field>
            </div>

            {values.status === 'draft' ? null : (
              <Field label="Beworben am" error={fieldErrors.applied_at}>
                <Input
                  type="date"
                  value={values.applied_at ?? ''}
                  onChange={(event) => set('applied_at', event.target.value)}
                />
              </Field>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="CV">
                <OptionSelect
                  value={values.cv_document_id}
                  options={cvs.map((cv) => ({ value: cv.id, label: cv.title }))}
                  noneLabel="keine Auswahl"
                  onChange={(value) => set('cv_document_id', value)}
                />
              </Field>

              <Field label="Motivationsschreiben">
                <OptionSelect
                  value={values.cover_letter_id}
                  options={coverLetters.map((letter) => ({
                    value: letter.id,
                    label: letter.title,
                  }))}
                  noneLabel="keine Auswahl"
                  onChange={(value) => set('cover_letter_id', value)}
                />
              </Field>
            </div>

            <Field label="Notizen">
              <Textarea
                rows={5}
                value={values.notes ?? ''}
                onChange={(event) => set('notes', event.target.value)}
              />
            </Field>
          </div>

        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-3">
            <Button variant="secondary" disabled={step === 1} onClick={() => setStep(1)}>
              Zurück
            </Button>

                        {step === 1 ? (
              <Button onClick={() => setStep(2)}>Weiter</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={pending}>
                {pending ? 'Speichert …' : application ? 'Speichern' : 'Anlegen'}
              </Button>
            )}
          </div>

          <p className="sr-only" aria-live="polite">
            Schritt {step} von 2
          </p>

          <div aria-hidden className="flex gap-1">
            {([1, 2] as const).map((value) => (
              <span
                key={value}
                className={cn(
                  'flex size-8 items-center justify-center rounded-md border text-sm text-muted-foreground',
                  step === value && 'border-foreground font-medium text-foreground',
                )}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type FieldProps = {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? ' *' : null}
      </Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

type Option = { value: string; label: string }

type OptionSelectProps = {
  value: string | null
  options: Option[]
  onChange: (value: string | null) => void
  /** Zusätzlicher Eintrag für "nicht gesetzt". Ohne ihn ist das Feld pflichtig. */
  noneLabel?: string
}

function OptionSelect({ value, options, onChange, noneLabel }: OptionSelectProps) {
  const entries = noneLabel ? [{ value: NONE, label: noneLabel }, ...options] : options

  // Base UI rendert im Trigger den Wert, nicht die Children des Items.
  // Über items bekommt es die Zuordnung Wert zu Label.
  const items = Object.fromEntries(entries.map((entry) => [entry.value, entry.label]))

  return (
    <Select
      items={items}
      value={value ?? NONE}
      onValueChange={(next) => {
        if (next === null) return
        onChange(next === NONE ? null : next)
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {entries.map((entry) => (
          <SelectItem key={entry.value} value={entry.value}>
            {entry.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}