# Phase 1: Foundation - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the visual and access layer: (1) replace the existing dark theme with the Notion-style light design system, (2) add admin authentication (login / session / logout), and (3) build the Settings screen that shows integration connection status. Every other phase builds on this foundation.

</domain>

<spec_lock>
## Visual Contract (locked via UI-SPEC)

**All visual and interaction decisions are locked.** See `01-UI-SPEC.md` for the complete contract: color palette, typography, spacing scale, component specs (Badge, Card, StatBlock, AlertRow, HealthBadge, MetricRow), sidebar structure, login page, settings screen, interaction patterns.

Downstream agents MUST read `01-UI-SPEC.md` before planning or implementing. Visual decisions are not duplicated here — this file covers implementation decisions only.

</spec_lock>

<decisions>
## Implementation Decisions

### Auth (AUTH-01–03)

- **D-01:** Auth library — **next-auth v5 (auth.js)** with `CredentialsProvider`. Current standard for Next.js App Router.
- **D-02:** Admin credentials in `.env.local` as `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`. Hash generated once manually via bcrypt before first run. No credentials in source code or git history.
- **D-03:** Session strategy — **JWT** (stateless). No database adapter needed. Works on Vercel serverless.
- **D-04:** Route protection — `middleware.ts` intercepts all routes except `/login` and static assets (`/_next/`, `/favicon.ico`). Unauthenticated users redirect to `/login`. Authenticated users on `/login` redirect to `/`.

### Config / Settings (CONF-01–02)

- **D-05:** API keys and URLs stored in `.env.local` — admin sets them manually, no UI save. Settings screen is **read-only**.
- **D-06:** Env var convention (one URL + one API key per tool):
  - n8n: `N8N_URL` + `N8N_API_KEY`
  - Chatwoot: `CHATWOOT_URL` + `CHATWOOT_TOKEN`
  - OpenAI: `OPENAI_API_KEY`
  - Airtable: `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID`
  - Slack: `SLACK_WEBHOOK_URL`
- **D-07:** Settings screen shows configured status per integration (env var present/absent → Badge "Conectado" / "Sin probar") + a **"Probar conexión"** button that does a real API ping. No input fields for entering or editing values.

### Design System Migration (DSYS-01–04)

- **D-08:** **Full visual migration in Phase 1.** `globals.css` replaced entirely with the new Notion-style token contract from UI-SPEC. All existing page files migrated from old dark token names (`--bg`, `--s1`, `--txt`, etc.) to new names (`--bg`, `--surface-1`, `--text-1`, etc.).
- **D-09:** Seed data in `lib/data.ts` stays unchanged. Phase 1 changes styles only — data migration happens in Phase 3.
- **D-10:** `Sidebar.tsx` fully rewritten: Lucide React icons, collapse/expand with `localStorage` persistence, new token names, new navigation structure from UI-SPEC.
- **D-11:** New reusable UI components go in `agency-dashboard/components/ui/`. Each component is a named export with typed props as defined in UI-SPEC.

### Claude's Discretion

- Exact implementation of each "Probar conexión" API route (how to ping n8n, Chatwoot, OpenAI, Airtable — endpoint + auth header per tool's API convention)
- Slack webhook test strategy (POST a test payload vs. just validating the URL is set)
- Internal file/module organization within `components/ui/` (one file per component vs. grouped)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual & Interaction Contract
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Complete visual and interaction contract: color palette, typography, spacing, all component specs (Badge, Card, StatBlock, AlertRow, HealthBadge, MetricRow), sidebar structure, login page layout, settings screen layout, transition rules. This is the authoritative source for everything visual.

### Phase Requirements
- `.planning/REQUIREMENTS.md` — Focus on DSYS-01–04, AUTH-01–03, CONF-01–02
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria (6 criteria define what "done" means)

### Codebase
- `agency-dashboard/AGENTS.md` — Breaking change notice for Next.js 16. Instructs agents to read `node_modules/next/dist/docs/` before writing any code. Mandatory read before implementation.
- `agency-dashboard/app/globals.css` — Current dark CSS vars to be replaced
- `agency-dashboard/components/Sidebar.tsx` — Current sidebar to be fully rewritten
- `agency-dashboard/app/layout.tsx` — Root layout to be updated (Inter font, new tokens, conditional sidebar exclusion for /login)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `agency-dashboard/lib/data.ts` — Static seed data and TypeScript types for clientes, alertas, workflows, tareas. Stays unchanged in Phase 1; components can still import from here for page shells.
- `agency-dashboard/components/TareasCliente.tsx` — Task widget (Client Component). Needs token migration but logic is reusable.

### Established Patterns
- CSS custom properties pattern: all theme values via `var(--token)`. Pattern stays — only the token values change.
- `'use client'` directive on interactive components; Server Components by default for pages.
- `@/` path alias for imports throughout (maps to project root of `agency-dashboard/`).
- Dynamic route params resolved with `await params` in async server components.

### Integration Points
- `app/layout.tsx` is the root shell — must conditionally exclude Sidebar for `/login` route. Implementation: create `app/login/layout.tsx` that does NOT import Sidebar (per UI-SPEC layout contract).
- `middleware.ts` (new file at `agency-dashboard/middleware.ts`) handles route protection via next-auth v5's `auth()` export.
- All existing page files (`app/page.tsx`, `app/clientes/page.tsx`, etc.) need inline `style` prop updates from old token names to new ones.

</code_context>

<specifics>
## Specific Ideas

- Login page at `/login` renders WITHOUT the sidebar — separate `app/login/layout.tsx` (per UI-SPEC)
- Sidebar collapse state persisted in `localStorage` key `sidebar_collapsed` (per UI-SPEC interaction patterns)
- "Probar conexión" button shows a spinner (Lucide Loader2 animate-spin) + "Probando..." while testing, then displays result as a Badge (stable/critical)
- No password reset flow in Phase 1 — the "¿Olvidaste tu contraseña?" link is static text only (per UI-SPEC copywriting contract)

</specifics>

<deferred>
## Deferred Ideas

- **shadcn/ui initialization** — UI-SPEC recommends before Phase 2, not needed for Phase 1's all-custom components
- **Password reset flow** — Out of scope for Phase 1 (single-admin internal tool)
- **Settings screen with editable inputs** — Deferred; .env.local is sufficient for MVP and avoids complexity of server-side file writes or DB storage in Phase 1

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-26*
