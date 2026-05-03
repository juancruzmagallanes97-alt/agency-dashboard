---
phase: "02"
plan: "01"
subsystem: "backend-foundation"
tags: [integration, config, api, chatwoot, metrics]
dependency_graph:
  requires: []
  provides:
    - lib/config.ts ConnectionConfig with 6 tools including chatwoot
    - lib/automations-catalog.ts with 4 automation entries
    - GET /api/test-connection?type=metrics returning 6-key JSON object
    - GET /api/test-connection?tool=chatwoot probe support
  affects:
    - apps/dashboard/app/configuracion/page.tsx (chatwoot added to TOOLS and state)
    - apps/dashboard/app/api/test-connection/route.ts (extended)
tech_stack:
  added: []
  patterns:
    - Promise.allSettled for parallel metric fetch with partial failure tolerance
    - AbortSignal.timeout(5000) on every external fetch
    - Pure TypeScript data module (no imports, named exports only)
key_files:
  created:
    - apps/dashboard/lib/automations-catalog.ts
  modified:
    - apps/dashboard/lib/config.ts
    - apps/dashboard/app/api/test-connection/route.ts
    - apps/dashboard/app/configuracion/page.tsx
decisions:
  - "Extended test-connection route with ?type=metrics branch instead of creating a new /api/metrics route — keeps credential logic centralized"
  - "Automation catalog uses local ToolName type (self-contained module) — structural typing reconciles with config.ts ToolName at usage sites"
metrics:
  duration: "2 minutes"
  completed_date: "2026-05-01"
  tasks_completed: 3
  files_modified: 4
---

# Phase 2 Plan 1: Server-side Foundation — Integration Hub Summary

**One-liner:** Extended config.ts with Chatwoot (6-tool ConnectionConfig), added ?type=metrics endpoint with Promise.allSettled parallel fetches, and created 4-entry automation catalog module.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend lib/config.ts | 1fb18f3 | lib/config.ts, app/configuracion/page.tsx |
| 2 | Extend route.ts — Chatwoot probe + metrics branch | 398629a | app/api/test-connection/route.ts |
| 3 | Create lib/automations-catalog.ts | 8469c0c | lib/automations-catalog.ts |

## What Was Built

### lib/config.ts
- `ConnectionConfig` extended with `chatwoot: { apiUrl, apiToken, accountId }` field
- `openai` field extended with `adminKey` property for OpenAI Admin API key
- `ToolName` union extended to 6 members: `'n8n' | 'airtable' | 'ghl' | 'openai' | 'slack' | 'chatwoot'`
- `getConfig()` reads `CHATWOOT_API_URL`, `CHATWOOT_API_TOKEN`, `CHATWOOT_ACCOUNT_ID`, `OPENAI_ADMIN_KEY` from env vars

### app/api/test-connection/route.ts
- `probe()` switch extended with `case 'chatwoot'`: hits `/api/v1/profile` with `api_access_token` header
- New `?type=metrics` branch in `GET` handler — returns 6-key JSON `{ n8n, chatwoot, airtable, openai, slack, ghl }`
- `Promise.allSettled` ensures one failing metric never blocks others
- 4 private metric helper functions with silent failure semantics (`string | null` return type)
- `fetchN8nMetric`: counts active workflows via `/api/v1/workflows`
- `fetchChatwootMetric`: gets open conversation count via `/api/v1/accounts/{id}/conversations/meta?status=open`
- `fetchAirtableMetric`: gets base name via `/v0/meta/bases`
- `fetchOpenAIMetric`: uses Admin Key for 30-day token usage, falls back to `'API key válida'`
- Slack and GHL use presence checks only (no HTTP calls)
- 9 total `AbortSignal.timeout(5000)` calls — all external fetches protected
- Zero `console.log` — silent failure throughout

### lib/automations-catalog.ts
- Pure TypeScript data module — no imports, all named exports
- Exports: `ToolName` type, `RequiredConfigItem` interface, `AutomationEntry` interface, `automationsCatalog` array
- 4 entries: seguimiento-post-clase, bienvenida-nuevo-socio, recordatorio-pago, reporte-semanal-actividad
- Each entry has `id`, `name`, `description`, `tools[]`, `requiredConfig[]`, optional `n8nWorkflowHint`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript compile error in configuracion/page.tsx**
- **Found during:** Task 1 — after adding 'chatwoot' to ToolName union, tsc reported `Property 'chatwoot' is missing` in the statuses Record
- **Issue:** `configuracion/page.tsx` had `useState<Record<ToolName, ToolStatus>>` with initial state missing the new `chatwoot` key; also `TOOLS` array and `testAll()` didn't include chatwoot
- **Fix:** Added `chatwoot: { state: 'idle' }` to useState initializer, added Chatwoot entry to TOOLS array, added `'chatwoot'` to testAll() tools array
- **Files modified:** `apps/dashboard/app/configuracion/page.tsx`
- **Commit:** 1fb18f3 (included in Task 1 commit)

**Note:** This fix is a subset of what Plan 02-02 will expand (full Chatwoot card UI, metrics display). The fix here only restores TypeScript correctness. Plan 02-02 owns the full UI extension.

## Security Verification

Threat model T-2-01 (allowlist check): `TOOLS.includes(tool)` allowlist now includes `'chatwoot'`.
Threat model T-2-02 (credential exposure): All metric helpers return formatted display strings only. No credential values (`apiKey`, `apiUrl`, `apiToken`) appear in any `NextResponse.json()` call.
Threat model T-2-04 (timeouts): `AbortSignal.timeout(5000)` on all 9 external fetch calls. `Promise.allSettled` prevents one slow fetch from blocking others.

## Known Stubs

None — all 3 files contain real implementation logic. The catalog entries are hardcoded by design (CONTEXT.md locked decision: no Airtable dependency for catalog in Phase 2).

## Self-Check: PASSED

- `apps/dashboard/lib/config.ts` — EXISTS, contains chatwoot, adminKey, 6-member ToolName
- `apps/dashboard/app/api/test-connection/route.ts` — EXISTS, contains metrics branch, chatwoot probe, Promise.allSettled
- `apps/dashboard/lib/automations-catalog.ts` — EXISTS, 4 entries
- Commits 1fb18f3, 398629a, 8469c0c — all present in apps/dashboard git log
- `tsc --noEmit` — PASSED with 0 errors
