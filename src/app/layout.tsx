import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'CodeJam - Code Together, Ship Faster',
  description: 'Real-time collaborative coding platform for developers who move fast. Share code, sync edits, and build together.',
  keywords: ['collaborative coding', 'real-time', 'code sharing', 'pair programming', 'developer tools'],
  authors: [{ name: 'CodeJam' }],
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
