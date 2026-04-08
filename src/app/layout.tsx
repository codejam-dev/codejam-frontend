import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import AppNavBar from '@/components/AppNavBar'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CodeJam — Developer Playground & Coding Platform',
  description: 'Write, execute, and share code instantly. Multi-language playground with Docker-sandboxed execution. Real-time collaboration coming soon.',
  keywords: ['code playground', 'online IDE', 'code execution', 'developer tools', 'collaborative coding'],
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
    title: 'CodeJam — Developer Playground & Coding Platform',
    description: 'Write, execute, and share code instantly. Multi-language playground with Docker-sandboxed execution.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <AppNavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
