import type { Metadata } from "next"
import { Montserrat } from 'next/font/google'
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import { getClientes } from "@/lib/services/clients"

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Agency Intelligence",
  description: "Automation Intelligence Platform",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const clientes = await getClientes()

  return (
    <html lang="es" className={montserrat.variable}>
      <body style={{ background: 'var(--bg)' }}>
        <div className="flex min-h-screen">
          <Sidebar clientes={clientes} />
          <main
            className="flex-1 min-h-screen overflow-y-auto"
            style={{ background: 'var(--bg)', marginLeft: 240, padding: '32px 40px' }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
