import Link from 'next/link'
import { getClientes } from '@/lib/services/clients'

const modelosActivos = [
  { nombre: 'Gemini 1.5 Flash', uso: 'Conversación principal (Vicky)', tokens: 142000, costo: 0.7 },
  { nombre: 'OpenAI Whisper', uso: 'Transcripción de audios', tokens: 8400, costo: 0.5 },
  { nombre: 'GPT-4o-mini', uso: 'Fallback si Gemini falla', tokens: 12000, costo: 0.36 },
  { nombre: 'Gemini Flash Vision', uso: 'Descripción de imágenes', tokens: 6200, costo: 0.4 },
  { nombre: 'Claude Haiku', uso: 'Parseo de fechas naturales', tokens: 4800, costo: 0.18 },
]

const usagePorCliente = [
  { clienteId: 'dc-gym', tokens: 173400, limite: 500000, costo: 2.14 },
]

export default async function OpenAIDashboard() {
  const clientes = await getClientes()

  const totalTokens = usagePorCliente.reduce((acc, u) => acc + u.tokens, 0)
  const totalCosto = usagePorCliente.reduce((acc, u) => acc + u.costo, 0)
  const clienteAlLimite = usagePorCliente.filter(u => u.tokens / u.limite > 0.85)

  return (
    <div>
      <div className="mb-6">
        <Link href="/herramientas" className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
          ‹ Herramientas
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: '#2EBA80' }}>O</div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>AI Models</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Tokens · costo · modelos activos</p>
            </div>
          </div>
          <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-md font-medium text-white" style={{ background: '#2EBA80' }}>
            Abrir OpenAI →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Tokens este mes', value: `${(totalTokens / 1000).toFixed(0)}K`, sub: 'todos los modelos' },
          { label: 'Costo estimado', value: `$${totalCosto.toFixed(2)}`, sub: 'este mes' },
          { label: 'Modelos activos', value: modelosActivos.length, sub: 'en DC Gym' },
        ].map((k, i) => (
          <div key={i} className="rounded-lg p-5 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>{k.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-1)' }}>{k.value}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {clienteAlLimite.length > 0 && (
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.3)' }}>
          <div className="text-sm font-medium text-amber-400">
            ⚠️ {clienteAlLimite.length} cliente cerca del límite — considerá ampliar la cuota
          </div>
        </div>
      )}

      <div className="rounded-lg mb-6 overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Modelos activos en DC Gym</span>
        </div>
        <div
          className="grid px-5 py-2.5 text-[10px] uppercase tracking-wider"
          style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-3)', gridTemplateColumns: '2fr 2fr 1fr 80px' }}
        >
          <span>Modelo</span><span>Uso en el sistema</span>
          <span className="text-right">Tokens</span><span className="text-right">Costo</span>
        </div>
        {modelosActivos.map((m, i) => (
          <div
            key={i}
            className="grid items-center px-5 py-3.5"
            style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)', gridTemplateColumns: '2fr 2fr 1fr 80px' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-sm" style={{ color: 'var(--text-1)' }}>{m.nombre}</span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-2)' }}>{m.uso}</span>
            <span className="text-right text-xs font-mono" style={{ color: 'var(--text-2)' }}>{(m.tokens / 1000).toFixed(1)}K</span>
            <span className="text-right text-xs font-mono" style={{ color: 'var(--text-2)' }}>${m.costo.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Uso por cliente</span>
        </div>
        <div className="px-5 py-5">
          {usagePorCliente
            .sort((a, b) => (b.tokens / b.limite) - (a.tokens / a.limite))
            .map(u => {
              const cliente = clientes.find(c => c.id === u.clienteId)
              if (!cliente) return null
              const pct = Math.round((u.tokens / u.limite) * 100)
              const alerta = pct > 85
              return (
                <div key={u.clienteId}>
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/clientes/${u.clienteId}`} className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                      {cliente.empresa}
                    </Link>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-2)' }}>
                      {alerta && <span className="text-amber-400 font-medium">⚠️ {pct}%</span>}
                      <span className="font-mono">{(u.tokens / 1000).toFixed(0)}K / {(u.limite / 1000).toFixed(0)}K tokens</span>
                      <span className="font-mono font-semibold" style={{ color: 'var(--text-1)' }}>${u.costo.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--border-2)' }}>
                    <div
                      className={`h-full rounded-full ${pct > 85 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
                    {pct}% utilizado — {100 - pct}% disponible hasta fin de mes
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
