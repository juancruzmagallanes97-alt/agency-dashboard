# Phase 2: Integration Hub — Research

**Researched:** 2026-05-01
**Domain:** External API integration, Next.js Route Handlers, React client-side state, static TypeScript catalog
**Confidence:** HIGH (codebase verified), MEDIUM (external APIs), HIGH (patterns)

---

## Summary

Phase 2 extends a single existing page (`app/configuracion/page.tsx`) that already has the integration card structure from Phase 1. The work has two distinct concerns: (1) adding per-tool live metrics fetched from external APIs on mount, and (2) adding a hardcoded Automation Catalog with an inline accordion UX. No new routes are created.

The external API surface is well-defined by the locked CONTEXT.md decisions. The primary technical risk is the OpenAI usage endpoint, which requires an **Admin Key** (not a regular API key) — the project may only have a regular API key in `.env.local`. The fallback ("API key válida") is already designed into the UI spec, so this is handled gracefully. All other API probes are straightforward and can be derived from what already exists in `test-connection/route.ts`.

The Automation Catalog is pure TypeScript — no external dependencies, no API calls. The n8n skill files confirm what `requiredConfig` entries should look like per automation type. Implementation is a data modeling task, not a technical integration task.

**Primary recommendation:** Extend `test-connection/route.ts` with a `?type=metrics` query param mode that returns all 6 tool metrics in one response. This is simpler than a separate `/api/metrics` route and keeps credential logic centralized. The client fires one `fetch` to `/api/test-connection?type=metrics`, receives a single object, and updates state per tool.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hub Location:** LOCKED: Extend /configuracion — no new screen. Do NOT create a new route. The existing page already has the status cards structure from Phase 1 — extend it with metrics, Chatwoot, and the automation catalog section.

**Credentials Storage:** LOCKED: Env vars only — no credential editing UI. Credentials read from `process.env` via `lib/config.ts`. No form to edit credentials from the browser. INTG-04 scope is limited to recognizing configured vs unconfigured tools.

**Chatwoot — Missing from Phase 1:** LOCKED: Add Chatwoot to config.ts and the hub. Env vars: `CHATWOOT_API_URL`, `CHATWOOT_API_TOKEN`, `CHATWOOT_ACCOUNT_ID`. Probe: GET `{url}/api/v1/profile` with `api_access_token: {token}` header.

**Metrics Loading:** LOCKED: Fetch on page open (parallel, on mount). `Promise.allSettled` — one failing fetch must not block others. Show loading skeleton per card while fetching.

**Automation Catalog:** LOCKED: Hardcoded catalog in `app/lib/automations-catalog.ts`. No Airtable dependency. UX: inline accordion, single-open, no persistence.

### Claude's Discretion

- Whether metrics are fetched from `test-connection?type=metrics` (extended) or a separate `/api/metrics` route — planner decides.

### Deferred Ideas (OUT OF SCOPE)

- Credential editing UI (form to change API keys from browser)
- Airtable-based automation catalog (Phase 3+)
- Real-time metrics via WebSocket/SSE
- Per-client automation assignment tracking (Phase 4/5)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INTG-01 | Admin ve todas las herramientas conectadas (Chatwoot, n8n, Slack, Airtable, OpenAI) con indicador visual de estado | Existing `configuracion/page.tsx` card structure extended; Chatwoot added to `lib/config.ts` and TOOLS array |
| INTG-02 | Admin puede ejecutar un test de conexión por herramienta | Existing `testTool()` function and `test-connection` route extended with Chatwoot probe |
| INTG-03 | Admin ve métricas básicas de cada herramienta | Metrics fetched from external APIs via new `?type=metrics` mode in route; per-tool endpoints verified |
| INTG-04 | Admin puede agregar, editar o eliminar una integración | Scoped to configured vs unconfigured recognition only (no credential editor); Automation Catalog is the positive expression of this requirement |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Metrics fetch (live data) | API / Backend (Route Handler) | — | Credentials must never leave the server; `process.env` is only available server-side |
| Metrics display + loading state | Browser / Client | — | Requires `useEffect` + `useState`; page is already `'use client'` |
| Connection probe (test button) | API / Backend (Route Handler) | — | Same as above — credential-bearing fetch stays in Route Handler |
| Chatwoot config addition | API / Backend (`lib/config.ts`) | — | Extends the server-only config module |
| Automation Catalog rendering | Browser / Client | — | Pure static data, selection state via `useState`; no server involvement |
| Checklist state persistence | Browser / Client | — | In-memory `useState` only; no persistence this phase |

