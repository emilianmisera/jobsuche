# Jobsuche

A tool I built to manage my own job applications. Before this everything lived in a spreadsheet plus a folder full of PDFs, which got messy fast.

Now applications, CVs, cover letters and the email thread all sit in one place, and replies from companies get matched to the right application automatically.

## Features

### Applications

- Table view with sorting, or a Kanban board with drag and drop between status columns
- Five statuses: draft, applied, in progress, rejected, offer
- Detail panel with documents, notes, next action and a full activity timeline
- Search across company and position
- Every status change gets logged to the timeline by a database trigger, no matter where it came from

### Documents

- Upload CVs as PDF and preview them right in the app, files live in a private Storage bucket
- Cover letters are written in the app and rendered to PDF on the server, using my Figma layout as the base file
- The custom font gets embedded, and the signature moves up or down depending on how long the text is
- Text position and font size can be adjusted in the app with a live preview

### Gmail sync

This is the part I spent the most time on.

- Connect a Gmail account via OAuth, read-only
- The sync searches only for companies I actually applied to, plus known ATS domains like Personio, Greenhouse or Lever
- Matching happens in three stages with decreasing confidence: known thread from an earlier run, sender domain against the normalised company name, then company name in the text combined with a job-related keyword
- An LLM reads a shortened, redacted snippet and decides whether it's a rejection, an interview invite, an offer, a plain acknowledgment or something unrelated
- Every matched email shows up in that application's timeline
- **Automatic status change** when the match is strong (thread or domain) and the model is at least 85% confident. Otherwise it becomes a suggestion with an accept and a dismiss button in the detail panel
- Status only ever moves forward, except rejections which can always be set. An acknowledgment can't undo a rejection
- A blue dot in the table and on the board card marks applications with something new. It disappears once you've looked, unless there's still a suggestion waiting
- Runs daily via cron, or on demand with the refresh button next to "add application"

## Stack

Next.js 16 with TypeScript, Tailwind 4 and shadcn/ui on Base UI. Supabase for database, auth and file storage. TanStack Table for the table, dnd-kit for the board, pdf-lib for the cover letters. Email classification runs on Groq. Deployed on Vercel.

## Some decisions

**The LLM never sees my inbox.** The Gmail query is scoped to companies I applied to. Message bodies are only fetched for emails that already matched an application. Of that, 600 characters go to the model, with links, addresses, phone numbers, signatures and quoted history stripped out first. Only sender, subject and a short preview get stored, never full bodies or attachments.

The classifier sits behind an interface with two implementations. One env variable switches between Groq and a local model through Ollama.

**Suggestions instead of blind automation.** A wrong status would be worse than no status, because the trigger writes it into the timeline too. So automation needs both a strong match and high confidence. Everything else waits for me.

**pdf-lib instead of JSX-to-PDF.** The cover letter layout already existed in Figma. Exporting it as a base PDF and stamping the text in keeps it exact. Rebuilding it in a JSX library would only have looked similar. The text box coordinates live as JSON on the template.

**RLS instead of filtering in code.** No query filters by user id, Row Level Security handles it throughout. Forgetting a filter would be a leak, forgetting a policy is just an empty result. The cron job is the exception, it runs without a session and filters explicitly.

**The detail panel is a query parameter.** I first built it as an intercepting route. It broke whenever something revalidated while the panel was open, Next would render the full page instead of the panel. With `?id=...` the list never gets unmounted and nothing can fall apart.

## Running it locally

Needs Node 24 and Docker.

```bash
npm install
npm run db:start
npm run db:types
npm run dev
```

Create `.env.local` from `.env.example`, the Supabase values come from `npx supabase status`.

Local login: `dev@local.test` with `devpassword`.

The Gmail sync additionally needs a Google Cloud project with the Gmail API enabled and a Groq key. Everything else works fine without them.

## Note

Built for a single user, signups are disabled. Gmail access is read-only and limited to messages matching an application. Details at `/datenschutz`.