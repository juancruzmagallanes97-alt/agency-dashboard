---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework instalado — validación via build checks + verificación manual estructurada |
| **Config file** | none — no se instala framework en Phase 1 |
| **Quick run command** | `cd agency-dashboard && npm run build` |
| **Full suite command** | `cd agency-dashboard && npm run lint && npm run build` |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd agency-dashboard && npm run build`
- **After every plan wave:** Run `cd agency-dashboard && npm run lint && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green + manual verification checklist complete
- **Max feedback latency:** ~60 seconds (build check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-deps | W0 | 0 | AUTH-01–03 | T-1-01 | bcryptjs pure JS — no native binary | build | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-globals | W1 | 1 | DSYS-01 | — | N/A | build | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-sidebar | W1 | 1 | DSYS-02 | — | N/A | build + manual | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-ui-components | W1 | 1 | DSYS-03 | — | N/A | build | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-table-views | W1 | 1 | DSYS-04 | — | N/A | build + manual | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-auth-config | W2 | 2 | AUTH-01 | T-1-02 | Credenciales en env, nunca en código; bcrypt compare time-constant | build | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-proxy | W2 | 2 | AUTH-01 | T-1-03 | proxy.ts protege rutas — redirect a /login si no autenticado | build + manual | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-login-page | W2 | 2 | AUTH-01/02 | T-1-02 | Error state no revela si el email existe; CSRF via next-auth | build + manual | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-logout | W2 | 2 | AUTH-03 | — | signOut() limpia cookie HttpOnly — no accesible desde JS | build + manual | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-settings | W3 | 3 | CONF-01/02 | T-1-04 | process.env keys nunca expuestas al cliente — solo booleanos | build + manual | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 1-ping-routes | W3 | 3 | CONF-02 | T-1-04 | Route Handlers autenticados (session check antes de fetch externo) | build + manual | `cd agency-dashboard && npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `agency-dashboard/` — instalar dependencias: `npm install next-auth@beta bcryptjs lucide-react && npm install -D @types/bcryptjs`
- [ ] `agency-dashboard/auth.ts` — archivo de configuración next-auth v5 (stub mínimo para que el build no falle)
- [ ] `agency-dashboard/proxy.ts` — protección de rutas (Next.js 16 — NO `middleware.ts`)
- [ ] `agency-dashboard/app/api/auth/[...nextauth]/route.ts` — handlers GET/POST de next-auth

*Wave 0 establece la infraestructura mínima para que el build compile en todas las waves posteriores.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Paleta Notion-style visible | DSYS-01 | Visual — no es verificable con build | 1. `npm run dev` 2. Abrir en browser 3. Confirmar que el fondo es blanco (#FFFFFF), texto oscuro (#1A1A1A), sidebar gris (#F7F7F5) |
| Sidebar colapsa/expande | DSYS-02 | Interacción — no es verificable con build | 1. `npm run dev` 2. Click en botón toggle del workspace header 3. Confirmar que el sidebar colapsa a 56px 4. Recargar browser — confirmar que el estado persiste (localStorage) |
| Filtros de tabla funcionan | DSYS-04 | Interacción — state local de React | 1. `npm run dev` 2. Ir a `/clientes` 3. Click en chips de filtro 4. Confirmar que las filas se filtran y los chips activos cambian a accent color |
| Login correcto redirige a dashboard | AUTH-01 | Auth flow — requiere .env.local con credenciales | 1. Configurar `.env.local` con ADMIN_EMAIL, ADMIN_PASSWORD_HASH 2. `npm run dev` 3. Ir a `/login` 4. Ingresar credenciales correctas 5. Confirmar redirect a `/` |
| Login incorrecto muestra error | AUTH-01 | Auth flow — estado de error visual | 1. `npm run dev` 2. Ir a `/login` 3. Ingresar credenciales incorrectas 4. Confirmar mensaje "Email o contraseña incorrectos. Verificá tus credenciales." |
| Sesión persiste en refresh | AUTH-02 | Browser behavior — no es verificable con build | 1. Hacer login exitoso 2. F5 / Ctrl+R 3. Confirmar que sigue en dashboard, no redirige a /login |
| Logout redirige a /login | AUTH-03 | Auth flow + redirect | 1. Estar logueado 2. Click en "Salir" en Sidebar footer 3. Confirmar redirect a `/login` y que no se puede volver sin login |
| Settings muestra estado correcto | CONF-01 | Depende de .env.local del entorno | 1. Configurar al menos una env var (ej: N8N_URL) 2. `npm run dev` 3. Ir a `/settings` 4. Confirmar Badge "Conectado" para la herramienta configurada y "Sin probar" para las no configuradas |
| "Probar conexión" funciona | CONF-02 | Requiere conexión real a las herramientas | 1. Configurar env vars reales 2. `npm run dev` 3. En `/settings`, click "Probar conexión" para cada herramienta 4. Confirmar que el spinner aparece, luego muestra Badge de resultado |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