---

## Standard Stack

### Core (all already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.4 | Route Handlers for server-side credential use | Already installed; `app/api/` pattern in use |
| React | 19.2.4 | Client component state (`useState`, `useEffect`) | Already installed |
| TypeScript | ^5 | Strict typing for catalog and state shapes | Already installed, strict mode active |
| Tailwind CSS | ^4 | Utility classes; `animate-pulse` for skeleton | Already installed |

### No new dependencies required

Phase 2 adds no new npm packages. All external API calls use the standard `fetch` API (already used in `test-connection/route.ts`). The automation catalog is a plain TypeScript file.

**Version verification:** Confirmed from `apps/dashboard/package.json` — all versions above are exact. [VERIFIED: package.json]

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (configuracion/page.tsx — 'use client')
  |
  |-- useEffect on mount
  |     └─> fetch('/api/test-connection?type=metrics')
  |             |
  |             └─> Route Handler (app/api/test-connection/route.ts)
  |                   |-- reads process.env via getConfig()
  |                   |-- parallel: fetch n8n /api/v1/workflows
  |                   |-- parallel: fetch Chatwoot /api/v1/accounts/{id}/conversations/meta
  |                   |-- parallel: fetch Airtable /v0/meta/bases
  |                   |-- parallel: fetch OpenAI /v1/organization/usage/completions (admin key) or skip
  |                   |-- parallel: Slack webhook presence check (no HTTP call)
  |                   |-- parallel: GHL key presence check (no HTTP call)
  |                   └─> returns { n8n: "...", chatwoot: "...", ... }
  |
  |-- useState: metrics per tool (string | null)
  |-- useState: metricsLoading (boolean)
  |-- useState: statuses (existing — test results)
  |-- useState: selectedCatalogId (string | null)
  |-- useState: checkedItems (Map<string, boolean>)
  |
  |-- renders: 6 integration cards with metric line
  └── renders: Automation Catalog accordion
            |
            └─> reads automationsCatalog from app/lib/automations-catalog.ts
                (static import — no API call, no useEffect)
```

### Recommended File Structure

```
apps/dashboard/
├── app/
│   ├── api/
│   │   └── test-connection/
│   │       └── route.ts          (extend: add ?type=metrics + chatwoot probe)
│   └── configuracion/
│       └── page.tsx              (extend: metrics state, catalog section, sub-components)
└── lib/
    ├── config.ts                 (extend: add chatwoot field to ConnectionConfig + ToolName)
    └── automations-catalog.ts   (new: hardcoded catalog entries)
```

**Note on path:** CONTEXT.md references `app/lib/automations-catalog.ts`. The actual project places shared non-component modules in `lib/` at the project root (not inside `app/`). Existing `lib/config.ts` and `lib/data.ts` confirm this. Use `lib/automations-catalog.ts`. [VERIFIED: codebase]

### Pattern 1: Metrics Route Extension

**What:** Extend the existing GET route handler to support `?type=metrics` in addition to `?tool=X`. When `type=metrics`, all 6 metrics are fetched in parallel server-side and returned as one object.

**When to use:** When all metrics are needed together on mount (not individual on-demand).

**Why one combined call over 6 individual:** Reduces client-side complexity, single loading state, atomic result. The page doesn't need per-tool incremental updates — all metrics arrive together.

```typescript
// Source: route.ts extension pattern — derived from existing code [VERIFIED: codebase]
// app/api/test-connection/route.ts — new branch in GET handler

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
      n8n:       settled(n8nResult),
      chatwoot:  settled(chatwootResult),
      airtable:  settled(airtableResult),
      openai:    settled(openaiResult),
      slack:     cfg.slack.webhookUrl ? 'Webhook activo' : null,
      ghl:       cfg.ghl.apiKey       ? 'Configurado'   : null,
    })
  }

  // existing ?tool= branch below ...
}

