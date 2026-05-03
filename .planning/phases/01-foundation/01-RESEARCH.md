# Phase 1: Foundation - Research

**Researched:** 2026-04-26
**Domain:** Next.js 16 App Router / next-auth v5 / CSS design system migration / API connectivity testing
**Confidence:** HIGH (auth, proxy naming, Next.js 16 docs) / MEDIUM (API ping endpoints for external tools)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Auth library — next-auth v5 (auth.js) con `CredentialsProvider`
- **D-02:** Credenciales del admin en `.env.local` como `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`. Hash generado manualmente con bcrypt antes del primer run
- **D-03:** Session strategy — JWT (stateless). Sin database adapter. Funciona en Vercel serverless
- **D-04:** Route protection — `middleware.ts` intercepta todas las rutas excepto `/login` y assets estáticos (`/_next/`, `/favicon.ico`). Usuarios no autenticados redirigen a `/login`. Usuarios autenticados en `/login` redirigen a `/`
- **D-05:** API keys y URLs almacenadas en `.env.local` — el admin las configura manualmente. La pantalla de Settings es solo lectura
- **D-06:** Convención de env vars: N8N_URL, N8N_API_KEY, CHATWOOT_URL, CHATWOOT_TOKEN, OPENAI_API_KEY, AIRTABLE_API_KEY, AIRTABLE_BASE_ID, SLACK_WEBHOOK_URL
- **D-07:** Settings muestra estado configurado por integración (env var presente/ausente → Badge "Conectado" / "Sin probar") + botón "Probar conexión" que hace un ping real. Sin inputs para editar valores
- **D-08:** Migración visual completa en Phase 1. `globals.css` reemplazado íntegramente con el nuevo contrato de tokens Notion-style del UI-SPEC. Todos los archivos de páginas existentes migrados de tokens oscuros antiguos (`--bg`, `--s1`, `--txt`, etc.) a los nuevos (`--bg`, `--surface-1`, `--text-1`, etc.)
- **D-09:** Seed data en `lib/data.ts` permanece sin cambios. Phase 1 cambia solo estilos — la migración de datos ocurre en Phase 3
- **D-10:** `Sidebar.tsx` completamente reescrito: íconos Lucide React, colapso/expansión con persistencia en `localStorage`, nuevos tokens, nueva estructura de navegación del UI-SPEC
- **D-11:** Nuevos componentes UI reutilizables en `agency-dashboard/components/ui/`. Cada componente tiene exports con nombre y props tipadas según el UI-SPEC

### Claude's Discretion

- Implementación exacta de cada ruta API "Probar conexión" (cómo hacer ping a n8n, Chatwoot, OpenAI, Airtable — endpoint + auth header por convención de la API de cada herramienta)
- Estrategia de test del webhook de Slack (POST de payload de prueba vs. solo validar que la URL esté configurada)
- Organización interna de archivos/módulos dentro de `components/ui/` (un archivo por componente vs. agrupados)

### Deferred Ideas (OUT OF SCOPE)

- Inicialización de shadcn/ui — recomendado antes de Phase 2, no requerido para los componentes todos-custom de Phase 1
- Flujo de recuperación de contraseña — fuera de scope para Phase 1 (herramienta interna de un solo admin)
- Pantalla de Settings con inputs editables — diferido; `.env.local` es suficiente para el MVP
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSYS-01 | Admin ve la app con estética Notion — paleta neutra, tipografía Inter, whitespace generoso | Verified CSS token contract in UI-SPEC + next/font/google API confirmed in Next.js 16 |
| DSYS-02 | Sidebar colapsable con jerarquía, íconos, estado activo y secciones agrupadas | Lucide React 1.11.0 compatible con React 19 — implementación detallada en UI-SPEC |
| DSYS-03 | Componentes base reutilizables: Badge, Card, StatBlock, AlertRow, HealthBadge, MetricRow | Interfaces y specs visuales completamente definidos en UI-SPEC — implementación custom sin deps externas |
| DSYS-04 | Vistas tipo tabla/database con filtros y agrupación visual | Pattern estándar con `useState` — sin lib externa necesaria |
| AUTH-01 | Admin puede hacer login con email/password | next-auth v5 beta + CredentialsProvider — API verificada en authjs.dev |
| AUTH-02 | Sesión persiste entre refreshes de browser | JWT cookie strategy en next-auth v5 — comportamiento por defecto |
| AUTH-03 | Admin puede hacer logout desde cualquier pantalla | `signOut()` server action desde Sidebar footer |
| CONF-01 | Admin configura URLs y API keys desde pantalla de Settings | Pantalla read-only que muestra estado de env vars — Route Handler para "Probar conexión" |
| CONF-02 | La plataforma verifica que cada conexión está activa y muestra su estado | Route Handlers que pingen cada API externa — endpoints investigados por herramienta |
</phase_requirements>

---

## Summary

Esta investigación cubre los tres workstreams de Phase 1 — migración del design system, autenticación y pantalla de Settings — con foco en los riesgos técnicos identificados: la compatibilidad de next-auth v5 con Next.js 16, el renombrado de `middleware.ts` a `proxy.ts` en Next.js 16, y los endpoints correctos para pingear cada integración externa.

