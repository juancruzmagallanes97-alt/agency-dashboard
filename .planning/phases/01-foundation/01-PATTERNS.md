# Phase 1: Foundation - Pattern Map

**Mapped:** 2026-04-26
**Files analyzed:** 21 (13 nuevos + 2 reescrituras completas + 6 migraciones de tokens)
**Analogs found:** 14 / 21

---

## File Classification

| Archivo nuevo / modificado | Rol | Data Flow | Analog más cercano | Calidad |
|---|---|---|---|---|
| `agency-dashboard/auth.ts` | config (next-auth) | request-response | ninguno — patrón de RESEARCH.md | sin analog |
| `agency-dashboard/proxy.ts` | middleware/guard | request-response | ninguno — patrón de RESEARCH.md | sin analog |
| `agency-dashboard/app/api/auth/[...nextauth]/route.ts` | Route Handler | request-response | ninguno — no hay Route Handlers en el proyecto | sin analog |
| `agency-dashboard/app/api/ping/[tool]/route.ts` | Route Handler | request-response | ninguno — no hay Route Handlers en el proyecto | sin analog |
| `agency-dashboard/app/login/layout.tsx` | layout (Server Component) | request-response | `agency-dashboard/app/layout.tsx` | role-match |
| `agency-dashboard/app/login/page.tsx` | Client Component (form) | request-response | `agency-dashboard/components/TareasCliente.tsx` | partial (mismo 'use client' + useState) |
| `agency-dashboard/app/settings/page.tsx` | Server Component (page) | request-response | `agency-dashboard/app/clientes/page.tsx` | role-match |
| `agency-dashboard/components/ui/Badge.tsx` | UI component | — | inline badge pattern en `app/page.tsx` y `app/clientes/[id]/page.tsx` | partial |
| `agency-dashboard/components/ui/Card.tsx` | UI component | — | panel divs en `app/page.tsx` (líneas 97–133) | partial |
| `agency-dashboard/components/ui/StatBlock.tsx` | UI component | — | KPI grid en `app/page.tsx` (líneas 39–93) | partial |
| `agency-dashboard/components/ui/AlertRow.tsx` | UI component | — | alert rows en `app/page.tsx` (líneas 148–168) | partial |
| `agency-dashboard/components/ui/HealthBadge.tsx` | UI component | — | health display en `app/clientes/[id]/page.tsx` (líneas 112–119) | partial |
| `agency-dashboard/components/ui/MetricRow.tsx` | UI component | — | métrica rows en `app/clientes/[id]/page.tsx` (líneas 120–150) | partial |
| `agency-dashboard/app/globals.css` | CSS (reemplazo completo) | — | `agency-dashboard/app/globals.css` (estructura a mantener, valores a reemplazar) | exact (estructura) |
| `agency-dashboard/components/Sidebar.tsx` | Client Component (reescritura) | event-driven | `agency-dashboard/components/Sidebar.tsx` (mismo archivo) | exact (estructura base) |
| `agency-dashboard/app/layout.tsx` | layout (Server Component) | — | `agency-dashboard/app/layout.tsx` (mismo archivo) | exact |
| `agency-dashboard/app/page.tsx` | Server Component (token migration) | — | `agency-dashboard/app/page.tsx` (mismo archivo) | exact |
| `agency-dashboard/app/clientes/page.tsx` | Server Component (token migration) | — | `agency-dashboard/app/clientes/page.tsx` (mismo archivo) | exact |
| `agency-dashboard/app/clientes/[id]/page.tsx` | Server Component (token migration) | — | `agency-dashboard/app/clientes/[id]/page.tsx` (mismo archivo) | exact |
| `agency-dashboard/app/alertas/page.tsx` | Server Component (token migration) | — | `agency-dashboard/app/alertas/page.tsx` (mismo archivo) | exact |
| `agency-dashboard/app/tareas/page.tsx` | Client Component (token migration) | — | `agency-dashboard/app/tareas/page.tsx` (mismo archivo) | exact |
| `agency-dashboard/app/herramientas/page.tsx` | Server Component (token migration) | — | `agency-dashboard/app/herramientas/page.tsx` (mismo archivo) | exact |
| `agency-dashboard/components/TareasCliente.tsx` | Client Component (token migration) | — | `agency-dashboard/components/TareasCliente.tsx` (mismo archivo) | exact |

---

## Pattern Assignments

