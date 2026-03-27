import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Usta Bonus Admin',
  description: 'Admin Dashboard for Usta Bonus Platform',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
