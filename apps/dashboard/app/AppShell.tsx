'use client'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import type { Cliente } from '@/lib/data'

export default function AppShell({
  clientes,
  children,
}: {
  clientes: Cliente[]
  children: React.ReactNode
}) {
  const pathname = usePathname()

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar clientes={clientes} />
      <main
        className="flex-1 min-h-screen overflow-y-auto"
        style={{ background: 'var(--bg)', marginLeft: 240, padding: '36px 48px' }}
      >
        {children}
      </main>
    </div>
  )
}