### `agency-dashboard/auth.ts` (config, sin analog)

**Analog:** ninguno — usar patrón de RESEARCH.md (Pattern 1, líneas 194–230)

Sin archivo análogo en el codebase. Copiar el patrón completo de RESEARCH.md directamente.

**Patrón completo (RESEARCH.md líneas 194–230):**
```typescript
// auth.ts — raíz de agency-dashboard/, al mismo nivel que package.json
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
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

**Convenciones del proyecto que aplican:**
- Sin `console.log` ni logs
- Imports con `@/` — este archivo está en la raíz entonces no hay alias necesario para los imports de next-auth
- No usar semicolons al final de JSX (pero este archivo es TS puro — el proyecto no tiene Prettier; seguir el estilo sin semicolons al igual que los archivos .tsx existentes)

---

### `agency-dashboard/proxy.ts` (middleware/guard, sin analog)

**Analog:** ninguno — usar patrón de RESEARCH.md (Pattern 2, líneas 233–268)

**CRÍTICO:** El archivo se llama `proxy.ts`, NO `middleware.ts`. Exporta `proxy`, no `middleware`.

**Patrón completo (RESEARCH.md líneas 248–268):**
```typescript
// proxy.ts — raíz de agency-dashboard/
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

---

### `agency-dashboard/app/api/auth/[...nextauth]/route.ts` (Route Handler, sin analog)

**Analog:** ninguno — primer Route Handler del proyecto

**Patrón completo (RESEARCH.md Pattern 3, línea 273–276):**
```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

Este es el archivo más corto — literalmente 2 líneas funcionales. No hay patrón adicional que extractar.

---

### `agency-dashboard/app/api/ping/[tool]/route.ts` (Route Handler, sin analog)

**Analog:** ninguno — pero la estructura de parámetros dinámicos tiene analog en Server Component

**Patrón de params dinámicos** — copiar de `app/clientes/[id]/page.tsx` líneas 11–13:
```typescript
// PATRÓN DE PARAMS ASÍNCRONO (Next.js 16 — await params)
export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
```

**Aplicar al Route Handler así:**
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
  // ... switch(tool) { case 'n8n': ... }
}
```

El patrón completo de cada case está en RESEARCH.md líneas 356–408.

**Regla de nombres:** El parámetro `_req` usa el prefijo `_` porque no se usa dentro del handler. Este es el patrón del proyecto (CLAUDE.md: "Unused parameters prefixed with `_`").

---

### `agency-dashboard/app/login/layout.tsx` (layout Server Component)

**Analog:** `agency-dashboard/app/layout.tsx` (líneas 1–23)

**Patrón del layout raíz** (líneas 1–23):
```typescript
import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "@/components/Sidebar"

export const metadata: Metadata = {
  title: "Agency Intelligence",
  description: "Automation Intelligence Platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ background: 'var(--bg)' }}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8 min-h-screen" style={{ background: 'var(--bg)', marginLeft: 220 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
```

**Login layout NO importa Sidebar.** Patrón a usar:
```typescript
// app/login/layout.tsx — sin Sidebar, sin html/body (el root layout los envuelve)
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
      {children}
    </div>
  )
}
```

**Nota importante:** El root `app/layout.tsx` ya renderiza `<html>` y `<body>`. El `app/login/layout.tsx` solo agrega un wrapper div — no repite html/body.

---

### `agency-dashboard/app/login/page.tsx` (Client Component — form)

**Analog:** `agency-dashboard/components/TareasCliente.tsx` (líneas 1–8, 22–28, 62–66)

**Patrón 'use client' + imports** (TareasCliente.tsx líneas 1–6):
```typescript
'use client'
import { useState, useEffect } from 'react'
import {
  Tarea, TareaCategoria, TareaEstado, TareaPrioridad,
  // ...
} from '@/lib/data'
```

**Patrón de función default exportada** (TareasCliente.tsx línea 22):
```typescript
export default function TareasCliente({ clienteId }: { clienteId: string }) {
```

**Patrón de validación antes de submit** (TareasCliente.tsx línea 65):
```typescript
function addTarea() {
  if (!form.titulo.trim()) return  // early return si vacío — sin error UI
```

**Aplicar a login:**
```typescript
'use client'
import { useState } from 'react'
// ...

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // ...
}
```

