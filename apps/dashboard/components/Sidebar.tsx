'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Building2, CheckSquare, Bell,
  Wrench, Workflow, MessageSquare, Cpu, Table2, Hash,
  Settings, LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import type { Cliente } from '@/lib/data'

const AVATAR_COLORS = [
  { from: '#2383E2', to: '#1563C0' },
  { from: '#34D399', to: '#059669' },
  { from: '#F97316', to: '#C2410C' },
  { from: '#A855F7', to: '#7C3AED' },
  { from: '#F59E0B', to: '#D97706' },
]

function statusRingColor(estado: string) {
  const map: Record<string, string> = {
    estable:  'var(--status-estable)',
    atencion: 'var(--status-atencion)',
    riesgo:   'var(--status-riesgo)',
    critico:  'var(--status-critico)',
  }
  return map[estado] ?? '#555'
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div style={{ height: 8 }} />
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      color: 'var(--text-3)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '18px 18px 6px',
      opacity: 0.5,
    }}>
      {label}
    </div>
  )
}

function NavItem({
  href, label, icon: Icon, indent = false, collapsed,
}: {
  href: string
  label: string
  icon: React.ElementType
  indent?: boolean
  collapsed: boolean
}) {
  const path = usePathname()
  const active = path === href || (href !== '/' && path.startsWith(href))

  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        aria-current={active ? 'page' : undefined}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 34, margin: '2px 8px', borderRadius: 8,
          textDecoration: 'none',
          background: active ? 'rgba(35,131,226,0.14)' : 'transparent',
          color: active ? 'var(--accent)' : 'var(--text-3)',
          transition: 'background 120ms ease',
        }}
      >
        <Icon className="w-4 h-4" />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: 10,
        height: 34,
        paddingLeft: indent ? 32 : 14,
        paddingRight: 14,
        marginBottom: 1,
        borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
        textDecoration: 'none',
        background: active ? 'rgba(35,131,226,0.08)' : 'transparent',
        color: active ? 'var(--text-1)' : 'var(--text-3)',
        transition: 'background 120ms ease, color 120ms ease',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
      }}
    >
      <Icon
        className="w-4 h-4 shrink-0"
        style={{ color: active ? 'var(--accent)' : 'inherit', opacity: active ? 1 : 0.55 }}
      />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </span>
    </Link>
  )
}

export default function Sidebar({ clientes }: { clientes: Cliente[] }) {
  const [collapsed, setCollapsed] = useState(false)

  const alertasCriticasCount = clientes
    .flatMap(c => c.alertas)
    .filter(a => a.tipo === 'critico' && !a.resuelta).length

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed')
      if (saved !== null) setCollapsed(JSON.parse(saved))
    } catch {}
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem('sidebar_collapsed', JSON.stringify(next)) } catch {}
  }

  const width = collapsed ? 56 : 240

  return (
    <aside
      style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width,
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        zIndex: 10,
        transition: 'width 220ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Top bar — logo + collapse */}
      <div style={{
        height: 48, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid var(--border)',
        gap: 10,
      }}>
        {collapsed ? (
          <button
            onClick={toggle}
            aria-label="Expandir sidebar"
            style={{
              flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)',
            }}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        ) : (
          <>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              A
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
                Agency Intelligence
              </div>
            </div>
            <button
              onClick={toggle}
              aria-label="Colapsar sidebar"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-3)', display: 'flex', alignItems: 'center',
                padding: 4, borderRadius: 4, flexShrink: 0,
              }}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Perfil del gestor */}
      {!collapsed && (
        <div style={{
          padding: '16px 16px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2383E2, #1256b8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
              border: '2px solid rgba(35,131,226,0.25)',
            }}>
              JC
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
                Juan Cruz
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-estable)', display: 'inline-block', flexShrink: 0 }} />
                Gestor
              </div>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div style={{ padding: '10px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2383E2, #1256b8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
            border: '2px solid rgba(35,131,226,0.25)',
          }}>
            JC
          </div>
        </div>
      )}

      {/* Status rápido */}
      {!collapsed && (
        <div style={{
          padding: '10px 16px 9px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
          </span>
          {alertasCriticasCount > 0 ? (
            <span style={{ fontSize: 11, color: 'var(--status-critico)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-critico)', display: 'inline-block' }} />
              {alertasCriticasCount} crítica{alertasCriticasCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--status-estable)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-estable)', display: 'inline-block' }} />
              Sin alertas
            </span>
          )}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 6 }}>
        <NavItem href="/" label="Dashboard" icon={LayoutDashboard} collapsed={collapsed} />

        <SectionLabel label="Clientes" collapsed={collapsed} />
        <NavItem href="/clientes" label="Todos los clientes" icon={Users} collapsed={collapsed} />
        {clientes.map((c, i) => (
          <NavItem
            key={c.id}
            href={`/clientes/${c.id}`}
            label={c.empresa}
            icon={() => (
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length].from}, ${AVATAR_COLORS[i % AVATAR_COLORS.length].to})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 700, color: '#fff',
                border: `1.5px solid ${statusRingColor(c.estado)}`,
              }}>
                {c.empresa[0]}
              </div>
            )}
            indent
            collapsed={collapsed}
          />
        ))}

        <SectionLabel label="Gestión" collapsed={collapsed} />
        <NavItem href="/tareas" label="Tareas" icon={CheckSquare} collapsed={collapsed} />
        <NavItem href="/alertas" label="Alertas" icon={Bell} collapsed={collapsed} />

        <SectionLabel label="Herramientas" collapsed={collapsed} />
        <NavItem href="/herramientas" label="Todas" icon={Wrench} collapsed={collapsed} />
        <NavItem href="/herramientas/n8n" label="n8n" icon={Workflow} indent collapsed={collapsed} />
        <NavItem href="/herramientas/ghl" label="GoHighLevel" icon={MessageSquare} indent collapsed={collapsed} />
        <NavItem href="/herramientas/openai" label="OpenAI" icon={Cpu} indent collapsed={collapsed} />
        <NavItem href="/herramientas/airtable" label="Airtable" icon={Table2} indent collapsed={collapsed} />
        <NavItem href="/herramientas/slack" label="Slack" icon={Hash} indent collapsed={collapsed} />

        <SectionLabel label="Sistema" collapsed={collapsed} />
        <NavItem href="/configuracion" label="Configuración" icon={Settings} collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div style={{
        height: 48, borderTop: '1px solid var(--border)', flexShrink: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 12px',
      }}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          aria-label="Salir"
          title={collapsed ? 'Salir' : undefined}
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 13,
            borderRadius: 6, padding: '4px 6px',
            width: collapsed ? '100%' : 'auto',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Salir</span>}
        </button>
      </div>
    </aside>
  )
}
