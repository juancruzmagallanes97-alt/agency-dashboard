import Link from 'next/link'
import { getClientes } from '@/lib/services/clients'
import { getWorkflowTipoColor, getWorkflowTipoLabel } from '@/lib/data'

export default async function N8nDashboard() {
  const clientes = await getClientes()

  const todosWorkflows = clientes.flatMap(c =>
    c.workflows.map(w => ({ ...w, cliente: c.empresa, clienteId: c.id }))
  )
  const activos = todosWorkflows.filter(w => w.estado === 'activo')
  const conError = todosWorkflows.filter(w => w.estado === 'error')
  const totalEjecuciones = todosWorkflows.reduce((acc, w) => acc + w.ejecucionesHoy, 0)
  const uptimePromedio = Math.round(todosWorkflows.reduce((acc, w) => acc + w.uptime, 0) / todosWorkflows.length * 10) / 10
  const n8nUrl = clientes[0]?.n8nBase || 'http://129.121.56.240'

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/herramientas" className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
          ‹ Herramientas
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: 'var(--accent)' }}>n</div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>n8n</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Estado de todos los workflows · {n8nUrl}</p>
            </div>
          </div>
          <a href={n8nUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: 'var(--accent)' }}>
            Abrir n8n →
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total workflows', value: todosWorkflows.length, color: 'var(--text-1)' },
          { label: 'Activos', value: activos.length, color: 'var(--text-1)' },
          { label: 'Con error', value: conError.length, color: 'var(--text-1)' },
          { label: 'Ejecuciones hoy', value: totalEjecuciones, color: 'var(--text-1)' },
        ].map((k, i) => (
          <div key={i} className="rounded-lg p-4 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>{k.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Con error */}
      {conError.length > 0 && (
        <div className="rounded-xl mb-6 overflow-hidden" style={{ border: '1px solid var(--border-2)' }}>
          <div className="px-5 py-3" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Workflows con error — atención inmediata</span>
          </div>
          {conError.map(w => (
            <div key={w.id} className="flex items-center justify-between px-5 py-3.5" style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
              <div>
                <a href={w.n8nUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{w.nombre} ↗</a>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{w.cliente} · {w.ultimaEjecucion}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{w.erroresHoy} errores</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{w.uptime}% uptime</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Todos los workflows */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Todos los workflows</span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{todosWorkflows.length} total · {uptimePromedio}% uptime</span>
        </div>
        <div
          className="grid px-5 py-2.5 text-[10px] uppercase tracking-wider"
          style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-3)', gridTemplateColumns: '2fr 1fr 80px 80px 80px 60px' }}
        >
          <span>Nombre</span><span>Cliente</span><span>Tipo</span>
          <span className="text-right">Hoy</span><span className="text-right">Uptime</span><span className="text-right">Estado</span>
        </div>
        {todosWorkflows.sort((a, b) => b.erroresHoy - a.erroresHoy).map(w => {
          const estadoDot = w.estado === 'activo' ? 'bg-[#9b9b9b]' : w.estado === 'error' ? 'bg-[#f0f0f0]' : 'bg-[#333]'
          return (
            <div
              key={w.id}
              className="grid items-center px-5 py-3 transition-colors"
              style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)', gridTemplateColumns: '2fr 1fr 80px 80px 80px 60px' }}
            >
              <div>
                <a href={w.n8nUrl} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--text-1)' }}>
                  {w.nombre} ↗
                </a>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-3)' }}>{w.id}</div>
              </div>
              <Link href={`/clientes/${w.clienteId}`} className="text-xs" style={{ color: 'var(--text-2)' }}>{w.cliente}</Link>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getWorkflowTipoColor(w.tipo)}`}>
                {getWorkflowTipoLabel(w.tipo)}
              </span>
              <div className="text-right"><span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{w.ejecucionesHoy}</span></div>
              <div className="text-right"><span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{w.uptime}%</span></div>
              <div className="flex items-center justify-end gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${estadoDot}`} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
