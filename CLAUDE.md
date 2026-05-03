<!-- GSD:project-start source:PROJECT.md -->
## Project

**Agency Automation Intelligence SaaS**

Un segundo cerebro operativo para la agencia: un panel unificado que indexa y centraliza todas las herramientas de automatización e IA (n8n, Chatwoot, Airtable, Slack, OpenAI) sin reemplazarlas. Cada herramienta sigue haciendo su trabajo en su propio sistema; esta plataforma es el organizador central que ve todo desde un solo lugar. Responde 4 preguntas por cada cliente: qué está funcionando, qué está fallando, qué se puede mejorar y qué oportunidades nuevas existen. UX al estilo Notion.

**Core Value:** El admin abre la plataforma y ve el ecosistema completo de automatizaciones desde un solo lugar — estado de cada herramienta, clientes que necesitan atención, tareas pendientes y oportunidades de upsell — sin tener que abrir n8n, Chatwoot ni Airtable por separado.

### Constraints

- **Tech stack**: Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript — continuar con la base existente
- **Datos MVP**: Airtable como backend de datos (no base de datos custom hasta 10+ clientes)
- **Single user**: Solo Agency Admin en MVP, sin sistema de roles complejo
- **n8n como orquestador**: El motor de inteligencia y reportes corre en n8n, no en el frontend
- **No-replacement principle**: La plataforma no replica funcionalidad de las herramientas — las indexa. Deep links llevan directo al recurso exacto en cada tool.
- **Deep links**: Airtable almacena IDs y URLs de recursos de n8n/Chatwoot; el frontend los usa para construir los links
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - All application code (`.ts`, `.tsx` files)
- CSS (custom properties via `app/globals.css`) - Design tokens and global styles
## Runtime
- Node.js (current LTS implied by `@types/node ^20`)
- npm
- Lockfile: `package-lock.json` present
## Frameworks
- Next.js 16.2.4 - Full-stack React framework (App Router)
- React 19.2.4 - UI rendering
- React DOM 19.2.4 - DOM rendering
- Tailwind CSS 4.x - Utility-first CSS framework (PostCSS plugin approach, `@import "tailwindcss"` syntax)
- `@tailwindcss/postcss ^4` - PostCSS integration for Tailwind v4
- Custom CSS variables for all design tokens (defined in `app/globals.css`)
- Next.js dev server (`next dev`) - Development
- Next.js build (`next build`) - Production build
- ESLint 9 - Linting with `eslint-config-next` core-web-vitals + typescript presets
## Key Dependencies
- `next` 16.2.4 - Framework with App Router, file-based routing, Server Components
- `react` / `react-dom` 19.2.4 - Component model
- `tailwindcss ^4` - Styling system
- `typescript ^5` - Type checking
- `eslint ^9` + `eslint-config-next 16.2.4` - Code quality
- `@types/node ^20`, `@types/react ^19`, `@types/react-dom ^19` - Type definitions
## Configuration
- Target: `ES2017`
- Strict mode enabled
- Module resolution: `bundler`
- Path alias: `@/*` maps to project root
- Next.js TypeScript plugin active
- Uses flat config format (`defineConfig`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Single plugin: `@tailwindcss/postcss`
- Minimal config — no custom settings active
- `.env.local` file exists (contents not read — gitignored)
- All `.env*` files are gitignored
## Design Tokens
- `--bg` `--s1` `--s2` `--s3` — Dark background layers
- `--border` `--border2` — Border colors
- `--txt` `--txt2` `--txt3` — Text hierarchy
- `--accent` (`#E8642A`) — Orange brand accent
- Color palette: `--green`, `--red`, `--amber` referenced in component code
## Platform Requirements
- Node.js ^20
- npm
- Vercel (implied by `.vercel` in `.gitignore`)
- Or any Node.js platform supporting Next.js standalone builds
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Page files: always `page.tsx` (Next.js App Router convention)
- Component files: PascalCase — `Sidebar.tsx`, `TareasCliente.tsx`
- Data/utility files: camelCase — `data.ts`
- CSS: `globals.css`
- Helper/getter functions: `get` prefix + descriptive name in camelCase — `getEstadoColor`, `getHealthEmoji`, `getTotalAlertas`, `getAlertasCriticas`
- Event handlers inside components: plain camelCase verbs — `save`, `toggle`, `addTarea`, `toggleEstado`, `adjustProgreso`, `updateNotas`
- Page components: PascalCase matching route intent — `Dashboard`, `Clientes`, `ClientePage`, `Alertas`, `TareasPage`
- Sub-components defined in the same file: PascalCase — `WfRow`, `TareaRow`, `NavItem`, `SectionLabel`
- camelCase throughout — `alertasCriticas`, `todasAlertas`, `clientesEnRiesgo`
- Unused parameters prefixed with `_` to satisfy TypeScript — `_plan`, `_score`, `_tipo`, `_clienteId`
- Short locals for maps/derived data: single letter or abbreviation — `c` (cliente), `t` (tarea), `a` (alerta), `w` (workflow), `r` (recomendacion), `hc` (health color), `ac` (alerta color)
- Union string literal types: use `type` keyword, not `interface` — `type Estado = 'estable' | 'atencion' | 'riesgo' | 'critico'`
- Object shapes: `interface` keyword — `interface Cliente`, `interface Workflow`, `interface Tarea`
- All types and interfaces defined in `lib/data.ts` (single source of truth)
- Type names in PascalCase — `Cliente`, `Tarea`, `AlertaTipo`, `WorkflowEstado`
- camelCase for lookup tables — `canalLabel`, `canalIcon`, `categoriaColor`, `prioridadColor`
- Type-safe lookups use `Record<KeyType, ValueType>` — `Record<TareaCategoria, string>`
## Code Style
- No Prettier config detected — formatting is handled implicitly by ESLint + editor defaults
- 2-space indentation (observed throughout all source files)
- Single quotes for strings in TSX/TS — `'use client'`, `'estable'`
- Semicolons omitted in TSX files (no semicolons at end of JSX statements)
- Trailing commas used in multi-line object/array literals
- ESLint 9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Configuration: `apps/dashboard/eslint.config.mjs` (flat config format)
- No additional custom rules beyond Next.js defaults
- Run: `eslint` (no path args — Next.js config handles file discovery)
- `strict: true` in `tsconfig.json` — all strict checks enabled
- `noEmit: true` — TS is type-check only, Next.js handles compilation
- Target `ES2017`, module resolution `bundler`
- `paths` alias: `@/*` maps to project root — used as `@/lib/data`, `@/components/Sidebar`
## Import Organization
- `@/` resolves to project root: `@/lib/data`, `@/components/Sidebar`
- Never use relative paths like `../../lib/data`
- Named imports for utilities — `import { clientes, getEstadoLabel, getAlertaColor } from '@/lib/data'`
- Default imports for components — `import TareasCliente from '@/components/TareasCliente'`
- `import type` for type-only imports — `import type { Metadata } from "next"`, `import type { Tarea, TareaEstado } from '@/lib/data'`
## Styling
- Tailwind v4 (PostCSS plugin) for layout, spacing, flex/grid, typography utilities
- CSS custom properties (`var(--name)`) for all theme colors — defined in `app/globals.css`
- Inline `style={{ color: 'var(--txt)', background: 'var(--s1)' }}` used when color must reference a CSS variable
- Tailwind color utilities used for semantic states: `text-emerald-400`, `text-red-400`, `text-amber-400`, `bg-emerald-400/10`, `border-emerald-400/20`
- Background layers: `--bg`, `--s1`, `--s2`, `--s3` (darkest to lightest surface)
- Borders: `--border`, `--border2`
- Text: `--txt` (primary), `--txt2` (secondary), `--txt3` (muted)
- Accent: `--accent` (#E8642A orange)
- `.hover-row`, `.hover-row2`: row hover background transition
- `.hover-border`: border color on hover
- `.nav-item`, `.nav-item.active`: sidebar navigation states
## Component Architecture
- Default: Server Components (no directive, no hooks) — all `app/**/page.tsx` pages except `app/tareas/page.tsx`
- Client Components marked with `'use client'` directive at top of file:
- `export default function ComponentName(...)` — always named function expressions, never arrow functions for top-level components
- Sub-components in the same file are plain `function` declarations (not exported) — `function WfRow(...)`, `function TareaRow(...)`
- Props typed inline as object destructuring: `{ clienteId }: { clienteId: string }`
- Props with multiple fields use explicit inline type literal, not a named Props type
- No API calls — all data is static in `lib/data.ts`
- Dynamic params resolved with `await params` in async server components: `const { id } = await params`
- `notFound()` from `next/navigation` for 404 handling in dynamic routes
## Error Handling
- `localStorage` access wrapped in `try/catch {}` with empty catch (swallowed silently):
- 404 for missing dynamic route param:
- No form validation error UI — `addTarea` returns early if title is empty: `if (!form.titulo.trim()) return`
- No error boundaries defined
## Logging
- No `console.log` / `console.error` / logging framework used anywhere in the codebase
- Errors from `localStorage` are silently swallowed
## Comments
- Section dividers with box-drawing characters in `lib/data.ts`:
- Inline JSX comments for layout sections: `{/* Header */}`, `{/* KPIs */}`, `{/* Nav */}`
- No JSDoc/TSDoc used
## Function Design
- Helper functions return Tailwind class strings or label strings directly — no wrapping
- Query helpers return arrays — `getTotalAlertas()`, `getClientesEnRiesgo()`
- Lookup helpers use an inline `const map = {...}; return map[key]` pattern
## Module Design
- `lib/data.ts` is the single data module — all types, interfaces, constants, and helpers exported individually (named exports)
- Components export one default per file
- No barrel files (`index.ts`) — imports go directly to the source file
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- App Router file-system routing (Next.js 16 / React 19)
- Single data module serves as the entire backend — no API routes, no database calls
- Mix of Server Components (default) and Client Components (`'use client'`) within the same route tree
- All business logic lives in one file: `lib/data.ts`
- Task state is persisted client-side via `localStorage` — no server persistence
## Layers
- Purpose: Render top-level views for each section of the dashboard
- Location: `app/` (App Router)
- Contains: `page.tsx` files for each route; `layout.tsx` for the shell
- Depends on: Data layer (`lib/data.ts`), UI Component layer
- Used by: Next.js router (file-system driven)
- Purpose: Reusable interactive components shared across pages
- Location: `components/`
- Contains: `Sidebar.tsx` (global nav, Client Component), `TareasCliente.tsx` (task manager widget, Client Component)
- Depends on: Data layer types and constants
- Used by: `app/layout.tsx` (Sidebar), individual page files (TareasCliente)
- Purpose: All types, seed data, derived data helpers, and display utilities
- Location: `lib/data.ts`
- Contains: TypeScript type definitions, hardcoded `clientes` array, `tareasDefault` array, `catalogoAutomatizaciones` array, and ~25 helper functions
- Depends on: Nothing (pure TypeScript, no external imports)
- Used by: Every page and both shared components
- Purpose: Global theming and utility CSS
- Location: `app/globals.css`
- Contains: CSS custom properties defining the dark-mode color palette, Tailwind v4 import, hover utilities, scrollbar styles, nav-item active state
- Depends on: Tailwind CSS v4
- Used by: `app/layout.tsx` via direct import
## Data Flow
- Server-rendered pages: stateless — data read once at render time from `lib/data.ts`
- Task components: `useState` + `localStorage` persistence (no server sync)
- No global state manager (no Zustand, Redux, Context API)
## Key Abstractions
- Purpose: Central domain entity — represents one agency client
- Examples: Defined and seeded in `lib/data.ts` (currently one record: `dc-gym`)
- Pattern: Plain TypeScript interface + hardcoded array
- Purpose: Represents one n8n workflow belonging to a client; carries live-ish metrics (uptime, executions, errors)
- Examples: Embedded in each `Cliente.workflows[]`
- Pattern: Nested typed object within Cliente
- Purpose: A flag requiring attention (critical, warning, or opportunity) scoped to a client
- Examples: Embedded in `Cliente.alertas[]`
- Pattern: Nested typed object; helper `getTotalAlertas()` aggregates across all clients
- Purpose: A task/configuration item owned by a client; can be predefined or user-created
- Examples: `lib/data.ts` → `tareasDefault[]`
- Pattern: Flat array filtered by `clienteId`; state managed client-side in `localStorage`
- Purpose: Compute display values (colors, labels, derived metrics) from domain types
- Examples: `getHealthColor()`, `getEstadoLabel()`, `getAlertaColor()`, `getAutomatizacionesPorCliente()`
- Pattern: Pure functions exported from `lib/data.ts`, imported where needed
## Entry Points
- Location: `app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Renders `<html>`, imports global CSS, mounts the fixed `<Sidebar>`, wraps `{children}` in the main content area
- Location: `app/page.tsx`
- Triggers: `GET /`
- Responsibilities: Agency-wide KPI summary, at-risk clients, active alerts, upsell opportunities, agency health breakdown
- Location: `app/clientes/page.tsx`
- Triggers: `GET /clientes`
- Responsibilities: Table of all clients with status, plan, channels, workflow counts, health score
- Location: `app/clientes/[id]/page.tsx`
- Triggers: `GET /clientes/<id>`
- Responsibilities: Full client view — metrics grid, system flow diagram, workflow table, alerts, tasks (TareasCliente), channels, recommendations. Async params pattern (Next.js 16).
- Location: `app/alertas/page.tsx`
- Triggers: `GET /alertas`
- Responsibilities: Aggregated alert list across all clients, grouped by type
- Location: `app/tareas/page.tsx`
- Triggers: `GET /tareas`
- Responsibilities: Cross-client task board; hydrates from `localStorage` per client on mount
- Location: `app/herramientas/page.tsx`, `app/herramientas/n8n/page.tsx`, `app/herramientas/ghl/page.tsx`, `app/herramientas/openai/page.tsx`
- Triggers: `GET /herramientas[/*]`
- Responsibilities: Aggregated tool dashboards — n8n workflow status across clients, GHL stats, OpenAI usage display
## Error Handling
- `notFound()` from `next/navigation` used in `app/clientes/[id]/page.tsx` when a client ID is not found
- No try/catch in Server Components (data is in-memory and never fails)
- `localStorage` reads in Client Components wrapped in try/catch (silent fallback to defaults)
- No error boundary components defined
## Cross-Cutting Concerns
- None — no logging framework. `console.log` not used in source code.
- No runtime validation. TypeScript types enforce shape at compile time only.
- `TareasCliente` validates `form.titulo.trim()` before adding a task — only UI-level guard.
- None — no auth layer. The dashboard is open access.
- Dark-only theme enforced via CSS custom properties in `app/globals.css`
- Color palette: `--bg`, `--s1`/`--s2`/`--s3` (surface layers), `--txt`/`--txt2`/`--txt3` (text hierarchy), `--accent` (#E8642A orange), semantic colors via Tailwind utilities (`text-emerald-400`, `text-red-400`, `text-amber-400`)
- Inline `style` props used alongside Tailwind classes throughout — both approaches coexist
- UI text is hardcoded in Spanish (Argentine Spanish)
- Date formatting uses `'es-AR'` locale explicitly (e.g., `toLocaleDateString('es-AR', ...)`)
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
