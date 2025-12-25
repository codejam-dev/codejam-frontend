import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'CodeJam - Code Together, Ship Faster',
  description: 'Real-time collaborative coding platform for developers who move fast. Share code, sync edits, and build together.',
  keywords: ['collaborative coding', 'real-time', 'code sharing', 'pair programming', 'developer tools'],
  authors: [{ name: 'CodeJam' }],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'CodeJam - Code Together, Ship Faster',
    description: 'Real-time collaborative coding platform for developers who move fast.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
