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
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Críticas', count: criticas.length, color: criticas.length > 0 ? 'var(--critical)' : 'var(--text-1)', accent: criticas.length > 0 },
          { label: 'Warnings', count: warnings.length, color: warnings.length > 0 ? 'var(--warning)' : 'var(--text-1)', accent: false },
          { label: 'Oportunidades', count: oportunidades.length, color: 'var(--opportunity)', accent: false },
        ].map((k, i) => (
          <div
            key={i}
            className="rounded-lg p-5"
            style={{
              background: 'var(--surface-1)',
              border: `1px solid ${k.accent ? 'rgba(232,64,64,0.3)' : 'var(--border)'}`,
            }}
          >
            <div className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-3)' }}>{k.label}</div>
            <div className="text-3xl font-bold font-mono" style={{ color: k.color }}>{k.count}</div>
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
