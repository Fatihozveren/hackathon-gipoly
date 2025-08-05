import React from 'react';
import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext';

const sora = Sora({ 
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gipoly - AI-powered tools for e-commerce sellers',
  description: 'Discover what to sell and at what price with AI-powered tools for e-commerce sellers.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${sora.variable} font-sora`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 