**Patrón de input styling** — copiar de TareasCliente.tsx líneas 129–137 (adaptando tokens nuevos):
```typescript
<input
  type="text"
  className="w-full text-sm px-3 py-2 rounded-lg outline-none"
  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
/>
```

**NOTA:** El `app/login/page.tsx` usa `useActionState` de React 19 (no `useFormStatus`) — ver RESEARCH.md líneas 76, 543.

---

### `agency-dashboard/app/settings/page.tsx` (Server Component)

**Analog:** `agency-dashboard/app/clientes/page.tsx` (líneas 1–11)

**Patrón de Server Component** (clientes/page.tsx líneas 1–11):
```typescript
import Link from 'next/link'
import { clientes, getEstadoLabel, /* ... */ } from '@/lib/data'

export default function Clientes() {
  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--txt)' }}>Clientes</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--txt3)' }}>...</p>
        </div>
      </div>
```

**Aplicar en settings — sin `'use client'`** para poder leer `process.env.*`:
```typescript
// app/settings/page.tsx — Server Component (sin 'use client')
// process.env.* disponible aquí, NO en client components
export default function SettingsPage() {
  const integrations = [
    { id: 'n8n', name: 'n8n', configured: !!(process.env.N8N_URL && process.env.N8N_API_KEY) },
    // ...
  ]
  // pasar integrations a un Client Component hijo para el botón "Probar conexión"
}
```

**Patrón de header de página** — copiar de `app/alertas/page.tsx` líneas 17–26 (más cercano al layout de settings):
```typescript
<div className="mb-8 flex items-end justify-between">
  <div>
    <h1 className="text-xl font-semibold" style={{ color: 'var(--txt)' }}>Alertas</h1>
    <p className="text-xs mt-1" style={{ color: 'var(--txt3)' }}>...</p>
  </div>
</div>
```

---

### `agency-dashboard/components/ui/Badge.tsx` (UI component)

**Analog:** inline badge pattern en `app/clientes/[id]/page.tsx` (líneas 376–378) y `app/page.tsx` (líneas 161–163)

**Patrón inline existente** (clientes/[id]/page.tsx líneas 376–378):
```typescript
<span className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${ac.badge}`}>
  {getAlertaLabel(a.tipo)}
</span>
```

**Plan label badge** (clientes/page.tsx líneas 68–70):
```typescript
<span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${getPlanColor(c.plan)}`}>
  {getPlanLabel(c.plan)}
</span>
```

**Extraer a componente** — con props tipadas según UI-SPEC:
```typescript
// components/ui/Badge.tsx — named export con props tipadas
interface BadgeProps {
  variant: 'critical' | 'warning' | 'opportunity' | 'stable' | 'neutral'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

export function Badge({ variant, size = 'sm', children }: BadgeProps) {
  // ...
}
```

**Convención:** `export function Badge` (named export, no default) — D-11 dice "named export". Todos los otros componentes del proyecto usan `export default function` pero el CONTEXT.md D-11 requiere named exports para `components/ui/`.

---

### `agency-dashboard/components/ui/Card.tsx` (UI component)

**Analog:** panel divs en `app/page.tsx` (líneas 97–98) y `app/alertas/page.tsx` (líneas 62–66)

**Patrón de contenedor** (page.tsx líneas 97–98):
```typescript
<div className="rounded-xl overflow-hidden" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
```

**Con noPadding** (alertas/page.tsx líneas 62–66):
```typescript
<div
  className="rounded-lg overflow-hidden"
  style={{ border: '1px solid var(--border)' }}
>
```

**Extraer a componente** — con nuevos tokens:
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className, noPadding = false }: CardProps) {
  return (
    <div
      className={`rounded-lg ${noPadding ? '' : 'p-5'} ${className ?? ''}`}
      style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
    >
      {children}
    </div>
  )
}
```

---

### `agency-dashboard/components/ui/StatBlock.tsx` (UI component)

**Analog:** KPI grid en `app/page.tsx` (líneas 39–93) — el bloque más completo de KPI rendering

**Patrón del KPI block existente** (page.tsx líneas 69–93):
```typescript
<div
  key={i}
  className="rounded-xl p-6"
  style={{
    background: 'var(--s1)',
    border: `1px solid ${kpi.accent ? 'rgba(232,64,64,0.3)' : 'var(--border)'}`,
  }}
