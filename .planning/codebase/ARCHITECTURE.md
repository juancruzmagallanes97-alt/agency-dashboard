# Architecture

**Analysis Date:** 2026-04-25

## Pattern Overview

**Overall:** Full-stack Next.js App Router SPA with static in-memory data layer

**Key Characteristics:**
- App Router file-system routing (Next.js 16 / React 19)
- Single data module serves as the entire backend — no API routes, no database calls
- Mix of Server Components (default) and Client Components (`'use client'`) within the same route tree
- All business logic lives in one file: `lib/data.ts`
- Task state is persisted client-side via `localStorage` — no server persistence

## Layers

**Routing / Page Layer:**
- Purpose: Render top-level views for each section of the dashboard
- Location: `app/` (App Router)
- Contains: `page.tsx` files for each route; `layout.tsx` for the shell
- Depends on: Data layer (`lib/data.ts`), UI Component layer
- Used by: Next.js router (file-system driven)

**UI Component Layer:**
- Purpose: Reusable interactive components shared across pages
- Location: `components/`
- Contains: `Sidebar.tsx` (global nav, Client Component), `TareasCliente.tsx` (task manager widget, Client Component)
- Depends on: Data layer types and constants
- Used by: `app/layout.tsx` (Sidebar), individual page files (TareasCliente)

**Data Layer:**
- Purpose: All types, seed data, derived data helpers, and display utilities
- Location: `lib/data.ts`
- Contains: TypeScript type definitions, hardcoded `clientes` array, `tareasDefault` array, `catalogoAutomatizaciones` array, and ~25 helper functions
- Depends on: Nothing (pure TypeScript, no external imports)
- Used by: Every page and both shared components

**Style Layer:**
- Purpose: Global theming and utility CSS
- Location: `app/globals.css`
- Contains: CSS custom properties defining the dark-mode color palette, Tailwind v4 import, hover utilities, scrollbar styles, nav-item active state
- Depends on: Tailwind CSS v4
- Used by: `app/layout.tsx` via direct import

## Data Flow

**Page Render (Server Component):**

1. Next.js router matches URL to a `page.tsx` file
2. Page imports directly from `lib/data.ts` (synchronous, in-memory)
3. Helper functions compute derived values (e.g., `getAlertasCriticas()`, `getClientesEnRiesgo()`)
4. JSX is rendered server-side and streamed to the client
5. No API calls, no database round-trips — all data is embedded in the bundle

**Dynamic Client Page (e.g., `/clientes/[id]`):**

1. URL param `id` is resolved via `params` promise (Next.js 16 async params)
2. `clientes.find(c => c.id === id)` locates the record
3. If not found, `notFound()` is called — triggers Next.js 404
4. Page renders with all sub-sections: metrics, workflow list, alerts, tasks, channels, recommendations

**Task State Flow (Client Component — `TareasCliente`):**

1. Component mounts and reads `localStorage.getItem('tareas_<clienteId>')`
2. Parsed JSON replaces the default in-memory `tareasDefault` slice
3. User interactions (toggle status, adjust progress, add task, edit notes) call `save()` which: updates React state AND writes back to `localStorage`
4. Global `/tareas` page hydrates by reading `localStorage` for each client on mount

**State Management:**
- Server-rendered pages: stateless — data read once at render time from `lib/data.ts`
- Task components: `useState` + `localStorage` persistence (no server sync)
- No global state manager (no Zustand, Redux, Context API)

## Key Abstractions

**Cliente (Client Record):**
- Purpose: Central domain entity — represents one agency client
- Examples: Defined and seeded in `lib/data.ts` (currently one record: `dc-gym`)
- Pattern: Plain TypeScript interface + hardcoded array

**Workflow:**
- Purpose: Represents one n8n workflow belonging to a client; carries live-ish metrics (uptime, executions, errors)
- Examples: Embedded in each `Cliente.workflows[]`
- Pattern: Nested typed object within Cliente

