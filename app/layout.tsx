import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const _dmSans = DM_Sans({ subsets: ['latin'] })
const _playfairDisplay = Playfair_Display({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Our Journal | Tai Rong & Maeko',
  description: 'A shared daily journal for Tai Rong and Maeko',
}

export const viewport: Viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
