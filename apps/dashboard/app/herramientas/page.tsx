import Link from 'next/link'
import { getClientes } from '@/lib/services/clients'

const HERRAMIENTAS = [
  {
    id:          'n8n',
    nombre:      'n8n',
    descripcion: 'Automatización de workflows',
    letra:       'N',
    href:        '/herramientas/n8n',
    color:       '#EA4B71',
    glow:        'rgba(234,75,113,0.20)',
  },
  {
    id:          'ghl',
    nombre:      'GoHighLevel',
    descripcion: 'CRM · leads · conversaciones',
    letra:       'G',
    href:        '/herramientas/ghl',
    color:       '#22C55E',
    glow:        'rgba(34,197,94,0.18)',
  },
  {
    id:          'openai',
    nombre:      'OpenAI',
    descripcion: 'Modelos · tokens · costo',
    letra:       'O',
    href:        '/herramientas/openai',
    color:       '#4B7BF5',
    glow:        'rgba(75,123,245,0.20)',
  },
]

const ACCESOS = [
  { label: 'n8n',            url: 'http://129.121.56.240' },
  { label: 'GoHighLevel',    url: 'https://app.gohighlevel.com' },
  { label: 'Airtable',       url: 'https://airtable.com' },
  { label: 'OpenAI Usage',   url: 'https://platform.openai.com/usage' },
  { label: 'Google AI Studio', url: 'https://aistudio.google.com' },
]

export default async function Herramientas() {
  const clientes = await getClientes()

  function getStats(h: typeof HERRAMIENTAS[0], clienteId: string) {
    const c = clientes.find(x => x.id === clienteId)
    if (!c) return []
    if (h.id === 'n8n') return [
      { label: 'Workflows',       value: c.workflows.length },
      { label: 'Activos',         value: c.workflows.filter(w => w.estado === 'activo').length },
      { label: 'Ejecuciones hoy', value: c.workflows.reduce((a, w) => a + w.ejecucionesHoy, 0) },
    ]
    if (h.id === 'ghl') return [
      { label: 'Conversaciones', value: c.metricas.conversaciones },
      { label: 'Leads seguidos', value: c.metricas.leadsFollowUp },
      { label: 'Tiempo resp.',   value: `${c.metricas.tiempoRespuestaSegundos}s` },
    ]
    return [
      { label: 'Modelos activos', value: 3 },
      { label: 'Tokens este mes', value: '~180K' },
      { label: 'Costo estimado',  value: '$6' },
    ]
  }

  return (
    <div className="fade-in-up">

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', marginBottom: 6, letterSpacing: '-0.02em' }}>Herramientas</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Servicios conectados, organizados por cliente</p>
      </div>

      {/* Por cliente */}
      {clientes.map(c => (
        <div key={c.id} style={{ marginBottom: 48 }}>

          {/* Cliente label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: '#fff',
              boxShadow: '0 0 14px var(--accent-glow)',
            }}>
              {c.empresa[0]}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{c.empresa}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                {c.workflows.length} workflows · {c.canales.length} canales · Plan {c.plan}
              </div>
            </div>
            <Link href={`/clientes/${c.id}`} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
              Ver cliente →
            </Link>
          </div>

          {/* Cards de herramientas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {HERRAMIENTAS.map(h => {
              const stats = getStats(h, c.id)
              return (
                <Link
                  key={h.id}
                  href={h.href}
                  style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface-1)', border: '1px solid var(--border)', textDecoration: 'none', display: 'block', position: 'relative', transition: 'border-color 150ms ease' }}
                >
                  {/* Barra de color arriba */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: h.color, boxShadow: `0 0 12px ${h.glow}` }} />

                  {/* Header tool */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: `${h.color}15`,
                      border: `1px solid ${h.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17, fontWeight: 800, color: h.color,
                    }}>
                      {h.letra}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{h.nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.descripcion}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {stats.map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</span>
                        <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-1)' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '10px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-estable)', boxShadow: '0 0 5px var(--status-estable)' }} />
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Activo</span>
                    </div>
                    <span style={{ fontSize: 11, color: h.color }}>Ver →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* Accesos rápidos */}
      <div style={{ borderRadius: 14, padding: '20px 24px', background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', fontWeight: 600, marginBottom: 14 }}>
          Acceso directo externo
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ACCESOS.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 8,
                background: 'var(--surface-2)', border: '1px solid var(--border-2)',
                color: 'var(--text-2)', textDecoration: 'none',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
