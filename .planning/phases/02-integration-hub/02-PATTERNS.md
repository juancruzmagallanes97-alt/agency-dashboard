# Phase 2: Integration Hub - Pattern Map

**Mapped:** 2026-05-01
**Files analyzed:** 4 (3 modified, 1 created)
**Analogs found:** 4 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/dashboard/lib/config.ts` | config | request-response | `apps/dashboard/lib/config.ts` itself | self (extend) |
| `apps/dashboard/app/api/test-connection/route.ts` | route handler | request-response | `apps/dashboard/app/api/test-connection/route.ts` itself | self (extend) |
| `apps/dashboard/app/configuracion/page.tsx` | component (client) | request-response + event-driven | `apps/dashboard/app/configuracion/page.tsx` itself | self (extend) |
| `apps/dashboard/lib/automations-catalog.ts` | utility / data module | transform (static) | `apps/dashboard/lib/data.ts` | role-match |

---

## Pattern Assignments

### `apps/dashboard/lib/config.ts` (config, request-response)

**Analog:** Self — extend the existing file.

**Current interface structure** (lines 1-31 — full file):
```typescript
export interface ConnectionConfig {
  n8n:      { url: string; apiKey: string }
  airtable: { apiKey: string; baseId: string }
  ghl:      { apiKey: string }
  openai:   { apiKey: string }
  slack:    { webhookUrl: string }
}

export type ToolName = 'n8n' | 'airtable' | 'ghl' | 'openai' | 'slack'

export function getConfig(): ConnectionConfig {
  return {
    n8n: {
      url:    process.env.N8N_API_URL ?? '',
      apiKey: process.env.N8N_API_KEY ?? '',
    },
    airtable: {
      apiKey: process.env.AIRTABLE_API_KEY ?? '',
      baseId: process.env.AIRTABLE_BASE_ID ?? '',
    },
    ghl: {
      apiKey: process.env.GHL_API_KEY ?? '',
    },
    openai: {
      apiKey: process.env.OPENAI_KEY ?? '',
    },
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL ?? '',
    },
  }
}
```

**What to add — copy this exact pattern for Chatwoot and OpenAI adminKey:**

Add `chatwoot` field to `ConnectionConfig` interface following the same inline-object shape as `n8n`:
```typescript
chatwoot: { apiUrl: string; apiToken: string; accountId: string }
```

Extend `openai` field to add `adminKey`:
```typescript
openai: { apiKey: string; adminKey: string }
```

Extend `ToolName` union — add `'chatwoot'` to the right side:
```typescript
export type ToolName = 'n8n' | 'airtable' | 'ghl' | 'openai' | 'slack' | 'chatwoot'
```

Add `chatwoot` block inside `getConfig()` return — follow the `?? ''` nullish-coalescing pattern used by all existing entries:
```typescript
chatwoot: {
  apiUrl:    process.env.CHATWOOT_API_URL    ?? '',
  apiToken:  process.env.CHATWOOT_API_TOKEN  ?? '',
  accountId: process.env.CHATWOOT_ACCOUNT_ID ?? '',
},
```

Add `adminKey` to `openai` block:
```typescript
openai: {
  apiKey:   process.env.OPENAI_KEY       ?? '',
  adminKey: process.env.OPENAI_ADMIN_KEY ?? '',
},
```

**Naming convention to copy:** camelCase field names, no trailing semicolons in the return object, 2-space indent.

---

### `apps/dashboard/app/api/test-connection/route.ts` (route handler, request-response)

**Analog:** Self — extend the existing file.

**Current imports and TOOLS array** (lines 1-4):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getConfig, type ToolName } from '@/lib/config'

const TOOLS: ToolName[] = ['n8n', 'airtable', 'ghl', 'openai', 'slack']
```

