# Concerns

**Analysis Date:** 2026-04-25

## Summary

The codebase is a working UI prototype with hardcoded static data. The main concerns are: all displayed metrics are fiction, no authentication, no real backend, and several bugs with CSS variables and math edge cases.

---

## Tech Debt

### TD-01: All data is hardcoded static fiction
- **Location:** `agency-dashboard/lib/data.ts`
- **Severity:** High
- **Description:** Every metric (uptime %, execution counts, token costs, health scores, alert counts) is a hardcoded integer. No real API calls exist anywhere in the codebase. The entire dashboard is a static mock.
- **Impact:** Cannot be used in production without replacing the entire data layer.

### TD-02: Hardcoded bare IP address
- **Location:** `agency-dashboard/lib/data.ts`, `agency-dashboard/app/herramientas/page.tsx`, `agency-dashboard/app/herramientas/n8n/page.tsx`
- **Severity:** Medium
- **Description:** `http://129.121.56.240` (n8n server URL) is hardcoded in multiple files. Should be in `.env.local` as `NEXT_PUBLIC_N8N_URL`.
- **Impact:** Environment-specific config in source; breaks when server changes.

### TD-03: `localStorage` as sole persistence
- **Location:** `agency-dashboard/components/TareasCliente.tsx`, `agency-dashboard/app/tareas/page.tsx`
- **Severity:** Medium
- **Description:** Task state is browser-local only. No multi-device sync, no server persistence, no multi-user support.
- **Impact:** Tasks lost on browser clear; different devices see different states.

### TD-04: Duplicated task toggle logic
- **Location:** `agency-dashboard/components/TareasCliente.tsx` and `agency-dashboard/app/tareas/page.tsx`
- **Severity:** Medium
- **Description:** Task state toggle is implemented differently in both files. They can diverge and produce inconsistent results.
- **Impact:** Subtle bugs when the same task is toggled from different views.

### TD-05: OpenAI page hardcoded to one client
- **Location:** `agency-dashboard/app/herramientas/openai/page.tsx`
- **Severity:** Low
- **Description:** The OpenAI usage page is hardcoded to show DC Gym data only. Not generalized across clients.

### TD-06: Fragile workflow name matching
- **Location:** `agency-dashboard/lib/data.ts` — `getAutomatizacionesPorCliente()`
- **Severity:** Low
- **Description:** Matches automations to clients by workflow display name string. Any rename breaks the association.

---

## Bugs

### BUG-01: Undefined CSS custom properties
- **Location:** Multiple page files
- **Severity:** High
- **Description:** `var(--green)`, `var(--red)`, `var(--amber)` are referenced in 5+ files but never defined in `agency-dashboard/app/globals.css`. These silently fall back to `undefined`/transparent — affected elements have no color.
- **Affected files:** Search for `var(--green)`, `var(--red)`, `var(--amber)` across `app/`

### BUG-02: Division by zero
- **Location:** `agency-dashboard/app/herramientas/ghl/page.tsx:23`
- **Severity:** Medium
- **Description:** Divides by `clientes.length` without a zero guard. If `clientes` is ever empty, produces `NaN`/`Infinity` in the UI.

### BUG-03: `Math.max` on empty array
- **Location:** `agency-dashboard/app/clientes/[id]/page.tsx:21`
- **Severity:** Medium
- **Description:** `Math.max(...emptyArray)` returns `-Infinity` when a client has no channels. The result is used in display logic, producing incorrect output.

---

## Security

### SEC-01: No authentication
- **Severity:** Critical (for production)
- **Description:** Zero auth layer. The dashboard exposes client emails, internal service URLs, n8n workflow links, and operational health data with no login required.
- **Note:** Acceptable for local/internal MVP; must be addressed before any external access.

### SEC-02: n8n links over plain HTTP
- **Location:** `agency-dashboard/lib/data.ts`
- **Description:** All n8n links use `http://` (not `https://`). Credentials and data are transmitted unencrypted.

### SEC-03: `.env.local` exists — verify contents
- **Location:** `agency-dashboard/.env.local`
- **Description:** File exists but no `process.env` calls exist in source — its contents may be unused. Verify it's in `.gitignore` (it is, per Next.js defaults) and confirm no secrets are accidentally referenced.

---

## Missing Features

### MISS-01: No alert resolution UI
- **Description:** `Alerta` type has a `resuelta` boolean field, but no button or flow in the UI to mark an alert as resolved.

### MISS-02: No client onboarding flow
- **Description:** Adding a new client requires editing TypeScript directly in `lib/data.ts`. No UI or admin form exists.

### MISS-03: Static health score
- **Description:** `healthScore` is a hardcoded integer per client. No computation from actual workflow metrics.

### MISS-04: No error boundaries
- **Description:** No React error boundary components. A render error in any client component will bubble up and crash the entire page.

---

## Tests

Zero tests. No test runner installed. See `TESTING.md` for recommendations.

---

*Concerns analysis: 2026-04-25*
*Update as issues are resolved or discovered*
