import './globals.css'
import type { Metadata } from 'next'
import { AppProvider } from '@/lib/context'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'MedQR',
  applicationName: 'MedQR',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  description: 'A comprehensive QR-based medical system for national health logistics and patient care.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Navbar />
          <main style={{ paddingTop: '1rem', minHeight: 'calc(100vh - 80px)' }}>
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  )
}

