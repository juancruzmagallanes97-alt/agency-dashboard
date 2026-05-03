import Link from 'next/link'
import { getClientes } from '@/lib/services/clients'
import { getAlertasCriticas, getAlertasActivas } from '@/lib/services/alerts'
import { getClientesEnRiesgo } from '@/lib/services/health'
import { getOportunidadesUpsell } from '@/lib/services/metrics'
import { getEstadoLabel, getHealthColor, getHealthEmoji, getAlertaColor, getAlertaLabel } from '@/lib/data'

const AVATAR_COLORS = [
  { from: '#4B7BF5', to: '#2550C0' },
  { from: '#00E87A', to: '#00A855' },
  { from: '#FF6B35', to: '#C2410C' },
  { from: '#A855F7', to: '#7C3AED' },
  { from: '#FFB800', to: '#D97706' },
]

const STATUS_RING: Record<string, string> = {
  estable:  'var(--status-estable)',
  atencion: 'var(--status-atencion)',
  riesgo:   'var(--status-riesgo)',
  critico:  'var(--status-critico)',
}

const STATUS_GLOW: Record<string, string> = {
  estable:  'rgba(0,232,122,0.30)',
  atencion: 'rgba(255,184,0,0.30)',
  riesgo:   'rgba(255,107,53,0.30)',
  critico:  'rgba(255,51,102,0.30)',
}

