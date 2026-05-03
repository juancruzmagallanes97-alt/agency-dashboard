---
phase: "02"
plan: "02"
subsystem: "ui-integration-hub"
tags: [integration, ui, metrics, catalog, accordion, skeleton]
dependency_graph:
  requires:
    - lib/config.ts ToolName 6-member union (plan 02-01)
    - lib/automations-catalog.ts with 4 entries (plan 02-01)
    - GET /api/test-connection?type=metrics endpoint (plan 02-01)
  provides:
    - /configuracion page with 6 integration cards including Chatwoot
    - Metric line per card with skeleton shimmer loading state
    - Automation Catalog accordion section with 4 entries
    - ChecklistItem toggle state per catalog entry
  affects:
    - apps/dashboard/app/configuracion/page.tsx
tech_stack:
  added: []
  patterns:
    - useEffect for fetch on mount (metrics)
    - useState Map for checklist toggle state
    - Single-open accordion via selectedCatalogId string state
    - Skeleton shimmer via Tailwind animate-pulse
key_files:
  created: []
  modified:
    - apps/dashboard/app/configuracion/page.tsx
decisions:
  - "MetricValues type alias defined inside component body (not module-level) — references ToolName which is an import, keeps scoping clean"
  - "Replaced all text-xs in existing code with text-[13px] per typography rules (Rule 2 — convention enforcement)"
  - "items-start on card container instead of items-center to accommodate 3-line left column without layout shift"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-05-01"
  tasks_completed: 2
  files_modified: 1
---

# Phase 2 Plan 2: Integration Hub UI Summary

**One-liner:** Extended configuracion/page.tsx with 6 integration cards (including Chatwoot), per-card skeleton/metric lines fetched via useEffect, and an Automation Catalog accordion section with inline checklist toggle.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add state, imports, sub-components, Chatwoot to TOOLS | 8903121 | app/configuracion/page.tsx |
| 2 | Add metrics state, useEffect fetch, metric line, Catalog section | 5bde8ec | app/configuracion/page.tsx |

## What Was Built

### app/configuracion/page.tsx

**Sub-components added (unexported, above export default):**
- `ChecklistItem`: renders a toggleable checkbox row with label and optional env var hint. Checked state fills with `--accent`, label gets line-through.
- `CatalogItem`: renders one automation catalog entry. Collapsed shows name, description, tool tags and chevron. Expanded (inline accordion) shows detail panel with "Qué hace", "Qué configurar" checklist, and optional "Workflow en n8n" hint.

**State additions:**
- `MetricValues` type alias (inside component, references `ToolName`)
- `metrics: MetricValues | null` — filled by useEffect
- `metricsLoading: boolean` — true until fetch settles
- `selectedCatalogId: string | null` — single-open accordion
- `checkedItems: Map<string, boolean>` — checklist toggle state
- `toggleChecked(itemKey)` handler

**useEffect:**
- Fires on mount, fetches `/api/test-connection?type=metrics`
- On success: sets metrics + metricsLoading=false
- On error: sets metricsLoading=false only (silent — metric shows "—")

**Metric line per card:**
- While loading: `w-24 h-3 rounded animate-pulse` skeleton
- After load: `text-[13px] var(--text-3)` metric string or "—"
- Card outer div changed to `items-start` to accommodate 3-line left column

**Automation Catalog section (below cards, before Config hint):**
- Section label: 11px uppercase accent `Automatizaciones`
- Heading: `Automatizaciones disponibles`
- Sub: `Seleccioná una para ver qué necesita configurarse.`
- 4 CatalogItem entries from `automationsCatalog`
- Single-open accordion: clicking open item collapses it, clicking another collapses first

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Convention] Replaced all text-xs occurrences with text-[13px]**
- **Found during:** Task 1 acceptance criteria check
- **Issue:** Wave 1 code left 6 `text-xs` instances in header, buttons, banner, status labels — violating typography rules in CLAUDE.md and UI-SPEC
- **Fix:** Replaced all 6 occurrences with `text-[13px]` (no visual difference at 12px vs 13px is negligible; compliant with project rules)
- **Files modified:** `apps/dashboard/app/configuracion/page.tsx`
- **Commit:** 8903121 (included in Task 1 commit)

## Security Verification

Threat model T-2-05 (MetricValues in browser): MetricValues contains only formatted display strings from the route handler. No credential data.
Threat model T-2-06 (checklist state): checkedItems is in-memory useState only, no persistence, no server sync.
Threat model T-2-07 (Unicode icon aria-hidden): all Unicode icons in TOOLS array now wrapped in `<span aria-hidden="true">` per UI-SPEC constraint #12.

## Known Stubs

None — all state is wired to real data sources. Metrics come from live API route. Catalog data is hardcoded by design (locked decision: no Airtable dependency for catalog in Phase 2).

## Self-Check: PARTIAL (awaiting Task 3 verification)

- `apps/dashboard/app/configuracion/page.tsx` — EXISTS, modified
- Commits 8903121, 5bde8ec — present in apps/dashboard git log
- `tsc --noEmit` — PASSED with 0 errors
- `next build` — PASSED, exits 0
- Task 3 (checkpoint:human-verify) — PENDING