>
  <div className="flex items-center gap-1.5 mb-4">
    <div className="w-1.5 h-1.5 rounded-full" style={{ background: kpi.dot }} />
    <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--txt3)' }}>
      {kpi.label}
    </span>
  </div>
  <div
    className="text-5xl font-bold leading-none tracking-tight"
    style={{ color: kpi.accent ? 'var(--red)' : 'var(--txt)' }}
  >
    {kpi.value}
  </div>
  <div className="text-[11px] mt-3" style={{ color: 'var(--txt3)' }}>{kpi.sub}</div>
</div>
```

**Extraer a componente** usando specs de UI-SPEC (Display 28px, weight 600, tabular-nums):
```typescript
interface StatBlockProps {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'critical'
}

export function StatBlock({ label, value, sub, variant = 'default' }: StatBlockProps) {
  // value: 28px, weight 600, tabular-nums
  // label: 12px, weight 400, text-3, uppercase
  // dot indicator: 6px circle
}
```

---

### `agency-dashboard/components/ui/AlertRow.tsx` (UI component)

**Analog:** alert rows en `app/page.tsx` (líneas 148–168)

**Patrón inline existente** (page.tsx líneas 148–168):
```typescript
<div
  key={a.id}
  className="flex items-center gap-3 px-5 py-4"
  style={{ borderBottom: '1px solid var(--border)' }}
>
  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}`} />
  <div className="flex-1 min-w-0">
    <div className="text-sm truncate" style={{ color: 'var(--txt)' }}>{a.titulo}</div>
    <div className="text-[11px] mt-0.5" style={{ color: 'var(--txt3)' }}>{a.clienteNombre} · {a.fecha}</div>
  </div>
  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium shrink-0 ${ac.badge}`}>
    {getAlertaLabel(a.tipo)}
  </span>
</div>
```

**Extraer a componente** usando props tipadas:
```typescript
interface AlertRowProps {
  titulo: string
  clienteNombre: string
  fecha: string
  tipo: 'critico' | 'warning' | 'oportunidad'
  onClick?: () => void
}

export function AlertRow({ titulo, clienteNombre, fecha, tipo, onClick }: AlertRowProps) {
  // dot: 6px circle con color semántico del tipo
  // Badge component sm del tipo
}
```

---

### `agency-dashboard/components/ui/HealthBadge.tsx` (UI component)

**Analog:** health display en `app/clientes/[id]/page.tsx` (líneas 112–119) y `app/clientes/page.tsx` (líneas 91–98)

**Patrón en tabla de clientes** (clientes/page.tsx líneas 91–98):
```typescript
<div className="flex items-center justify-end gap-2">
  {alertasActivas.filter(a => a.tipo === 'critico').length > 0 && (
    <span className="text-[10px] text-red-400">🔴</span>
  )}
  <span className={`text-sm font-bold font-mono ${hc.text}`}>
    {getHealthEmoji(c.healthScore)} {c.healthScore}
  </span>
</div>
```

**Extraer a componente** con mapeo de score → color per UI-SPEC:
```typescript
interface HealthBadgeProps {
  score: number  // 0-100
  showLabel?: boolean
}

export function HealthBadge({ score, showLabel = false }: HealthBadgeProps) {
  // 80-100: green, 60-79: amber, 40-59: orange, 0-39: red (ver UI-SPEC)
  // padding: 4px 8px, border-radius: 4px, border: 1px
  // score text: 14px, font-weight 600, tabular-nums
}
```

---

### `agency-dashboard/components/ui/MetricRow.tsx` (UI component)

**Analog:** métricas en `app/clientes/[id]/page.tsx` (líneas 120–150)

**Patrón inline existente** (clientes/[id]/page.tsx líneas 120–125):
```typescript
<div className="rounded-lg p-4 text-center" style={{ background: 'var(--s1)', border: '1px solid var(--border)' }}>
  <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--txt3)' }}>Conversaciones</div>
  <div className="text-2xl font-bold font-mono" style={{ color: 'var(--txt)' }}>{c.metricas.conversaciones}</div>
  <div className="text-[11px] mt-1" style={{ color: 'var(--txt3)' }}>este mes</div>
</div>
```

**Extraer a componente** (layout horizontal label/valor per UI-SPEC):
```typescript
interface MetricRowProps {
  label: string
  value: string | number
  unit?: string
  dimLabel?: boolean
}