function settled(r: PromiseSettledResult<string | null>): string | null {
  return r.status === 'fulfilled' ? r.value : null
}
```

### Pattern 2: Chatwoot Probe (new in route.ts)

**What:** Add `case 'chatwoot'` to the `probe()` switch inside the existing `test-connection` route.

**Endpoint verified:** `GET {CHATWOOT_API_URL}/api/v1/profile` with header `api_access_token: {token}` — the simplest auth probe that verifies token validity without side effects. [CITED: developers.chatwoot.com/api-reference]

```typescript
// Source: derived from existing probe() pattern [VERIFIED: codebase]
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

### Pattern 3: Client Metrics State

**What:** `useState` for metrics map and loading boolean. `useEffect` with empty deps fires on mount.

```typescript
// Source: derived from existing page.tsx pattern [VERIFIED: codebase]
type MetricValues = Record<ToolName, string | null>  // null = error/pending
const [metrics, setMetrics] = useState<MetricValues | null>(null)
const [metricsLoading, setMetricsLoading] = useState(true)

useEffect(() => {
  fetch('/api/test-connection?type=metrics')
    .then(r => r.json())
    .then((data: MetricValues) => {
      setMetrics(data)
      setMetricsLoading(false)
    })
    .catch(() => {
      setMetricsLoading(false)
      // metrics stays null — all cards show "—"
    })
}, [])
```

### Pattern 4: Automation Catalog TypeScript Shape

