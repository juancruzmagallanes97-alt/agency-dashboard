import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCliente } from '@/lib/services/clients'
import { getTareas } from '@/lib/services/tasks'
import {
  canalLabel, canalIcon, getAlertaColor, getAlertaLabel,
  getEstadoLabel, getHealthColor, getHealthEmoji,
  getNichoLabel, getPlanColor, getPlanLabel,
  getWorkflowTipoColor, getWorkflowTipoLabel,
} from '@/lib/data'
import TareasCliente from '@/components/TareasCliente'

const AVATAR_COLORS = [
  { from: '#4B7BF5', to: '#2550C0' },
  { from: '#00E87A', to: '#00A855' },
  { from: '#FF6B35', to: '#C2410C' },
  { from: '#A855F7', to: '#7C3AED' },
  { from: '#FFB800', to: '#D97706' },
]

const STATUS_COLOR: Record<string, string> = {
  estable:  'var(--status-estable)',
  atencion: 'var(--status-atencion)',
  riesgo:   'var(--status-riesgo)',
  critico:  'var(--status-critico)',
}

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [c, defaultTareas] = await Promise.all([
    getCliente(id),
    getTareas(id),
  ])
  if (!c) notFound()

  const hc = getHealthColor(c.healthScore)
  const alertasActivas = c.alertas.filter(a => !a.resuelta)
  const alertasCriticas = alertasActivas.filter(a => a.tipo === 'critico')
  const workflowsError = c.workflows.filter(w => w.estado === 'error')
  const todosCanales = ['whatsapp', 'instagram', 'webchat', 'facebook'] as const
  const maxConv = Math.max(...c.canales.map(ch => c.metricas.conversionPorCanal[ch]))

  const wfPrincipal = c.workflows.find(w => w.tipo === 'principal')
  const wfTools = c.workflows.filter(w => w.tipo === 'tool')
  const wfOtros = c.workflows.filter(w => w.tipo === 'sub' || w.tipo === 'sync' || w.tipo === 'scheduled')

  const analytics = c.analyticsConsultas ?? null
  const maxConsultasHora = analytics ? Math.max(...analytics.horario.map(h => h.cantidad)) : 0
  const horaPico = analytics ? analytics.horario.reduce((a, b) => b.cantidad > a.cantidad ? b : a) : null
  const maxVecesPreguntas = analytics?.topPreguntas[0]?.veces ?? 1

  const statusColor = STATUS_COLOR[c.estado] ?? '#555'
  const grad = AVATAR_COLORS[0]
  const healthGlow = c.healthScore >= 75 ? 'rgba(34,197,94,0.20)' : c.healthScore >= 55 ? 'rgba(234,179,8,0.20)' : 'rgba(239,68,68,0.20)'

  const kpis = [
    {
      label: 'Health Score',
      value: `${c.healthScore}`,
      sub: getHealthEmoji(c.healthScore) + ' ' + (c.healthScore >= 75 ? 'Excelente' : c.healthScore >= 55 ? 'Estable' : 'En riesgo'),
      accent: statusColor,
      glow: healthGlow,
      numColor: hc.text,
    },
    {
      label: 'Conversaciones',
      value: String(c.metricas.conversaciones),
      sub: 'este mes',
      accent: 'var(--accent)',
      glow: 'rgba(75,123,245,0.12)',
      numColor: 'var(--text-1)',
    },
    {
      label: 'Leads seguidos',
      value: String(c.metricas.leadsFollowUp),
      sub: 'automatizados',
      accent: 'var(--status-estable)',
      glow: 'rgba(34,197,94,0.10)',
      numColor: 'var(--text-1)',
    },
    {
      label: 'Tiempo resp.',
      value: `${c.metricas.tiempoRespuestaSegundos}s`,
      sub: c.metricas.tiempoRespuestaSegundos <= 15 ? 'óptimo' : 'alto',
      accent: c.metricas.tiempoRespuestaSegundos > 15 ? 'var(--status-atencion)' : 'var(--border-2)',
      glow: c.metricas.tiempoRespuestaSegundos > 15 ? 'rgba(234,179,8,0.10)' : 'transparent',
      numColor: c.metricas.tiempoRespuestaSegundos > 15 ? 'var(--status-atencion)' : 'var(--text-1)',
    },
    {
      label: 'Horas ahorradas',
      value: `${c.metricas.horasAhorradas}h`,
      sub: 'este mes',
      accent: 'var(--accent-2)',
      glow: 'rgba(0,212,255,0.08)',
      numColor: 'var(--text-1)',
    },
  ]

  return (
    <div className="fade-in-up">

      {/* ── BREADCRUMB ── */}
      <Link href="/clientes" style={{ fontSize: 11, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        ‹ Todos los clientes
      </Link>

      {/* ── HEADER ── */}
      <div style={{
        borderRadius: 16,
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        padding: '28px 32px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Barra de status arriba */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: statusColor,
          boxShadow: `0 0 20px ${statusColor}66`,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(145deg, ${grad.from}, ${grad.to})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800, color: '#fff',
              border: `2.5px solid ${statusColor}`,
              boxShadow: `0 0 0 1px rgba(0,0,0,0.8), 0 0 24px ${statusColor}44`,
            }}>
              {c.empresa[0]}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{c.empresa}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: `${statusColor}15`, border: `1px solid ${statusColor}40` }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block', boxShadow: `0 0 6px ${statusColor}` }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>{getEstadoLabel(c.estado)}</span>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${getPlanColor(c.plan)}`}>
                  {getPlanLabel(c.plan)}
                </span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>
                  {getNichoLabel(c.nicho)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 20, fontSize: 11, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                {c.sucursales && <span>📍 {c.sucursales.join(' · ')}</span>}
                <span>📅 Cliente desde {new Date(c.fechaInicio).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}</span>
                <span>✉️ {c.email}</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <a
              href={c.n8nBase} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: 12, padding: '8px 16px', borderRadius: 8, fontWeight: 600,
                background: 'var(--accent)', color: '#fff', textDecoration: 'none',
                boxShadow: '0 0 16px rgba(75,123,245,0.30)',
              }}
            >
              Abrir n8n →
            </a>
            <a
              href={c.ghlUrl} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: 12, padding: '8px 16px', borderRadius: 8, fontWeight: 600,
                background: 'var(--surface-2)', color: 'var(--text-1)',
                border: '1px solid var(--border-2)', textDecoration: 'none',
              }}
            >
              Abrir GHL →
            </a>
          </div>
        </div>
      </div>

      {/* ── ALERTA CRÍTICA ── */}
      {alertasCriticas.length > 0 && (
        <div style={{ borderRadius: 12, padding: '14px 20px', marginBottom: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--critical)', marginBottom: 6 }}>
            🔴 {alertasCriticas.length} alerta{alertasCriticas.length > 1 ? 's' : ''} crítica{alertasCriticas.length > 1 ? 's' : ''} — acción inmediata requerida
          </div>
          {alertasCriticas.map(a => (
            <div key={a.id} style={{ fontSize: 12, color: 'rgba(239,68,68,0.8)', marginTop: 4 }}>
              · {a.titulo}
              {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: 'var(--critical)', textDecoration: 'underline' }}>Ver en n8n →</a>}
            </div>
          ))}
        </div>
      )}

      {/* ── MÉTRICAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {kpis.map((kpi, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              borderRadius: 14,
              padding: '18px 20px 16px',
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: kpi.accent,
              boxShadow: `0 0 10px ${kpi.glow}`,
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              background: `radial-gradient(ellipse at 30% 0%, ${kpi.glow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14, fontWeight: 600 }}>
                {kpi.label}
              </div>
              <div className={`text-3xl font-bold font-mono leading-none ${kpi.numColor.startsWith('var') ? '' : kpi.numColor}`} style={kpi.numColor.startsWith('var') ? { color: kpi.numColor, textShadow: `0 0 20px ${kpi.glow}` } : { textShadow: `0 0 20px ${kpi.glow}` }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ANALYTICS ── */}
      {analytics && horaPico && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Consultas por hora</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>últimos 30 días</span>
            </div>
            <div style={{ padding: '20px 20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
                {analytics.horario.map(({ hora, cantidad }) => {
                  const heightPct = maxConsultasHora > 0 ? (cantidad / maxConsultasHora) * 100 : 0
                  const isPeak = hora === horaPico.hora
                  const isHigh = cantidad > maxConsultasHora * 0.65
                  return (
                    <div key={hora} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                      <div
                        title={`${hora}:00 — ${cantidad} consultas`}
                        style={{
                          width: '100%',
                          height: `${Math.max(heightPct, cantidad > 0 ? 5 : 2)}%`,
                          background: isPeak ? 'var(--accent)' : isHigh ? 'rgba(75,123,245,0.4)' : 'var(--surface-3)',
                          borderRadius: '3px 3px 0 0',
                          boxShadow: isPeak ? '0 0 8px rgba(75,123,245,0.5)' : 'none',
                          transition: 'height 300ms ease',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 9, color: 'var(--text-3)' }}>
                <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', flexShrink: 0 }} />
                Pico: {horaPico.hora}:00hs · {horaPico.cantidad} consultas
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Consultas más frecuentes</span>
              {c.bot && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>bot {c.bot}</span>}
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {analytics.topPreguntas.slice(0, 5).map((p, i) => {
                const pct = Math.round((p.veces / maxVecesPreguntas) * 100)
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-3)', minWidth: 14, fontFamily: 'monospace', flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.4 }}>{p.pregunta}</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.veces.toLocaleString('es-AR')}</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--border-2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? 'var(--accent)' : `rgba(75,123,245,${Math.max(0.15, 0.4 - i * 0.06)})`, borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── FLUJO DEL SISTEMA ── */}
      <div style={{ borderRadius: 14, marginBottom: 20, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Flujo del sistema</span>
            <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--text-3)' }}>de punta a punta · ~8–12 segundos</span>
          </div>
          <a href={wfPrincipal?.n8nUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
            Ver WF-00 en n8n →
          </a>
        </div>
        <div style={{ padding: '20px 20px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: 700 }}>
            {[
              { step: '01', label: 'Lead escribe',     sub: 'WhatsApp · Instagram',                          icon: '📱', color: 'var(--text-2)',    border: 'var(--border-2)' },
              { step: '02', label: 'GHL recibe',        sub: 'Webhook → n8n',                                 icon: '🔗', color: 'var(--text-2)',    border: 'var(--border-2)' },
              { step: '03', label: 'Main Dispatcher',   sub: 'Revisa historial · detecta sucursal',           icon: '⚙️', color: 'var(--accent)',     border: 'var(--accent)',   tag: 'WF-00' },
              { step: '04', label: 'Debounce Redis',    sub: 'Espera 5s · junta mensajes',                    icon: '⏳', color: 'var(--text-2)',    border: 'var(--border-2)', tag: '5 seg' },
              { step: '05', label: 'Bot responde',      sub: 'Gemini 1.5 Flash · contexto de sucursal',       icon: '🤖', color: 'var(--opportunity)', border: 'var(--opportunity)', tag: 'Gemini' },
              { step: '06', label: 'GHL envía',         sub: 'Mensaje al lead',                               icon: '✅', color: 'var(--text-2)',    border: 'var(--border-2)' },
            ].map((s, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
                  <div style={{ borderRadius: 10, padding: '12px', width: '100%', background: 'var(--surface-2)', border: `1px solid ${s.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      {s.tag && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 700, color: s.color, background: 'rgba(255,255,255,0.05)' }}>{s.tag}</span>}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.color, lineHeight: 1.3 }}>{s.label}</div>
                    <div style={{ fontSize: 10, marginTop: 4, color: 'var(--text-3)', lineHeight: 1.4 }}>{s.sub}</div>
                  </div>
                  <div style={{ fontSize: 10, marginTop: 6, fontFamily: 'monospace', color: 'var(--text-3)' }}>{s.step}</div>
                </div>
                {i < arr.length - 1 && <div style={{ display: 'flex', alignItems: 'center', paddingTop: 16, paddingInline: 6, color: 'var(--text-3)', fontSize: 14 }}>→</div>}
              </div>
            ))}
          </div>
        </div>
        {wfTools.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 10 }}>Tools disponibles para el bot</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {wfTools.map(wf => (
                <a key={wf.id} href={wf.n8nUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8,
                  fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border-2)',
                  color: 'var(--text-2)', textDecoration: 'none',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-estable)', boxShadow: '0 0 5px var(--status-estable)' }} />
                  {wf.nombre}
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── WORKFLOWS + ALERTAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Workflows</span>
            <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
              <span style={{ color: 'var(--status-estable)' }}>{c.workflows.filter(w => w.estado === 'activo').length} activos</span>
              {workflowsError.length > 0 && <span style={{ color: 'var(--critical)' }}>{workflowsError.length} error</span>}
            </div>
          </div>
          {wfPrincipal && (
            <div>
              <div style={{ padding: '6px 20px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>Principal</div>
              <WfRow wf={wfPrincipal} />
            </div>
          )}
          {wfTools.length > 0 && (
            <div>
              <div style={{ padding: '6px 20px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>Tools</div>
              {wfTools.map(wf => <WfRow key={wf.id} wf={wf} />)}
            </div>
          )}
          {wfOtros.length > 0 && (
            <div>
              <div style={{ padding: '6px 20px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>Background</div>
              {wfOtros.map(wf => <WfRow key={wf.id} wf={wf} />)}
            </div>
          )}
        </div>

        <div style={{ borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Alertas</span>
            {alertasActivas.length > 0
              ? <span style={{ fontSize: 12, color: 'var(--critical)' }}>{alertasActivas.length} activa{alertasActivas.length > 1 ? 's' : ''}</span>
              : <span style={{ fontSize: 12, color: 'var(--status-estable)' }}>✓ Todo en orden</span>}
          </div>
          {alertasActivas.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8, filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.5))' }}>✅</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Sin alertas activas</div>
            </div>
          ) : (
            alertasActivas
              .sort((a, b) => ({ critico: 0, warning: 1, oportunidad: 2 }[a.tipo] - { critico: 0, warning: 1, oportunidad: 2 }[b.tipo]))
              .map(a => {
                const ac = getAlertaColor(a.tipo)
                return (
                  <div key={a.id} className="hover-row" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}`} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{a.titulo}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${ac.badge}`}>{getAlertaLabel(a.tipo)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', paddingLeft: 16 }}>{a.descripcion}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, paddingLeft: 16, fontSize: 11, color: 'var(--text-3)' }}>
                      <span>{a.fecha}</span>
                      {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Ver en n8n →</a>}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>

      {/* ── TAREAS ── */}
      <div style={{ marginBottom: 20 }}>
        <TareasCliente clienteId={c.id} defaultTareas={defaultTareas} />
      </div>

      {/* ── CANALES + RECOMENDACIONES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Canales de conversación</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {todosCanales.map(canal => {
              const activo = c.canales.includes(canal)
              const conv = c.metricas.conversionPorCanal[canal]
              const pct = maxConv > 0 && activo ? Math.round((conv / maxConv) * 100) : 0
              const esMejor = activo && conv === maxConv && maxConv > 0
              return (
                <div key={canal} style={{ opacity: activo ? 1 : 0.4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{canalIcon[canal]}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{canalLabel[canal]}</span>
                      {esMejor && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, color: 'var(--status-estable)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>Mejor canal</span>}
                      {!activo && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-3)' }}>No activo</span>}
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-2)' }}>{activo ? `${conv}%` : '—'}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: 'var(--border-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: esMejor ? 'var(--status-estable)' : 'var(--accent)', boxShadow: esMejor ? '0 0 6px rgba(34,197,94,0.4)' : 'none' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Recomendaciones</span>
          </div>
          {c.recomendaciones.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Sin recomendaciones activas</div>
          ) : (
            c.recomendaciones
              .sort((a, b) => ({ alto: 0, medio: 1, bajo: 2 }[a.impacto] - { alto: 0, medio: 1, bajo: 2 }[b.impacto]))
              .map(r => {
                const tipoColors: Record<string, string> = {
                  operacional: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                  crecimiento: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
                  upsell:      'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                }
                const tipoLabels: Record<string, string> = { operacional: 'Operacional', crecimiento: 'Crecimiento', upsell: 'Upsell' }
                const impactoColor: Record<string, string> = { alto: 'var(--status-riesgo)', medio: 'var(--status-atencion)', bajo: 'var(--text-3)' }
                return (
                  <div key={r.id} className="hover-row" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{r.titulo}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${tipoColors[r.tipo]}`}>{tipoLabels[r.tipo]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.descripcion}</div>
                    <div style={{ fontSize: 11, marginTop: 8, fontWeight: 600, color: impactoColor[r.impacto] }}>Impacto {r.impacto}</div>
                  </div>
                )
              })
          )}
        </div>
      </div>

    </div>
  )
}

function WfRow({ wf }: { wf: import('@/lib/data').Workflow }) {
  const dotColor = wf.estado === 'activo' ? 'var(--status-estable)' : wf.estado === 'error' ? 'var(--critical)' : 'var(--surface-3)'
  const dotGlow  = wf.estado === 'activo' ? 'rgba(34,197,94,0.5)'  : wf.estado === 'error' ? 'rgba(239,68,68,0.5)' : 'transparent'
  return (
    <a
      href={wf.n8nUrl} target="_blank" rel="noopener noreferrer"
      className="hover-row"
      style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
    >
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotGlow}`, flexShrink: 0, marginRight: 12 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: wf.estado === 'error' ? 'var(--critical)' : 'var(--text-1)' }}>{wf.nombre}</div>
        <div style={{ fontSize: 10, marginTop: 2, fontFamily: 'monospace', color: 'var(--text-3)' }}>{wf.id} · {wf.ultimaEjecucion}</div>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded border mr-4 ${getWorkflowTipoColor(wf.tipo)}`}>{getWorkflowTipoLabel(wf.tipo)}</span>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-2)' }}>{wf.ejecucionesHoy} hoy</div>
        <div style={{ fontSize: 10, marginTop: 2, color: wf.erroresHoy > 0 ? 'var(--critical)' : 'var(--text-3)' }}>
          {wf.erroresHoy > 0 ? `${wf.erroresHoy} errores` : `${wf.uptime}% uptime`}
        </div>
      </div>
      <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--text-3)' }}>↗</span>
    </a>
  )
}
