# Plan 01-02 Summary — Sidebar Redesign + UI Components

## Status: Complete

## Files Created/Modified

| File | Action |
|------|--------|
| apps/dashboard/components/Sidebar.tsx | Rewritten — Lucide icons, collapse/expand 240↔56px, signOut |
| apps/dashboard/components/ui/Badge.tsx | Created — 5 variants (critical, warning, opportunity, stable, neutral) |
| apps/dashboard/components/ui/Card.tsx | Created — noPadding prop, box-shadow |
| apps/dashboard/components/ui/StatBlock.tsx | Created — 28px tabular-nums value display |
| apps/dashboard/components/ui/AlertRow.tsx | Created — imports Badge, dot color per tipo |
| apps/dashboard/components/ui/HealthBadge.tsx | Created — 4 score ranges (80/60/40/0) |
| apps/dashboard/components/ui/MetricRow.tsx | Created — label/value/unit, tabular-nums |
| apps/dashboard/app/configuracion/page.tsx | Updated — Modo Simulación warning banner added |

## Build

next build: exit 0, 13 static routes + 2 dynamic + 1 proxy (middleware)

## Decisions

- Sidebar uses `Table2` from lucide-react for Airtable nav item
- Modo Simulación banner uses `--warning-bg` / `--warning-border` / `--warning` tokens (new Notion palette)
- Configuracion page still uses legacy vars (--txt, --s2 etc.) in the existing card code — migration to new vars happens in Plan 01-03
- All UI components: named exports, no 'use client' needed (pure render)
- AlertRow: no 'use client' despite onClick prop — consumer components manage client boundary

## Self-Check: PASSED
