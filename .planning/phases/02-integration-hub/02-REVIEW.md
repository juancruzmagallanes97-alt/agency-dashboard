---
phase: "02"
status: findings
reviewed_at: 2026-05-01
---

# Phase 02 — Integration Hub: Code Review

**Reviewed:** 2026-05-01
**Depth:** standard
**Files Reviewed:** 4
**Status:** findings

## Summary

Four new files implement the Integration Hub: a configuration accessor (`lib/config.ts`), a server-side connection-test API route (`app/api/test-connection/route.ts`), a static automations catalog (`lib/automations-catalog.ts`), and the Configuracion Client Component page (`app/configuracion/page.tsx`).

The most significant issues are in the API route: an SSRF exposure via unvalidated URL env vars that the server fetches on behalf of the caller, a missing `default` branch in `probe()` that silently returns `undefined`, and the Slack probe sending a real visible message every time the user tests the connection. Several lower-severity issues cover a duplicated `ToolName` type definition, an incomplete Airtable guard, and non-persisted checklist state.

---

## Critical Issues

### CR-01: SSRF — n8n and Chatwoot URLs are fetched without host validation

**File:** `apps/dashboard/app/api/test-connection/route.ts:15, 63, 113, 132`

**Issue:** Both `probe()` and the metric helpers construct outbound `fetch()` calls by interpolating `cfg.n8n.url` and `cfg.chatwoot.apiUrl` directly. These values come from environment variables, but the endpoint is reachable from the browser without authentication. If those env vars are ever set (or manipulated) to point at internal infrastructure — cloud metadata endpoints, local caches, internal admin ports — the Next.js server will issue the request on behalf of the caller and surface the response. This is a server-side request forgery vector.

**Fix:** Add a URL safety guard before every dynamic `fetch()` call. Reject non-HTTPS schemes and loopback/private-range hostnames:

```typescript
function assertSafeUrl(raw: string, label: string): void {
  let parsed: URL
  try { parsed = new URL(raw) } catch {
    throw new Error(`${label}: URL invalida`)
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`${label}: solo se permiten URLs HTTPS`)
  }
  // Block loopback and RFC-1918 private ranges
  if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(parsed.hostname)) {
    throw new Error(`${label}: destino de red interna no permitido`)
  }
}
```

Call `assertSafeUrl(url, 'n8n')` / `assertSafeUrl(apiUrl, 'chatwoot')` before each corresponding `fetch()`.

Note: the `AbortSignal.timeout(5000)` present on each call does limit the exposure window but does not prevent the request from being made.

---

### CR-02: `probe()` is missing a `default` branch — falls through to implicit `undefined` return

**File:** `apps/dashboard/app/api/test-connection/route.ts:11-69`

**Issue:** The `switch (tool)` inside `probe()` handles all six current `ToolName` values but has no `default` case. The function is typed to return `Promise<{ ok: boolean; latencyMs: number; error?: string }>`, but if the switch falls through (e.g., due to a future `ToolName` extension or an unexpected runtime value slipping past the `TOOLS.includes(tool)` guard), the function returns `undefined`. The call site at line 101 passes that directly to `NextResponse.json()`, which serializes `undefined` as an empty body, causing a broken API response with no error signal.

TypeScript does not catch this because the narrowed union type makes all branches appear exhaustive — but only at compile time, not at runtime.

**Fix:** Add a `default` branch with an exhaustiveness check:

```typescript
default: {
  const _exhaustive: never = tool
  return { ok: false, latencyMs: 0, error: `Herramienta desconocida` }
}
```

---

## Warnings

### WR-01: Slack `probe()` sends a real message to the channel on every test

**File:** `apps/dashboard/app/api/test-connection/route.ts:44-51`

**Issue:** The Slack probe POSTs `{ text: 'ping' }` to the webhook URL. This delivers a visible message to whatever Slack channel the webhook targets every time the user clicks "Testear" or "Testear todas". Calling `testAll()` triggers six parallel `testTool()` calls, including Slack, sending the message immediately without any user confirmation. There is no UI warning that this side-effect occurs. Repeated testing will clutter the channel.

**Fix Option A (preferred):** Validate the webhook URL format without posting. Slack webhooks follow a predictable structure — a structural check provides meaningful validation without side effects:

```typescript
case 'slack': {
  const { webhookUrl } = cfg.slack
  if (!webhookUrl) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
  try {
    const parsed = new URL(webhookUrl)
    const valid =
      parsed.protocol === 'https:' &&
      parsed.hostname === 'hooks.slack.com' &&
      parsed.pathname.startsWith('/services/')
    return { ok: valid, latencyMs: Date.now() - t0, error: valid ? undefined : 'URL de webhook invalida' }
  } catch {
    return { ok: false, latencyMs: 0, error: 'URL de webhook invalida' }
  }
}
```

**Fix Option B:** If a real POST is required, add a visible warning in the UI before the Slack test button that reads "Esto enviara un mensaje de prueba a tu canal."

---

### WR-02: GHL `probe()` always returns `ok: true` for any non-empty key — reports false "Conectado"

**File:** `apps/dashboard/app/api/test-connection/route.ts:54-58`

**Issue:** The GHL case returns `{ ok: true }` as long as `apiKey` is non-empty. Any non-empty string — including an expired, revoked, or malformed key — is shown as "Conectado" in the UI, giving the user false confidence that GHL is properly configured.

