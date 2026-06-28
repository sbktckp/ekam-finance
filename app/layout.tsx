import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ekam Finance',
  description: 'One place for all your finances',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    &lt;html lang="en"&gt;
      &lt;body className={inter.className}&gt;{children}&lt;/body&gt;
    &lt;/html&gt;
  )
}
