---
phase: 2
name: Integration Hub
date: 2026-04-30
status: ready-to-plan
discussed_areas:
  - hub-location
  - credentials-storage
  - metrics-loading
  - automation-brain
---

<domain>
Phase 2 delivers the Integration Hub: a unified view inside /configuracion where the admin sees all connected tools (n8n, Chatwoot, Airtable, OpenAI, Slack) with live status, real metrics, and connection testing. It also adds the Automation Catalog — a hardcoded list of predefined automations where selecting one shows exactly what needs to be configured for that automation.
</domain>

<decisions>

## Hub Location

**LOCKED: Extend /configuracion — no new screen.**

The Integration Hub lives inside `app/configuracion/page.tsx`. Do NOT create a new route (/integraciones, /hub, or similar). The existing page already has the status cards structure from Phase 1 — extend it with metrics, Chatwoot, and the automation catalog section.

The /herramientas/* pages remain as-is (individual tool views). The hub is the unified overview.

## Credentials Storage

**LOCKED: Env vars only — no credential editing UI.**

Credentials (API keys, URLs, webhook URLs) are read from `process.env` via `lib/config.ts`. There is NO form to edit credentials from the browser. INTG-04 ("add/edit/remove integration") is scoped to the hub recognizing configured vs unconfigured tools — not to a credential editor. Editing credentials means editing `.env.local` directly.

Do NOT add database storage, encrypted files, or any write path for credentials in this phase.

## Chatwoot — Missing from Phase 1

**LOCKED: Add Chatwoot to config.ts and the hub.**

`lib/config.ts` currently lacks Chatwoot. It must be added:
- Env vars: `CHATWOOT_API_URL`, `CHATWOOT_API_TOKEN`, `CHATWOOT_ACCOUNT_ID`
- Probe endpoint: GET `{url}/api/v1/profile` with `api_access_token: {token}` header — expect 200
- Metric: active conversations count from Chatwoot API

All tool references (ROADMAP, requirements, UI) include Chatwoot. Fix the gap in this phase.

## Metrics Loading

**LOCKED: Fetch on page open (parallel, on mount).**

When the admin opens /configuracion, all tool metrics load automatically — no manual refresh button required, no polling. Fire all 5 (now 6 with Chatwoot) metric requests in parallel via `Promise.all` on component mount. Show a loading skeleton per card while fetching.

Metrics to show per tool:
- **n8n:** Active workflows count (`/api/v1/workflows` response length)
- **Chatwoot:** Active conversations count (`/api/v1/accounts/{id}/conversations?status=open`)
- **Airtable:** Record count in base (`/v0/meta/bases` — show base name)
- **OpenAI:** Last 30-day token usage (from `/v1/usage` if available, else show "API key válida")
- **Slack:** Webhook configured — show "Webhook activo" (no metric available without OAuth)
- **GHL:** API key present — show "Configurado" (no public health endpoint)

## Automation Catalog (Cerebro)

**LOCKED: Hardcoded catalog in app/lib, selection-based UX.**

A new section in /configuracion (below the integration cards) shows "Automatizaciones disponibles". The admin selects a predefined automation from a catalog list and the platform shows exactly what needs to be configured.

**UX flow:**
1. Admin sees a list of automation templates (cards or rows)
2. Admin clicks one (e.g., "Seguimiento post clase de prueba")
3. A panel/modal expands showing: what this automation does, which tools it uses, and what needs to be configured (checklist of required fields/credentials)
4. Admin can mark items as configured

**Catalog structure (hardcoded in `app/lib/automations-catalog.ts`):**
Each entry has:
- `id`: unique slug
- `name`: display name
- `description`: what it does
- `tools`: which integrations it uses (ToolName[])
- `requiredConfig`: array of items the admin must configure (label, tool, envVar?)
- `n8nWorkflowHint`: optional — name/hint of the n8n workflow to look for

**Reference:** Use `/Users/juancruzmagallanes/.claude/skills/n8n-node-configuration/` skill files to understand what fields are required per n8n node type when building the `requiredConfig` for each automation entry.

**Starting catalog entries (build at least these):**
- Seguimiento post clase de prueba (Google Review / WhatsApp)
- Bienvenida nuevo socio (WhatsApp + CRM)
- Recordatorio de pago (WhatsApp)
- Reporte semanal de actividad (Slack + n8n)

The catalog is static TypeScript — no Airtable dependency, no backend. Expanding it means adding entries to the file.

</decisions>

<canonical_refs>
- `.planning/ROADMAP.md` — Phase 2 success criteria (INTG-01 to INTG-04)
- `.planning/REQUIREMENTS.md` — INTG-01, INTG-02, INTG-03, INTG-04 definitions
- `apps/dashboard/lib/config.ts` — ConnectionConfig interface to extend with Chatwoot
- `apps/dashboard/app/api/test-connection/route.ts` — Probe logic to extend with Chatwoot + metrics
- `apps/dashboard/app/configuracion/page.tsx` — Page to extend (hub + catalog)
- `/Users/juancruzmagallanes/.claude/skills/n8n-node-configuration/SKILL.md` — Node configuration patterns for automation catalog
- `/Users/juancruzmagallanes/.claude/skills/n8n-node-configuration/OPERATION_PATTERNS.md` — Operation-specific required fields
- `/Users/juancruzmagallanes/.claude/skills/n8n-node-configuration/DEPENDENCIES.md` — Property dependencies per node type
</canonical_refs>

<code_context>
**Reusable from Phase 1:**
- `components/ui/Badge.tsx` — Use for status indicators (connected/error/unconfigured)
- `components/ui/Card.tsx` — Use for integration cards and automation catalog cards
- `components/ui/StatBlock.tsx` — Use for metric values (workflow count, conversation count)
- `lib/config.ts` — Extend with Chatwoot (don't rewrite from scratch)
- `app/api/test-connection/route.ts` — Extend with Chatwoot probe and metrics endpoints

**Patterns from Phase 1:**
- Server-side fetch pattern: all credential use stays in API routes (never in Client Components)
- Client Component pattern: 'use client' + useState + fetch on useEffect for live data
- CSS tokens: var(--surface-1), var(--text-1), var(--accent), var(--critical), var(--opportunity)
- Dark theme is now active — all new UI must use var(--*) tokens, not hardcoded colors
</code_context>

<deferred_ideas>
- Credential editing UI (form to change API keys from browser) — intentionally deferred, env vars are sufficient for MVP
- Airtable-based automation catalog — deferred to Phase 3+ when Airtable integration is live
- Real-time metrics via WebSocket/SSE — deferred, on-mount fetch is sufficient for Phase 2
- Per-client automation assignment tracking — deferred to Phase 4/5 (Client Hub)
</deferred_ideas>