El hallazgo más crítico es que **Next.js 16 renombra `middleware` a `proxy`**. El archivo convencional es ahora `proxy.ts` (no `middleware.ts`). El CONTEXT.md D-04 usa el nombre legacy. La decisión D-04 permanece válida en su intención — proteger rutas — pero el archivo debe llamarse `proxy.ts` y exportar `proxy`, no `middleware`. next-auth v5 ya fue actualizado para documentar explícitamente este cambio: `export { auth as proxy } from "@/auth"`.

El segundo hallazgo importante es que **`proxy.ts` en Next.js 16 corre en Node.js runtime por defecto** (ya no en Edge por defecto). Esto elimina el problema de Edge/bcrypt: `bcryptjs` puede usarse tanto en el proxy como en los server actions de login sin preocupaciones de compatibilidad. No se necesita una solución especial para hash comparison.

El design system es el workstream más mecánico: 256 referencias a tokens CSS viejos en 9 archivos de página — gran parte es trabajo de búsqueda-y-reemplazo guiado por la tabla de mappeo del CONTEXT.md.

**Recomendación primaria:** Usar `next-auth@beta` (5.0.0-beta.31), `bcryptjs` (pure JS, compatible con Node.js runtime), `lucide-react` (1.11.0), sin dependencias adicionales.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Login form UI | Browser/Client | — | `'use client'` para useState + useActionState |
| Credencial validation (bcrypt compare) | API/Backend (Server Action) | — | Nunca en cliente; Server Action con `'use server'` |
| JWT session creation/destruction | API/Backend | — | `createSession()` / `deleteSession()` con `next/headers` cookies API |
| Route protection (redirect unauth users) | Proxy (proxy.ts) | — | Intercepta antes del render; optimistic check del cookie |
| Session read in Server Components | Frontend Server (SSR) | — | `auth()` call directo, sin fetch |
| Session read in Client Components | Browser/Client | Frontend Server | `useSession()` requiere `SessionProvider` wrapper |
| API ping routes ("Probar conexión") | API/Backend (Route Handler) | — | Fetch externo desde el servidor — evita CORS y no expone keys al cliente |
| CSS tokens / design system | Browser/Client | — | CSS custom properties en `:root`, sin server involvement |
| Settings screen (read env vars) | Frontend Server (SSR) | — | Server Component lee `process.env.*` directamente |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next-auth` | `5.0.0-beta.31` (instalar como `next-auth@beta`) | Auth completa: CredentialsProvider, JWT session, route protection | Estándar oficial para Next.js App Router; peerDep: next ^16.0.0 confirmado [VERIFIED: npm registry] |
| `bcryptjs` | `3.0.3` | Hash y comparación de passwords — pure JS, sin binarios nativos | Compatible con Node.js runtime del proxy; no requiere compilación nativa [VERIFIED: npm registry] |
| `lucide-react` | `1.11.0` | Íconos SVG en Sidebar y componentes UI | Peer dep: react ^19.0.0 confirmado; es la decisión bloqueada D-10 [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/bcryptjs` | `2.4.x` | TypeScript types para bcryptjs | Siempre que se instale bcryptjs en proyecto TypeScript |
| `jose` | `^5.x` | JWT sign/verify en Edge si se necesitara | Solo si en algún punto se mueve a Edge runtime — NO necesario en Phase 1 con Node.js runtime |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `bcryptjs` | `bcrypt` (native) | `bcrypt` requiere compilación de binarios nativos — falla en Vercel serverless si el build no lo linkea bien. `bcryptjs` pure JS es más portable. |
| `bcryptjs` | `argon2` | `argon2` es más seguro pero solo via `@node-rs/argon2` que tiene el mismo problema de binarios. Para un admin interno, bcryptjs con cost factor 12 es más que suficiente. |
| next-auth v5 beta | Better Auth | Better Auth es GA y moderno pero requiere DB adapter incluso para JWT — más complejidad de la necesaria para single-admin. |
| Custom JWT (jose) | next-auth v5 | Más control pero implementar CredentialsProvider + cookie segura + refresh desde cero tiene superficie de error alta. next-auth v5 lo maneja todo. |

**Installation:**
```bash
cd agency-dashboard
npm install next-auth@beta bcryptjs lucide-react
npm install --save-dev @types/bcryptjs
```

**Version verification:** Verificado contra npm registry el 2026-04-26:
- `next-auth@beta` → 5.0.0-beta.31; peerDep `next: ^14.0.0-0 || ^15.0.0 || ^16.0.0` — compatible
- `bcryptjs` → 3.0.3
- `lucide-react` → 1.11.0; peerDep `react: ^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0` — compatible con React 19

---

## Architecture Patterns

### System Architecture Diagram

