import Link from 'next/link'
import { getAlertasActivas } from '@/lib/services/alerts'
import { getAlertaColor, getAlertaLabel } from '@/lib/data'
import type { AlertaTipo } from '@/lib/data'

export default async function Alertas() {
  const todasAlertas = await getAlertasActivas()
  const criticas = todasAlertas.filter(a => a.tipo === 'critico')
  const warnings = todasAlertas.filter(a => a.tipo === 'warning')
  const oportunidades = todasAlertas.filter(a => a.tipo === 'oportunidad')

  const grupos: { tipo: AlertaTipo; label: string; alertas: typeof todasAlertas }[] = [
    { tipo: 'critico', label: 'Críticas', alertas: criticas },
    { tipo: 'warning', label: 'Warnings', alertas: warnings },
    { tipo: 'oportunidad', label: 'Oportunidades', alertas: oportunidades },
  ]

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Alertas</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
            {todasAlertas.length} alerta{todasAlertas.length !== 1 ? 's' : ''} activa{todasAlertas.length !== 1 ? 's' : ''}
            {criticas.length > 0 && <span className="text-red-400 ml-1">· {criticas.length} crítica{criticas.length > 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Críticas',      count: criticas.length,     accent: criticas.length > 0 ? 'var(--critical)'     : 'var(--border-2)', glow: criticas.length > 0 ? 'rgba(239,68,68,0.12)'   : 'transparent', numColor: criticas.length > 0 ? 'var(--critical)' : 'var(--text-1)' },
          { label: 'Warnings',      count: warnings.length,     accent: warnings.length > 0 ? 'var(--warning)'      : 'var(--border-2)', glow: warnings.length > 0 ? 'rgba(234,179,8,0.10)'   : 'transparent', numColor: warnings.length > 0 ? 'var(--warning)' : 'var(--text-1)' },
          { label: 'Oportunidades', count: oportunidades.length, accent: 'var(--opportunity)',                        glow: 'rgba(34,197,94,0.10)',                                              numColor: 'var(--opportunity)' },
        ].map((k, i) => (
          <div key={i} style={{ position: 'relative', borderRadius: 14, padding: '20px 24px 18px', background: 'var(--surface-1)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.accent, boxShadow: `0 0 10px ${k.glow}` }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: `radial-gradient(ellipse at 30% 0%, ${k.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', fontWeight: 600, marginBottom: 16 }}>{k.label}</div>
              <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.03em', color: k.numColor, textShadow: `0 0 24px ${k.glow}` }}>{k.count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>activa{k.count !== 1 ? 's' : ''}</div>
            </div>
          </div>
        ))}
      </div>

      {todasAlertas.length === 0 ? (
        <div
          className="rounded-lg p-16 text-center"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <div className="text-3xl mb-3">✅</div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Sin alertas activas</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Todos los sistemas funcionando correctamente</div>
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map(grupo => grupo.alertas.length > 0 && (
            <div key={grupo.tipo}>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${getAlertaColor(grupo.tipo).dot}`} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{grupo.label}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{grupo.alertas.length}</span>
                </div>
                {grupo.alertas.map(a => {
                  const ac = getAlertaColor(a.tipo)
                  return (
                    <div
                      key={a.id}
                      className="px-5 py-4"
                      style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${ac.badge}`}>
                              {getAlertaLabel(a.tipo)}
                            </span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{a.titulo}</span>
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-2)' }}>{a.descripcion}</div>
                          <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: 'var(--text-3)' }}>
                            <span>{a.fecha}</span>
                            <Link href={`/clientes/${a.clienteId}`} style={{ color: 'var(--accent)' }}>
                              {a.clienteNombre} →
                            </Link>
                            {a.url && (
                              <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-2)' }}>
                                Ver en n8n ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
