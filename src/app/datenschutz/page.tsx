import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung · Jobsuche',
  description: 'Wie Jobsuche mit Daten umgeht',
}

export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Datenschutzerklärung</h1>
      <p className="mt-2 text-sm text-muted-foreground">Stand: September 2026</p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-lg font-semibold">Verantwortlicher</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Emilian Misera
            <br />
            Kontakt: emilian.misera@gmail.com
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Zweck der Anwendung</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Jobsuche ist ein privates Werkzeug zur Verwaltung eigener Bewerbungen. Es wird
            ausschließlich vom Betreiber selbst genutzt und steht nicht öffentlich zur
            Registrierung bereit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Verarbeitete Daten</h2>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed">
            <li>
              Bewerbungsdaten wie Unternehmen, Position, Ort, Status, Termine und Notizen, die der
              Nutzer selbst einträgt.
            </li>
            <li>
              Hochgeladene Dokumente wie Lebensläufe und Anschreiben. Diese liegen in einem
              privaten Speicherbereich und sind nur für den jeweiligen Nutzer abrufbar.
            </li>
            <li>
              E-Mail-Adresse und Passwort-Hash zur Anmeldung, verwaltet über Supabase.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Zugriff auf Google-Nutzerdaten</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Wenn der Nutzer sein Gmail-Konto verbindet, greift die Anwendung mit der Berechtigung
            gmail.readonly lesend auf das Postfach zu. Der Zugriff dient ausschließlich dazu,
            Antworten von Unternehmen den eigenen Bewerbungen zuzuordnen.
          </p>

          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            <li>
              Abgerufen werden nur Nachrichten, die zu einer vom Nutzer angelegten Bewerbung
              passen. Die Suche ist auf die Namen dieser Unternehmen und bekannte
              Bewerbungsportale eingegrenzt.
            </li>
            <li>
              Der Nachrichtentext wird nur für bereits zugeordnete Nachrichten geladen. Alle
              übrigen Nachrichten werden nicht abgerufen.
            </li>
            <li>
              Gespeichert werden Absender, Betreff, Zeitpunkt und eine kurze Vorschau. Vollständige
              Nachrichtentexte und Anhänge werden nicht gespeichert.
            </li>
            <li>
              Zur Einordnung, ob es sich um eine Absage, eine Einladung oder ein Angebot handelt,
              wird ein gekürzter und anonymisierter Ausschnitt an einen Sprachmodell-Dienst
              übermittelt. Links, E-Mail-Adressen, Telefonnummern, Signaturen und zitierte
              Verläufe werden vorher entfernt.
            </li>
            <li>
              Google-Nutzerdaten werden nicht verkauft, nicht für Werbung verwendet und nicht an
              Dritte weitergegeben, die über die genannte Verarbeitung hinausgehen.
            </li>
          </ul>

          <p className="mt-3 text-sm leading-relaxed">
            Die Nutzung und Weitergabe von Informationen aus Google APIs erfolgt im Einklang mit
            der{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Google API Services User Data Policy
            </a>{' '}
            einschließlich der Limited Use Anforderungen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Eingesetzte Dienste</h2>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed">
            <li>Supabase für Datenbank, Anmeldung und Dateispeicher, Serverstandort Frankfurt.</li>
            <li>Vercel für den Betrieb der Anwendung.</li>
            <li>Groq für die Einordnung von E-Mail-Inhalten.</li>
            <li>Google für den Zugriff auf das verbundene Gmail-Konto.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Speicherdauer und Löschung</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Der Nutzer kann die Gmail-Verbindung jederzeit in den Einstellungen trennen. Dabei
            wird das gespeicherte Zugriffstoken gelöscht. Der Zugriff lässt sich zusätzlich
            jederzeit im Google-Konto unter den Sicherheitseinstellungen widerrufen. Bewerbungen
            und Dokumente können in der Anwendung einzeln gelöscht werden.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Rechte der betroffenen Person</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Es bestehen die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung, Datenübertragbarkeit und Widerspruch. Anfragen richten Sie bitte an die
            oben genannte Adresse.
          </p>
        </section>
      </div>
    </main>
  )
}