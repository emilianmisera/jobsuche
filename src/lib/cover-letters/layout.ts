/** Alle Werte in PDF-Punkten, Ursprung unten links. A4 ist 595 × 842. */
export type CoverLetterLayout = {
  body: { x: number; y: number; width: number; fontSize: number; lineHeight: number }
  signature: { width: number; gapAbove: number }
}

export const DEFAULT_LAYOUT: CoverLetterLayout = {
  body: { x: 89, y: 515, width: 416, fontSize: 8.5, lineHeight: 12 },
  signature: { width: 100, gapAbove: 10 },
}

/** Die Spalte ist jsonb, der Inhalt also ungeprüft. Fehlende Werte kommen aus dem Default. */
export function parseLayout(value: unknown): CoverLetterLayout {
  const raw = (value ?? {}) as Partial<CoverLetterLayout>

  return {
    body: { ...DEFAULT_LAYOUT.body, ...raw.body },
    signature: { ...DEFAULT_LAYOUT.signature, ...raw.signature },
  }
}