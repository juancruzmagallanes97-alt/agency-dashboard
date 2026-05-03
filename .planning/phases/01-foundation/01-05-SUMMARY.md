---
phase: 01-foundation
plan: 05
subsystem: config
tags: [settings, config, api-route, server-proxy, connection-test, lucide-react]

# Dependency graph
requires:
  - phase: 01-foundation
    plan: 01
    provides: "lib/config.ts con getConfig() y ToolName, proxy de rutas auth"
  - phase: 01-foundation
    plan: 02
    provides: "Sidebar.tsx con nav item /configuracion bajo seccion Sistema"
  - phase: 01-foundation
    plan: 03
    provides: "Tokens CSS migrados (--text-1, --surface-1, --border, etc.)"
provides:
  - "lib/config.ts: ConnectionConfig interface, getConfig(), ToolName — fuente tipada de env vars de integraciones"
  - "api/test-connection/route.ts: probe server-side para n8n, airtable, openai, slack, ghl — credenciales nunca llegan al browser"
  - "app/configuracion/page.tsx: 5 tarjetas de integración con StatusDot, latency badge, botones Testear y Testear todas"
  - "Sidebar.tsx: nav item Configuración bajo seccion Sistema apuntando a /configuracion"
affects:
  - config
  - phase-02-onwards

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-side API proxy: credenciales leidas en route.ts via getConfig(), browser solo recibe { ok, latencyMs, error }"
    - "AbortSignal.timeout(5000) para todos los fetch de probe — evita cuelgues en endpoints no disponibles"
    - "Promise.all en testAll() — los 5 tests corren en paralelo desde el cliente"
    - "Estado por herramienta: Record<ToolName, ToolStatus> con states idle/testing/ok/error"
    - "Legacy CSS aliases --green/--red/--amber mapean a --opportunity/--critical/--warning en globals.css"

key-files:
  created:
    - apps/dashboard/app/api/test-connection/route.ts
  modified:
    - apps/dashboard/lib/config.ts (ya existia, committado en 01-01)
    - apps/dashboard/app/configuracion/page.tsx (ya existia, committado en 01-02)
    - apps/dashboard/components/Sidebar.tsx (ya existia con nav item, committado en 01-02)

key-decisions:
  - "Todos los archivos de Tasks 1, 3 y 4 ya estaban implementados y committados en planes anteriores (01-01 y 01-02) — solo faltaba commitear app/api/test-connection/route.ts"
  - "ghl probe es config-present check: apiKey no vacio = ok, sin endpoint publico de health disponible"
  - "slack probe hace POST real al webhook con payload {text:'ping'} — respuesta 200 confirma webhook activo"
  - "AbortSignal.timeout(5000) elegido sobre setTimeout manual — API nativa de Node.js 18+, limpia y sin cleanup"

patterns-established:
  - "Server-side proxy pattern para credenciales: env vars leidas en route.ts, frontend recibe solo resultado boolean"
  - "ConnectionConfig como interfaz tipada centraliza todos los nombres de env vars en un lugar"

requirements-completed: [CONF-01, CONF-02]

# Metrics
duration: ~20min
completed: 2026-04-30
---

# Phase 1 Plan 05: Settings / Config Screen Summary

**Pantalla /configuracion con 5 tarjetas de integracion y proxy server-side que testea conexiones sin exponer credenciales al browser — CONF-01 y CONF-02 completados**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-04-30
- **Tasks:** 5 (Tasks 1, 3, 4 ya implementados en planes anteriores; Task 2 committado en este plan; Task 5 verificacion de build)
- **Files committed this plan:** 1 (app/api/test-connection/route.ts)

## Accomplishments

- `lib/config.ts` con `ConnectionConfig` interface, `getConfig()` y `ToolName` union type — valores de env vars con default string vacio, no undefined
- `app/api/test-connection/route.ts` — GET handler con probe por herramienta: n8n (`/api/v1/workflows`), airtable (`/v0/meta/bases`), openai (`/v1/models`), slack (POST webhook), ghl (config-present). Timeout de 5s via `AbortSignal.timeout`. Devuelve `{ ok, latencyMs, error? }`. Retorna 400 para tool desconocida.
- `app/configuracion/page.tsx` — Client Component con estado `Record<ToolName, ToolStatus>`, StatusDot, latency badge, boton Testear por card y boton Testear todas que hace `Promise.all` en paralelo
- `components/Sidebar.tsx` — nav item "Configuracion" bajo seccion "Sistema" con icono `Settings` de lucide-react
- Build `next build` pasa clean: 0 TypeScript errors, 0 ESLint errors, todas las rutas compiladas

## Task Commits

| Task | Descripcion | Commit | Archivos |
|------|-------------|--------|----------|
| 1 | lib/config.ts | committado en 01-01 (`947387d`) | lib/config.ts |
| 2 | api/test-connection/route.ts | `b77d99a` | app/api/test-connection/route.ts |
| 3 | configuracion/page.tsx | committado en 01-02 (`c720fa3`) | app/configuracion/page.tsx |
| 4 | Sidebar nav item | committado en 01-02 (`a878267`) | components/Sidebar.tsx |
| 5 | Build verification | — (no files) | — |

## Files Created/Modified

- `apps/dashboard/app/api/test-connection/route.ts` — Proxy server-side: probe para 5 herramientas, credenciales nunca al browser, AbortSignal.timeout 5s, respuesta tipada

## Decisions Made

- Tasks 1, 3 y 4 ya estaban implementados y committados en planes 01-01 y 01-02 — este plan solo necessito commitear la route de test-connection que estaba untracked
- ghl usa config-present check (apiKey no vacio) porque no hay endpoint publico de health en GoHighLevel
- slack hace POST real con `{text:'ping'}` al webhook — respuesta 200 confirma que el webhook esta activo y la URL es valida
- `AbortSignal.timeout(5000)` sobre `setTimeout` manual: API nativa Node.js 18+, sin cleanup manual necesario

## Deviations from Plan

### Pre-implementacion detectada

**[Situacion normal] Tasks 1, 3 y 4 ya implementados en planes anteriores**
- **Encontrado durante:** Inspeccion inicial de archivos
- **Situacion:** `lib/config.ts`, `app/configuracion/page.tsx` y el nav item en `Sidebar.tsx` ya existian y estaban committados desde 01-01 y 01-02. Solo `app/api/test-connection/route.ts` estaba untracked.
- **Accion:** Commitear el archivo untracked sin modificaciones. No se rehizo trabajo existente.
- **Resultado:** Build pasa clean.

## Known Stubs

Ninguno — la pantalla de configuracion no tiene stubs de datos. Los estados de conexion comienzan en `idle` ("Sin testear") que es el comportamiento correcto para herramientas no testeadas.

## Threat Flags

Ninguno — el plan maneja correctamente la superficie de seguridad relevante: credenciales server-side, sin exposicion al browser.

---

## Self-Check: PASSED

- `apps/dashboard/app/api/test-connection/route.ts` — FOUND (committed `b77d99a`)
- `apps/dashboard/lib/config.ts` — FOUND (committed `947387d`)
- `apps/dashboard/app/configuracion/page.tsx` — FOUND (committed `c720fa3`)
- `apps/dashboard/components/Sidebar.tsx` nav item configuracion — FOUND (committed `a878267`)
- `next build` — PASSED (14/14 pages, 0 TypeScript errors, 0 ESLint errors)
- CONF-01 (config storage + typed reader) — SATISFIED via lib/config.ts
- CONF-02 (live status UI + connection test) — SATISFIED via page.tsx + route.ts

---
*Phase: 01-foundation*
*Completed: 2026-04-30*