export function MetricRow({ label, value, unit, dimLabel = false }: MetricRowProps) {
  // display: flex, justify-between, align-center
  // padding: 8px 0, border-bottom: 1px solid var(--border)
  // label: 14px, weight 400, text-2
  // value: 14px, weight 600, tabular-nums
  // unit: 12px, weight 400, text-3, margin-left: 4px
}
```

---

### `agency-dashboard/app/globals.css` (reemplazo completo)

**Analog:** `agency-dashboard/app/globals.css` (mismo archivo — estructura idéntica, valores reemplazados)

**Estructura actual** (globals.css líneas 1–41) que define el patrón:
```css
@import "tailwindcss";   /* MANTENER — Tailwind v4 */

:root {
  /* tokens actuales — a reemplazar íntegramente */
  --bg:      #111111;
  --s1:      #1a1a1a;
  /* ... */
}

* { box-sizing: border-box; }  /* MANTENER */

body {
  background: var(--bg);
  color: var(--txt);           /* → var(--text-1) */
  font-family: ...;            /* → var(--font-sans) */
  -webkit-font-smoothing: antialiased;  /* MANTENER */
  font-size: 14px;             /* MANTENER */
  line-height: 1.6;            /* UI-SPEC dice 1.5 */
}

::selection { ... }
::-webkit-scrollbar { ... }   /* MANTENER estructura, actualizar colores */

/* Clases helper — ELIMINAR completamente: */
.hover-row  { ... }    /* → Tailwind inline hover: */
.hover-row2 { ... }    /* → Tailwind inline hover: */
.hover-border { ... }  /* → Tailwind inline hover: */
.nav-item { ... }      /* → Sidebar reescrito maneja su propio estado */
.nav-item:hover { ... }
.nav-item.active { ... }
```

**TABLA DE MAPPING de tokens (viejo → nuevo):**

| Token viejo | Token nuevo | Notas |
|---|---|---|
| `--bg: #111111` | `--bg: #FFFFFF` | Mismo nombre |
| `--s1: #1a1a1a` | `--surface-1: #F7F7F5` | Renombrado |
| `--s2: #222222` | `--surface-2: #EFEFED` | Renombrado |
| `--s3: #2a2a2a` | (eliminado) | Reemplazar con `--surface-2` donde se usaba `--s3` |
| `--border: #2e2e2e` | `--border: #E5E5E3` | Mismo nombre, valor nuevo |
| `--border2: #3a3a3a` | `--border-2: #D3D3D0` | Guión en lugar de número |
| `--txt: #f0f0f0` | `--text-1: #1A1A1A` | Renombrado |
| `--txt2: #888888` | `--text-2: #6B6B6B` | Renombrado |
| `--txt3: #444444` | `--text-3: #ABABAB` | Renombrado |
| `--accent: #E8642A` | `--accent: #2383E2` | Mismo nombre, color cambia naranja → azul |
| (nuevo) | `--accent-bg: rgba(35,131,226,0.08)` | Nav item active bg |
| (nuevo) | `--critical`, `--critical-bg`, `--critical-border` | Status tokens |
| (nuevo) | `--warning`, `--warning-bg`, `--warning-border` | Status tokens |
| (nuevo) | `--opportunity`, `--opportunity-bg`, `--opportunity-border` | Status tokens |
| (nuevo) | `--font-sans` | Inter font var |

**CSS completo a escribir** está especificado en UI-SPEC líneas 179–236.

---

### `agency-dashboard/components/Sidebar.tsx` (reescritura completa)

**Analog:** `agency-dashboard/components/Sidebar.tsx` (mismo archivo — estructura a reemplazar)

**Patrón 'use client' + imports existentes** (Sidebar.tsx líneas 1–4):
```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clientes } from '@/lib/data'
```

**Patrón de sub-componente interno** (Sidebar.tsx líneas 6–11 y 14–39):
```typescript
function SectionLabel({ label }: { label: string }) {
  return (...)
}

function NavItem({ href, label, icon, indent = false }: { href: string; label: string; icon: string; indent?: boolean }) {
  const path = usePathname()
  const active = path === href || (href !== '/' && path.startsWith(href))
  // ...
}
```

**Patrón de active link** (Sidebar.tsx línea 16) — MANTENER esta lógica:
```typescript
const active = path === href || (href !== '/' && path.startsWith(href))
```

**Patrón export default** (Sidebar.tsx línea 41):
```typescript
export default function Sidebar() {
```

