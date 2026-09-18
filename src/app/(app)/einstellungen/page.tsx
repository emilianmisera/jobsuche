import { TemplateForm } from '@/components/cover-letters/template-form'
import { TemplateList } from '@/components/cover-letters/template-list'
import { getTemplates } from '@/lib/cover-letters/queries'

export default async function EinstellungenPage() {
  const templates = await getTemplates()

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl bg-background p-8">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <section className="mt-8 max-w-2xl">
        <h2 className="text-lg font-semibold">Anschreiben-Vorlagen</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Basis für alle Motivationsschreiben. Neue Anschreiben nehmen die Standardvorlage,
          bestehende behalten ihre.
        </p>

        <div className="mt-4">
          <TemplateList templates={templates} />
        </div>

        <h3 className="mt-10 font-semibold">Neue Vorlage</h3>

        <div className="mt-4">
          <TemplateForm />
        </div>
      </section>
    </div>
  )
}