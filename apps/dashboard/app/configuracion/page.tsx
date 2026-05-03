'use client'
import { useState, useEffect } from 'react'
import type { ToolName } from '@/lib/config'
import type { AutomationEntry } from '@/lib/automations-catalog'
import { automationsCatalog } from '@/lib/automations-catalog'

interface ToolStatus {
  state: 'idle' | 'testing' | 'ok' | 'error'
  latencyMs?: number
  error?: string
}

const TOOLS: { key: ToolName; label: string; icon: string; description: string }[] = [
  { key: 'n8n',      label: 'n8n',          icon: '⚙',  description: 'Motor de automatizaciones' },
  { key: 'airtable', label: 'Airtable',     icon: '⊞',  description: 'Base de datos de clientes' },
  { key: 'ghl',      label: 'GoHighLevel',  icon: '◈',  description: 'CRM y marketing' },
  { key: 'openai',   label: 'OpenAI',       icon: '◉',  description: 'Procesamiento de IA' },
  { key: 'slack',    label: 'Slack',        icon: '⊕',  description: 'Notificaciones y alertas' },
  { key: 'chatwoot', label: 'Chatwoot',     icon: '◎',  description: 'Mensajería y soporte' },
]

function StatusDot({ state }: { state: ToolStatus['state'] }) {
  const colors: Record<ToolStatus['state'], string> = {
    idle:    'var(--border-2)',
    testing: 'var(--amber)',
    ok:      'var(--green)',
    error:   'var(--red)',
  }
  return (
    <div
      className="w-2 h-2 rounded-full shrink-0"
      style={{ background: colors[state], transition: 'background 0.3s' }}
    />
  )
}