**Core probe() structure** (lines 6-63 — full function):
```typescript
async function probe(tool: ToolName): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const cfg = getConfig()
  const t0 = Date.now()

  try {
    switch (tool) {
      case 'n8n': {
        const { url, apiKey } = cfg.n8n
        if (!url) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        const res = await fetch(`${url}/api/v1/workflows`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(5000),
        })
        return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
      }

      case 'airtable': {
        const { apiKey } = cfg.airtable
        if (!apiKey) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        const res = await fetch('https://api.airtable.com/v0/meta/bases', {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(5000),
        })
        return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
      }

      case 'openai': {
        const { apiKey } = cfg.openai
        if (!apiKey) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(5000),
        })
        return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
      }

      case 'slack': {
        const { webhookUrl } = cfg.slack
        if (!webhookUrl) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'ping' }),
          signal: AbortSignal.timeout(5000),
        })
        return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
      }

      case 'ghl': {
        const { apiKey } = cfg.ghl
        if (!apiKey) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        return { ok: true, latencyMs: Date.now() - t0 }
      }
    }
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - t0, error: e instanceof Error ? e.message : 'Error de red' }
  }
}
```

**GET handler** (lines 65-72):
```typescript
export async function GET(req: NextRequest) {
  const tool = req.nextUrl.searchParams.get('tool') as ToolName | null
  if (!tool || !TOOLS.includes(tool)) {
    return NextResponse.json({ error: 'Tool inválido' }, { status: 400 })
  }
  const result = await probe(tool)
  return NextResponse.json(result)
}
```

**What to add — 3 changes to this file:**

**Change 1:** Add `'chatwoot'` to the `TOOLS` array constant (line 4):
```typescript
const TOOLS: ToolName[] = ['n8n', 'airtable', 'ghl', 'openai', 'slack', 'chatwoot']
```

**Change 2:** Add `case 'chatwoot'` inside the `probe()` switch — copy the `airtable` case structure (non-standard auth header instead of Bearer):
```typescript
case 'chatwoot': {
  const { apiUrl, apiToken } = cfg.chatwoot
  if (!apiUrl || !apiToken) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
  const res = await fetch(`${apiUrl}/api/v1/profile`, {
    headers: { api_access_token: apiToken },
    signal: AbortSignal.timeout(5000),
  })
  return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
}
```

**Change 3:** Add `?type=metrics` branch to `GET` handler and the private metric helper functions. Add this BEFORE the existing `?tool=` logic — early return on `type === 'metrics'` so existing probe path is unchanged:

```typescript
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')

  if (type === 'metrics') {
    const cfg = getConfig()
    const [n8nResult, chatwootResult, airtableResult, openaiResult] =
      await Promise.allSettled([
        fetchN8nMetric(cfg),
        fetchChatwootMetric(cfg),
        fetchAirtableMetric(cfg),
        fetchOpenAIMetric(cfg),
      ])
    return NextResponse.json({
      n8n:      settled(n8nResult),
      chatwoot: settled(chatwootResult),
      airtable: settled(airtableResult),
      openai:   settled(openaiResult),
      slack:    cfg.slack.webhookUrl ? 'Webhook activo' : null,
      ghl:      cfg.ghl.apiKey       ? 'Configurado'   : null,
    })
  }

  // existing ?tool= branch below (unchanged)
  const tool = req.nextUrl.searchParams.get('tool') as ToolName | null
  if (!tool || !TOOLS.includes(tool)) {
    return NextResponse.json({ error: 'Tool inválido' }, { status: 400 })
  }
  const result = await probe(tool)
  return NextResponse.json(result)
}
```

The `settled()` helper and four metric fetch functions follow this pattern — one private function per tool, same `AbortSignal.timeout(5000)` as probe(), return `string | null`, never throw (errors produce `null`):

```typescript
function settled(r: PromiseSettledResult<string | null>): string | null {
  return r.status === 'fulfilled' ? r.value : null
}

async function fetchN8nMetric(cfg: ReturnType<typeof getConfig>): Promise<string | null> {
  const { url, apiKey } = cfg.n8n
  if (!url || !apiKey) return null
  const res = await fetch(`${url}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': apiKey },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return null
  const data = await res.json()
  const active = Array.isArray(data?.data)
    ? data.data.filter((w: { active?: boolean }) => w.active === true).length
    : null
  return active !== null ? `${active} workflows activos` : null
}

