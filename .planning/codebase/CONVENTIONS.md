# Coding Conventions

**Analysis Date:** 2026-04-25

## Naming Patterns

**Files:**
- Page files: always `page.tsx` (Next.js App Router convention)
- Component files: PascalCase — `Sidebar.tsx`, `TareasCliente.tsx`
- Data/utility files: camelCase — `data.ts`
- CSS: `globals.css`

**Functions:**
- Helper/getter functions: `get` prefix + descriptive name in camelCase — `getEstadoColor`, `getHealthEmoji`, `getTotalAlertas`, `getAlertasCriticas`
- Event handlers inside components: plain camelCase verbs — `save`, `toggle`, `addTarea`, `toggleEstado`, `adjustProgreso`, `updateNotas`
- Page components: PascalCase matching route intent — `Dashboard`, `Clientes`, `ClientePage`, `Alertas`, `TareasPage`
- Sub-components defined in the same file: PascalCase — `WfRow`, `TareaRow`, `NavItem`, `SectionLabel`

**Variables:**
- camelCase throughout — `alertasCriticas`, `todasAlertas`, `clientesEnRiesgo`
- Unused parameters prefixed with `_` to satisfy TypeScript — `_plan`, `_score`, `_tipo`, `_clienteId`
- Short locals for maps/derived data: single letter or abbreviation — `c` (cliente), `t` (tarea), `a` (alerta), `w` (workflow), `r` (recomendacion), `hc` (health color), `ac` (alerta color)

**Types:**
- Union string literal types: use `type` keyword, not `interface` — `type Estado = 'estable' | 'atencion' | 'riesgo' | 'critico'`
- Object shapes: `interface` keyword — `interface Cliente`, `interface Workflow`, `interface Tarea`
- All types and interfaces defined in `lib/data.ts` (single source of truth)
- Type names in PascalCase — `Cliente`, `Tarea`, `AlertaTipo`, `WorkflowEstado`

**Constants / Records:**
- camelCase for lookup tables — `canalLabel`, `canalIcon`, `categoriaColor`, `prioridadColor`
- Type-safe lookups use `Record<KeyType, ValueType>` — `Record<TareaCategoria, string>`

## Code Style

**Formatting:**
- No Prettier config detected — formatting is handled implicitly by ESLint + editor defaults
- 2-space indentation (observed throughout all source files)
- Single quotes for strings in TSX/TS — `'use client'`, `'estable'`
- Semicolons omitted in TSX files (no semicolons at end of JSX statements)
- Trailing commas used in multi-line object/array literals

**Linting:**
- ESLint 9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Configuration: `agency-dashboard/eslint.config.mjs` (flat config format)
- No additional custom rules beyond Next.js defaults
- Run: `eslint` (no path args — Next.js config handles file discovery)

**TypeScript:**
- `strict: true` in `tsconfig.json` — all strict checks enabled
- `noEmit: true` — TS is type-check only, Next.js handles compilation
- Target `ES2017`, module resolution `bundler`
- `paths` alias: `@/*` maps to project root — used as `@/lib/data`, `@/components/Sidebar`

## Import Organization

**Order (observed pattern):**
1. Framework imports — `import type { Metadata } from "next"`, `import Link from 'next/link'`, `import { notFound } from 'next/navigation'`
2. React hooks (when needed) — `import { useState, useEffect } from 'react'`
3. Internal data/lib — `import { clientes, getEstadoLabel, ... } from '@/lib/data'`
4. Internal components — `import TareasCliente from '@/components/TareasCliente'`
5. CSS (layout only) — `import "./globals.css"` (only in root layout)

**Path Aliases:**
- `@/` resolves to project root: `@/lib/data`, `@/components/Sidebar`
- Never use relative paths like `../../lib/data`

**Import style:**
- Named imports for utilities — `import { clientes, getEstadoLabel, getAlertaColor } from '@/lib/data'`
- Default imports for components — `import TareasCliente from '@/components/TareasCliente'`
- `import type` for type-only imports — `import type { Metadata } from "next"`, `import type { Tarea, TareaEstado } from '@/lib/data'`

## Styling