```typescript
// Source: derived from CONTEXT.md specification [VERIFIED: CONTEXT.md]
// lib/automations-catalog.ts

export type ToolName = 'n8n' | 'chatwoot' | 'airtable' | 'openai' | 'slack' | 'ghl'

export interface RequiredConfigItem {
  label: string          // "Webhook de WhatsApp configurado"
  tool: ToolName         // which tool this belongs to
  envVar?: string        // "N8N_API_KEY" — shows "Var: N8N_API_KEY" in UI
}

export interface AutomationEntry {
  id: string             // unique slug — "seguimiento-post-clase"
  name: string           // "Seguimiento post clase de prueba"
  description: string    // what it does
  tools: ToolName[]      // which integrations it uses
  requiredConfig: RequiredConfigItem[]
  n8nWorkflowHint?: string  // "Seguimiento Trial Gym" — name to look for in n8n
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

### Pattern 5: CatalogItem Sub-component (inline)

Sub-components follow the existing `WfRow` / `TareaRow` pattern: unexported `function` declarations inside `configuracion/page.tsx`. [VERIFIED: CONTEXT.md + UI-SPEC.md + codebase conventions]

```typescript
// Source: UI-SPEC.md spec + existing codebase sub-component pattern [VERIFIED]
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
  onToggle: (id: string) => void
}) {
  return (
    <>
      <div
        className="rounded-xl border cursor-pointer px-4 py-3 flex items-center justify-between gap-4"
        style={{
          background: 'var(--surface-1)',
          borderColor: isSelected ? 'var(--border)' : 'var(--border)',
          borderLeftColor: isSelected ? 'var(--accent)' : undefined,
          borderLeftWidth: isSelected ? 3 : undefined,
        }}
        onClick={onSelect}
      >
        {/* ... collapsed content ... */}
      </div>
      {isSelected && <CatalogDetailPanel entry={entry} checked={checked} onToggle={onToggle} />}
    </>
  )
}
```

### Anti-Patterns to Avoid

- **Separate metrics route:** Don't create `/api/metrics/route.ts`. Extend `test-connection/route.ts` with `?type=metrics`. Keeps credential logic in one place.
- **Individual metric fetches from client:** Don't fire 6 separate `fetch()` calls from `useEffect`. One combined call, one loading state, simpler.
- **`Promise.all` for metrics:** Use `Promise.allSettled` — one failing tool must not block display of the others.
- **`console.log` for metric errors:** Silent failure only. Metric errors render as `"—"` with no error label per codebase convention.
- **New files in `components/ui/`:** All new Phase 2 sub-components (CatalogItem, ChecklistItem, SkeletonLine) stay inline in `configuracion/page.tsx` as unexported function declarations.
- **New CSS token introductions:** Do not add tokens to `globals.css`. Use only existing `var(--*)` tokens.
- **`text-xs` for 13px text:** Use `text-[13px]` (arbitrary value). `text-xs` = 12px, which is NOT in the approved typographic scale.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animated loading skeleton | Custom CSS animation | Tailwind `animate-pulse` | Already in Tailwind v4 — `animate-pulse` handles opacity keyframe |
| Accordion state | Complex open/close manager | Simple `useState<string \| null>` for selectedId | Single-open accordion needs nothing more |
| Parallel fetch with partial failure | `Promise.all` with try/catch per call | `Promise.allSettled` | Built-in — returns fulfilled/rejected per item without short-circuiting |
| Server-side credential access | Client-side env var reads | `process.env` in Route Handler | `NEXT_PUBLIC_` prefix would expose credentials to browser — always wrong for secrets |

---

## External API Reference

### Chatwoot — Conversation Count Metric

**Endpoint:** `GET {CHATWOOT_API_URL}/api/v1/accounts/{account_id}/conversations/meta`

**Authentication:** Header `api_access_token: {token}` [CITED: developers.chatwoot.com/api-reference/conversations/get-conversation-counts]

**Query params:** `status=open` (default is "open" — can omit)

**Response:**
```json
{
  "meta": {
    "mine_count": 3,
    "unassigned_count": 5,
    "assigned_count": 7,
    "all_count": 15
  }
}
```

**How to extract metric:** `data.meta.all_count` → format as `"{n} conversaciones abiertas"` [CITED: developers.chatwoot.com]

**Probe endpoint (for test button):** `GET {CHATWOOT_API_URL}/api/v1/profile` — lightweight auth check, no side effects. [VERIFIED: CONTEXT.md]

**Confidence:** HIGH (official Chatwoot developer docs confirmed via WebFetch)

---

### n8n — Active Workflow Count Metric

**Endpoint:** `GET {N8N_API_URL}/api/v1/workflows`

**Authentication:** Header `X-N8N-API-KEY: {apiKey}` [CITED: deepwiki.com/n8n-io/n8n-docs]

**Response shape (per workflow object):** Each workflow includes an `active` boolean field. The endpoint returns a paginated list with `data[]` array of workflow objects. [CITED: deepwiki.com/n8n-io/n8n-docs — confirmed `activate` endpoint implies active field]

**How to extract metric:** Count items where `w.active === true` → format as `"{n} workflows activos"`. Already used for probe in existing `test-connection/route.ts` (same endpoint). [VERIFIED: codebase]

**Existing code reuse:** The probe already calls `{url}/api/v1/workflows` — reuse the same fetch, parse response body as `data[]`, filter `.active`.

**Confidence:** MEDIUM (active field inferred from activate endpoint docs; codebase already hits this endpoint for probe)

**Safe fallback:** If parsing fails or response is not an array, return `null` → displays `"—"`.

---

### Airtable — Base Name Metric

**Endpoint:** `GET https://api.airtable.com/v0/meta/bases`

**Authentication:** Header `Authorization: Bearer {apiKey}` [CITED: airtable.com/developers/web/api/list-bases via search results]

**Response:**
```json
{
  "bases": [
    {
      "id": "appXXXXXXXXXXXXXX",
      "name": "My Agency Base",
      "permissionLevel": "create"
    }
  ]
}
```

**Caveat:** Response does NOT include record counts per base. Record counts require a separate `GET /v0/{baseId}/{tableName}?maxRecords=1` call or table schema inspection. [VERIFIED: search results confirm fields are id/name/permissionLevel only]

**How to extract metric:** Find the base matching `AIRTABLE_BASE_ID` → format as `"Base: {name}"`. If no match, fall back to `"{n} bases encontradas"` or `null`. [CITED: airtable.com/developers/web/api/list-bases]