export default async function Dashboard() {
  const [clientes, alertasCriticas, todasAlertas, clientesEnRiesgo, oportunidades] = await Promise.all([
    getClientes(),
    getAlertasCriticas(),
    getAlertasActivas(),
    getClientesEnRiesgo(),
    getOportunidadesUpsell(),
  ])

  const totalHoras = clientes.reduce((acc, c) => acc + c.metricas.horasAhorradas, 0)
  const totalConversaciones = clientes.reduce((acc, c) => acc + c.metricas.conversaciones, 0)

  const ahora = new Date()
  const hora = ahora.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const kpis = [
    {
      label:      'Clientes activos',
      value:      clientes.length,
      sub:        'monitoreados',
      accent:     'var(--status-estable)',
      glow:       'rgba(0,232,122,0.15)',
      numColor:   'var(--status-estable)',
    },
    {
      label:      'Alertas críticas',
      value:      alertasCriticas.length,
      sub:        `${todasAlertas.length} en total`,
      accent:     alertasCriticas.length > 0 ? 'var(--status-critico)' : 'var(--border-2)',
      glow:       alertasCriticas.length > 0 ? 'rgba(255,51,102,0.12)' : 'transparent',
      numColor:   alertasCriticas.length > 0 ? 'var(--status-critico)' : 'var(--text-1)',
    },
    {
      label:      'Conversaciones',
      value:      totalConversaciones,
      sub:        'este mes',
      accent:     'var(--accent)',
      glow:       'rgba(75,123,245,0.12)',
      numColor:   'var(--accent)',
    },
    {
      label:      'Horas ahorradas',
      value:      `${totalHoras}h`,
      sub:        'este mes',
      accent:     'var(--accent-2)',
      glow:       'rgba(0,212,255,0.10)',
      numColor:   'var(--accent-2)',
    },
  ]

  return (
    <div className="fade-in-up">

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 40 }}>
        <p style={{
          fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase',
          letterSpacing: '0.14em', marginBottom: 10, fontWeight: 500,
        }}>
          {ahora.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 10 }}>
          <span style={{ color: 'var(--text-1)' }}>{saludo}, </span>
          <span style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Juan Cruz
          </span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="status-dot-live" />
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {todasAlertas.length > 0
              ? `${todasAlertas.length} alerta${todasAlertas.length !== 1 ? 's' : ''} activa${todasAlertas.length !== 1 ? 's' : ''} para revisar`
              : 'Todo funcionando sin alertas activas'}
          </p>
        </div>
      </div>

      {/* ── AVATARES DE CLIENTES ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Clientes activos
          </span>
          <Link href="/clientes" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
            Ver tabla →
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {clientes.map((c, i) => {
            const ringColor = STATUS_RING[c.estado] ?? '#555'
            const glowColor = STATUS_GLOW[c.estado] ?? 'transparent'
            const grad = AVATAR_COLORS[i % AVATAR_COLORS.length]
            const hc = getHealthColor(c.healthScore)
            return (
              <Link
                key={c.id}
                href={`/clientes/${c.id}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: `linear-gradient(145deg, ${grad.from}, ${grad.to})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800, color: '#fff',
                    border: `2px solid ${ringColor}`,
                    boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 20px ${glowColor}`,
                    transition: 'box-shadow 200ms ease',
                  }}>
                    {c.empresa[0]}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 12, height: 12, borderRadius: '50%',
                    background: ringColor,
                    border: '2px solid var(--bg)',
                    boxShadow: `0 0 6px ${glowColor}`,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', textAlign: 'center', maxWidth: 68, lineHeight: 1.3 }}>
                  {c.empresa}
                </div>
                <div className={`text-[10px] font-mono font-bold ${hc.text}`}>
                  {getHealthEmoji(c.healthScore)} {c.healthScore}
                </div>
              </Link>
            )
          })}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '1.5px dashed var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: 'var(--text-3)',
            }}>
              +
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', maxWidth: 68 }}>Agregar</div>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="card-glow"
            style={{
              position: 'relative',
              borderRadius: 14,
              padding: '22px 24px 20px',
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            {/* Barra de acento arriba */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: kpi.accent,
              boxShadow: `0 0 12px ${kpi.glow}`,
            }} />

            {/* Glow de fondo detrás del número */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
              background: `radial-gradient(ellipse at 30% 0%, ${kpi.glow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative' }}>
              <div style={{
                fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase',
                letterSpacing: '0.12em', marginBottom: 18, fontWeight: 600,
              }}>
                {kpi.label}
              </div>
              <div style={{
                fontSize: 52, fontWeight: 800, color: kpi.numColor,
                lineHeight: 1, letterSpacing: '-0.04em',
                textShadow: `0 0 30px ${kpi.glow}`,
              }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12 }}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ATENCIÓN + ALERTAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Clientes que necesitan atención */}
        <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Necesitan atención</span>
              {clientesEnRiesgo.length > 0 && (
                <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 6, background: 'var(--critical-bg)', color: 'var(--critical)', border: '1px solid var(--critical-border)', fontFamily: 'monospace' }}>
                  {clientesEnRiesgo.length}
                </span>
              )}
            </div>
            <Link href="/clientes" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Ver todos →</Link>
          </div>

          {clientesEnRiesgo.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8, color: 'var(--status-estable)', filter: 'drop-shadow(0 0 8px rgba(0,232,122,0.5))' }}>◆</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Todos los clientes estables</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin acción requerida</div>
            </div>
          ) : (
            clientesEnRiesgo.map((c, i) => {
              const hc = getHealthColor(c.healthScore)
              const grad = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <Link
                  key={c.id}
                  href={`/clientes/${c.id}`}
                  className="hover-row"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                      border: `2px solid ${STATUS_RING[c.estado]}`,
                    }}>
                      {c.empresa[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{c.empresa}</div>
                      <div style={{ fontSize: 11, marginTop: 2, color: 'var(--text-3)' }}>{getEstadoLabel(c.estado)}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold font-mono ${hc.text}`}>
                    {getHealthEmoji(c.healthScore)} {c.healthScore}
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Alertas activas */}
        <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Alertas activas</span>
              {todasAlertas.length > 0 && (
                <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border-2)', fontFamily: 'monospace' }}>
                  {todasAlertas.length}
                </span>
              )}
            </div>
            <Link href="/alertas" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Ver todas →</Link>
          </div>

          {todasAlertas.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8, color: 'var(--status-estable)', filter: 'drop-shadow(0 0 8px rgba(0,232,122,0.5))' }}>◆</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Sin alertas activas</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Todo funcionando bien</div>
            </div>
          ) : (
            todasAlertas.slice(0, 5).map(a => {
              const ac = getAlertaColor(a.tipo)
              return (
                <div
                  key={a.id}
                  className="hover-row"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titulo}</div>
                    <div style={{ fontSize: 11, marginTop: 2, color: 'var(--text-3)' }}>{a.clienteNombre} · {a.fecha}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium shrink-0 ${ac.badge}`}>
                    {getAlertaLabel(a.tipo)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── ESTADO AGENCIA + OPORTUNIDADES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Estado de la agencia */}
        <div style={{ borderRadius: 14, padding: '20px 24px', background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 24 }}>Estado de la agencia</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {(['estable', 'atencion', 'riesgo', 'critico'] as const).map(estado => {
              const count = clientes.filter(c => c.estado === estado).length
              const pct = clientes.length > 0 ? Math.round((count / clientes.length) * 100) : 0
              const ring = STATUS_RING[estado]
              const labels = { estable: 'Estable', atencion: 'Atención', riesgo: 'En riesgo', critico: 'Crítico' }
              return (
                <div key={estado}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: ring, flexShrink: 0, boxShadow: `0 0 6px ${ring}` }} />
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{labels[estado]}</span>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-3)' }}>{count}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: 'var(--border-2)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct || 0}%`,
                      background: `linear-gradient(90deg, ${ring}, ${ring}88)`,
                      borderRadius: 999,
                      transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)',
                      boxShadow: `0 0 8px ${ring}66`,
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Oportunidades */}
        <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Oportunidades detectadas</span>
          </div>
          {oportunidades.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin oportunidades activas</div>
            </div>
          ) : (
            oportunidades.map(o => (
              <Link
                key={o.id}
                href={`/clientes/${o.cliente.id}`}
                className="hover-row"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-estable)', flexShrink: 0, boxShadow: '0 0 6px var(--status-estable)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{o.titulo}</div>
                  <div style={{ fontSize: 11, marginTop: 2, color: 'var(--text-3)' }}>{o.cliente.empresa}</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'var(--opportunity-bg)', color: 'var(--opportunity)', border: '1px solid var(--opportunity-border)', fontWeight: 600 }}>
                  Oportunidad
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