**Alerta:**
- Purpose: A flag requiring attention (critical, warning, or opportunity) scoped to a client
- Examples: Embedded in `Cliente.alertas[]`
- Pattern: Nested typed object; helper `getTotalAlertas()` aggregates across all clients

**Tarea:**
- Purpose: A task/configuration item owned by a client; can be predefined or user-created
- Examples: `lib/data.ts` → `tareasDefault[]`
- Pattern: Flat array filtered by `clienteId`; state managed client-side in `localStorage`

**Helper Functions:**
- Purpose: Compute display values (colors, labels, derived metrics) from domain types
- Examples: `getHealthColor()`, `getEstadoLabel()`, `getAlertaColor()`, `getAutomatizacionesPorCliente()`
- Pattern: Pure functions exported from `lib/data.ts`, imported where needed

## Entry Points

**Application Shell:**
- Location: `app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Renders `<html>`, imports global CSS, mounts the fixed `<Sidebar>`, wraps `{children}` in the main content area

**Dashboard (root):**
- Location: `app/page.tsx`
- Triggers: `GET /`
- Responsibilities: Agency-wide KPI summary, at-risk clients, active alerts, upsell opportunities, agency health breakdown

**Client List:**
- Location: `app/clientes/page.tsx`
- Triggers: `GET /clientes`
- Responsibilities: Table of all clients with status, plan, channels, workflow counts, health score

**Client Detail:**
- Location: `app/clientes/[id]/page.tsx`
- Triggers: `GET /clientes/<id>`
- Responsibilities: Full client view — metrics grid, system flow diagram, workflow table, alerts, tasks (TareasCliente), channels, recommendations. Async params pattern (Next.js 16).

**Alerts:**
- Location: `app/alertas/page.tsx`
- Triggers: `GET /alertas`
- Responsibilities: Aggregated alert list across all clients, grouped by type

**Tasks (global):**
- Location: `app/tareas/page.tsx`
- Triggers: `GET /tareas`
- Responsibilities: Cross-client task board; hydrates from `localStorage` per client on mount

**Tools Hub:**
- Location: `app/herramientas/page.tsx`, `app/herramientas/n8n/page.tsx`, `app/herramientas/ghl/page.tsx`, `app/herramientas/openai/page.tsx`
- Triggers: `GET /herramientas[/*]`
- Responsibilities: Aggregated tool dashboards — n8n workflow status across clients, GHL stats, OpenAI usage display

## Error Handling

**Strategy:** Minimal — rely on Next.js conventions

**Patterns:**
- `notFound()` from `next/navigation` used in `app/clientes/[id]/page.tsx` when a client ID is not found
- No try/catch in Server Components (data is in-memory and never fails)
- `localStorage` reads in Client Components wrapped in try/catch (silent fallback to defaults)
- No error boundary components defined

## Cross-Cutting Concerns

**Logging:**
- None — no logging framework. `console.log` not used in source code.

**Validation:**
- No runtime validation. TypeScript types enforce shape at compile time only.
- `TareasCliente` validates `form.titulo.trim()` before adding a task — only UI-level guard.

**Authentication:**
- None — no auth layer. The dashboard is open access.

**Theming:**
- Dark-only theme enforced via CSS custom properties in `app/globals.css`
- Color palette: `--bg`, `--s1`/`--s2`/`--s3` (surface layers), `--txt`/`--txt2`/`--txt3` (text hierarchy), `--accent` (#E8642A orange), semantic colors via Tailwind utilities (`text-emerald-400`, `text-red-400`, `text-amber-400`)
- Inline `style` props used alongside Tailwind classes throughout — both approaches coexist

**Internationalization:**
- UI text is hardcoded in Spanish (Argentine Spanish)
- Date formatting uses `'es-AR'` locale explicitly (e.g., `toLocaleDateString('es-AR', ...)`)

---

*Architecture analysis: 2026-04-25*
*Update when major patterns change*
