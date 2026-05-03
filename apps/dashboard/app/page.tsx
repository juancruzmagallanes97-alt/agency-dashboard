import Link from 'next/link'
import { getClientes } from '@/lib/services/clients'
import { getAlertasCriticas, getAlertasActivas } from '@/lib/services/alerts'
import { getClientesEnRiesgo } from '@/lib/services/health'
import { getOportunidadesUpsell } from '@/lib/services/metrics'
import { getEstadoLabel, getHealthColor, getHealthEmoji, getAlertaColor, getAlertaLabel } from '@/lib/data'

const AVATAR_COLORS = [
  { from: '#2383E2', to: '#1256b8' },
  { from: '#34D399', to: '#059669' },
  { from: '#F97316', to: '#C2410C' },
  { from: '#A855F7', to: '#7C3AED' },
  { from: '#F59E0B', to: '#D97706' },
]

const STATUS_RING: Record<string, string> = {
  estable:  'var(--status-estable)',
  atencion: 'var(--status-atencion)',
  riesgo:   'var(--status-riesgo)',
  critico:  'var(--status-critico)',
}

const STATUS_GLOW: Record<string, string> = {
  estable:  'rgba(34,197,94,0.25)',
  atencion: 'rgba(234,179,8,0.25)',
  riesgo:   'rgba(249,115,22,0.25)',
  critico:  'rgba(239,68,68,0.25)',
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
      label: 'Clientes activos',
      value: clientes.length,
      sub: 'monitoreados',
      accent: 'var(--status-estable)',
      valueColor: 'var(--text-1)',
    },
    {
      label: 'Alertas críticas',
      value: alertasCriticas.length,
      sub: `${todasAlertas.length} en total`,
      accent: alertasCriticas.length > 0 ? 'var(--status-critico)' : 'var(--border-2)',
      valueColor: alertasCriticas.length > 0 ? 'var(--status-critico)' : 'var(--text-1)',
    },
    {
      label: 'Conversaciones',
      value: totalConversaciones,
      sub: 'este mes',
      accent: 'var(--accent)',
      valueColor: 'var(--text-1)',
    },
    {
      label: 'Horas ahorradas',
      value: `${totalHoras}h`,
      sub: 'este mes',
      accent: 'var(--status-atencion)',
      valueColor: 'var(--text-1)',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, fontWeight: 500 }}>
            {ahora.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 10 }}>
            {saludo}, Juan Cruz
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {todasAlertas.length > 0
              ? `Tenés ${todasAlertas.length} alerta${todasAlertas.length !== 1 ? 's' : ''} activa${todasAlertas.length !== 1 ? 's' : ''} para revisar`
              : 'Todo funcionando sin alertas activas'}
          </p>
        </div>
        <Link
          href="/clientes"
          className="text-xs px-4 py-2 rounded-lg border"
          style={{ color: 'var(--text-2)', borderColor: 'var(--border-2)', background: 'var(--surface-2)', fontWeight: 500, marginTop: 4 }}
        >
          Ver todos →
        </Link>
      </div>

      {/* Fila de avatares de clientes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Clientes activos
          </span>
          <Link href="/clientes" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
            Ver tabla →
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
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
                {/* Avatar con ring de estado */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: `linear-gradient(145deg, ${grad.from}, ${grad.to})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800, color: '#fff',
                    border: `2.5px solid ${ringColor}`,
                    boxShadow: `0 0 0 1px rgba(0,0,0,0.8), 0 0 16px ${glowColor}`,
                  }}>
                    {c.empresa[0]}
                  </div>
                  {/* Dot de estado en esquina */}
                  <div style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 11, height: 11, borderRadius: '50%',
                    background: ringColor,
                    border: '2px solid var(--bg)',
                  }} />
                </div>
                {/* Nombre */}
                <div style={{ fontSize: 11, color: 'var(--text-2)', textAlign: 'center', maxWidth: 68, lineHeight: 1.3 }}>
                  {c.empresa}
                </div>
                {/* Health score */}
                <div className={`text-[10px] font-mono font-bold ${hc.text}`}>
                  {getHealthEmoji(c.healthScore)} {c.healthScore}
                </div>
              </Link>
            )
          })}

          {/* Placeholder — añadir cliente */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '2px dashed var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'var(--text-3)',
            }}>
              +
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', maxWidth: 68 }}>
              Agregar
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="rounded-xl p-6"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderTop: `2px solid ${kpi.accent}`,
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20, fontWeight: 500 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: kpi.valueColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 14 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Clientes que necesitan atención */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Necesitan atención</span>
              {clientesEnRiesgo.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md font-mono" style={{ background: 'var(--surface-2)', color: 'var(--status-critico)', border: '1px solid var(--border-2)' }}>
                  {clientesEnRiesgo.length}
                </span>
              )}
            </div>
            <Link href="/clientes" className="text-[11px]" style={{ color: 'var(--accent)' }}>Ver todos →</Link>
          </div>
          {clientesEnRiesgo.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div style={{ fontSize: 28, marginBottom: 8, color: 'var(--status-estable)' }}>◆</div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Todos los clientes estables</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Sin acción requerida</div>
            </div>
          ) : (
            clientesEnRiesgo.map((c, i) => {
              const hc = getHealthColor(c.healthScore)
              const grad = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <Link
                  key={c.id}
                  href={`/clientes/${c.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors"
                  style={{ borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
                >
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                      border: `2px solid ${STATUS_RING[c.estado]}`,
                    }}>
                      {c.empresa[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{c.empresa}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{getEstadoLabel(c.estado)}</div>
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
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Alertas activas</span>
              {todasAlertas.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md font-mono" style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border-2)' }}>
                  {todasAlertas.length}
                </span>
              )}
            </div>
            <Link href="/alertas" className="text-[11px]" style={{ color: 'var(--accent)' }}>Ver todas →</Link>
          </div>
          {todasAlertas.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div style={{ fontSize: 28, marginBottom: 8, color: 'var(--status-estable)' }}>◆</div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Sin alertas activas</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Todo funcionando bien</div>
            </div>
          ) : (
            todasAlertas.slice(0, 5).map(a => {
              const ac = getAlertaColor(a.tipo)
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-5 py-4"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--text-1)' }}>{a.titulo}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{a.clienteNombre} · {a.fecha}</div>
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

      {/* Estado de la agencia + Oportunidades */}
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-semibold mb-6" style={{ color: 'var(--text-1)' }}>Estado de la agencia</div>
          <div className="space-y-5">
            {(['estable', 'atencion', 'riesgo', 'critico'] as const).map(estado => {
              const count = clientes.filter(c => c.estado === estado).length
              const pct = clientes.length > 0 ? Math.round((count / clientes.length) * 100) : 0
              const ring = STATUS_RING[estado]
              const labels = { estable: 'Estable', atencion: 'Atención', riesgo: 'En riesgo', critico: 'Crítico' }
              return (
                <div key={estado}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: ring, flexShrink: 0 }} />
                      <span className="text-xs" style={{ color: 'var(--text-2)' }}>{labels[estado]}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--border-2)' }}>
                    <div style={{ height: '100%', width: `${pct || 0}%`, background: ring, borderRadius: 999, transition: 'width 400ms ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Oportunidades detectadas</span>
          </div>
          {oportunidades.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="text-sm" style={{ color: 'var(--text-3)' }}>Sin oportunidades activas</div>
            </div>
          ) : (
            oportunidades.map(o => (
              <Link
                key={o.id}
                href={`/clientes/${o.cliente.id}`}
                className="flex items-center gap-3 px-5 py-4 transition-colors"
                style={{ borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-estable)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm" style={{ color: 'var(--text-1)' }}>{o.titulo}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{o.cliente.empresa}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md border font-medium shrink-0" style={{ background: 'rgba(34,197,94,0.08)', color: 'var(--status-estable)', borderColor: 'rgba(34,197,94,0.2)' }}>
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
