import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TooltipProvider } from "@/components/ui/tooltip"

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jobsuche',
  description: 'Bewerbungen, Dokumente und Termine an einem Ort',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="bg-muted/40 font-sans antialiased">
        <TooltipProvider>
      {children}
        </TooltipProvider>
      </body>
    </html>
  )
}