# Structure

**Analysis Date:** 2026-04-25

## Directory Layout

```
/Users/juancruzmagallanes/Documents/Claude/Programador/
├── agency-dashboard/          # Main Next.js application
│   ├── app/                   # Next.js App Router — pages and layout
│   │   ├── layout.tsx         # Application shell (html, Sidebar, global CSS)
│   │   ├── page.tsx           # Dashboard (root — agency overview)
│   │   ├── globals.css        # Global styles, CSS custom properties, Tailwind
│   │   ├── favicon.ico
│   │   ├── alertas/
│   │   │   └── page.tsx       # Alerts view (aggregated across all clients)
│   │   ├── clientes/
│   │   │   ├── page.tsx       # Client list
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Client detail (dynamic route)
│   │   ├── herramientas/
│   │   │   ├── page.tsx       # Tools hub
│   │   │   ├── ghl/page.tsx   # GoHighLevel dashboard
│   │   │   ├── n8n/page.tsx   # n8n workflow dashboard
│   │   │   └── openai/page.tsx# OpenAI usage dashboard
│   │   └── tareas/
│   │       └── page.tsx       # Global tasks board (cross-client)
│   ├── components/            # Shared React components
│   │   ├── Sidebar.tsx        # Global navigation (Client Component)
│   │   └── TareasCliente.tsx  # Task manager widget (Client Component)
│   ├── lib/                   # Data layer
│   │   └── data.ts            # All types, seed data, and helper functions
│   ├── public/                # Static assets (SVGs)
│   ├── AGENTS.md              # AI assistant config (Codex)
│   ├── CLAUDE.md              # AI assistant config (Claude)
│   ├── next.config.ts         # Next.js configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── postcss.config.mjs     # PostCSS (Tailwind)
│   ├── eslint.config.mjs      # ESLint 9 flat config
│   ├── package.json           # Dependencies and scripts
│   └── .env.local             # Local environment variables (gitignored)
├── agency-saas-mvp.md         # Product strategy document
├── .planning/                 # GSD planning directory
│   └── codebase/              # Codebase analysis documents
└── .git/                      # Git repository (root)
```

## Key File Locations

| Purpose | Path |
|---------|------|
| Application shell | `agency-dashboard/app/layout.tsx` |
| Root dashboard | `agency-dashboard/app/page.tsx` |
| All data + types + helpers | `agency-dashboard/lib/data.ts` |
| Global styles + theme | `agency-dashboard/app/globals.css` |
| Global navigation | `agency-dashboard/components/Sidebar.tsx` |
| Task manager widget | `agency-dashboard/components/TareasCliente.tsx` |
| Client detail page | `agency-dashboard/app/clientes/[id]/page.tsx` |
| Next.js config | `agency-dashboard/next.config.ts` |
| TypeScript config | `agency-dashboard/tsconfig.json` |
| Product strategy | `agency-saas-mvp.md` |

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js App Router convention)
- Layout: `layout.tsx`
- Components: PascalCase (`Sidebar.tsx`, `TareasCliente.tsx`)
- Data/utilities: camelCase (`data.ts`)
- Config files: framework convention (e.g., `next.config.ts`, `eslint.config.mjs`)

**Directories:**
- Route segments: kebab-case (`herramientas`, `clientes`, `alertas`, `tareas`)
- Dynamic segments: bracket notation (`[id]`)
- Utility directories: lowercase (`lib`, `components`, `public`)

**TypeScript:**
- Interfaces/Types: PascalCase (`Cliente`, `Workflow`, `Alerta`, `Tarea`)
- Functions: camelCase (`getHealthColor`, `getAlertasCriticas`, `calcularMetricas`)
- Constants/arrays: camelCase (`clientes`, `tareasDefault`, `catalogoAutomatizaciones`)
- Path alias: `@/*` maps to project root (configured in `tsconfig.json`)

## Where to Add New Code

| What | Where |
|------|-------|
| New page/route | Create `app/<route>/page.tsx` |
| Shared component | Add to `components/` (PascalCase filename) |
| New domain type | Add interface to `lib/data.ts` |
| New data/seed | Add to arrays in `lib/data.ts` |
| New helper function | Add to `lib/data.ts`, export at bottom |
| New tool dashboard | Add directory under `app/herramientas/` |
| Static assets | Add to `public/` |
| Environment variables | Add to `.env.local` (never commit) |

## Special Directories

- `.next/` — Build output, auto-generated, gitignored
- `node_modules/` — Dependencies, gitignored
- `.planning/` — GSD planning docs at repo root (not inside agency-dashboard)
- `agency-dashboard/.git/` — Separate git repo inside the subdirectory

---

*Structure analysis: 2026-04-25*
*Update when directories or major file locations change*