**Estructura a reemplazar — qué cambia en la reescritura:**
- Emoji icons (`"⊞"`, `"◈"`) → Lucide React components (`<LayoutDashboard className="w-4 h-4" />`)
- `localStorage` para estado collapse (nuevo — no existe en Sidebar actual)
- `useState` para `collapsed` state (nuevo)
- Tokens CSS viejos (`#161616`, `#222`) → tokens nuevos (`var(--surface-1)`, `var(--border)`)
- Clase `.nav-item.active` CSS → inline `style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}`
- Footer: status indicator simple → links de Settings + botón Salir con `signOut()` de next-auth
- Width: 220px → 240px expandido, 56px colapsado

**localStorage pattern** — copiar de TareasCliente.tsx líneas 31–35:
```typescript
useEffect(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY(clienteId))
    if (saved) setTareas(JSON.parse(saved))
  } catch {}
}, [clienteId])
```

**Adaptar para collapse:**
```typescript
const [collapsed, setCollapsed] = useState(false)

useEffect(() => {
  try {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved) setCollapsed(JSON.parse(saved))
  } catch {}
}, [])

function toggle() {
  const next = !collapsed
  setCollapsed(next)
  try { localStorage.setItem('sidebar_collapsed', JSON.stringify(next)) } catch {}
}
```

---

### `agency-dashboard/app/layout.tsx` (actualización)

**Analog:** `agency-dashboard/app/layout.tsx` (mismo archivo)

**Estado actual** (layout.tsx líneas 1–23):
```typescript
import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "@/components/Sidebar"

export const metadata: Metadata = { ... }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ background: 'var(--bg)' }}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8 min-h-screen" style={{ background: 'var(--bg)', marginLeft: 220 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
```

**Cambios necesarios:**
1. Agregar Inter font via `next/font/google` — patrón en RESEARCH.md líneas 309–324
2. `marginLeft: 220` → `marginLeft: 240` (nuevo ancho de sidebar)
3. `padding: '2rem'` → `padding: '32px 40px'` (UI-SPEC layout contract)
4. Agregar `className={inter.variable}` a `<html>`
5. El `app/login/layout.tsx` separado elimina la necesidad de lógica condicional en este layout

**Patrón Inter font** (RESEARCH.md líneas 309–324):
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600'],
  display: 'swap',
})

// En el return:
<html lang="es" className={inter.variable}>
```

---

## Migraciones de tokens (archivos existentes)

Los 6 archivos de páginas y `TareasCliente.tsx` requieren reemplazos textuales de tokens. El patrón es idéntico en todos.

### Tabla de sustitución para los archivos de migración

Buscar y reemplazar en todos los archivos bajo `agency-dashboard/app/` y `agency-dashboard/components/TareasCliente.tsx`:

| Buscar | Reemplazar | Notas |
|---|---|---|
| `var(--txt)` | `var(--text-1)` | Color principal de texto |
| `var(--txt2)` | `var(--text-2)` | Texto secundario |
| `var(--txt3)` | `var(--text-3)` | Texto terciario |
| `var(--s1)` | `var(--surface-1)` | Superficie primaria |
| `var(--s2)` | `var(--surface-2)` | Superficie secundaria |
| `var(--s3)` | `var(--surface-2)` | No hay surface-3 nuevo — mapear a surface-2 |
| `var(--border2)` | `var(--border-2)` | Guión, no número |
| `class="hover-row` | eliminar class, agregar `className="hover:bg-[var(--surface-1)]` | O mantener transición inline |
| `class="hover-row2` | mismo que hover-row | |
| `className={...\`hover-row` | idem | En template literals |

**Verificación post-migración** — ejecutar después de todos los cambios:
```bash
grep -r "hover-row\|hover-border\|nav-item\|--s1\|--s2\|--s3\|--txt\|--border2" agency-dashboard/app/ agency-dashboard/components/
```
No debe haber matches. Si los hay, hay tokens no migrados.

### Ejemplos concretos por archivo

**`app/page.tsx` línea 24** (patrón más frecuente):
```typescript
// ANTES:
<h1 className="text-2xl font-semibold" style={{ color: 'var(--txt)' }}>
// DESPUÉS:
<h1 className="text-2xl font-semibold" style={{ color: 'var(--text-1)' }}>
```