```
Browser
  │
  ▼ HTTP request
proxy.ts  (Next.js 16 proxy — Node.js runtime)
  │  export { auth as proxy } from "@/auth"
  │  checks JWT cookie → redirect /login if missing
  │
  ▼ request passes
App Router
  ├── /login           (Server Component + Client form)
  │     └── Server Action: login(formData)
  │           └── CredentialsProvider.authorize()
  │                 └── bcryptjs.compare(password, ADMIN_PASSWORD_HASH)
  │                 └── createSession() → Set JWT cookie
  │
  ├── / (dashboard)    (Server Component — reads session via auth())
  ├── /clientes/*      (Server Components)
  ├── /alertas         (Server Component)
  ├── /tareas          (Client Component — localStorage)
  ├── /herramientas/*  (Server Components)
  └── /settings        (Server Component — reads process.env.*)
        └── "Probar conexión" button (Client Component)
              └── POST /api/ping/[tool]  (Route Handler)
                    └── fetch(TOOL_URL, { headers: { Authorization: ... } })
                    └── returns { ok: boolean, message: string }

lib/data.ts  (unchanged — static seed data, Phase 1)
components/ui/  (new — Badge, Card, StatBlock, AlertRow, HealthBadge, MetricRow)
```

### Recommended Project Structure

```
agency-dashboard/
├── auth.ts                    # next-auth v5 config — exporta { handlers, signIn, signOut, auth }
├── proxy.ts                   # Protección de rutas — export { auth as proxy } from "@/auth"
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Handlers GET/POST de next-auth
│   │   └── ping/[tool]/route.ts          # "Probar conexión" por herramienta
│   ├── login/
│   │   ├── layout.tsx         # Layout sin Sidebar
│   │   └── page.tsx           # Client Component — formulario de login
│   ├── settings/
│   │   └── page.tsx           # Server Component — read-only env vars status
│   ├── layout.tsx             # Actualizado: Inter font, nuevo marginLeft 240px, SessionProvider
│   ├── globals.css            # Reemplazado íntegramente con nuevo contrato de tokens
│   └── [páginas existentes]   # Token migration: --s1 → --surface-1, --txt → --text-1, etc.
├── components/
│   ├── Sidebar.tsx            # Reescrito completo — Lucide icons, collapse/expand
│   └── ui/
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── StatBlock.tsx
│       ├── AlertRow.tsx
│       ├── HealthBadge.tsx
│       └── MetricRow.tsx
└── lib/
    └── data.ts                # Sin cambios en Phase 1
```

### Pattern 1: next-auth v5 — auth.ts Configuration

```typescript
// auth.ts (raíz del proyecto, al mismo nivel que package.json)
// Source: https://authjs.dev/getting-started/authentication/credentials
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email as string
        const password = credentials.password as string

        if (email !== process.env.ADMIN_EMAIL) return null

        const hash = process.env.ADMIN_PASSWORD_HASH
        if (!hash) return null

        const valid = await bcryptjs.compare(password, hash)
        if (!valid) return null

        return { id: '1', email, name: 'Admin' }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    authorized: async ({ auth }) => !!auth,
  },
})
```

### Pattern 2: proxy.ts — Route Protection (Next.js 16)

**CRÍTICO:** En Next.js 16 el archivo se llama `proxy.ts`, NO `middleware.ts`. La convención `middleware` fue deprecada en v16.0.0 y renombrada a `proxy`. [VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md]

