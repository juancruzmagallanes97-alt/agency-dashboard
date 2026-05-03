---
phase: 3
name: Data Layer
date: 2026-05-02
status: in-discussion
discussed_areas:
  - data-architecture
---

<domain>
Phase 3 replaces every static seed in lib/data.ts with live reads from external sources (Airtable, n8n, Chatwoot, OpenAI). The architectural pivot decided in this discussion changes HOW that replacement happens: instead of wiring each page directly to a specific vendor API, the platform now has a generic service layer with interchangeable provider connectors.
</domain>

<decisions>

## Data Architecture — LOCKED: Service Layer + Interchangeable Providers

**Decision:** Build a provider/service architecture before connecting any external API.

```
lib/
  data.ts              ← Unchanged: types, helpers, static arrays (backward compat)
  providers/
    interface.ts       ← DataProvider contract (TypeScript interface)
    mock.ts            ← Wraps existing data.ts arrays — active default
    index.ts           ← Factory: DATA_PROVIDER env var selects provider
    airtable.ts        ← Stub (implement when Airtable is chosen)
    sheets.ts          ← Stub (alternative connector)
  services/
    clients.ts         ← getClientes(), getCliente(id)
    alerts.ts          ← getAlertas(), getAlertasCriticas()
    health.ts          ← getClientesEnRiesgo()
    metrics.ts         ← getOportunidadesUpsell()
    tasks.ts           ← getTareasDefault(clienteId?)
```

**Why:** Airtable vs Google Sheets vs Notion is undecided. Coupling all pages to Airtable SDK now creates expensive rework if the decision changes. The service layer means connectors are interchangeable — only the provider file changes, not the pages.

**Priority order:**
1. Core engine (services + provider interface) — independent of any vendor
2. Mock provider uses current static data — dashboard fully functional from day one
3. External connectors (Airtable/Sheets/Notion) implemented later as drop-in replacements

## Backward Compatibility — LOCKED: data.ts stays intact

`lib/data.ts` is NOT modified during this phase. All existing page imports (`import { clientes, getEstadoLabel } from '@/lib/data'`) continue to work without changes.

The mock provider (`providers/mock.ts`) imports from `lib/data.ts` and re-exposes the data through the `DataProvider` interface. New code uses services; existing code stays on direct data.ts imports until pages are explicitly migrated.

## Provider Selection — LOCKED: env var at runtime

```typescript
// providers/index.ts
const DATA_PROVIDER = process.env.DATA_PROVIDER ?? 'mock'
```

Provider options: `'mock'` (default), `'airtable'` (future), `'sheets'` (future).
No UI toggle — this is infrastructure config, not a user-facing setting.

## External Connector Decision — DEFERRED

Which external connector to implement (Airtable, Google Sheets, Notion) is explicitly NOT decided in this phase. This phase delivers the architecture. The connector decision happens when:
- The agency has real client data to migrate
- A concrete provider is chosen based on existing data location

The `airtable.ts` and `sheets.ts` stubs exist as placeholders with the correct interface signature — no implementation yet.

## n8n → Platform pipeline — DEFERRED

DATA-05 (alerts and health scores written by n8n to a data store, read by the frontend) is deferred to after the connector decision. The mock provider seeds realistic alerts and health scores in the meantime.

## Data Freshness — LOCKED: SSR on page load, no polling

Services are called server-side (in Server Components or API routes). Each page navigation fetches fresh data. No client-side polling, no manual refresh button. Next.js fetch cache is used where appropriate.

When a real connector is active, the same SSR pattern applies — the provider implementation handles caching internally (e.g., Airtable rate limits via 1-minute cache).

</decisions>

<canonical_refs>
- `.planning/ROADMAP.md` — Phase 3 success criteria (DATA-01 to DATA-05)
- `.planning/REQUIREMENTS.md` — DATA-01, DATA-02, DATA-03, DATA-04, DATA-05 definitions
- `apps/dashboard/lib/data.ts` — Source of types, helpers, and static data (read-only reference)
- `apps/dashboard/lib/providers/interface.ts` — DataProvider contract (created in this phase)
- `apps/dashboard/lib/providers/mock.ts` — Active provider wrapping data.ts (created in this phase)
</canonical_refs>

<code_context>
**Reusable from Phase 2:**
- All existing types and interfaces in lib/data.ts stay intact
- lib/config.ts — unchanged
- app/api/test-connection/route.ts — unchanged (handles live connection metrics separately)

**New infrastructure:**
- lib/providers/interface.ts — DataProvider TypeScript interface
- lib/providers/mock.ts — implements DataProvider using data.ts static arrays
- lib/providers/index.ts — factory function returning active provider
- lib/services/*.ts — async wrapper functions for page consumption

**Migration pattern:**
```typescript
// providers/mock.ts
import { clientes, tareasDefault } from '../data'
import type { DataProvider } from './interface'

export class MockProvider implements DataProvider {
  async getClientes() { return clientes }
  async getCliente(id: string) { return clientes.find(c => c.id === id) ?? null }
  // ...
}
```
</code_context>

<deferred_ideas>
- Airtable connector implementation — deferred until data source is decided
- Google Sheets connector — alternative to Airtable
- Notion connector — alternative
- n8n-written health scores and alerts in external store — deferred to post-connector decision
- Client-side optimistic updates — deferred, SSR is sufficient for MVP
</deferred_ideas>
