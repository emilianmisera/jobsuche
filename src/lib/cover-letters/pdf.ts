import 'server-only'

import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'

import { parseLayout } from '@/lib/cover-letters/layout'
import { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

async function download(supabase: Supabase, path: string): Promise<Uint8Array | null> {
  const { data, error } = await supabase.storage.from('documents').download(path)

  if (error || !data) return null

  return new Uint8Array(await data.arrayBuffer())
}

/**
 * Umbruch an Wortgrenzen. Leerzeilen im Text bleiben als Absatzabstand erhalten,
 * Wörter die breiter als die Spalte sind werden hart getrennt.
 */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []

  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') {
      lines.push('')
      continue
    }

    let current = ''

    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word

      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate
        continue
      }

      if (current) lines.push(current)

      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word
        continue
      }

      let chunk = ''

      for (const char of word) {
        if (font.widthOfTextAtSize(chunk + char, size) > maxWidth) {
          lines.push(chunk)
          chunk = char
        } else {
          chunk += char
        }
      }

      current = chunk
    }

    if (current) lines.push(current)
  }

  return lines
}

export type RenderResult = { bytes: Uint8Array; overflow: boolean }

export async function renderCoverLetterPdf(id: string): Promise<RenderResult | null> {
  const supabase = await createClient()

  const { data: letter } = await supabase
    .from('cover_letters')
    .select(
      `
      body,
      template:cover_letter_templates (layout, base_pdf_path, signature_pdf_path, font_path)
    `,
    )
    .eq('id', id)
    .single()

  if (!letter?.template) return null

  const template = letter.template
  const layout = parseLayout(template.layout)

  const baseBytes = await download(supabase, template.base_pdf_path)

  if (!baseBytes) return null

  const pdf = await PDFDocument.load(baseBytes)
  pdf.registerFontkit(fontkit)

  const fontBytes = template.font_path ? await download(supabase, template.font_path) : null

  const font = fontBytes
    ? await pdf.embedFont(fontBytes, { subset: true })
    : await pdf.embedFont(StandardFonts.Helvetica)

  const page = pdf.getPage(0)
  const lines = wrapText(letter.body, font, layout.body.fontSize, layout.body.width)

  let y = layout.body.y

  for (const line of lines) {
    if (line) {
      page.drawText(line, {
        x: layout.body.x,
        y,
        size: layout.body.fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      })
    }

    y -= layout.body.lineHeight
  }

  // Grundlinie der letzten gesetzten Zeile
  const lastBaseline = y + layout.body.lineHeight

  if (template.signature_pdf_path) {
    const signatureBytes = await download(supabase, template.signature_pdf_path)

    if (signatureBytes) {
      const isPdf = template.signature_pdf_path.toLowerCase().endsWith('.pdf')

      if (isPdf) {
        const [embedded] = await pdf.embedPdf(signatureBytes)
        const height = embedded.height * (layout.signature.width / embedded.width)

        page.drawPage(embedded, {
          x: layout.body.x,
          y: lastBaseline - layout.signature.gapAbove - height,
          width: layout.signature.width,
          height,
        })
      } else {
        const image = await pdf.embedPng(signatureBytes)
        const height = image.height * (layout.signature.width / image.width)

        page.drawImage(image, {
          x: layout.body.x,
          y: lastBaseline - layout.signature.gapAbove - height,
          width: layout.signature.width,
          height,
        })
      }
    }
  }

  // Unterhalb von 120pt sitzt die MISERA-Wortmarke
  const overflow = lastBaseline < 120

  return { bytes: await pdf.save(), overflow }
}