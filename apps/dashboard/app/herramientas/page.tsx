import Link from 'next/link'
import { getClientes } from '@/lib/services/clients'

export default async function Herramientas() {
  const clientes = await getClientes()

  const herramientas = [
    {
      id: 'n8n',
      nombre: 'n8n',
      descripcion: 'Automatización de workflows',
      letra: 'N',
      href: '/herramientas/n8n',
      stats: (clienteId: string) => {
        const c = clientes.find(x => x.id === clienteId)
        if (!c) return []
        return [
          { label: 'Workflows', value: c.workflows.length },
          { label: 'Activos', value: c.workflows.filter(w => w.estado === 'activo').length },
          { label: 'Ejecuciones hoy', value: c.workflows.reduce((a, w) => a + w.ejecucionesHoy, 0) },
        ]
      },
    },
    {
      id: 'ghl',
      nombre: 'GoHighLevel',
      descripcion: 'CRM · leads · conversaciones',
      letra: 'G',
      href: '/herramientas/ghl',
      stats: (clienteId: string) => {
        const c = clientes.find(x => x.id === clienteId)
        if (!c) return []
        return [
          { label: 'Conversaciones', value: c.metricas.conversaciones },
          { label: 'Leads seguidos', value: c.metricas.leadsFollowUp },
          { label: 'Tiempo resp.', value: `${c.metricas.tiempoRespuestaSegundos}s` },
        ]
      },
    },
    {
      id: 'openai',
      nombre: 'OpenAI',
      descripcion: 'Modelos · tokens · costo',
      letra: 'O',
      href: '/herramientas/openai',
      stats: (_clienteId: string) => [
        { label: 'Modelos activos', value: 3 },
        { label: 'Tokens este mes', value: '~180K' },
        { label: 'Costo estimado', value: '$6' },
      ],
    },
  ]

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Herramientas</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>Servicios conectados, organizados por cliente</p>
      </div>

      {clientes.map(c => (
        <div key={c.id} className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'var(--text-1)',
              }}
            >
              {c.empresa[0]}
            </div>
            <div>
              <div className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>{c.empresa}</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>
                {c.workflows.length} workflows · {c.canales.length} canales · Plan {c.plan}
              </div>
            </div>
            <div className="ml-auto">
              <Link href={`/clientes/${c.id}`} className="text-xs" style={{ color: 'var(--text-3)' }}>
                Ver cliente →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {herramientas.map(h => {
              const stats = h.stats(c.id)
              return (
                <Link
                  key={h.id}
                  href={h.href}
                  className="block rounded-xl overflow-hidden transition-colors"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  <div className="px-6 pt-6 pb-4 flex items-center gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: 'var(--text-1)',
                        flexShrink: 0,
                      }}
                    >
                      {h.letra}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{h.nombre}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{h.descripcion}</div>
                    </div>
                  </div>
                  <div className="px-6 py-4 space-y-3">
                    {stats.map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{s.label}</span>
                        <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-1)' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 pb-5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-3)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>Activo</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>Ver →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      <div className="rounded-xl p-5" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>Acceso directo externo</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'n8n', url: 'http://129.121.56.240' },
            { label: 'GoHighLevel', url: 'https://app.gohighlevel.com' },
            { label: 'Airtable', url: 'https://airtable.com' },
            { label: 'OpenAI Usage', url: 'https://platform.openai.com/usage' },
            { label: 'Google AI Studio', url: 'https://aistudio.google.com' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