**Confidence:** HIGH (official Airtable docs confirmed response shape)

---

### OpenAI — Token Usage Metric

**Endpoint:** `GET https://api.openai.com/v1/organization/usage/completions`

**Authentication:** Requires **Admin Key** (`Authorization: Bearer {OPENAI_ADMIN_KEY}`) — this is DIFFERENT from the regular API key. [CITED: developers.openai.com/cookbook/examples/completions_usage_api]

**Required query params:** `start_time` (Unix seconds, 30 days ago)

**Critical gap:** The project's `.env.local` uses `OPENAI_KEY` (regular API key). The usage endpoint requires a separate Admin Key. The fallback "API key válida" (verify via `/v1/models` — already in probe) is the expected path for most deployments. [VERIFIED: CONTEXT.md "else show 'API key válida'"]

**If Admin Key is available:**
```
Response: { data: [{ results: [{ input_tokens, output_tokens }] }] }
Metric: sum(input_tokens + output_tokens) across all buckets
```

**Design decision for implementation:** Check for `OPENAI_ADMIN_KEY` env var. If present, hit usage endpoint. If absent, fall back to `"API key válida"` (no request needed beyond knowing the key is set). This matches the CONTEXT.md specification exactly.

**Confidence:** MEDIUM (endpoint confirmed; Admin Key requirement confirmed via cookbook; fallback path is designed and locked)

---

### Slack — Metric Strategy

No HTTP call to Slack for the metric. Slack Incoming Webhooks do not expose a status/health endpoint. [ASSUMED]

**Metric:** If `SLACK_WEBHOOK_URL` env var is set → `"Webhook activo"`. If not → `null` (renders as "No configurado").

**Confidence:** HIGH (this is the explicit CONTEXT.md decision — no Slack metric endpoint exists without OAuth)

---

### GHL — Metric Strategy

No HTTP call to GHL for the metric. [ASSUMED — same as Slack pattern]

**Metric:** If `GHL_API_KEY` env var is set → `"Configurado"`. If not → `null`.

**Confidence:** HIGH (explicit CONTEXT.md decision)

---

## Config Extension (lib/config.ts)

Current `ConnectionConfig` interface and `ToolName` union must be extended:

```typescript
// Source: CONTEXT.md (locked) + existing lib/config.ts [VERIFIED: codebase]

export interface ConnectionConfig {
  n8n:      { url: string; apiKey: string }
  airtable: { apiKey: string; baseId: string }
  ghl:      { apiKey: string }
  openai:   { apiKey: string; adminKey: string }  // adminKey = OPENAI_ADMIN_KEY ?? ''
  slack:    { webhookUrl: string }
  chatwoot: { apiUrl: string; apiToken: string; accountId: string }  // NEW
}

export type ToolName = 'n8n' | 'airtable' | 'ghl' | 'openai' | 'slack' | 'chatwoot'  // 'chatwoot' added

// getConfig() additions:
chatwoot: {
  apiUrl:    process.env.CHATWOOT_API_URL    ?? '',
  apiToken:  process.env.CHATWOOT_API_TOKEN  ?? '',
  accountId: process.env.CHATWOOT_ACCOUNT_ID ?? '',
},
openai: {
  apiKey:   process.env.OPENAI_KEY      ?? '',
  adminKey: process.env.OPENAI_ADMIN_KEY ?? '',
},
```

**Downstream effect:** `configuracion/page.tsx` initializes `statuses` as `Record<ToolName, ToolStatus>`. This initialization must include `chatwoot: { state: 'idle' }`. The `TOOLS` array must add the Chatwoot entry. Both changes are in the same file. [VERIFIED: codebase]

---

## Common Pitfalls

### Pitfall 1: OpenAI Usage Endpoint Requires Admin Key, Not Regular API Key

**What goes wrong:** Calling `https://api.openai.com/v1/organization/usage/completions` with a regular `OPENAI_KEY` returns 403. Developer assumes the endpoint is broken.

**Why it happens:** OpenAI introduced a separate Admin API key tier. Regular API keys (sk-...) work for completions. Admin keys (sk-admin-...) work for organization-level usage reporting.

