export const metadata = {
  title: 'Pinecone - AZD Template Example',
  description: 'Pinecone - AZD Template Example'
}

import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

import '../global.css'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
