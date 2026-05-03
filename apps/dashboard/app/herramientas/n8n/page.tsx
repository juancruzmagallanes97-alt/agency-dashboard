import Link from 'next/link'
import { getClientes } from '@/lib/services/clients'
import { getWorkflowTipoColor, getWorkflowTipoLabel } from '@/lib/data'

export default async function N8nDashboard() {
  const clientes = await getClientes()

  const todosWorkflows = clientes.flatMap(c =>
    c.workflows.map(w => ({ ...w, cliente: c.empresa, clienteId: c.id }))
  )
  const activos      = todosWorkflows.filter(w => w.estado === 'activo')
  const conError     = todosWorkflows.filter(w => w.estado === 'error')
  const totalEjecu   = todosWorkflows.reduce((acc, w) => acc + w.ejecucionesHoy, 0)
  const uptimeProm   = todosWorkflows.length
    ? Math.round(todosWorkflows.reduce((acc, w) => acc + w.uptime, 0) / todosWorkflows.length * 10) / 10
    : 0
  const n8nUrl = clientes[0]?.n8nBase || 'http://129.121.56.240'

  const kpis = [
    { label: 'Total',          value: todosWorkflows.length, accent: 'var(--border-2)',      glow: 'transparent',              numColor: 'var(--text-1)' },
    { label: 'Activos',        value: activos.length,        accent: 'var(--status-estable)', glow: 'rgba(34,197,94,0.12)',     numColor: 'var(--status-estable)' },
    { label: 'Con error',      value: conError.length,       accent: conError.length > 0 ? 'var(--critical)' : 'var(--border-2)', glow: conError.length > 0 ? 'rgba(239,68,68,0.10)' : 'transparent', numColor: conError.length > 0 ? 'var(--critical)' : 'var(--text-1)' },
    { label: 'Ejecuciones hoy', value: totalEjecu,           accent: 'var(--accent)',         glow: 'rgba(75,123,245,0.12)',    numColor: 'var(--accent)' },
  ]

  return (
    <div className="fade-in-up">

      {/* Header */}
      <Link href="/herramientas" style={{ fontSize: 11, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
        ‹ Herramientas
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(234,75,113,0.12)', border: '1px solid rgba(234,75,113,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#EA4B71', flexShrink: 0,
            boxShadow: '0 0 16px rgba(234,75,113,0.15)',
          }}>
            n
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.02em' }}>n8n</h1>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, marginTop: 3 }}>
              Estado de todos los workflows · {n8nUrl}
            </p>
          </div>
        </div>
        <a
          href={n8nUrl} target="_blank" rel="noopener noreferrer"
          style={{
            fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 8,
            background: '#EA4B71', color: '#fff', textDecoration: 'none',
            boxShadow: '0 0 16px rgba(234,75,113,0.30)',
          }}
        >
          Abrir n8n →
        </a>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ position: 'relative', borderRadius: 14, padding: '18px 20px 16px', background: 'var(--surface-1)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.accent, boxShadow: `0 0 10px ${k.glow}` }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: `radial-gradient(ellipse at 30% 0%, ${k.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', fontWeight: 600, marginBottom: 14 }}>{k.label}</div>
              <div style={{ fontSize: 40, fontWeight: 800, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.03em', color: k.numColor, textShadow: `0 0 20px ${k.glow}` }}>{k.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 10 }}>
                {i === 3 ? `${uptimeProm}% uptime prom.` : 'workflows'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Con error */}
      {conError.length > 0 && (
        <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--critical)' }}>🔴 Workflows con error — atención inmediata</span>
          </div>
          {conError.map(w => (
            <div key={w.id} className="hover-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(239,68,68,0.10)' }}>
              <div>
                <a href={w.n8nUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: 'var(--critical)', textDecoration: 'none' }}>{w.nombre} ↗</a>
                <div style={{ fontSize: 11, marginTop: 3, color: 'var(--text-3)' }}>{w.cliente} · {w.ultimaEjecucion}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--critical)' }}>{w.erroresHoy} errores</div>
                <div style={{ fontSize: 11, marginTop: 3, color: 'var(--text-3)' }}>{w.uptime}% uptime</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabla de workflows */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Todos los workflows</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-3)' }}>{todosWorkflows.length} total · {uptimeProm}% uptime</span>
        </div>

        {/* Cols header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 90px 70px 70px 60px',
          padding: '8px 20px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border)',
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)',
        }}>
          <span>Nombre</span><span>Cliente</span><span>Tipo</span>
          <span style={{ textAlign: 'right' }}>Hoy</span>
          <span style={{ textAlign: 'right' }}>Uptime</span>
          <span style={{ textAlign: 'right' }}>Estado</span>
        </div>

        {todosWorkflows.sort((a, b) => b.erroresHoy - a.erroresHoy).map(w => {
          const dotColor = w.estado === 'activo' ? 'var(--status-estable)' : w.estado === 'error' ? 'var(--critical)' : '#333'
          const dotGlow  = w.estado === 'activo' ? 'rgba(34,197,94,0.6)'  : w.estado === 'error' ? 'rgba(239,68,68,0.6)' : 'transparent'
          return (
            <div
              key={w.id}
              className="hover-row"
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 90px 70px 70px 60px', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <a href={w.n8nUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: w.estado === 'error' ? 'var(--critical)' : 'var(--text-1)', textDecoration: 'none' }}>
                  {w.nombre} ↗
                </a>
                <div style={{ fontSize: 10, fontFamily: 'monospace', marginTop: 2, color: 'var(--text-3)' }}>{w.id}</div>
              </div>
              <Link href={`/clientes/${w.clienteId}`} style={{ fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}>{w.cliente}</Link>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getWorkflowTipoColor(w.tipo)}`}>{getWorkflowTipoLabel(w.tipo)}</span>
              <div style={{ textAlign: 'right', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-2)' }}>{w.ejecucionesHoy}</div>
              <div style={{ textAlign: 'right', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-2)' }}>{w.uptime}%</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotGlow}` }} />
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
