import { notFound } from 'next/navigation'
import { signOut } from '@/auth'
import { getCliente } from '@/lib/services/clients'
import { LogOut, Zap, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react'

export default async function PortalCliente({ params }: { params: Promise<{ clienteId: string }> }) {
  const { clienteId } = await params
  const cliente = await getCliente(clienteId)
  if (!cliente) notFound()

  const workflowsActivos = cliente.workflows.filter(w => w.estado === 'activo').length
  const workflowsError   = cliente.workflows.filter(w => w.estado === 'error').length
  const alertasCriticas  = cliente.alertas.filter(a => a.tipo === 'critico' && !a.resuelta)
  const alertasWarning   = cliente.alertas.filter(a => a.tipo === 'warning' && !a.resuelta)
  const uptimeProm = cliente.workflows.length
    ? Math.round(cliente.workflows.reduce((acc, w) => acc + w.uptime, 0) / cliente.workflows.length * 10) / 10
    : 0

  function healthColor(score: number) {
    if (score >= 75) return 'var(--status-estable)'
    if (score >= 55) return 'var(--status-atencion)'
    if (score >= 35) return 'var(--status-riesgo)'
    return 'var(--status-critico)'
  }

  const hColor = healthColor(cliente.healthScore)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-1)',
        padding: '0 40px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
          }}>
            A
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Agency Intelligence</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 4 }}>· Portal de cliente</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{cliente.empresa}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Plan {cliente.plan}</div>
          </div>
          <form action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}>
            <button type="submit" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: 12,
            }}>
              <LogOut style={{ width: 13, height: 13 }} />
              Salir
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 40px' }}>

        {/* Empresa header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.02em' }}>
            {cliente.empresa}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            Resumen de tu sistema de automatización
          </p>
        </div>

        {/* Alerta crítica banner */}
        {alertasCriticas.length > 0 && (
          <div style={{
            borderRadius: 12, padding: '14px 20px', marginBottom: 24,
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <AlertTriangle style={{ width: 16, height: 16, color: 'var(--critical)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--critical)' }}>
                {alertasCriticas.length} alerta{alertasCriticas.length > 1 ? 's' : ''} crítica{alertasCriticas.length > 1 ? 's' : ''} — requiere atención
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                {alertasCriticas[0].titulo}
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            {
              label: 'Health score',
              value: `${cliente.healthScore}`,
              sub: 'de 100',
              color: hColor,
              glow: `${hColor}20`,
            },
            {
              label: 'Workflows activos',
              value: `${workflowsActivos}`,
              sub: `${cliente.workflows.length} total`,
              color: 'var(--status-estable)',
              glow: 'rgba(34,197,94,0.12)',
            },
            {
              label: 'Uptime promedio',
              value: `${uptimeProm}%`,
              sub: 'últimos 30 días',
              color: 'var(--accent)',
              glow: 'rgba(75,123,245,0.12)',
            },
            {
              label: 'Ejecuciones hoy',
              value: `${cliente.workflows.reduce((a, w) => a + w.ejecucionesHoy, 0)}`,
              sub: 'automatizaciones',
              color: 'var(--text-1)',
              glow: 'transparent',
            },
          ].map((k, i) => (
            <div key={i} style={{
              borderRadius: 12, padding: '18px 20px',
              background: 'var(--surface-1)', border: '1px solid var(--border)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: k.color, boxShadow: `0 0 10px ${k.glow}`,
              }} />
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', fontWeight: 600, marginBottom: 12 }}>
                {k.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'monospace', color: k.color, lineHeight: 1 }}>
                {k.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Workflows */}
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 24 }}>
          <div style={{
            padding: '12px 20px', background: 'var(--surface-1)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Zap style={{ width: 14, height: 14, color: 'var(--accent)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Tus automatizaciones</span>
            {workflowsError > 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: 11, color: 'var(--critical)',
                background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '2px 8px',
              }}>
                {workflowsError} con error
              </span>
            )}
          </div>
          {cliente.workflows.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
              No hay workflows configurados aún
            </div>
          ) : (
            cliente.workflows.map(w => {
              const dotColor = w.estado === 'activo' ? 'var(--status-estable)' : w.estado === 'error' ? 'var(--critical)' : '#444'
              return (
                <div key={w.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', borderBottom: '1px solid var(--border)',
                  background: 'var(--surface-1)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: dotColor,
                      boxShadow: w.estado === 'activo' ? '0 0 6px rgba(34,197,94,0.6)' : w.estado === 'error' ? '0 0 6px rgba(239,68,68,0.6)' : 'none',
                    }} />
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{w.nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Última ejecución: {w.ultimaEjecucion}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-2)' }}>{w.uptime}% uptime</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{w.ejecucionesHoy} hoy</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Alertas */}
        {(alertasCriticas.length > 0 || alertasWarning.length > 0) && (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 24 }}>
            <div style={{
              padding: '12px 20px', background: 'var(--surface-1)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Activity style={{ width: 14, height: 14, color: 'var(--warning)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Alertas activas</span>
            </div>
            {[...alertasCriticas, ...alertasWarning].map(a => (
              <div key={a.id} style={{
                padding: '12px 20px', borderBottom: '1px solid var(--border)',
                background: 'var(--surface-1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 4,
                    background: a.tipo === 'critico' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                    color: a.tipo === 'critico' ? 'var(--critical)' : 'var(--warning)',
                    border: `1px solid ${a.tipo === 'critico' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
                    flexShrink: 0, marginTop: 1,
                  }}>
                    {a.tipo === 'critico' ? 'Crítica' : 'Atención'}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{a.titulo}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.descripcion}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Todo bien */}
        {alertasCriticas.length === 0 && alertasWarning.length === 0 && (
          <div style={{
            borderRadius: 12, padding: '20px 24px',
            background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <CheckCircle2 style={{ width: 18, height: 18, color: 'var(--status-estable)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--status-estable)' }}>Todo funcionando correctamente</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Sin alertas activas en tu sistema</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
