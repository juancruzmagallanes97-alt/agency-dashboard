---
phase: 01-foundation
plan: "03"
subsystem: foundation
tags: [css-migration, design-tokens, ui-filters, client-component, table-sort]
dependency_graph:
  requires:
    - 01-01 (Notion-style CSS tokens defined in globals.css)
    - 01-02 (Sidebar and UI components)
  provides:
    - All 9 pages migrated to new Notion-style tokens
    - Clientes page with filter chips and sortable columns
  affects:
    - apps/dashboard/app/clientes/page.tsx (converted to Client Component)
    - All page files in apps/dashboard/app/
    - apps/dashboard/components/TareasCliente.tsx
tech_stack:
  added: []
  patterns:
    - CSS custom property migration (old dark tokens → Notion-style tokens)
    - Client Component conversion for interactive table filtering
    - React useState for filter and sort state
    - Lucide-react ArrowUp/ArrowDown for sort indicators
key_files:
  created: []
  modified:
    - apps/dashboard/app/clientes/page.tsx
    - apps/dashboard/app/page.tsx
    - apps/dashboard/app/alertas/page.tsx
    - apps/dashboard/app/tareas/page.tsx
    - apps/dashboard/app/herramientas/page.tsx
    - apps/dashboard/app/herramientas/n8n/page.tsx
    - apps/dashboard/app/herramientas/ghl/page.tsx
    - apps/dashboard/app/herramientas/openai/page.tsx
    - apps/dashboard/app/configuracion/page.tsx
    - apps/dashboard/components/TareasCliente.tsx
decisions:
  - key: include-configuracion-migration
    choice: Migrate app/configuracion/page.tsx even though not in plan list
    rationale: File had old tokens (var(--s1), var(--txt), var(--border2)); leaving it would break visual consistency; Rule 2 (missing critical functionality) applied
  - key: th-as-div-in-grid
    choice: Use th elements with inline display:flex inside a CSS grid container
    rationale: Plan specified th elements for semantics; grid container was already div; hybrid approach works and passes TypeScript
metrics:
  duration: "~20 minutes"
  completed: "2026-04-30"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 10
---

# Phase 01 Plan 03: CSS Token Migration and Client Filters Summary

**One-liner:** Migrated 9 pages from old dark CSS tokens to Notion-style tokens and converted clientes/page.tsx to a Client Component with estado filter chips and sortable columns.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Migrate CSS tokens in 9 existing files | 9623b06 | All app/*.tsx + TareasCliente.tsx + configuracion |
| 2 | Add filter chips and sortable columns to clients view (DSYS-04) | 8a3e59d | apps/dashboard/app/clientes/page.tsx |

## Token Migration Details

### Mapping Applied

| Token viejo | Token nuevo | Files affected |
|-------------|-------------|----------------|
| `var(--txt)` | `var(--text-1)` | herramientas/*, ghl, n8n, openai, configuracion, TareasCliente |
| `var(--txt2)` | `var(--text-2)` | herramientas/*, ghl, n8n, openai, configuracion, TareasCliente |
| `var(--txt3)` | `var(--text-3)` | All 10 files |
| `var(--s1)` | `var(--surface-1)` | clientes, herramientas/*, ghl, n8n, openai, configuracion, TareasCliente |
| `var(--s2)` | `var(--surface-2)` | clientes, herramientas/*, ghl, openai, configuracion, TareasCliente |
| `var(--s3)` | `var(--surface-2)` | herramientas/*, TareasCliente |
| `var(--border2)` | `var(--border-2)` | herramientas, n8n, ghl, openai, configuracion, TareasCliente |

### CSS Helper Classes Replaced

| Clase vieja | Reemplazo | File |
|-------------|-----------|------|
| `hover-row` | `hover:bg-[var(--surface-1)]` | app/clientes/page.tsx |
| `hover-row2` | `hover:bg-[var(--surface-1)]` | components/TareasCliente.tsx |
| `hover-border` | Eliminada (sin reemplazo) | app/herramientas/page.tsx |

## Filter Chips and Sortable Columns (DSYS-04)

### Implemented in `app/clientes/page.tsx`

**Filter chips** (por estado):
- Todos, Estable, Atención, En Riesgo, Crítico
- Chip activo: `var(--accent-bg)` background, `rgba(35,131,226,0.3)` border, `var(--accent)` color
- Chip inactivo: `var(--surface-1)` background, `var(--border)` border
- Botón "Limpiar filtros" aparece cuando hay un filtro activo

**Sortable columns**:
- Cliente (nombre), Plan, Health Score
- Click inicial → asc, segundo click → desc, tercer click → sin orden
- SortIndicator sub-component muestra ArrowUp/ArrowDown de lucide-react

**Estado del componente**:
- `filtroEstado: FilterEstado` — 'todos' | 'estable' | 'atencion' | 'riesgo' | 'critico'
- `sortCol: SortColumn` — 'nombre' | 'healthScore' | 'plan' | null
- `sortDir: SortDirection` — 'asc' | 'desc'

## Verification Results

```
grep tokens viejos → 0 líneas (PASS)
grep clases helper viejas → 0 líneas (PASS)
grep var(--surface-1) en app/page.tsx → 7 ocurrencias (PASS)
grep var(--surface-2) en TareasCliente.tsx → 14 ocurrencias (PASS)
grep filtroEstado en clientes/page.tsx → 5 (PASS)
grep handleSort en clientes/page.tsx → 4 (PASS)
npm run build → exit 0, 13 static pages (PASS)
```

## Deviations from Plan

### Auto-added Issues (Rule 2)

**1. [Rule 2 - Missing] Migrated app/configuracion/page.tsx**
- **Found during:** Task 1 grep scan
- **Issue:** configuracion/page.tsx had 14 occurrences of old tokens (var(--s1), var(--txt), var(--border2), etc.) — not listed in the 9-file plan but was clearly broken
- **Fix:** Applied same token substitution mapping to configuracion/page.tsx
- **Files modified:** apps/dashboard/app/configuracion/page.tsx
- **Commit:** 9623b06

### Staged Previously Untracked Pages

The dashboard git repo had most page files as untracked (they existed on disk but were not committed to the dashboard sub-repo). During Task 1, these were staged and committed alongside the token migration:
- app/alertas/page.tsx, app/clientes/page.tsx, app/clientes/[id]/page.tsx
- app/herramientas/*.tsx, app/tareas/page.tsx
- components/TareasCliente.tsx, lib/data.ts, lib/config.ts

This was expected per the 01-01 summary note about the nested git repo structure.

## Known Stubs

None — all migrations apply real tokens. Filter and sort state is functional, not placeholder.

## Threat Flags

None — this plan only migrates CSS tokens and adds local React state; no new network endpoints or security surfaces introduced.

## Self-Check

- [x] 9+ files modified: CONFIRMED (10 files)
- [x] grep tokens viejos = 0: CONFIRMED
- [x] grep clases helper = 0: CONFIRMED
- [x] clientes/page.tsx has 'use client': CONFIRMED
- [x] clientes/page.tsx has useState: CONFIRMED
- [x] clientes/page.tsx has filtroEstado: CONFIRMED (5 occurrences)
- [x] clientes/page.tsx has handleSort: CONFIRMED (4 occurrences)
- [x] clientes/page.tsx has ArrowUp: CONFIRMED
- [x] clientes/page.tsx has "Limpiar filtros": CONFIRMED
- [x] Task 1 commit 9623b06: CONFIRMED
- [x] Task 2 commit 8a3e59d: CONFIRMED
- [x] next build exits 0: CONFIRMED

## Self-Check: PASSED
