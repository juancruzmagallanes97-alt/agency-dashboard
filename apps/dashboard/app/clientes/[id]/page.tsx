import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCliente } from '@/lib/services/clients'
import { getTareas } from '@/lib/services/tasks'
import {
  canalLabel, canalIcon, getAlertaColor, getAlertaLabel,
  getEstadoDot, getEstadoLabel, getHealthColor, getHealthEmoji,
  getNichoLabel, getPlanColor, getPlanLabel,
  getWorkflowTipoColor, getWorkflowTipoLabel,
} from '@/lib/data'
import TareasCliente from '@/components/TareasCliente'

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

  return (
    <div>
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <Link href="/clientes" className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
          ‹ Clientes
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>{c.empresa}</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${getEstadoDot(c.estado)}`} />
                <span className="text-xs" style={{ color: 'var(--text-2)' }}>{getEstadoLabel(c.estado)}</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${getPlanColor(c.plan)}`}>
                {getPlanLabel(c.plan)}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                {getNichoLabel(c.nicho)}
              </span>
              {c.bot && (
                <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                  Bot: {c.bot}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-[11px]" style={{ color: 'var(--text-3)' }}>
              {c.sucursales && <span>📍 {c.sucursales.join(' · ')}</span>}
              <span>📅 Cliente desde {new Date(c.fechaInicio).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}</span>
              <span>✉️ {c.email}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href={c.n8nBase} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors" style={{ background: 'var(--accent)', color: '#fff' }}>
              Abrir n8n →
            </a>
            <a href={c.ghlUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors" style={{ background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border-2)' }}>
              Abrir GHL →
            </a>
          </div>
        </div>
      </div>

      {/* Alerta crítica */}
      {alertasCriticas.length > 0 && (
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(232,64,64,0.08)', border: '1px solid rgba(232,64,64,0.3)' }}>
          <div className="text-sm font-medium text-red-400 mb-1">
            🔴 {alertasCriticas.length} alerta{alertasCriticas.length > 1 ? 's' : ''} crítica{alertasCriticas.length > 1 ? 's' : ''} — acción inmediata requerida
          </div>
          {alertasCriticas.map(a => (
            <div key={a.id} className="text-xs text-red-400/80 mt-1">
              · {a.titulo}
              {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline">Ver en n8n →</a>}
            </div>
          ))}
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="rounded-lg p-4 flex flex-col items-center justify-center text-center" style={{ background: 'var(--surface-1)', border: `1px solid var(--border)` }}>
          <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>Health</div>
          <div className="text-2xl mb-1">{getHealthEmoji(c.healthScore)}</div>
          <div className={`text-3xl font-bold font-mono leading-none ${hc.text}`}>{c.healthScore}</div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>/100</div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>Conversaciones</div>
          <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-1)' }}>{c.metricas.conversaciones}</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>este mes</div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>Leads seguidos</div>
          <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-1)' }}>{c.metricas.leadsFollowUp}</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>automatizados</div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background: 'var(--surface-1)', border: `1px solid ${c.metricas.tiempoRespuestaSegundos > 15 ? 'rgba(232,160,32,0.3)' : 'var(--border)'}` }}>
          <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>Tiempo resp.</div>
          <div className="text-2xl font-bold font-mono" style={{ color: c.metricas.tiempoRespuestaSegundos > 15 ? 'var(--warning)' : 'var(--text-1)' }}>
            {c.metricas.tiempoRespuestaSegundos}s
          </div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>
            {c.metricas.tiempoRespuestaSegundos <= 15 ? 'óptimo' : 'alto'}
          </div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>Hs ahorradas</div>
          <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-1)' }}>{c.metricas.horasAhorradas}</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>este mes</div>
        </div>
      </div>

      {/* Analytics de consultas */}
      {analytics && horaPico && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Distribución horaria */}
          <div className="rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Consultas por hora</span>
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>últimos 30 días</span>
            </div>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-end gap-px" style={{ height: 72 }}>
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
                          height: `${Math.max(heightPct, cantidad > 0 ? 4 : 0)}%`,
                          background: isPeak ? 'var(--accent)' : isHigh ? 'rgba(35,131,226,0.4)' : 'var(--surface-2)',
                          borderRadius: '2px 2px 0 0',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-2" style={{ fontSize: 9, color: 'var(--text-3)' }}>
                <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
              </div>
              <div className="mt-3 flex items-center gap-2" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', flexShrink: 0 }} />
                <span>Pico: {horaPico.hora}:00hs · {horaPico.cantidad} consultas</span>
              </div>
            </div>
          </div>

          {/* Top preguntas */}
          <div className="rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Consultas más frecuentes</span>
              {c.bot && <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>bot {c.bot}</span>}
            </div>
            <div className="px-5 py-4 space-y-3.5">
              {analytics.topPreguntas.slice(0, 5).map((p, i) => {
                const pct = Math.round((p.veces / maxVecesPreguntas) * 100)
                return (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-3)', minWidth: 14, fontFamily: 'monospace', flexShrink: 0, marginTop: 1 }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.4 }}>{p.pregunta}</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {p.veces.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div style={{ height: 3, background: 'var(--border-2)', borderRadius: 2 }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: i === 0 ? 'var(--accent)' : `rgba(35,131,226,${Math.max(0.15, 0.4 - i * 0.06)})`,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Flujo del sistema */}
      <div className="rounded-lg mb-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Flujo del sistema</span>
            <span className="ml-3 text-[11px]" style={{ color: 'var(--text-3)' }}>cómo viaja un mensaje de punta a punta · ~8–12 segundos</span>
          </div>
          <a href={wfPrincipal?.n8nUrl} target="_blank" rel="noopener noreferrer" className="text-[11px]" style={{ color: 'var(--accent)' }}>
            Ver WF-00 en n8n →
          </a>
        </div>
        <div className="px-5 py-6 overflow-x-auto">
          <div className="flex items-start gap-0 min-w-[700px]">
            {[
              { step: '01', label: 'Lead escribe', sub: 'WhatsApp · Instagram', icon: '📱', color: 'var(--text-2)', border: 'var(--border-2)' },
              { step: '02', label: 'GHL recibe', sub: 'Webhook → n8n', icon: '🔗', color: 'var(--text-2)', border: 'var(--border-2)' },
              { step: '03', label: 'Main Dispatcher', sub: 'Revisa historial · detecta sucursal · tipo de msg', icon: '⚙️', color: 'var(--accent)', border: 'var(--accent)', tag: 'WF-00' },
              { step: '04', label: 'Debounce Redis', sub: 'Espera 5s · junta mensajes', icon: '⏳', color: 'var(--text-2)', border: 'var(--border-2)', tag: '5 seg' },
              { step: '05', label: 'Vicky responde', sub: 'Gemini 1.5 Flash · contexto de sucursal', icon: '🤖', color: 'var(--opportunity)', border: 'var(--opportunity)', tag: 'Gemini' },
              { step: '06', label: 'GHL envía', sub: 'Mensaje al lead', icon: '✅', color: 'var(--text-2)', border: 'var(--border-2)' },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-start">
                <div className="flex flex-col items-center" style={{ minWidth: '120px' }}>
                  <div className="rounded-lg p-3 w-full" style={{ background: 'var(--surface-2)', border: `1px solid ${s.border}` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{s.icon}</span>
                      {s.tag && <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold" style={{ background: 'var(--surface-2)', color: s.color }}>{s.tag}</span>}
                    </div>
                    <div className="text-xs font-medium leading-tight" style={{ color: s.color }}>{s.label}</div>
                    <div className="text-[10px] mt-1 leading-tight" style={{ color: 'var(--text-3)' }}>{s.sub}</div>
                  </div>
                  <div className="text-[10px] mt-1.5 font-mono" style={{ color: 'var(--text-3)' }}>{s.step}</div>
                </div>
                {i < arr.length - 1 && <div className="flex items-center pt-4 px-2" style={{ color: 'var(--text-3)' }}>→</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-3)' }}>
            Tools disponibles para Vicky (llamadas por el Dispatcher)
          </div>
          <div className="flex flex-wrap gap-2">
            {wfTools.map(wf => (
              <a key={wf.id} href={wf.n8nUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded text-[11px] transition-colors" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {wf.nombre}
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Workflows + Alertas */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Workflows</span>
            <div className="flex gap-2 text-[11px]">
              <span className="text-emerald-400">{c.workflows.filter(w => w.estado === 'activo').length} activos</span>
              {workflowsError.length > 0 && <span className="text-red-400">{workflowsError.length} error</span>}
            </div>
          </div>
          {wfPrincipal && (
            <div>
              <div className="px-5 py-2 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>Principal</div>
              <WfRow wf={wfPrincipal} />
            </div>
          )}
          {wfTools.length > 0 && (
            <div>
              <div className="px-5 py-2 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>Tools (llamados por el bot)</div>
              {wfTools.map(wf => <WfRow key={wf.id} wf={wf} />)}
            </div>
          )}
          {wfOtros.length > 0 && (
            <div>
              <div className="px-5 py-2 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>Background</div>
              {wfOtros.map(wf => <WfRow key={wf.id} wf={wf} />)}
            </div>
          )}
        </div>

        <div className="rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Alertas</span>
            {alertasActivas.length > 0
              ? <span className="text-xs text-red-400">{alertasActivas.length} activa{alertasActivas.length > 1 ? 's' : ''}</span>
              : <span className="text-xs text-emerald-400">✓ Todo en orden</span>}
          </div>
          {alertasActivas.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm" style={{ color: 'var(--text-2)' }}>Sin alertas activas</div>
            </div>
          ) : (
            <div>
              {alertasActivas
                .sort((a, b) => ({ critico: 0, warning: 1, oportunidad: 2 }[a.tipo] - { critico: 0, warning: 1, oportunidad: 2 }[b.tipo]))
                .map(a => {
                  const ac = getAlertaColor(a.tipo)
                  return (
                    <div key={a.id} className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${ac.dot}`} />
                          <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{a.titulo}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${ac.badge}`}>{getAlertaLabel(a.tipo)}</span>
                      </div>
                      <div className="text-xs pl-3.5" style={{ color: 'var(--text-2)' }}>{a.descripcion}</div>
                      <div className="flex items-center gap-3 mt-2 pl-3.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
                        <span>{a.fecha}</span>
                        {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Ver en n8n →</a>}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Tareas */}
      <div className="mb-6">
        <TareasCliente clienteId={c.id} defaultTareas={defaultTareas} />
      </div>

      {/* Canales + Recomendaciones */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Canales de conversación</span>
          </div>
          <div className="px-5 py-4 space-y-5">
            {todosCanales.map(canal => {
              const activo = c.canales.includes(canal)
              const conv = c.metricas.conversionPorCanal[canal]
              const pct = maxConv > 0 && activo ? Math.round((conv / maxConv) * 100) : 0
              const esMejor = activo && conv === maxConv && maxConv > 0
              return (
                <div key={canal} style={{ opacity: activo ? 1 : 0.4 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{canalIcon[canal]}</span>
                      <span className="text-sm" style={{ color: 'var(--text-1)' }}>{canalLabel[canal]}</span>
                      {esMejor && <span className="text-[10px] px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">Mejor canal</span>}
                      {!activo && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>No activo</span>}
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{activo ? `${conv}%` : '—'}</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'var(--border-2)' }}>
                    <div className={`h-full rounded-full ${esMejor ? 'bg-emerald-400' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Recomendaciones</span>
          </div>
          {c.recomendaciones.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="text-sm" style={{ color: 'var(--text-2)' }}>Sin recomendaciones activas</div>
            </div>
          ) : (
            <div>
              {c.recomendaciones
                .sort((a, b) => ({ alto: 0, medio: 1, bajo: 2 }[a.impacto] - { alto: 0, medio: 1, bajo: 2 }[b.impacto]))
                .map(r => {
                  const tipoColors = {
                    operacional: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                    crecimiento: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
                    upsell: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                  }
                  const tipoLabels = { operacional: 'Operacional', crecimiento: 'Crecimiento', upsell: 'Upsell' }
                  const impactoText = { alto: 'text-orange-400', medio: 'text-amber-400', bajo: 'var(--text-3)' }
                  return (
                    <div key={r.id} className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{r.titulo}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${tipoColors[r.tipo]}`}>{tipoLabels[r.tipo]}</span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-2)' }}>{r.descripcion}</div>
                      <div className={`text-[11px] mt-2 font-medium ${impactoText[r.impacto]}`}>Impacto {r.impacto}</div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WfRow({ wf }: { wf: import('@/lib/data').Workflow }) {
  return (
    <a href={wf.n8nUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-5 py-3 transition-colors hover:bg-[var(--surface-1)]" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 mr-3 ${wf.estado === 'activo' ? 'bg-emerald-400' : wf.estado === 'error' ? 'bg-red-400' : 'bg-[#3E3E52]'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm" style={{ color: wf.estado === 'error' ? 'var(--critical)' : 'var(--text-1)' }}>{wf.nombre}</div>
        <div className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--text-3)' }}>{wf.id} · {wf.ultimaEjecucion}</div>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded border mr-4 ${getWorkflowTipoColor(wf.tipo)}`}>{getWorkflowTipoLabel(wf.tipo)}</span>
      <div className="text-right shrink-0">
        <div className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{wf.ejecucionesHoy} hoy</div>
        <div className="text-[10px] mt-0.5" style={{ color: wf.erroresHoy > 0 ? 'var(--critical)' : 'var(--text-3)' }}>
          {wf.erroresHoy > 0 ? `${wf.erroresHoy} errores` : `${wf.uptime}% uptime`}
        </div>
      </div>
      <span className="ml-3 text-xs" style={{ color: 'var(--text-3)' }}>↗</span>
    </a>
  )
}