**Fix:** Either make a real GHL API call to verify the key, or make the limitation explicit in code and surface it in the UI. Minimum change to prevent misleading UI state:

```typescript
case 'ghl': {
  const { apiKey } = cfg.ghl
  if (!apiKey) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
  // Real connectivity check not implemented — key presence only
  return { ok: true, latencyMs: Date.now() - t0, error: 'Formato no verificado' }
}
```

And update the `statusLabel` map or add a tooltip in the UI to clarify "Clave presente (no verificada)".

---

### WR-03: `ToolName` is defined independently in two files — dual sources of truth

**File:** `apps/dashboard/lib/config.ts:10` and `apps/dashboard/lib/automations-catalog.ts:1`

**Issue:** `type ToolName` is declared separately in both files with identical literals. They are structurally compatible today but are not the same type reference. Adding a new tool to one file without updating the other silently creates a mismatch. The project's CLAUDE.md convention mandates a single source of truth for types in `lib/data.ts`.

**Fix:** Delete the `ToolName` declaration from `automations-catalog.ts` and import from `config.ts`:

```typescript
// In automations-catalog.ts — remove local ToolName, add:
import type { ToolName } from '@/lib/config'
```

Long term, migrate both to `lib/data.ts` per the project convention.

---

### WR-04: `fetchAirtableMetric` proceeds with an empty `baseId` — guard is incomplete

**File:** `apps/dashboard/app/api/test-connection/route.ts:148-151`

**Issue:** The guard on line 150 checks only `if (!apiKey) return null`. When `baseId` is empty, the function still runs, fetches the bases list, and falls through to `bases.length > 0 ? '${bases.length} bases encontradas' : null`. This returns a degraded metric that obscures the actual misconfiguration (key set, no base ID). The Airtable `probe()` at lines 23-29 has the same partial guard — `apiKey` only.

**Fix:** Guard on both values in `fetchAirtableMetric`:

```typescript
if (!apiKey || !baseId) return null
```

And in `probe()`:
```typescript
const { apiKey, baseId } = cfg.airtable
if (!apiKey || !baseId) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
```

---

### WR-05: Checklist state is not persisted — resets on every page reload

**File:** `apps/dashboard/app/configuracion/page.tsx:189, 221-226`

**Issue:** `checkedItems` is plain `useState(new Map())`. Users who check off configuration items in the automations catalog lose their progress on every reload. The project already uses `localStorage` for persistence (in `TareasCliente.tsx`) — not using it here is an inconsistency that will frustrate users working through a multi-step configuration checklist.

**Fix:** Mirror the `TareasCliente` pattern:

```typescript
// Restore on mount
useEffect(() => {
  try {
    const raw = localStorage.getItem('config-checklist')
    if (raw) setCheckedItems(new Map(JSON.parse(raw) as [string, boolean][]))
  } catch {}
}, [])

// Persist on toggle
function toggleChecked(itemKey: string) {
  setCheckedItems(prev => {
    const next = new Map(prev)
    next.set(itemKey, !prev.get(itemKey))
    try { localStorage.setItem('config-checklist', JSON.stringify([...next])) } catch {}
    return next
  })
}
```

---

### WR-06: n8n auth header is inconsistent between `probe()` and `fetchN8nMetric()`

**File:** `apps/dashboard/app/api/test-connection/route.ts:16 vs 114`

**Issue:** `probe()` authenticates with `Authorization: Bearer ${apiKey}`, while `fetchN8nMetric()` uses `X-N8N-API-KEY: ${apiKey}`. n8n currently accepts both, but the inconsistency is a maintenance hazard. If n8n deprecates one format, one path breaks silently.

**Fix:** Standardize on `X-N8N-API-KEY` (n8n's canonical header) in both places:

```typescript
headers: { 'X-N8N-API-KEY': apiKey },
```

---

## Info

### IN-01: `MetricValues` type alias is declared inside the component function body

**File:** `apps/dashboard/app/configuracion/page.tsx:185`

**Issue:** `type MetricValues = Record<ToolName, string | null>` is declared inside `ConfiguracionPage()`. Type aliases inside function bodies are valid TypeScript but contrary to project convention (all types in `lib/data.ts` or module scope). It also makes `MetricValues` invisible to other modules.

**Fix:** Move to module scope (after imports, before the component), or to `lib/config.ts`.

---

### IN-02: `StatusDot` idle color uses border token instead of text token

**File:** `apps/dashboard/app/configuracion/page.tsx:24`

**Issue:** `idle: 'var(--border-2)'` (`#373737`) is used as the dot color for an unchecked/idle state. Against `--surface-1` (`#202020`) the contrast ratio is low. `--text-3` (`#AAAAAA`) is the project's designated muted-indicator color and would be more legible.

**Fix:**

```typescript
idle: 'var(--text-3)',
```

---

### IN-03: `useEffect` metrics fetch has no error boundary for malformed JSON

**File:** `apps/dashboard/app/configuracion/page.tsx:229-239`

**Issue:** The chain `.then(r => r.json()).then((data: MetricValues) => ...)` does not guard against a non-JSON response body (e.g., a 502 proxy error returning HTML). `r.json()` would throw, which is caught by `.catch(() => setMetricsLoading(false))` — so it fails silently. This is acceptable for MVP, but the catch handler could set a dedicated error state to show a hint in the UI rather than rendering `—` for all metrics with no explanation.

No code change required at this stage.

---

_Reviewed: 2026-05-01_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