**`app/page.tsx` línea 75** (surface + border):
```typescript
// ANTES:
style={{ background: 'var(--s1)', border: `1px solid ${kpi.accent ? '...' : 'var(--border)'}` }}
// DESPUÉS:
style={{ background: 'var(--surface-1)', border: `1px solid ${kpi.accent ? '...' : 'var(--border)'}` }}
```

**`app/page.tsx` línea 115** (hover-row class):
```typescript
// ANTES:
className="hover-row flex items-center justify-between px-5 py-4 transition-colors"
// DESPUÉS:
className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--surface-1)]"
```

**`app/clientes/[id]/page.tsx` línea 11** (async params — NO cambiar):
```typescript
// MANTENER SIN CAMBIOS — es correcto para Next.js 16
export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
```

**`components/TareasCliente.tsx` línea 98** (s3 → surface-2):
```typescript
// ANTES:
style={{ background: 'var(--s3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}
// DESPUÉS:
style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}
```

---

## Shared Patterns

### Patrón: Server Component (default — sin `'use client'`)

**Fuente:** `agency-dashboard/app/clientes/page.tsx`, `agency-dashboard/app/alertas/page.tsx`, `agency-dashboard/app/page.tsx`

**Aplica a:** `app/settings/page.tsx` (nuevo)

Características:
- Sin directiva `'use client'` al tope
- Función async (si necesita await) o síncrona
- `export default function NombrePagina()` — PascalCase matching route intent
- Puede leer `process.env.*` directamente
- Sin hooks (`useState`, `useEffect`, etc.)
- No hay `'use client'` en ninguno de los 5 archivos de páginas existentes (excepto `app/tareas/page.tsx`)

### Patrón: Client Component

**Fuente:** `agency-dashboard/components/TareasCliente.tsx` (líneas 1–2), `agency-dashboard/components/Sidebar.tsx` (línea 1)

**Aplica a:** `app/login/page.tsx`, reescritura de `Sidebar.tsx`

```typescript
'use client'          // SIEMPRE primera línea, antes de todo
import { useState } from 'react'
```

### Patrón: localStorage con try/catch silencioso

**Fuente:** `agency-dashboard/components/TareasCliente.tsx` (líneas 31–35)

**Aplica a:** `Sidebar.tsx` (collapse state)

```typescript
useEffect(() => {
  try {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved) setCollapsed(JSON.parse(saved))
  } catch {}   // error silencioso — nunca console.log
}, [])
```

### Patrón: import type para tipos

**Fuente:** `agency-dashboard/app/tareas/page.tsx` (línea 5), `agency-dashboard/app/layout.tsx` (línea 1)

**Aplica a:** todos los archivos nuevos que importan tipos

```typescript
import type { Metadata } from "next"
import type { Tarea, TareaEstado } from '@/lib/data'
```

### Patrón: CSS custom properties — inline style para colores

**Fuente:** todos los archivos de páginas existentes

**Aplica a:** todos los archivos nuevos y migrados

```typescript
// Colores SIEMPRE via CSS custom properties, nunca valores hardcoded Tailwind para el tema
style={{ color: 'var(--text-1)' }}            // texto primario
style={{ background: 'var(--surface-1)' }}   // superficie
style={{ border: '1px solid var(--border)' }} // bordes
// Excepciones: estado semántico puede usar Tailwind colored utilities
className="text-emerald-400"  // OK — estado Estable
className="text-red-400"      // OK — estado Crítico
```

### Patrón: `@/` path alias — nunca rutas relativas

**Fuente:** todos los archivos del proyecto

**Aplica a:** todos los archivos nuevos

```typescript
import { clientes } from '@/lib/data'         // correcto
import TareasCliente from '@/components/TareasCliente'  // correcto
// NUNCA: import { ... } from '../../lib/data'
```

### Patrón: async params en rutas dinámicas

**Fuente:** `agency-dashboard/app/clientes/[id]/page.tsx` (líneas 11–13)

**Aplica a:** `app/api/ping/[tool]/route.ts`

```typescript
// Next.js 16 — params es una Promise
export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params   // await es obligatorio
```

### Patrón: notFound() para rutas dinámicas sin match

**Fuente:** `agency-dashboard/app/clientes/[id]/page.tsx` (líneas 13–14)

```typescript
import { notFound } from 'next/navigation'
const c = clientes.find(c => c.id === id)
if (!c) notFound()
```