**How to avoid:** Check for `OPENAI_ADMIN_KEY` env var. If absent, skip the usage call entirely and return `"API key válida"` after confirming the regular key works via `/v1/models`. Never fail loudly — `null` → `"—"` in the UI.

**Warning signs:** HTTP 403 from the usage endpoint.

---

### Pitfall 2: Chatwoot Response for Open Conversations Uses the `/meta` endpoint, NOT the list endpoint

**What goes wrong:** Calling `/api/v1/accounts/{id}/conversations` returns paginated conversation objects — you'd have to paginate all pages to get a true count. This is expensive and slow.

**Why it happens:** Devs reach for the list endpoint by reflex. The list endpoint has a `meta` field in its response too, but the dedicated `/conversations/meta` endpoint exists specifically for counts.

**How to avoid:** Use `GET /api/v1/accounts/{account_id}/conversations/meta?status=open` which returns `{ meta: { all_count: N } }` in a single fast request. [CITED: developers.chatwoot.com/api-reference/conversations/get-conversation-counts]

---

### Pitfall 3: `Promise.all` Short-Circuits on First Failure

**What goes wrong:** One misconfigured tool (e.g., Slack webhook URL missing) throws, blocking all other metrics from loading.

**Why it happens:** `Promise.all` rejects immediately when any promise rejects.

**How to avoid:** Always use `Promise.allSettled` for parallel metric fetches. Check `result.status === 'fulfilled'` per item. [VERIFIED: Next.js/JS standard]

---

### Pitfall 4: ToolName Union Out of Sync

**What goes wrong:** `lib/config.ts` adds `'chatwoot'` to `ToolName`. `configuracion/page.tsx` has hardcoded `Record<ToolName, ...>` objects that don't include `'chatwoot'`. TypeScript strict mode will catch this at compile time — but only if the dev doesn't suppress the error.

**How to avoid:** After extending `ToolName`, check all `Record<ToolName, ...>` usages: `statuses` state, `testAll()` tools array, `TOOLS` config array. TypeScript will surface missing keys with `strict: true`. [VERIFIED: codebase]

---

### Pitfall 5: `text-xs` vs `text-[13px]` Confusion