function ChecklistItem({
  label,
  envVar,
  done,
  onToggle,
}: {
  label: string
  envVar?: string
  done: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-start gap-3 py-1 cursor-pointer" onClick={onToggle}>
      <div
        className="w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center border"
        style={{
          background:  done ? 'var(--accent)' : 'transparent',
          borderColor: done ? 'var(--accent)' : 'var(--border-2)',
        }}
      >
        {done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
      </div>
      <div>
        <span
          className="text-[13px]"
          style={{
            color:          done ? 'var(--text-3)' : 'var(--text-2)',
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {label}
        </span>
        {envVar && (
          <span className="text-[11px] ml-2 font-mono" style={{ color: 'var(--text-3)' }}>
            Var: {envVar}
          </span>
        )}
      </div>
    </div>
  )
}

function CatalogItem({
  entry,
  isSelected,
  onSelect,
  checked,
  onToggle,
}: {
  entry: AutomationEntry
  isSelected: boolean
  onSelect: () => void
  checked: Map<string, boolean>
  onToggle: (itemKey: string) => void
}) {
  return (
    <div>
      <div
        className="rounded-xl cursor-pointer px-4 py-3 flex items-center justify-between gap-4"
        style={{
          background:      'var(--surface-1)',
          border:          isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
          borderLeftWidth: isSelected ? 3 : 1,
        }}
        onClick={onSelect}
      >
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
            {entry.name}
          </div>
          <div className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>
            {entry.description}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {entry.tools.map(t => (
              <span
                key={t}
                className="text-[11px] px-1.5 py-0.5 rounded"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <span aria-hidden="true" style={{ color: 'var(--text-3)', fontSize: 12, flexShrink: 0 }}>
          {isSelected ? '▲' : '▼'}
        </span>
      </div>
      {isSelected && (
        <div
          className="rounded-b-xl px-5 py-4 border-x border-b"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          {entry.n8nWorkflowHint && (
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                Workflow en n8n
              </p>
              <p className="text-[13px] font-mono" style={{ color: 'var(--text-2)' }}>
                {entry.n8nWorkflowHint}
              </p>
            </div>
          )}
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
              Qué hace
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
              {entry.description}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
              Qué configurar
            </p>
            <div className="flex flex-col gap-1">
              {entry.requiredConfig.map((item, i) => {
                const itemKey = `${entry.id}-${i}`
                const done = checked.get(itemKey) ?? false
                return (
                  <ChecklistItem
                    key={itemKey}
                    label={item.label}
                    envVar={item.envVar}
                    done={done}
                    onToggle={() => onToggle(itemKey)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ConfiguracionPage() {
  const [statuses, setStatuses] = useState<Record<ToolName, ToolStatus>>({
    n8n:      { state: 'idle' },
    airtable: { state: 'idle' },
    ghl:      { state: 'idle' },
    openai:   { state: 'idle' },
    slack:    { state: 'idle' },
    chatwoot: { state: 'idle' },
  })
  const [testingAll, setTestingAll] = useState(false)
  type MetricValues = Record<ToolName, string | null>
  const [metrics, setMetrics] = useState<MetricValues | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [toolUrls, setToolUrls] = useState<Record<ToolName, string | null> | null>(null)
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Map<string, boolean>>(new Map())

  async function testTool(tool: ToolName) {
    setStatuses(prev => ({ ...prev, [tool]: { state: 'testing' } }))
    try {
      const res = await fetch(`/api/test-connection?tool=${tool}`)
      const data = await res.json()
      setStatuses(prev => ({
        ...prev,
        [tool]: {
          state:     data.ok ? 'ok' : 'error',
          latencyMs: data.latencyMs,
          error:     data.error,
        },
      }))
    } catch {
      setStatuses(prev => ({ ...prev, [tool]: { state: 'error', error: 'Error de red' } }))
    }
  }

  async function testAll() {
    setTestingAll(true)
    const tools: ToolName[] = ['n8n', 'airtable', 'ghl', 'openai', 'slack', 'chatwoot']
    setStatuses(prev => {
      const next = { ...prev }
      tools.forEach(t => { next[t] = { state: 'testing' } })
      return next
    })
    await Promise.all(tools.map(testTool))
    setTestingAll(false)
  }

  // Restaurar checklist desde localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem('config-checklist')
      if (raw) setCheckedItems(new Map(JSON.parse(raw) as [string, boolean][]))
    } catch {}
  }, [])

  function toggleChecked(itemKey: string) {
    setCheckedItems(prev => {
      const next = new Map(prev)
      next.set(itemKey, !prev.get(itemKey))
      try { localStorage.setItem('config-checklist', JSON.stringify([...next])) } catch {}
      return next
    })
  }

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/test-connection?type=metrics').then(r => r.json()),
      fetch('/api/test-connection?type=urls').then(r => r.json()),
    ]).then(([metricsRes, urlsRes]) => {
      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value as MetricValues)
      if (urlsRes.status === 'fulfilled') setToolUrls(urlsRes.value as Record<ToolName, string | null>)
      setMetricsLoading(false)
    }).catch(() => {
      setMetricsLoading(false)
    })
  }, [])

  const statusLabel: Record<ToolStatus['state'], string> = {
    idle:    'Sin testear',
    testing: 'Testeando…',
    ok:      'Conectado',
    error:   'Error',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
            Sistema
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-1)' }}>Configuración</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>
            Estado de las integraciones externas
          </p>
        </div>
        <button
          onClick={testAll}
          disabled={testingAll}
          className="text-[13px] px-3 py-1.5 rounded-lg border transition-colors"
          style={{
            color:       'var(--text-2)',
            borderColor: 'var(--border-2)',
            background:  'var(--surface-2)',
            cursor:      testingAll ? 'not-allowed' : 'pointer',
            opacity:     testingAll ? 0.6 : 1,
          }}
        >
          {testingAll ? 'Testeando…' : 'Testear todas'}
        </button>
      </div>

      {/* Modo Simulación banner */}
      <div
        className="mb-6 rounded-lg px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}
      >
        <span style={{ fontSize: 14 }}>⚡</span>
        <div>
          <span className="text-[13px] font-medium" style={{ color: 'var(--warning)' }}>
            Modo Simulación
          </span>
          <span className="text-[13px] ml-2" style={{ color: 'var(--text-2)' }}>
            Las conexiones son opcionales en desarrollo. Los tests no afectan el funcionamiento de la plataforma.
          </span>
        </div>
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 gap-3">
        {TOOLS.map(({ key, label, icon, description }) => {
          const st = statuses[key]
          return (
            <div
              key={key}
              className="rounded-xl p-5 flex items-start justify-between gap-4"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <span aria-hidden="true">{icon}</span>
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--text-1)' }}>
                    {toolUrls?.[key] ? (
                      <a
                        href={toolUrls[key]!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                        style={{ color: 'inherit' }}
                      >
                        {label}
                        <span aria-hidden="true" style={{ fontSize: 10, color: 'var(--text-3)' }}>↗</span>
                      </a>
                    ) : label}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</div>
                  {/* Metric line */}
                  <div className="mt-2">
                    {metricsLoading
                      ? (
                        <span
                          className="inline-block w-24 h-3 rounded animate-pulse"
                          style={{ background: 'var(--border)', opacity: 0.6 }}
                        />
                      )
                      : (
                        <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>
                          {metrics?.[key] ?? '—'}
                        </span>
                      )
                    }
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <StatusDot state={st.state} />
                  <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>
                    {st.error ? st.error : statusLabel[st.state]}
                  </span>
                  {st.state === 'ok' && st.latencyMs !== undefined && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: 'rgba(0,200,100,0.1)', color: 'var(--green)', border: '1px solid rgba(0,200,100,0.2)' }}
                    >
                      {st.latencyMs}ms
                    </span>
                  )}
                </div>

                {/* Test button */}
                <button
                  onClick={() => testTool(key)}
                  disabled={st.state === 'testing'}
                  className="text-[13px] px-3 py-1.5 rounded-lg border transition-colors"
                  style={{
                    color:       'var(--text-2)',
                    borderColor: 'var(--border-2)',
                    background:  'var(--surface-2)',
                    cursor:      st.state === 'testing' ? 'not-allowed' : 'pointer',
                    opacity:     st.state === 'testing' ? 0.6 : 1,
                  }}
                >
                  Testear
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Catálogo de automatizaciones */}
      <div className="mt-10">
        <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
          Automatizaciones
        </p>
        <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
          Automatizaciones disponibles
        </h2>
        <p className="text-[13px] mb-5" style={{ color: 'var(--text-3)' }}>
          Seleccioná una para ver qué necesita configurarse.
        </p>
        <div className="flex flex-col gap-2">
          {automationsCatalog.map(entry => (
            <CatalogItem
              key={entry.id}
              entry={entry}
              isSelected={selectedCatalogId === entry.id}
              onSelect={() => setSelectedCatalogId(prev => prev === entry.id ? null : entry.id)}
              checked={checkedItems}
              onToggle={toggleChecked}
            />
          ))}
        </div>
      </div>

      {/* Config hint */}
      <div
        className="mt-6 rounded-xl p-4"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
          Las credenciales se configuran en el archivo de entorno del servidor (gitignoreado).
          Los valores nunca se exponen al navegador.
        </p>
      </div>
    </div>
  )
}