```typescript
// proxy.ts (raíz — al mismo nivel que package.json / auth.ts)
// Source: https://authjs.dev/getting-started/session-management/protecting
export { auth as proxy } from "@/auth"

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

Si se necesita lógica personalizada (redirect desde /login cuando ya autenticado):

```typescript
// proxy.ts — versión con lógica custom
import { auth } from "@/auth"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnLogin = req.nextUrl.pathname === '/login'

  if (!isLoggedIn && !isOnLogin) {
    return Response.redirect(new URL('/login', req.nextUrl.origin))
  }
  if (isLoggedIn && isOnLogin) {
    return Response.redirect(new URL('/', req.nextUrl.origin))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

### Pattern 3: Route Handler para next-auth (App Router)

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### Pattern 4: Login Form (Client Component)

```typescript
// app/login/page.tsx — 'use client' + useActionState para estado del form
'use client'
import { useActionState } from 'react'
import { signIn } from 'next-auth/react'

// Patrón alternativo: Server Action con signIn() de next-auth
// La forma más simple para next-auth v5 con App Router:
// form action llama a signIn('credentials', formData) como Server Action
```

### Pattern 5: Session en Server Components

```typescript
// Cualquier Server Component
import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()
  // session.user.email disponible
  // si session es null → el proxy ya habría redirigido
}
```

### Pattern 6: next/font/google con CSS Variable (Next.js 16)

```typescript
// app/layout.tsx
// Source: node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',  // inyecta CSS custom property
  weight: ['400', '600'],    // Inter NO es variable font — especificar weights explícitamente
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>...</body>
    </html>
  )
}
```

En `globals.css`:
```css
:root {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
body {
  font-family: var(--font-sans);
}
```

**Nota:** Inter en Google Fonts sí tiene versión variable (wght 100-900). Usar `weight: 'variable'` o no especificar weight también es válido y reduce el número de requests. El UI-SPEC usa solo 400 y 600 — especificar ambos es correcto.

### Pattern 7: Route Handlers para "Probar conexión"

```typescript
// app/api/ping/[tool]/route.ts
import { auth } from "@/auth"
import { NextRequest } from "next/server"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ ok: false }, { status: 401 })

  const { tool } = await params

  try {
    switch (tool) {
      case 'n8n': {
        // GET /api/v1/workflows?limit=1 — requiere API key, confirma key válida
        const res = await fetch(`${process.env.N8N_URL}/api/v1/workflows?limit=1`, {
          headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY ?? '' },
          signal: AbortSignal.timeout(5000),
        })
        return Response.json({ ok: res.ok })
      }
      case 'chatwoot': {
        // GET /auth/sign_in no es correcto — usar /api/v1/profile con token
        const res = await fetch(`${process.env.CHATWOOT_URL}/api/v1/profile`, {
          headers: { 'api_access_token': process.env.CHATWOOT_TOKEN ?? '' },
          signal: AbortSignal.timeout(5000),
        })
        return Response.json({ ok: res.ok })
      }
      case 'openai': {
        // GET /v1/models — minimal call, no tokens consumed
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY ?? ''}` },
          signal: AbortSignal.timeout(5000),
        })
        return Response.json({ ok: res.ok })
      }
      case 'airtable': {
        // GET /v0/meta/bases — lista bases del usuario, confirma key válida
        const res = await fetch('https://api.airtable.com/v0/meta/bases', {
          headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY ?? ''}` },
          signal: AbortSignal.timeout(5000),
        })
        return Response.json({ ok: res.ok })
      }
      case 'slack': {
        // Slack Incoming Webhooks no tienen endpoint de "dry run" oficial
        // Estrategia recomendada: POST un payload silencioso al webhook
        // Slack responde 200 "ok" si el webhook URL es válido y activo
        if (!process.env.SLACK_WEBHOOK_URL) return Response.json({ ok: false })
        const res = await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: '_Conexión verificada desde Agency Intelligence._' }),
          signal: AbortSignal.timeout(5000),
        })
        return Response.json({ ok: res.ok })
      }
      default:
        return Response.json({ ok: false, error: 'Unknown tool' }, { status: 400 })
    }
  } catch {
    return Response.json({ ok: false, error: 'Connection timeout or network error' })
  }
}
```

### Anti-Patterns a Evitar

- **Usar `middleware.ts` en Next.js 16:** El archivo fue deprecado en v16.0.0 y renombrado a `proxy.ts`. Crear `middleware.ts` genera advertencia de deprecación y puede dejar de funcionar en v17. Usar `proxy.ts` con `export function proxy()` o `export const proxy = auth(...)`.
- **Importar `next-auth/middleware` para el proxy:** La importación antigua `export { default } from "next-auth/middleware"` fue reemplazada en v5 por `export { auth as proxy } from "@/auth"`.
- **bcrypt (native) en Vercel serverless:** El módulo nativo `bcrypt` requiere compilar binarios — puede fallar en entornos serverless. Usar `bcryptjs` (pure JS).
- **Leer `process.env.*` en Client Components:** Las env vars sin prefijo `NEXT_PUBLIC_` no están disponibles en el browser. Las API keys y URLs de integraciones deben leerse solo en Server Components o Route Handlers.
- **SessionProvider en layout.tsx raíz sin `'use client'`:** `SessionProvider` de next-auth/react es un Client Component — el layout que lo importa necesita `'use client'` o delegarlo a un wrapper Client Component.
- **Poner `signOut()` de next-auth directamente en un Server Component:** `signOut()` requiere ser llamado desde un Client Component o un Server Action. En el Sidebar (Client Component) se puede llamar directamente.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT session management | Custom JWT sign/verify + cookie handling | next-auth v5 (JWT strategy) | Manejar rotación, expiración, HttpOnly cookies, CSRF y refresh desde cero tiene superficie de error enorme |
| Password hashing | Custom hash function | bcryptjs.compare() / bcryptjs.hash() | bcrypt tiene comportamiento time-constant; naive string compare es vulnerable a timing attacks |
| Icon SVGs | SVG inline manual | lucide-react | Accesibilidad, tamaño consistente, tree-shaking — no hay valor en mantener SVGs a mano |
| CSS transition system | Framer Motion o similar | CSS `transition` nativo | Todas las animaciones de Phase 1 son simples (width, opacity, background) — CSS transitions son suficientes y no añaden dependencias |

**Key insight:** El mayor riesgo en este dominio es la seguridad de auth. Confiar en next-auth v5 para JWT + cookies elimina una categoría entera de bugs de seguridad.

---

## Common Pitfalls

### Pitfall 1: Nombre de archivo `middleware.ts` en Next.js 16
**What goes wrong:** El desarrollador crea `agency-dashboard/middleware.ts` (convención de Next.js 15 y anteriores). El archivo puede funcionar inicialmente si Next.js mantiene compatibilidad temporal, pero la convención está deprecada desde v16.0.0 y el equipo de Next.js indica que dejará de ser soportada.
**Why it happens:** Toda la documentación de next-auth v5, tutoriales y el propio CONTEXT.md D-04 mencionan `middleware.ts`. Es el nombre histórico.
**How to avoid:** Crear el archivo como `agency-dashboard/proxy.ts` y exportar `export { auth as proxy } from "@/auth"` (o `export function proxy()`). La `config.matcher` es idéntica.
**Warning signs:** El CONTEXT.md D-04 dice `middleware.ts` — el planner debe traducir esto a `proxy.ts`.

### Pitfall 2: SessionProvider y Server Components
**What goes wrong:** Se importa `SessionProvider` de `next-auth/react` directamente en `app/layout.tsx` (Server Component) — TypeScript/Next.js lanza error porque SessionProvider es Client Component.
**Why it happens:** El root layout no tiene `'use client'` y no puede importar Client Components sin un wrapper.
**How to avoid:** Crear `components/SessionProviderWrapper.tsx` con `'use client'` que envuelva a `SessionProvider`, e importar ese wrapper en el layout. Alternativa: dado que en Phase 1 ningún Client Component necesita `useSession()` (el Sidebar lee el estado de auth via server action / redirect), SessionProvider puede diferirse hasta que sea necesario.
**Warning signs:** Si no hay Client Components que llamen `useSession()`, SessionProvider no es necesario en Phase 1.

### Pitfall 3: Leer `process.env` en Client Components
**What goes wrong:** La Settings page intenta leer `process.env.N8N_URL` para mostrar si está configurado, pero se renderiza como Client Component — el valor es `undefined`.
**Why it happens:** Las env vars sin `NEXT_PUBLIC_` prefix no se incluyen en el bundle del cliente.
**How to avoid:** La Settings page DEBE ser Server Component (sin `'use client'`). Lee `process.env.*` en el servidor y pasa solo el resultado booleano (¿está configurado? sí/no) al cliente — nunca el valor de la key.

### Pitfall 4: bcrypt vs bcryptjs en Node.js serverless
**What goes wrong:** Se instala `bcrypt` (native). En dev funciona pero el build de Vercel falla con `Cannot find module bcrypt/build/...` o similar porque los binarios nativos no se compilan en el entorno serverless.
**Why it happens:** `bcrypt` usa addons nativos de Node.js que requieren compilación en el target OS.
**How to avoid:** Usar `bcryptjs` (pure JavaScript, zero native dependencies). API idéntica a `bcrypt`.

### Pitfall 5: Token migration incompleta — classes CSS en globals.css
**What goes wrong:** Se actualiza `globals.css` con los nuevos tokens pero se dejan referencias a `.hover-row`, `.hover-row2`, `.hover-border`, `.nav-item` en los archivos de página. Esas clases ya no existen en el nuevo CSS.
**Why it happens:** Hay 256 referencias a tokens viejos y 6 referencias a clases CSS helper en los 9 archivos de página — es fácil dejar alguna.
**How to avoid:** Tras la migración, hacer `grep -r "hover-row\|hover-border\|nav-item\|--s1\|--s2\|--s3\|--txt\|--border2" agency-dashboard/app/` para confirmar que no quedan referencias.

### Pitfall 6: n8n `/healthz` endpoint vs `/api/v1/workflows`
**What goes wrong:** Se usa `/healthz` para el ping de n8n. El endpoint `/healthz` responde 200 aunque la API key sea inválida o inexistente — solo indica que el servidor está vivo.
**Why it happens:** `/healthz` es un health check de liveness, no de autenticación.
**How to avoid:** Usar `GET /api/v1/workflows?limit=1` con el header `X-N8N-API-KEY` para verificar tanto conectividad como validez de la API key. Un 200 confirma ambos. Un 401 indica key inválida.

---

## Code Examples

### Generación del hash de contraseña (one-time, antes de primer deploy)

```bash
# Ejecutar en terminal una sola vez para generar ADMIN_PASSWORD_HASH
node -e "const b = require('bcryptjs'); b.hash('tuPasswordSegura', 12).then(h => console.log(h))"
# Copiar el output a .env.local como ADMIN_PASSWORD_HASH=<hash>
```

### globals.css — Token Mapping (viejo → nuevo)

| Token Viejo | Token Nuevo | Cambio |
|-------------|-------------|--------|
| `--bg: #111111` | `--bg: #FFFFFF` | Dark → light |
| `--s1: #1a1a1a` | `--surface-1: #F7F7F5` | Renombrado + light |
| `--s2: #222222` | `--surface-2: #EFEFED` | Renombrado + light |
| `--s3: #2a2a2a` | (eliminado — no hay surface-3) | Reemplazar con `--surface-2` donde se usaba |
| `--border: #2e2e2e` | `--border: #E5E5E3` | Mismo nombre, valor light |
| `--border2: #3a3a3a` | `--border-2: #D3D3D0` | Renombrado (guión, no número) |
| `--txt: #f0f0f0` | `--text-1: #1A1A1A` | Renombrado |
| `--txt2: #888888` | `--text-2: #6B6B6B` | Renombrado |
| `--txt3: #444444` | `--text-3: #ABABAB` | Renombrado + valor diferente |
| `--accent: #E8642A` | `--accent: #2383E2` | Mismo nombre, color cambia de naranja a azul Notion |
| `.hover-row` | (eliminar) | Reemplazar con inline `hover:` Tailwind o nuevo CSS |
| `.nav-item.active` | (eliminar) | Sidebar reescrito con lógica propia |

### Settings page — Server Component leyendo env vars

```typescript
// app/settings/page.tsx
// Source: Next.js docs — Server Components leen process.env en server side

const integrations = [
  {
    id: 'n8n',
    name: 'n8n',
    configured: !!(process.env.N8N_URL && process.env.N8N_API_KEY),
  },
  {
    id: 'chatwoot',
    name: 'Chatwoot',
    configured: !!(process.env.CHATWOOT_URL && process.env.CHATWOOT_TOKEN),
  },
  {
    id: 'openai',
    name: 'OpenAI',
    configured: !!process.env.OPENAI_API_KEY,
  },
  {
    id: 'airtable',
    name: 'Airtable',
    configured: !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID),
  },
  {
    id: 'slack',
    name: 'Slack',
    configured: !!process.env.SLACK_WEBHOOK_URL,
  },
]
// Pasar `integrations` (solo booleanos) a un Client Component para el botón "Probar conexión"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` (función `proxy()`) | Next.js v16.0.0 | Todos los proyectos que migren a Next.js 16 deben renombrar el archivo |
| `export { default } from "next-auth/middleware"` | `export { auth as proxy } from "@/auth"` | next-auth v5 | La nueva API unifica auth() para server components, proxy y route handlers |
| Edge runtime por defecto en middleware | Node.js runtime por defecto en proxy | Next.js v15.5.0 (estable) | bcrypt native puede funcionar — aunque bcryptjs sigue siendo preferible |
| `useFormStatus` para loading state | `useActionState` (React 19) | React 19 | `useActionState` reemplaza y extiende `useFormStatus` — incluye el estado del form |
| Tailwind `tailwind.config.js` | Sin config file — `@import "tailwindcss"` en globals.css | Tailwind v4 | Ya implementado en el proyecto |

**Deprecated/outdated:**
- `middleware.ts`: deprecado en Next.js v16 — usar `proxy.ts`
- `next-auth/middleware` import: reemplazado en v5 — usar `export { auth as proxy } from "@/auth"`
- `useFormStatus` para submit loading: reemplazado por `useActionState` en React 19

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Slack Incoming Webhook responde 200 `ok` para un payload válido y puede usarse como "test de conexión" | Code Examples (Pattern 7) | Si Slack bloquea o retorna diferente código, el test de conexión mostrará error falso. Alternativa: solo verificar que la env var no sea vacía. |
| A2 | Chatwoot `/api/v1/profile` con header `api_access_token` es el endpoint correcto para user tokens (no Platform API tokens) | Code Examples (Pattern 7) | Si el Chatwoot del cliente usa Platform API tokens en lugar de User tokens, el endpoint correcto sería diferente. Ambos tipos de tokens existen en Chatwoot. |
| A3 | Airtable `/v0/meta/bases` está disponible en todos los planes (Free, Team, Business) | Code Examples (Pattern 7) | Si la cuenta Airtable es Free y no tiene acceso a la Metadata API, el ping fallará con 403 aunque las credenciales sean válidas. Alternativa: hacer GET a una tabla específica del AIRTABLE_BASE_ID. |

---

## Open Questions

1. **¿middleware.ts sigue funcionando en Next.js 16 aunque esté deprecated?**
   - What we know: El changelog dice "deprecated and renamed" en v16.0.0. La note en el doc dice "middleware file convention is deprecated." El codemod lo migra automáticamente.
   - What's unclear: Si Next.js 16 todavía ejecuta `middleware.ts` con un warning, o si directamente lo ignora.
   - Recommendation: Crear directamente `proxy.ts` para seguir el estándar de v16 y evitar el warning. No asumir compatibilidad.

2. **¿SessionProvider es necesario en Phase 1?**
   - What we know: En Phase 1, el único Client Component que necesita saber si el usuario está autenticado es Sidebar (para el botón de logout). `signOut()` de `next-auth/react` puede llamarse sin `useSession`.
   - What's unclear: Si el planner quiere agregar un indicador visual del usuario en el Sidebar, necesitaría `useSession()` → `SessionProvider`.
   - Recommendation: Omitir SessionProvider en Phase 1. Si Sidebar solo llama `signOut()`, no necesita el contexto de sesión.

3. **¿Slack test POST envia mensaje visible en el canal?**
   - What we know: Los Incoming Webhooks de Slack publican mensajes en el canal configurado. No hay endpoint de "dry run".
   - What's unclear: Si el cliente quiere que el test sea silencioso (sin mensaje en el canal).
   - Recommendation: El test POST enviará un mensaje discreto ("_Conexión verificada desde Agency Intelligence._"). Esta es la única forma de verificar un Incoming Webhook. Documentarlo en la UI como comportamiento esperado.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | next-auth, bcryptjs, build | ✓ | inferred LTS (platform) | — |
| npm | Package install | ✓ | confirmed (package-lock.json exists) | — |
| `next-auth@beta` | AUTH-01–03 | ✗ (not installed) | 5.0.0-beta.31 disponible | — |
| `bcryptjs` | AUTH-01 (password compare) | ✗ (not installed) | 3.0.3 disponible | — |
| `lucide-react` | DSYS-02, DSYS-03 | ✗ (not installed) | 1.11.0 disponible | — |
| `.env.local` | AUTH-01, CONF-01, CONF-02 | ✓ (exists, contents unknown) | — | Admin debe configurar manualmente |
| n8n instance | CONF-02 (ping) | ASSUMED | — | Mock response si no disponible en dev |
| Chatwoot instance | CONF-02 (ping) | ASSUMED | — | Mock response si no disponible en dev |

**Missing dependencies con fallback:** `.env.local` variables — si no están configuradas, el ping devuelve error de conexión (comportamiento esperado, no bloquea desarrollo).

**Missing dependencies sin fallback:** `next-auth@beta`, `bcryptjs`, `lucide-react` — deben instalarse en Wave 0 antes de cualquier implementación.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No test framework instalado en el proyecto. Para Phase 1 se recomienda Playwright para e2e o validación manual estructurada |
| Config file | none — Wave 0 debe crear si se elige instalar |
| Quick run command | `npm run build` (TypeScript type-check + Next.js build) |
| Full suite command | `npm run lint && npm run build` |

**Decisión sobre framework de tests:** El proyecto no tiene Jest, Vitest ni Playwright. Para Phase 1 (UI visual + auth + API pings), las verificaciones más valiosas son:
1. TypeScript build sin errores (`npm run build`)
2. Verificación manual de flujo de login/logout
3. Verificación manual de "Probar conexión" con env vars reales

No se requiere instalar un framework de tests en Phase 1 dado que `nyquist_validation: true` puede satisfacerse con build checks + checklist de verificación manual estructurada.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSYS-01 | Paleta Notion-style visible en browser | manual | `npm run dev` → visual check | ❌ Wave 0 N/A |
| DSYS-02 | Sidebar colapsa/expande con persistencia | manual | `npm run dev` → click toggle | ❌ Wave 0 N/A |
| DSYS-03 | Componentes UI renderizan sin errores de TypeScript | unit/build | `npm run build` | ❌ Wave 0 N/A |
| DSYS-04 | Filtros de tabla funcionan (estado local) | manual | `npm run dev` → click chips | ❌ Wave 0 N/A |
| AUTH-01 | Login con credenciales correctas redirige a `/` | e2e/manual | `npm run dev` → POST /api/auth/callback/credentials | ❌ Wave 0 N/A |
| AUTH-01 | Login con credenciales incorrectas muestra error | e2e/manual | `npm run dev` → intento fallido | ❌ Wave 0 N/A |
| AUTH-02 | Sesión persiste en browser refresh | manual | `npm run dev` → F5 después de login | ❌ Wave 0 N/A |
| AUTH-03 | Logout desde Sidebar redirige a `/login` | manual | `npm run dev` → click "Salir" | ❌ Wave 0 N/A |
| CONF-01 | Settings muestra Badge Conectado/Sin probar por herramienta | build | `npm run build` (TypeScript) | ❌ Wave 0 N/A |
| CONF-02 | "Probar conexión" llama al Route Handler y muestra resultado | manual/integration | `npm run dev` → click botón con .env.local configurado | ❌ Wave 0 N/A |

### Sampling Rate

- **Per task commit:** `npm run build` — TypeScript strict mode confirma que no hay regresiones de tipos
- **Per wave merge:** `npm run lint && npm run build` — lint + build completo
- **Phase gate:** Build verde + checklist de verificación manual completo antes de `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `agency-dashboard/proxy.ts` — archivo de protección de rutas (nuevo)
- [ ] `agency-dashboard/auth.ts` — configuración next-auth v5 (nuevo)
- [ ] `agency-dashboard/app/api/auth/[...nextauth]/route.ts` — handlers next-auth (nuevo)
- [ ] `agency-dashboard/app/login/` — directorio y página de login (nuevo)
- [ ] `agency-dashboard/app/settings/` — directorio y página de settings (nuevo)
- [ ] `agency-dashboard/components/ui/` — directorio de componentes (nuevo)
- [ ] Dependencies: `npm install next-auth@beta bcryptjs lucide-react && npm install -D @types/bcryptjs`

---

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | next-auth v5 CredentialsProvider + bcryptjs (costo 12) |
| V3 Session Management | yes | next-auth v5 JWT strategy — HttpOnly, Secure, SameSite cookies |
| V4 Access Control | yes | proxy.ts con authorized callback — todas las rutas protegidas excepto /login |
| V5 Input Validation | yes | Validar email/password en Server Action antes de llamar authorize() |
| V6 Cryptography | yes | bcryptjs para password hash — NUNCA almacenar plaintext; NUNCA MD5/SHA1 |

### Known Threat Patterns for Next.js + next-auth

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Credential stuffing / brute force | Tampering | En Phase 1: no hay rate limiting (tool interno, riesgo bajo). Phase 2+ considerar iron-session con attempt counter |
| JWT token theft via XSS | Elevation of Privilege | next-auth v5 usa HttpOnly cookies por defecto — JavaScript del browser no puede leer el token |
| CSRF en login form | Spoofing | next-auth v5 incluye CSRF token automáticamente para CredentialsProvider |
| API keys expuestas al cliente | Information Disclosure | process.env vars (sin NEXT_PUBLIC_) solo disponibles server-side — Route Handlers y Server Components leen las keys |
| Secrets en código/git | Information Disclosure | .env.local está en .gitignore — verificado en el proyecto. ADMIN_PASSWORD_HASH en env, nunca en código |
| Timing attack en password compare | Tampering | bcryptjs.compare() es time-constant por diseño del algoritmo bcrypt |

---

## Project Constraints (from CLAUDE.md)

Directivas que el planner debe cumplir:

- **Stack bloqueado:** Next.js 16.2.4 + React 19.2.4 + Tailwind CSS 4 + TypeScript 5 — no añadir frameworks adicionales
- **Path alias:** Todos los imports via `@/` — nunca rutas relativas como `../../lib/data`
- **Componentes top-level:** `export default function ComponentName()` — siempre function declaration, nunca arrow function
- **Client Components:** `'use client'` al tope del archivo cuando usa hooks o eventos
- **Server Components:** default (sin directiva) para todas las páginas que no usen hooks
- **Tipos en `lib/data.ts`:** Los tipos de dominio nuevos van ahí — pero Phase 1 no modifica data.ts (D-09)
- **Import type:** Usar `import type` para imports de solo tipos
- **Sin console.log:** Ningún log en código de producción
- **CSS:** CSS custom properties para colores (`var(--token)`), Tailwind utilities para layout/spacing
- **Tailwind v4:** `@import "tailwindcss"` en globals.css — sin tailwind.config.js
- **Idioma:** Texto de UI en español (argentino) — ya implementado en el proyecto existente

---

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — proxy.ts API, runtime, migration from middleware.ts, Next.js 16 breaking change
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md` — auth patterns en Next.js 16 App Router, Server Actions, DAL pattern
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` — next/font/google API, CSS variable pattern
- npm registry (next-auth@5.0.0-beta.31): peerDependencies confirmadas `next: ^14.0.0-0 || ^15.0.0 || ^16.0.0`
- npm registry (lucide-react@1.11.0): peerDependencies `react: ^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0`
- npm registry (bcryptjs@3.0.3): pure JS, sin native deps

### Secondary (MEDIUM confidence)
- [authjs.dev/getting-started/installation](https://authjs.dev/getting-started/installation?framework=next.js) — auth.ts config, route handler setup
- [authjs.dev/getting-started/authentication/credentials](https://authjs.dev/getting-started/authentication/credentials) — CredentialsProvider authorize() signature
- [authjs.dev/getting-started/session-management/protecting](https://authjs.dev/getting-started/session-management/protecting) — proxy.ts export pattern para Next.js 16
- [authjs.dev/getting-started/session-management/get-session](https://authjs.dev/getting-started/session-management/get-session) — session en Server vs Client Components
- n8n community docs: `/healthz` vs `/api/v1/workflows` para test de conectividad autenticada
- OpenAI API reference: `GET /v1/models` como endpoint minimal para test

### Tertiary (LOW confidence — marcados ASSUMED en tabla de Assumptions)
- Slack Incoming Webhooks test strategy — comportamiento de POST a webhook URL como test (A1)
- Chatwoot `/api/v1/profile` como endpoint correcto para user access tokens (A2)
- Airtable `/v0/meta/bases` disponible en todos los planes (A3)

---

## Metadata

**Confidence breakdown:**
- Standard stack (next-auth, bcryptjs, lucide-react): HIGH — versiones verificadas contra npm registry con peerDeps confirmadas
- Architecture (proxy.ts naming, auth patterns): HIGH — verificado en docs locales de Next.js 16
- API ping endpoints (n8n, OpenAI): MEDIUM — verificado con documentación oficial referenciada
- API ping endpoints (Chatwoot, Slack, Airtable): LOW-MEDIUM — endpoints razonables pero con assumptions documentadas
- Design system migration: HIGH — el mapping de tokens está completamente definido en UI-SPEC
- Pitfalls: HIGH — basados en breaking changes verificados en docs de Next.js 16

**Research date:** 2026-04-26
**Valid until:** 2026-05-26 (next-auth beta puede cambiar; verificar si hay nueva beta antes de ejecutar)
