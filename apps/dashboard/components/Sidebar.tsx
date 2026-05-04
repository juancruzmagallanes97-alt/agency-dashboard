'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Bell,
  Wrench, Workflow, MessageSquare, Cpu, Table2, Hash,
  Settings, LogOut, PanelLeftClose, PanelLeftOpen, ChevronDown,
} from 'lucide-react'
import type { Cliente } from '@/lib/data'

const AVATAR_COLORS = [
  { from: '#4B7BF5', to: '#2550C0' },
  { from: '#00E87A', to: '#00A855' },
  { from: '#FF6B35', to: '#C2410C' },
  { from: '#A855F7', to: '#7C3AED' },
  { from: '#FFB800', to: '#D97706' },
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

function SectionLabel({
  label, collapsed, collapsible, open, onToggle,
}: {
  label: string
  collapsed: boolean
  collapsible?: boolean
  open?: boolean
  onToggle?: () => void
}) {
  if (collapsed) return <div style={{ height: 8 }} />

  if (collapsible) {
    return (
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 10, fontWeight: 700, color: 'var(--text-2)',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          padding: '18px 16px 6px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        {label}
        <ChevronDown
          style={{
            width: 12, height: 12, color: 'var(--text-3)',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 200ms ease',
          }}
        />
      </button>
    )
  }

  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: 'var(--text-2)',
      textTransform: 'uppercase', letterSpacing: '0.12em',
      padding: '18px 16px 6px',
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
          background: active ? 'rgba(75,123,245,0.15)' : 'transparent',
          color: active ? 'var(--accent)' : 'var(--text-2)',
          transition: 'background 120ms ease',
        }}
      >
        <Icon style={{ width: 16, height: 16 }} />
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
        paddingLeft: indent ? 30 : 12,
        paddingRight: 12,
        marginBottom: 1,
        marginLeft: 4,
        marginRight: 4,
        borderRadius: 8,
        borderLeft: indent ? 'none' : 'none',
        textDecoration: 'none',
        background: active ? 'rgba(75,123,245,0.12)' : 'transparent',
        color: active ? 'var(--text-1)' : 'var(--text-2)',
        transition: 'background 120ms ease, color 120ms ease',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        position: 'relative',
      }}
    >
      {active && (
        <div style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 18, borderRadius: 2,
          background: 'linear-gradient(180deg, var(--accent), var(--accent-2))',
          boxShadow: '0 0 8px var(--accent-glow)',
        }} />
      )}
      <Icon
        style={{
          width: 15, height: 15, flexShrink: 0,
          color: active ? 'var(--accent)' : 'var(--text-3)',
        }}
      />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </span>
    </Link>
  )
}

export default function Sidebar({ clientes }: { clientes: Cliente[] }) {
  const [collapsed, setCollapsed] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

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
      {/* Top bar */}
      <div style={{
        height: 52, flexShrink: 0,
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
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)',
            }}
          >
            <PanelLeftOpen style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
              boxShadow: '0 0 12px var(--accent-glow)',
            }}>
              A
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
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
              <PanelLeftClose style={{ width: 15, height: 15 }} />
            </button>
          </>
        )}
      </div>

      {/* Perfil */}
      {!collapsed && (
        <div style={{
          padding: '14px 14px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
              boxShadow: '0 0 12px var(--accent-glow)',
            }}>
              SS
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
                Sr Smith
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-estable)', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 4px var(--status-estable)' }} />
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
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 10px var(--accent-glow)',
          }}>
            SS
          </div>
        </div>
      )}

      {/* Status rápido */}
      {!collapsed && (
        <div style={{
          padding: '8px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
          </span>
          {alertasCriticasCount > 0 ? (
            <span style={{ fontSize: 11, color: 'var(--status-critico)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-critico)', display: 'inline-block', boxShadow: '0 0 5px var(--status-critico)' }} />
              {alertasCriticasCount} crítica{alertasCriticasCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--status-estable)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-estable)', display: 'inline-block', boxShadow: '0 0 5px var(--status-estable)' }} />
              Sin alertas
            </span>
          )}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 8, paddingBottom: 8 }}>
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
                width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length].from}, ${AVATAR_COLORS[i % AVATAR_COLORS.length].to})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 7, fontWeight: 800, color: '#fff',
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
        <NavItem href="/alertas" label="Alertas" icon={Bell} collapsed={collapsed} />

        <SectionLabel
          label="Herramientas"
          collapsed={collapsed}
          collapsible
          open={toolsOpen}
          onToggle={() => setToolsOpen(o => !o)}
        />
        <NavItem href="/herramientas" label="Todas" icon={Wrench} collapsed={collapsed} />
        {(toolsOpen || collapsed) && (
          <>
            <NavItem href="/herramientas/n8n"      label="n8n"          icon={Workflow}      indent collapsed={collapsed} />
            <NavItem href="/herramientas/ghl"      label="GoHighLevel"  icon={MessageSquare} indent collapsed={collapsed} />
            <NavItem href="/herramientas/openai"   label="OpenAI"       icon={Cpu}           indent collapsed={collapsed} />
            <NavItem href="/herramientas/airtable" label="Airtable"     icon={Table2}        indent collapsed={collapsed} />
            <NavItem href="/herramientas/slack"    label="Slack"        icon={Hash}          indent collapsed={collapsed} />
          </>
        )}

        <SectionLabel label="Sistema" collapsed={collapsed} />
        <NavItem href="/configuracion" label="Configuración" icon={Settings} collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div style={{
        height: 52, borderTop: '1px solid var(--border)', flexShrink: 0,
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
            color: 'var(--text-2)', fontSize: 13,
            borderRadius: 6, padding: '4px 6px',
            width: collapsed ? '100%' : 'auto',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
          {!collapsed && <span>Salir</span>}
        </button>
      </div>
    </aside>
  )
}
