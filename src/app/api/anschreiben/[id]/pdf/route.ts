import { renderCoverLetterPdf } from '@/lib/cover-letters/pdf'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new Response('Nicht angemeldet.', { status: 401 })

  const { id } = await params

  // Titel kommt aus derselben Abfrage, RLS filtert auf den eigenen User
  const { data: letter } = await supabase
    .from('cover_letters')
    .select('title')
    .eq('id', id)
    .single()

  if (!letter) return new Response('Nicht gefunden.', { status: 404 })

  const result = await renderCoverLetterPdf(id)

  if (!result) {
    return new Response('Die Vorlage hat keine Basis-PDF.', { status: 422 })
  }

  const download = new URL(request.url).searchParams.has('download')
  const filename = `${letter.title.replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`

  return new Response(new Blob([result.bytes as BlobPart], { type: 'application/pdf' }), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
      'Cache-Control': 'no-store',
      'X-Overflow': result.overflow ? '1' : '0',
    },
  })
}