**Approach: hybrid Tailwind + inline CSS variables**
- Tailwind v4 (PostCSS plugin) for layout, spacing, flex/grid, typography utilities
- CSS custom properties (`var(--name)`) for all theme colors — defined in `app/globals.css`
- Inline `style={{ color: 'var(--txt)', background: 'var(--s1)' }}` used when color must reference a CSS variable
- Tailwind color utilities used for semantic states: `text-emerald-400`, `text-red-400`, `text-amber-400`, `bg-emerald-400/10`, `border-emerald-400/20`

**Design tokens (all defined in `app/globals.css :root`):**
- Background layers: `--bg`, `--s1`, `--s2`, `--s3` (darkest to lightest surface)
- Borders: `--border`, `--border2`
- Text: `--txt` (primary), `--txt2` (secondary), `--txt3` (muted)
- Accent: `--accent` (#E8642A orange)

**CSS classes in `globals.css`:**
- `.hover-row`, `.hover-row2`: row hover background transition
- `.hover-border`: border color on hover
- `.nav-item`, `.nav-item.active`: sidebar navigation states

## Component Architecture

**Server vs Client components:**
- Default: Server Components (no directive, no hooks) — all `app/**/page.tsx` pages except `app/tareas/page.tsx`
- Client Components marked with `'use client'` directive at top of file:
  - `components/Sidebar.tsx` — needs `usePathname`
  - `components/TareasCliente.tsx` — needs `useState`, `useEffect`, `localStorage`
  - `app/tareas/page.tsx` — needs `useState`, `useEffect`, `localStorage`

**Component definition style:**
- `export default function ComponentName(...)` — always named function expressions, never arrow functions for top-level components
- Sub-components in the same file are plain `function` declarations (not exported) — `function WfRow(...)`, `function TareaRow(...)`
- Props typed inline as object destructuring: `{ clienteId }: { clienteId: string }`
- Props with multiple fields use explicit inline type literal, not a named Props type

**Data fetching:**
- No API calls — all data is static in `lib/data.ts`
- Dynamic params resolved with `await params` in async server components: `const { id } = await params`
- `notFound()` from `next/navigation` for 404 handling in dynamic routes

## Error Handling

**Strategy:** Minimal — silent fallback for localStorage, `notFound()` for missing entities

**Patterns:**
- `localStorage` access wrapped in `try/catch {}` with empty catch (swallowed silently):
  ```typescript
  try {
    const saved = localStorage.getItem(STORAGE_KEY(clienteId))
    if (saved) setTareas(JSON.parse(saved))
  } catch {}
  ```
- 404 for missing dynamic route param:
  ```typescript
  const c = clientes.find(c => c.id === id)
  if (!c) notFound()
  ```
- No form validation error UI — `addTarea` returns early if title is empty: `if (!form.titulo.trim()) return`
- No error boundaries defined

## Logging

- No `console.log` / `console.error` / logging framework used anywhere in the codebase
- Errors from `localStorage` are silently swallowed

## Comments

**Style:**
- Section dividers with box-drawing characters in `lib/data.ts`:
  ```typescript
  // ─── Helpers ─────────────────────────────────────────────────────────────────
  // ─── Tareas ──────────────────────────────────────────────────────────────────
  ```
- Inline JSX comments for layout sections: `{/* Header */}`, `{/* KPIs */}`, `{/* Nav */}`
- No JSDoc/TSDoc used

## Function Design

**Size:** Functions are short — helpers in `lib/data.ts` are typically 3–6 lines; event handlers in components are 5–15 lines

**Parameters:** Single typed parameter for domain helpers — `getEstadoLabel(estado: Estado)`, `getHealthEmoji(score: number)`

**Return Values:**
- Helper functions return Tailwind class strings or label strings directly — no wrapping
- Query helpers return arrays — `getTotalAlertas()`, `getClientesEnRiesgo()`
- Lookup helpers use an inline `const map = {...}; return map[key]` pattern

## Module Design

**Exports:**
- `lib/data.ts` is the single data module — all types, interfaces, constants, and helpers exported individually (named exports)
- Components export one default per file
- No barrel files (`index.ts`) — imports go directly to the source file

---

*Convention analysis: 2026-04-25*
