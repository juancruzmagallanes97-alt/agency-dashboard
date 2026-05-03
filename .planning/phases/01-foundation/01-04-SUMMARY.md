---
phase: 01-foundation
plan: 04
subsystem: auth
tags: [next-auth, credentials, login, jwt, client-component, lucide-react]

# Dependency graph
requires:
  - phase: 01-foundation
    plan: 01
    provides: "next-auth instalado, auth.ts con CredentialsProvider y bcryptjs, proxy.ts con middleware de proteccion"
  - phase: 01-foundation
    plan: 02
    provides: "Sidebar con boton Salir que llama signOut(), root layout.tsx actualizado"
provides:
  - "Pagina /login con formulario completo (email + password) sin sidebar"
  - "Layout especifico de /login que centra el card sin renderizar Sidebar"
  - "Estado loading con Loader2 spinner de lucide-react"
  - "Estado de error con mensaje exacto del UI-SPEC"
  - "Llamada a signIn('credentials', { redirect: false }) de next-auth/react"
  - "Redireccion manual a / tras login exitoso via window.location.href"
  - "Flujo de auth end-to-end verificado manualmente por el usuario"
affects:
  - auth
  - 01-05
  - future-phases

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Login layout sin Sidebar: route segment layout.tsx que solo envuelve en div centrado"
    - "signIn con redirect:false para control de estado loading/error antes de redirigir"
    - "window.location.href para redireccion post-login (compatible con next-auth v5)"
    - "onFocus/onBlur en inputs para focus ring con var(--accent) sin CSS global adicional"

key-files:
  created:
    - apps/dashboard/app/login/layout.tsx
    - apps/dashboard/app/login/page.tsx
  modified: []

key-decisions:
  - "signIn con redirect:false elegido sobre redirect:true para poder manejar loading y error state en el cliente antes de redirigir"
  - "window.location.href en lugar de router.push para redireccion post-login — compatibilidad con next-auth v5 y evitar problemas de cache del router"
  - "LoginLayout solo agrega un wrapper div centrado — root layout ya provee html/body"
  - "No se agrego SessionProvider — signIn() y signOut() no lo requieren en este contexto segun RESEARCH.md Pitfall 2"

patterns-established:
  - "Route segment layout para rutas sin sidebar: crear layout.tsx en el subdirectorio de la ruta"
  - "Client Component para paginas con estado interactivo: useState + async handler"
  - "Mensaje de error generico para no revelar si el email existe (mitigacion user enumeration)"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

# Metrics
duration: ~35min
completed: 2026-04-30
---

# Phase 1 Plan 04: Login Page Summary

**Pagina /login funcional con formulario de credenciales, spinner loading, error state y flujo de auth end-to-end verificado — login, sesion persistente y logout**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-30T15:00:00Z
- **Completed:** 2026-04-30T15:37:47Z
- **Tasks:** 1 (+ 1 checkpoint de verificacion manual aprobado)
- **Files modified:** 2

## Accomplishments
- Layout de /login sin Sidebar creado — card centrado en pantalla completa, sin html/body (el root layout los provee)
- Formulario de login con campos email y password, estados loading (Loader2 spinner) y error (mensaje rojo exacto del UI-SPEC)
- Llamada a signIn('credentials', { redirect: false }) de next-auth/react con redireccion manual a / tras exito
- Flujo end-to-end verificado manualmente por el usuario: login incorrecto muestra error, login correcto redirige al dashboard, sesion persiste en F5, logout desde Sidebar redirige a /login

## Task Commits

Cada tarea commiteada atomicamente:

1. **Task 1: Crear app/login/layout.tsx y app/login/page.tsx** - `9779c54` (feat) — mergeado en `48bee4d` via worktree

**Plan metadata:** pendiente (este SUMMARY)

## Files Created/Modified
- `apps/dashboard/app/login/layout.tsx` - Layout de ruta /login: wrapper div con flex centering, sin Sidebar, sin html/body
- `apps/dashboard/app/login/page.tsx` - Client Component con formulario de login, estados loading/error, signIn de next-auth y redireccion manual

## Decisions Made
- `signIn` con `redirect: false` para manejar loading/error en el cliente antes de redirigir manualmente via `window.location.href`
- `window.location.href` sobre `router.push` para evitar problemas de cache con next-auth v5
- Sin `SessionProvider` en el layout — `signIn()` y `signOut()` no lo requieren segun RESEARCH.md

## Deviations from Plan

None - plan ejecutado exactamente como estaba escrito.

## Issues Encountered

**Configuracion de variables de entorno requerida para el checkpoint de verificacion manual.**

El checkpoint requeria que el usuario configurara las credenciales de autenticacion antes de poder verificar el flujo. Las variables necesarias en el archivo de entorno local del proyecto son:

- `ADMIN_EMAIL` — email del administrador
- `ADMIN_PASSWORD_HASH` — hash bcrypt de la contrasena (generado con bcryptjs, 12 rounds)
- `AUTH_SECRET` — string aleatoria larga para firmar los JWT de next-auth

El usuario configuro las variables y verifico el flujo completo exitosamente.

## User Setup Required

Para que la autenticacion funcione se deben configurar tres variables de entorno en el archivo de entorno local del proyecto (`apps/dashboard/` directory):

| Variable | Descripcion |
|----------|-------------|
| `ADMIN_EMAIL` | Email del administrador |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt generado con bcryptjs (12 rounds) |
| `AUTH_SECRET` | String aleatoria larga para firmar los JWT de next-auth |

Para generar el hash de la contrasena, ejecutar desde `apps/dashboard/`:
```bash
node -e "const b = require('bcryptjs'); b.hash('tu-contrasena', 12).then(h => console.log(h))"
```

Sin estas variables, el servidor arranca pero el login falla con error de autenticacion.

## Next Phase Readiness
- Flujo de auth end-to-end completo: proxy.ts protege rutas, /login autentica con credenciales, sesion JWT persistente, logout desde Sidebar redirige a /login
- Plan 01-05 puede continuar sin bloqueos de auth
- Si se agregan mas usuarios en el futuro, el CredentialsProvider en auth.ts debera actualizarse para buscar en base de datos en lugar de variables de entorno

---

## Self-Check: PASSED

- `apps/dashboard/app/login/layout.tsx` — FOUND
- `apps/dashboard/app/login/page.tsx` — FOUND
- Commit `9779c54` incluido en merge `48bee4d` via worktree — FOUND
- Contenido verificado: layout.tsx sin Sidebar ni html/body; page.tsx con 'use client', signIn, Loader2, animate-spin, redirect:false y copy exacto del UI-SPEC

---
*Phase: 01-foundation*
*Completed: 2026-04-30*