**What goes wrong:** Developer uses `text-xs` (Tailwind's 12px) for secondary text, violating the 4-size typographic scale.

**Why it happens:** `text-xs` is muscle memory; the approved scale uses `text-[13px]` (arbitrary) for the 13px tier.

**How to avoid:** The approved sizes are `text-[11px]`, `text-[13px]`, `text-sm` (14px), `text-2xl` (24px). Never use `text-xs` in Phase 2. [VERIFIED: UI-SPEC.md]

---

### Pitfall 6: Catalog File Location Mismatch

**What goes wrong:** CONTEXT.md says `app/lib/automations-catalog.ts` but the project doesn't have an `app/lib/` directory. Creating it would add a non-standard path.

**Why it happens:** CONTEXT.md used a slightly different path than the actual project structure.

**How to avoid:** Place the file at `lib/automations-catalog.ts` (project root `lib/` — same as `lib/config.ts` and `lib/data.ts`). Import with `@/lib/automations-catalog`. [VERIFIED: codebase — no `app/lib/` exists]

---

### Pitfall 7: Metrics State Shape — Null vs "—"

**What goes wrong:** Storing the formatted string `"—"` in state for errors. Then the display logic is inconsistent between "metric loaded, value is dash" and "metric not loaded".

**How to avoid:** Store `null` for any error/missing metric. Let the render function map `null → "—"` at display time. This keeps state clean: `null` = error or not-yet-loaded, `string` = value ready. [VERIFIED: UI-SPEC.md MetricState pattern]

---

## Next.js Route Handler Notes

The existing `test-connection/route.ts` uses the correct Next.js 16 App Router Route Handler pattern:

```typescript
// Already in codebase — correct pattern [VERIFIED: codebase]
export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get('key')
  return NextResponse.json({ ... })
}
```

The `?type=metrics` extension adds a second branch to this same function. No new file, no new imports beyond what's already there. `AbortSignal.timeout(5000)` is already used — keep it for all external fetch calls in the metrics functions too.

**Environment variables in Route Handlers:** `process.env.X` in a Route Handler (server-side) reads from `.env.local` at runtime. No `NEXT_PUBLIC_` prefix needed or wanted — these are secrets. [CITED: Next.js docs node_modules/next/dist/docs/01-app/02-guides/environment-variables.md]

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no `jest.config.*`, no `vitest.config.*`, no `pytest.ini` |
| Config file | None — Wave 0 must decide if tests are added |
| Quick run command | n/a |
| Full suite command | n/a |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTG-01 | Integration cards render for all 6 tools including Chatwoot | manual-only | — | No test infra |
| INTG-02 | Test button fires fetch and updates StatusDot | manual-only | — | No test infra |
| INTG-03 | Metrics load on mount, skeleton shown, values appear | manual-only | — | No test infra |
| INTG-04 | Configured vs unconfigured tools shown correctly | manual-only | — | No test infra |

**Manual verification protocol (replaces automated tests):**
1. Open `/configuracion` — all 6 tool cards appear including Chatwoot
2. Skeleton shimmer visible briefly on metric lines, then values appear
3. Click "Testear" on any card — dot goes amber, then green/red
4. Select any automation in catalog — detail panel expands, others collapse
5. Check a checklist item — checkbox fills accent, text gets strikethrough

### Wave 0 Gaps

No test framework exists. The project does not require tests to be added for Phase 2 (no `nyquist_validation` test infrastructure). Manual verification covers the acceptance criteria.

---

## Security Domain

`security_enforcement: true` in `.planning/config.json`. ASVS Level 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No new auth added this phase |
| V3 Session Management | No | No session changes |
| V4 Access Control | No | Single admin, no role changes |
| V5 Input Validation | Yes | `tool` query param validated against allowlist before use |
| V6 Cryptography | No | No crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Query param injection (`?tool=../../etc`) | Tampering | Existing `TOOLS.includes(tool)` allowlist check — maintain for `?type=metrics` branch too |
| Credential exposure to browser | Information Disclosure | All credential use stays in Route Handler (`process.env` server-only); never returned in JSON response |
| SSRF via user-controlled API URL | Tampering | API URLs come from `process.env` (admin-controlled), not from request body or query params — no SSRF surface |

**Key constraint:** The route handler must never echo back credential values in any response. Metric responses contain only the formatted metric string (e.g., `"12 workflows activos"`), never the API key or URL used to fetch it. [VERIFIED: existing route.ts pattern]

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Implied by project | ^20 (from @types/node) | — |
| npm | Package manager | Yes | Lockfile present | — |
| `.env.local` | Credentials | Yes (file exists) | — | Simulation mode banner covers missing creds |
| n8n instance | INTG-03 metric | Unknown at research time | — | Returns `null` → "—" in UI |
| Chatwoot instance | INTG-01/03 | Unknown at research time | — | Returns `null` → "—" in UI |
| Airtable account | INTG-03 metric | Unknown at research time | — | Returns `null` → "—" in UI |
| OpenAI admin key | INTG-03 metric | Unknown — likely absent | — | Falls back to "API key válida" |
| Slack webhook | INTG-03 metric | Unknown at research time | — | Falls back to "No configurado" |

**Missing dependencies with no fallback:** None — all external API failures are handled gracefully via `Promise.allSettled` + null metric values.

**Missing dependencies with fallback:** OpenAI admin key (most likely absent; fallback designed and locked).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Slack Incoming Webhooks have no status endpoint without OAuth | External API Reference (Slack) | Low — if wrong, a metric could be added, but "Webhook activo" is already the specified output |
| A2 | GHL has no public health endpoint | External API Reference (GHL) | Low — same as above; "Configurado" is specified output |
| A3 | n8n workflow response includes `active` boolean field per workflow | External API Reference (n8n) | Medium — if the field name differs (e.g., `status: 'active'`), count logic breaks; fallback to null/dash is safe |
| A4 | `lib/automations-catalog.ts` is the correct path (not `app/lib/`) | Architecture Patterns | Low — can be resolved in Wave 0; wrong path would be a compile error |
| A5 | The project only has a regular `OPENAI_KEY`, not an Admin Key | OpenAI Metric | Low — fallback to "API key válida" is already designed; no user impact |

---

## Open Questions

1. **Does the n8n instance return `active` as a boolean on each workflow object?**
   - What we know: The n8n API has an `activate` endpoint, implying workflows carry active state
   - What's unclear: Exact field name in the list response (`active`, `isActive`, `status`)
   - Recommendation: In the metrics helper, try `w.active === true` first; if count is 0 and list is non-empty, log nothing (fail silent) and return `null`

2. **Is `OPENAI_ADMIN_KEY` present in `.env.local`?**
   - What we know: Regular `OPENAI_KEY` exists (Phase 1 config)
   - What's unclear: Whether admin key was ever added
   - Recommendation: Code defensively — check `cfg.openai.adminKey` is non-empty before attempting the usage call. Otherwise, "API key válida" is the correct output.

3. **Does the Chatwoot instance use HTTPS and a custom domain, or the default Chatwoot cloud URL?**
   - What we know: `CHATWOOT_API_URL` will be set in `.env.local`
   - What's unclear: Nothing — the probe and metric both use the configured URL, so any valid Chatwoot installation works
   - Recommendation: No action needed.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict mode — all new types must be complete, no `any`
- No Prettier — 2-space indent, single quotes, no semicolons in TSX
- `@/` alias for all imports — never relative paths
- Named function exports for page component; sub-components as `function` declarations (not exported)
- `import type` for type-only imports
- No `console.log` anywhere
- CSS custom properties for colors via `style=` inline; Tailwind for layout/spacing
- Tailwind v4 — `@import "tailwindcss"` syntax; arbitrary values with bracket notation
- All UI text in Argentine Spanish
- `'use client'` directive at top of any component using hooks
- `localStorage` access (if ever used) wrapped in `try/catch` with silent fallback

---

## Sources

### Primary (HIGH confidence)
- `apps/dashboard/app/configuracion/page.tsx` — existing page structure verified
- `apps/dashboard/lib/config.ts` — existing ConnectionConfig interface verified
- `apps/dashboard/app/api/test-connection/route.ts` — existing probe patterns verified
- `apps/dashboard/app/globals.css` — CSS tokens verified
- `.planning/phases/02-integration-hub/02-CONTEXT.md` — locked decisions
- `.planning/phases/02-integration-hub/02-UI-SPEC.md` — approved design contract
- `apps/dashboard/package.json` — dependency versions verified
- `apps/dashboard/node_modules/next/dist/docs/` — Next.js 16 Route Handler, env vars docs
- `developers.chatwoot.com/api-reference/conversations/get-conversation-counts` — conversation meta endpoint confirmed

### Secondary (MEDIUM confidence)
- `deepwiki.com/n8n-io/n8n-docs` — n8n API authentication (`X-N8N-API-KEY`) and active field confirmed
- `developers.openai.com/cookbook/examples/completions_usage_api` — Admin Key requirement for usage endpoint confirmed
- Web search results for Airtable list-bases response shape (id, name, permissionLevel)

### Tertiary (LOW confidence — assumptions)
- Slack webhook no-status-endpoint assumption (A1)
- GHL no-health-endpoint assumption (A2)
- n8n `active` field exact name (A3)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing, verified from package.json
- Architecture: HIGH — extends verified existing patterns
- Chatwoot API: HIGH — endpoint and response confirmed via official docs
- n8n API: MEDIUM — active field inferred, not directly verified in response schema
- Airtable API: HIGH — list-bases response confirmed via search + official docs
- OpenAI usage API: MEDIUM — endpoint confirmed; Admin Key requirement confirmed; project key availability unknown
- Automation catalog shape: HIGH — derived from locked CONTEXT.md + n8n skill files
- UI/component patterns: HIGH — verified against UI-SPEC.md and existing codebase

**Research date:** 2026-05-01
**Valid until:** 2026-06-01 (APIs stable; n8n workflow response schema worth re-verifying if probe fails)
