import Link from 'next/link'
import { getClientes } from '@/lib/services/clients'
import { canalLabel, canalIcon } from '@/lib/data'
import type { Canal } from '@/lib/data'

export default async function GHLDashboard() {
  const clientes = await getClientes()
  const canales: Canal[] = ['whatsapp', 'instagram', 'webchat', 'facebook']

  const statsPorCanal = canales.map(canal => {
    const clientesConCanal = clientes.filter(c => c.canales.includes(canal))
    const conversionPromedio = clientesConCanal.length > 0
      ? Math.round(clientesConCanal.reduce((acc, c) => acc + c.metricas.conversionPorCanal[canal], 0) / clientesConCanal.length)
      : 0
    const totalConversaciones = clientesConCanal.reduce((acc, c) => acc + c.metricas.conversaciones, 0)
    return { canal, clientesActivos: clientesConCanal.length, conversionPromedio, totalConversaciones }
  })

  const canalesActivos = statsPorCanal.filter(s => s.clientesActivos > 0)
  const mejorCanal = canalesActivos.length > 0
    ? [...canalesActivos].sort((a, b) => b.conversionPromedio - a.conversionPromedio)[0]
    : null
  const maxConversion = Math.max(...statsPorCanal.map(c => c.conversionPromedio))
  const totalConversaciones = clientes.reduce((acc, c) => acc + c.metricas.conversaciones, 0)
  const totalLeads = clientes.reduce((acc, c) => acc + c.metricas.leadsFollowUp, 0)
  const tiempoPromedioSeg = clientes.length > 0
    ? Math.round(clientes.reduce((acc, c) => acc + c.metricas.tiempoRespuestaSegundos, 0) / clientes.length)
    : 0

  return (
    <div>
      <div className="mb-6">
        <Link href="/herramientas" className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
          ‹ Herramientas
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: '#4A90E2' }}>G</div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>GoHighLevel</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Canales · leads · conversiones</p>
            </div>
          </div>
          <a href="https://app.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: '#4A90E2' }}>
            Abrir GHL →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Conversaciones este mes', value: totalConversaciones, sub: 'todas las cuentas' },
          { label: 'Leads con follow-up', value: totalLeads, sub: 'automatizados' },
          { label: 'Tiempo de respuesta', value: `${tiempoPromedioSeg}s`, sub: tiempoPromedioSeg <= 15 ? 'óptimo' : 'revisar' },
        ].map((k, i) => (
          <div key={i} className="rounded-lg p-5 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>{k.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-1)' }}>{k.value}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {mejorCanal && (
        <div className="rounded-lg p-5 mb-6" style={{ background: 'rgba(46,186,128,0.06)', border: '1px solid rgba(46,186,128,0.2)' }}>
          <div className="text-[11px] uppercase tracking-wide mb-1 text-emerald-400">Canal más óptimo</div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{canalIcon[mejorCanal.canal]}</span>
            <div>
              <div className="text-lg font-semibold text-emerald-400">{canalLabel[mejorCanal.canal]}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                {mejorCanal.conversionPromedio}% conversión promedio · {mejorCanal.clientesActivos} cliente{mejorCanal.clientesActivos > 1 ? 's' : ''} activo{mejorCanal.clientesActivos > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg mb-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Comparativa de canales</span>
        </div>
        <div className="px-5 py-5 space-y-5">
          {statsPorCanal.sort((a, b) => b.conversionPromedio - a.conversionPromedio).map(s => {
            const pct = maxConversion > 0 ? Math.round((s.conversionPromedio / maxConversion) * 100) : 0
            const esMejor = mejorCanal?.canal === s.canal
            return (
              <div key={s.canal}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{canalIcon[s.canal]}</span>
                    <span className="text-sm" style={{ color: 'var(--text-1)' }}>{canalLabel[s.canal]}</span>
                    {esMejor && <span className="text-[10px] px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">Mejor</span>}
                    {s.clientesActivos === 0 && <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Sin clientes</span>}
                  </div>
                  <div className="text-right text-xs" style={{ color: 'var(--text-2)' }}>
                    <span className="font-mono font-semibold" style={{ color: 'var(--text-1)' }}>{s.conversionPromedio}%</span>
                    <span className="ml-2">{s.clientesActivos} clientes</span>
                  </div>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'var(--border-2)' }}>
                  <div
                    className={`h-full rounded-full ${esMejor ? 'bg-emerald-400' : 'bg-blue-400'}`}
                    style={{ width: `${pct}%`, opacity: s.clientesActivos === 0 ? 0.2 : 1 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Performance por cliente</span>
        </div>
        {clientes.map(c => {
          const mejorCanalCliente = c.canales.reduce((best, canal) =>
            c.metricas.conversionPorCanal[canal] > c.metricas.conversionPorCanal[best] ? canal : best
          )
          return (
            <div
              key={c.id}
              className="flex items-center justify-between px-5 py-3.5"
              style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <Link href={`/clientes/${c.id}`} className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                  {c.empresa}
                </Link>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                  Mejor canal: {canalIcon[mejorCanalCliente]} {canalLabel[mejorCanalCliente]} ({c.metricas.conversionPorCanal[mejorCanalCliente]}%)
                </div>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <div className="text-sm font-mono font-semibold" style={{ color: 'var(--text-1)' }}>{c.metricas.conversaciones}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>conversaciones</div>
                </div>
                <div>
                  <div className="text-sm font-mono font-semibold" style={{ color: 'var(--text-1)' }}>{c.metricas.tiempoRespuestaSegundos}s</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>respuesta</div>
                </div>
                <a href={c.ghlUrl} target="_blank" rel="noopener noreferrer" className="text-xs self-center" style={{ color: 'var(--accent)' }}>
                  GHL ↗
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