async function fetchChatwootMetric(cfg: ReturnType<typeof getConfig>): Promise<string | null> {
  const { apiUrl, apiToken, accountId } = cfg.chatwoot
  if (!apiUrl || !apiToken || !accountId) return null
  const res = await fetch(`${apiUrl}/api/v1/accounts/${accountId}/conversations/meta?status=open`, {
    headers: { api_access_token: apiToken },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return null
  const data = await res.json()
  const count = data?.meta?.all_count
  return typeof count === 'number' ? `${count} conversaciones abiertas` : null
}

async function fetchAirtableMetric(cfg: ReturnType<typeof getConfig>): Promise<string | null> {
  const { apiKey, baseId } = cfg.airtable
  if (!apiKey) return null
  const res = await fetch('https://api.airtable.com/v0/meta/bases', {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return null
  const data = await res.json()
  const bases: { id: string; name: string }[] = data?.bases ?? []
  const match = bases.find(b => b.id === baseId)
  if (match) return `Base: ${match.name}`
  return bases.length > 0 ? `${bases.length} bases encontradas` : null
}

async function fetchOpenAIMetric(cfg: ReturnType<typeof getConfig>): Promise<string | null> {
  const { apiKey, adminKey } = cfg.openai
  if (!apiKey && !adminKey) return null
  if (adminKey) {
    const start = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
    const res = await fetch(
      `https://api.openai.com/v1/organization/usage/completions?start_time=${start}`,
      {
        headers: { Authorization: `Bearer ${adminKey}` },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (res.ok) {
      const data = await res.json()
      const buckets: { results: { input_tokens: number; output_tokens: number }[] }[] =
        data?.data ?? []
      const total = buckets.reduce((sum, b) =>
        sum + b.results.reduce((s, r) => s + r.input_tokens + r.output_tokens, 0), 0)
      return `${total.toLocaleString('es-AR')} tokens (30d)`
    }
  }
  return 'API key válida'
}
```

**Error handling pattern to copy:** All probe cases use `try/catch` at the outer level (lines 60-62). Metric helpers do NOT throw — they return `null` on any error. The `settled()` helper converts rejected promises to `null`. This is the silent-failure convention from `CLAUDE.md`.

**Credential-never-in-response rule:** Metric strings contain only display values (counts, names). Never include the API URL, key, or token in the JSON response. Copy from existing probe returns — `error: res.ok ? undefined : \`HTTP ${res.status}\`` — no credential data echoed.

---

### `apps/dashboard/app/configuracion/page.tsx` (component, request-response + event-driven)

**Analog:** Self — extend the existing file.

**Current imports and types** (lines 1-9):
```typescript
'use client'
import { useState } from 'react'
import type { ToolName } from '@/lib/config'

interface ToolStatus {
  state: 'idle' | 'testing' | 'ok' | 'error'
  latencyMs?: number
  error?: string
}
```

**What to add to imports:**
```typescript
import { useEffect } from 'react'
import type { AutomationEntry } from '@/lib/automations-catalog'
import { automationsCatalog } from '@/lib/automations-catalog'
```

**Current TOOLS array** (lines 11-17):
```typescript
const TOOLS: { key: ToolName; label: string; icon: string; description: string }[] = [
  { key: 'n8n',      label: 'n8n',          icon: '⚙',  description: 'Motor de automatizaciones' },
  { key: 'airtable', label: 'Airtable',     icon: '⊞',  description: 'Base de datos de clientes' },
  { key: 'ghl',      label: 'GoHighLevel',  icon: '◈',  description: 'CRM y marketing' },
  { key: 'openai',   label: 'OpenAI',       icon: '◉',  description: 'Procesamiento de IA' },
  { key: 'slack',    label: 'Slack',        icon: '⊕',  description: 'Notificaciones y alertas' },
]
```

**Add Chatwoot entry** — follow the same object shape and icon style:
```typescript
{ key: 'chatwoot',  label: 'Chatwoot',     icon: '◎',  description: 'Mensajería y soporte' },
```

**Current StatusDot sub-component** (lines 19-32) — copy this pattern for all new sub-components (unexported `function`, inline prop type, inline style with CSS vars):
```typescript
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
```

**Current page component state initialization** (lines 35-41):
```typescript
export default function ConfiguracionPage() {
  const [statuses, setStatuses] = useState<Record<ToolName, ToolStatus>>({
    n8n:      { state: 'idle' },
    airtable: { state: 'idle' },
    ghl:      { state: 'idle' },
    openai:   { state: 'idle' },
    slack:    { state: 'idle' },
  })
  const [testingAll, setTestingAll] = useState(false)
```

**Add these new state declarations** right after the existing ones — follow the same `useState` + explicit generic type pattern:
```typescript
  type MetricValues = Record<ToolName, string | null>
  const [metrics, setMetrics] = useState<MetricValues | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Map<string, boolean>>(new Map())
```

Also add `chatwoot` to the `statuses` initial value:
```typescript
  const [statuses, setStatuses] = useState<Record<ToolName, ToolStatus>>({
    n8n:      { state: 'idle' },
    airtable: { state: 'idle' },
    ghl:      { state: 'idle' },
    openai:   { state: 'idle' },
    slack:    { state: 'idle' },
    chatwoot: { state: 'idle' },
  })
```

**Current testTool() function** (lines 44-60) — copy this pattern for the new `loadMetrics()` event handler:
```typescript
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
```

**New `useEffect` for metrics** — add after `testAll()`, before `statusLabel`. Pattern: empty dep array fires once on mount, fetch with `.catch(() => {})` silent failure per CLAUDE.md convention:
```typescript
  useEffect(() => {
    fetch('/api/test-connection?type=metrics')
      .then(r => r.json())
      .then((data: MetricValues) => {
        setMetrics(data)
        setMetricsLoading(false)
      })
      .catch(() => {
        setMetricsLoading(false)
      })
  }, [])
```

**New `toggleChecked()` handler** — inline event handler pattern following camelCase verb convention from CLAUDE.md:
```typescript
  function toggleChecked(itemKey: string) {
    setCheckedItems(prev => {
      const next = new Map(prev)
      next.set(itemKey, !prev.get(itemKey))
      return next
    })
  }
```

**Integration card pattern** (lines 128-184) — the existing card render loop. Add a metric line inside each card, below the label/description block and above the right-side status/test controls. Use `metricsLoading` to show skeleton vs value:
```typescript
{/* Metric line — add inside the left div, below description */}
<div className="text-[13px] mt-1" style={{ color: 'var(--text-2)' }}>
  {metricsLoading
    ? <span className="inline-block w-24 h-3 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
    : (metrics?.[key] ?? '—')
  }
</div>
```

**Catalog section** — add after the existing `{/* Config hint */}` div (after line 196). Follow the page's section comment convention (`{/* Sección */}`):
```typescript
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
```

**New sub-components** — place these as unexported `function` declarations ABOVE `export default function ConfiguracionPage()`, following the same pattern as `StatusDot`. Inline prop types, `style=` with CSS vars, no `export`:

```typescript
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
        className="rounded-xl border cursor-pointer px-4 py-3 flex items-center justify-between gap-4"
        style={{
          background:      'var(--surface-1)',
          borderColor:     isSelected ? 'var(--accent)' : 'var(--border)',
          borderLeftWidth: isSelected ? 3 : 1,
        }}
        onClick={onSelect}
      >
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{entry.name}</div>
          <div className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>{entry.description}</div>
          <div className="flex gap-1 mt-2">
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
        <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{isSelected ? '▲' : '▼'}</span>
      </div>
      {isSelected && (
        <div
          className="rounded-b-xl px-4 py-4 border-x border-b"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          {entry.n8nWorkflowHint && (
            <p className="text-[11px] mb-3" style={{ color: 'var(--text-3)' }}>
              Workflow en n8n: <span style={{ color: 'var(--text-2)' }}>{entry.n8nWorkflowHint}</span>
            </p>
          )}
          <div className="flex flex-col gap-2">
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
      )}
    </div>
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
    <div
      className="flex items-start gap-3 cursor-pointer"
      onClick={onToggle}
    >
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
            {envVar}
          </span>
        )}
      </div>
    </div>
  )
}
```

**Typography scale to use** (from RESEARCH.md pitfall 5 — mandatory):
- `text-[11px]` — labels, hints, secondary metadata
- `text-[13px]` — body text, descriptions
- `text-sm` (14px) — primary labels
- `text-2xl` (24px) — page headings
- NEVER use `text-xs` (12px)

---

### `apps/dashboard/lib/automations-catalog.ts` (utility / data module, transform)

**Analog:** `apps/dashboard/lib/data.ts` — same role: pure TypeScript module, no imports, named exports for types and constants, single source of truth for domain data.

**Pattern to copy from `lib/data.ts`:**
- File starts with TypeScript `type` and `interface` declarations (no imports, no `'use client'`)
- Types use `export type` for unions, `export interface` for object shapes
- Data constants use `export const` with explicit type annotation
- No default export — all named exports
- Use `@/lib/automations-catalog` import path (never relative)

**The module to create** (full content — derived from CONTEXT.md locked spec and RESEARCH.md Pattern 4):

```typescript
export type ToolName = 'n8n' | 'chatwoot' | 'airtable' | 'openai' | 'slack' | 'ghl'

export interface RequiredConfigItem {
  label: string
  tool: ToolName
  envVar?: string
}

export interface AutomationEntry {
  id: string
  name: string
  description: string
  tools: ToolName[]
  requiredConfig: RequiredConfigItem[]
  n8nWorkflowHint?: string
}

export const automationsCatalog: AutomationEntry[] = [
  {
    id: 'seguimiento-post-clase',
    name: 'Seguimiento post clase de prueba',
    description: 'Envía un mensaje de WhatsApp o solicitud de reseña en Google 24h después de la primera clase de prueba de un nuevo prospecto.',
    tools: ['n8n', 'chatwoot'],
    requiredConfig: [
      { label: 'Webhook de entrada en n8n configurado', tool: 'n8n', envVar: 'N8N_API_URL' },
      { label: 'Canal de WhatsApp conectado en Chatwoot', tool: 'chatwoot', envVar: 'CHATWOOT_API_URL' },
      { label: 'Template de mensaje de seguimiento creado', tool: 'chatwoot' },
    ],
    n8nWorkflowHint: 'Seguimiento Trial',
  },
  {
    id: 'bienvenida-nuevo-socio',
    name: 'Bienvenida nuevo socio',
    description: 'Envía mensaje de bienvenida por WhatsApp y registra el contacto en el CRM cuando un nuevo socio se da de alta.',
    tools: ['n8n', 'chatwoot', 'airtable'],
    requiredConfig: [
      { label: 'Webhook de alta de socio configurado en n8n', tool: 'n8n', envVar: 'N8N_API_URL' },
      { label: 'Canal de WhatsApp conectado en Chatwoot', tool: 'chatwoot', envVar: 'CHATWOOT_API_URL' },
      { label: 'Base de clientes configurada en Airtable', tool: 'airtable', envVar: 'AIRTABLE_BASE_ID' },
    ],
    n8nWorkflowHint: 'Bienvenida Socio',
  },
  {
    id: 'recordatorio-pago',
    name: 'Recordatorio de pago',
    description: 'Envía recordatorio por WhatsApp 3 días antes del vencimiento de cuota y un seguimiento el día del vencimiento si no se registró el pago.',
    tools: ['n8n', 'chatwoot'],
    requiredConfig: [
      { label: 'Trigger programado (Cron) en n8n configurado', tool: 'n8n', envVar: 'N8N_API_URL' },
      { label: 'Canal de WhatsApp conectado en Chatwoot', tool: 'chatwoot', envVar: 'CHATWOOT_API_URL' },
      { label: 'Template de recordatorio de pago creado', tool: 'chatwoot' },
    ],
    n8nWorkflowHint: 'Recordatorio Pago',
  },
  {
    id: 'reporte-semanal-actividad',
    name: 'Reporte semanal de actividad',
    description: 'Genera y envía un resumen semanal con métricas de conversaciones, workflows ejecutados y tareas pendientes a Slack cada lunes.',
    tools: ['n8n', 'slack'],
    requiredConfig: [
      { label: 'Trigger semanal (Cron lunes) configurado en n8n', tool: 'n8n', envVar: 'N8N_API_URL' },
      { label: 'Webhook de Slack configurado', tool: 'slack', envVar: 'SLACK_WEBHOOK_URL' },
    ],
    n8nWorkflowHint: 'Reporte Semanal',
  },
]
```

**Note on `ToolName` duplication:** `lib/config.ts` already exports `ToolName`. The catalog module re-exports its own `ToolName` to remain self-contained (same values). The `configuracion/page.tsx` imports `ToolName` from `@/lib/config` for `statuses` state and from `@/lib/automations-catalog` indirectly via `AutomationEntry`. If TypeScript complains about duplicate types, the planner may choose to import `ToolName` from `@/lib/config` in the catalog file instead of re-declaring it. Either approach is valid — prefer whichever avoids a `@ts-expect-error`.

---

## Shared Patterns

### CSS Token Usage
**Source:** `apps/dashboard/app/configuracion/page.tsx` (existing card renders, lines 127-185)
**Apply to:** All new UI in `configuracion/page.tsx` (catalog section, metric lines, skeleton, checklist)

Inline `style=` for all color values — never Tailwind color utilities for theme colors:
```typescript
style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
style={{ color: 'var(--text-1)' }}          // primary text
style={{ color: 'var(--text-2)' }}          // secondary text
style={{ color: 'var(--text-3)' }}          // muted / hint text
style={{ color: 'var(--accent)' }}          // orange brand accent
style={{ color: 'var(--green)' }}           // success
style={{ color: 'var(--red)' }}             // error
style={{ color: 'var(--amber)' }}           // warning / in-progress
```

Tailwind for layout/spacing only: `className="flex items-center gap-4 rounded-xl px-4 py-3"`

### Fetch + Silent Failure
**Source:** `apps/dashboard/app/configuracion/page.tsx` lines 44-60 (`testTool`) and lines 56-58 (catch block)
**Apply to:** `loadMetrics()` useEffect and all metric helper functions in `route.ts`

The pattern: `try { ... } catch { ... }` with no variable in the catch clause (TypeScript allows bare `catch` — used in existing code at line 57). On failure, set loading to false and leave data as `null`. No `console.error`. No error message surfaced to the user — `null` renders as `"—"`.

### `AbortSignal.timeout(5000)`
**Source:** `apps/dashboard/app/api/test-connection/route.ts` lines 17, 27, 36, 46, 49
**Apply to:** Every `fetch()` call inside metric helper functions in `route.ts`

Copy exactly — no custom timeout values, no `AbortController` wrapper.

### Sub-component Declaration Pattern
**Source:** `apps/dashboard/app/configuracion/page.tsx` lines 19-32 (`StatusDot`)
**Apply to:** `CatalogItem`, `ChecklistItem` — both defined in `configuracion/page.tsx`

Rules from CLAUDE.md:
- Plain `function` declaration (not arrow function, not `const`)
- Not exported — no `export` keyword
- Props typed as inline object literal in the function signature (not a named `Props` type)
- Defined in the same file as the page component that uses them
- Placed ABOVE `export default function ConfiguracionPage()`

### No-Console Rule
**Source:** CLAUDE.md convention (zero `console.log` in codebase)
**Apply to:** All new code in all 4 files

Never add `console.log`, `console.error`, or `console.warn`. Errors are silently swallowed (empty `catch` blocks or `catch { }`) or result in `null` return values.

### Import Convention
**Source:** All existing files in `apps/dashboard/`
**Apply to:** `automations-catalog.ts` imports in `configuracion/page.tsx`

```typescript
import type { AutomationEntry } from '@/lib/automations-catalog'   // type-only import
import { automationsCatalog } from '@/lib/automations-catalog'     // value import
```

Never use relative paths (`../../lib/...`). Always `@/` alias.

---

## No Analog Found

All 4 files have analogs — either self-extension or role-match:

| File | Analog Type | Notes |
|---|---|---|
| `lib/config.ts` | Self-extension | File exists; add Chatwoot field, adminKey, update ToolName union |
| `app/api/test-connection/route.ts` | Self-extension | File exists; add chatwoot case, metrics branch, helper functions |
| `app/configuracion/page.tsx` | Self-extension | File exists; add state, useEffect, catalog section, sub-components |
| `lib/automations-catalog.ts` | Role-match (`lib/data.ts`) | New file; data module pattern is established |

---

## Metadata

**Analog search scope:** `apps/dashboard/lib/`, `apps/dashboard/app/api/`, `apps/dashboard/app/configuracion/`, `apps/dashboard/components/ui/`
**Files scanned:** 9 (config.ts, route.ts, page.tsx, data.ts, Badge.tsx, Card.tsx, StatBlock.tsx, MetricRow.tsx, AlertRow.tsx)
**Pattern extraction date:** 2026-05-01
