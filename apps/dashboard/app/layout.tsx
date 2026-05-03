import type { Metadata } from "next"
import { Montserrat } from 'next/font/google'
import "./globals.css"
import AppShell from "./AppShell"
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
        <AppShell clientes={clientes}>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
