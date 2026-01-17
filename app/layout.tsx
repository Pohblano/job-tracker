// Root layout for SVB; loads Inter, global styles, and wraps all routes in a clean TV-first shell.
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'Shop Visibility Board',
  description: 'TV-first, real-time visibility dashboard for the shop floor.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-tv-background text-tv-text">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