### Patrón: sub-componentes en el mismo archivo (no exportados)

**Fuente:** `agency-dashboard/components/TareasCliente.tsx` (líneas 221–223), `agency-dashboard/app/clientes/[id]/page.tsx` (líneas 497–498)

**Aplica a:** `Sidebar.tsx` (NavItem, SectionLabel sub-components)

```typescript
// Sub-componente: function declaration, no export
function TareaRow({ tarea, onToggle }: { tarea: Tarea; onToggle: (id: string) => void }) {
  // ...
}

function WfRow({ wf }: { wf: import('@/lib/data').Workflow }) {
  // ...
}
```

### Patrón: prefijo `_` para parámetros no usados

**Fuente:** CLAUDE.md convenciones

**Aplica a:** `app/api/ping/[tool]/route.ts`

```typescript
export async function POST(
  _req: NextRequest,  // _req porque no se usa el request body
  { params }: { params: Promise<{ tool: string }> }
)
```

---

## Sin Analog en el Codebase

Archivos sin match en el codebase — el planner debe usar los patrones de RESEARCH.md:

| Archivo | Rol | Data Flow | Razón |
|---|---|---|---|
| `agency-dashboard/auth.ts` | config | request-response | No hay archivos de configuración next-auth en el proyecto |
| `agency-dashboard/proxy.ts` | middleware | request-response | No hay middleware/proxy en el proyecto |
| `agency-dashboard/app/api/auth/[...nextauth]/route.ts` | Route Handler | request-response | No hay ningún Route Handler (`app/api/`) en el proyecto |
| `agency-dashboard/app/api/ping/[tool]/route.ts` | Route Handler | request-response | Idem — primer Route Handler del proyecto |

Para estos archivos el ejecutor DEBE leer los patrones en RESEARCH.md secciones Pattern 1–7 (líneas 193–408).

---

## Riesgos y Notas para el Ejecutor

1. **`proxy.ts` no `middleware.ts`** — El archivo de protección de rutas SE LLAMA `proxy.ts` en Next.js 16. Crear `middleware.ts` es incorrecto. Ver RESEARCH.md Pitfall 1 (líneas 437–441).

2. **`process.env.*` solo en Server Components y Route Handlers** — `app/settings/page.tsx` debe ser Server Component (sin `'use client'`). Los valores de env vars nunca pasan al cliente — solo booleanos (configurado: sí/no). Ver RESEARCH.md Pitfall 3 (líneas 449–452).

3. **`--s3` → `--surface-2`** — No existe `--surface-3` en el nuevo design system. Todos los usos de `var(--s3)` se mapean a `var(--surface-2)`. Ver tabla de mapping arriba.

4. **`.hover-row`, `.hover-row2`, `.nav-item` — eliminar todas las referencias** — Estas clases CSS no existirán en el nuevo `globals.css`. Reemplazar con hover utilities de Tailwind (`hover:bg-[var(--surface-1)]`) o estilos inline. Ver RESEARCH.md Pitfall 5 (líneas 459–462).

5. **`--border2` → `--border-2`** (guión, no número) — Diferente nombre, no solo diferente valor.

6. **Lucide icons: `className="w-4 h-4"`** — 16px per UI-SPEC. Importar individualmente: `import { LayoutDashboard } from 'lucide-react'`.

7. **SessionProvider en Phase 1** — Según RESEARCH.md Open Question 2 (líneas 571–573): si el Sidebar solo llama `signOut()` de `next-auth/react`, NO necesita `SessionProvider`. No agregar el wrapper innecesariamente.

8. **`export default` vs `export` en components/ui/** — Los componentes en `components/ui/` usan **named exports** (`export function Badge`), no default exports. Es lo requerido por D-11. Los demás componentes del proyecto (`Sidebar`, `TareasCliente`) usan default exports — eso es correcto para ellos.

---

## Metadata

**Scope de búsqueda de analogs:**
- `agency-dashboard/app/**/*.tsx`
- `agency-dashboard/components/**/*.tsx`
- `agency-dashboard/app/globals.css`

**Archivos escaneados:** 10 (todos los archivos .tsx + globals.css del proyecto)
**Sin Route Handlers previos:** confirmado — `app/api/` no existe
**Sin archivos de config auth previos:** confirmado — `auth.ts`, `proxy.ts` son nuevos

**Fecha de extracción:** 2026-04-26
