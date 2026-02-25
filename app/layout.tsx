import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Marketdesk — Pre-Market OS',
  description: 'Your pre-market operating system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>
        <Sidebar />
        {/* Contenu principal — offset sidebar fixe 72px mobile / 272px desktop */}
        <div className="ml-[72px] lg:ml-[272px] min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
