---
phase: "02"
fixed_at: 2026-05-01T00:00:00Z
review_path: .planning/phases/02-integration-hub/02-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-05-01
**Source review:** `.planning/phases/02-integration-hub/02-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (CR-01, CR-02, WR-01 — WR-06)
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CR-01: SSRF — assertSafeUrl guard en n8n y chatwoot

**Files modified:** `apps/dashboard/app/api/test-connection/route.ts`
**Commit:** `7ec58a7`
**Applied fix:** Nueva función `assertSafeUrl(raw, label)` que permite `localhost` y `127.x.x.x` (n8n en desarrollo), bloquea rangos RFC-1918 (10.x, 192.168.x, 172.16-31.x) y siempre bloquea el endpoint de metadata cloud (169.254.169.254). La función se llama en `probe()` para n8n y chatwoot, y también en `fetchN8nMetric()` y `fetchChatwootMetric()` antes de cada `fetch()` dinámico.

---

### CR-02: `probe()` sin rama `default` — retorno implícito undefined

**Files modified:** `apps/dashboard/app/api/test-connection/route.ts`
**Commit:** `7ec58a7`
**Applied fix:** Agregada rama `default` con exhaustiveness check (`const _exhaustive: never = tool`) que retorna `{ ok: false, latencyMs: 0, error: 'Herramienta desconocida' }`. Incluida en el mismo commit que CR-01 ya que ambos modifican `probe()`.

---

### WR-01: Slack probe enviaba mensaje real al canal en cada test

**Files modified:** `apps/dashboard/app/api/test-connection/route.ts`
**Commit:** `c8606ac`
**Applied fix:** Reemplazado el `fetch` POST real a Slack por validación estructural de la URL del webhook: verifica protocolo `https:`, hostname `hooks.slack.com` y ruta que comienza con `/services/`. No hay efecto secundario ni mensaje visible en el canal.

---

### WR-02: GHL probe retorna `ok: true` para cualquier clave no-vacía

**Files modified:** `apps/dashboard/app/api/test-connection/route.ts`
**Commit:** `4045d22`
**Applied fix:** Agrega campo `error: 'Clave presente (no verificada)'` al resultado exitoso. La UI recibirá esta advertencia junto con `ok: true`, dejando claro que la verificación real de conectividad no está implementada para GHL.

---

### WR-03: `ToolName` duplicado en dos archivos

**Files modified:** `apps/dashboard/lib/automations-catalog.ts`
**Commit:** `d37a741`
**Applied fix:** Eliminada la declaración local `export type ToolName = ...` de `automations-catalog.ts`. Reemplazada por `import type { ToolName } from '@/lib/config'`. Un solo origen de verdad para la unión.

---

### WR-04: Guard incompleto en Airtable — no verifica `baseId`

**Files modified:** `apps/dashboard/app/api/test-connection/route.ts`
**Commit:** `494c86e`
**Applied fix:** En `probe('airtable')`: cambiado `const { apiKey }` por `const { apiKey, baseId }` y guard actualizado a `if (!apiKey || !baseId)`. En `fetchAirtableMetric()`: guard actualizado de `if (!apiKey)` a `if (!apiKey || !baseId)`. Ambos puntos de entrada ahora rechazan configuración parcial.

---

### WR-05: Estado del checklist no persistía entre recargas

**Files modified:** `apps/dashboard/app/configuracion/page.tsx`
**Commit:** `6bb5042`
**Applied fix:** Siguiendo el patrón de `TareasCliente.tsx`: agrega `useEffect` de restauración al montar (lee `'config-checklist'` de localStorage dentro de try/catch) y agrega escritura a localStorage dentro de `toggleChecked()` (también en try/catch). El estado del checklist sobrevive recargas de página.

---

### WR-06: Header de auth de n8n inconsistente entre `probe()` y `fetchN8nMetric()`

**Files modified:** `apps/dashboard/app/api/test-connection/route.ts`
**Commit:** `7ec58a7`
**Applied fix:** `probe('n8n')` ahora usa `'X-N8N-API-KEY': apiKey` igual que `fetchN8nMetric()`. Estandarizado en el header canónico de n8n. Incluido en el mismo commit que CR-01 ya que modifica el mismo case del switch.

---

_Fixed: 2026-05-01_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
