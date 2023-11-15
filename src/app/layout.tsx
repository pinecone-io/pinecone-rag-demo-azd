import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { PreloadResources } from './preload-resources'
import { AppInsightsProvider } from '@/components/instrumentation/AppInsightsProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <PreloadResources />
      <body className={inter.className}>
        <AppInsightsProvider>{children}</AppInsightsProvider>
      </body>
    </html>
  )
}
