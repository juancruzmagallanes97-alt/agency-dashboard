# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 01-foundation
**Areas discussed:** Auth — librería y credenciales, Config persistence — dónde guardar API keys, Migración de páginas existentes

---

## Auth — Librería y credenciales

| Option | Description | Selected |
|--------|-------------|----------|
| next-auth v5 (auth.js) | Versión actual diseñada para App Router. API limpia con auth() server function. Soporta CredentialsProvider. | ✓ |
| next-auth v4 | Versión más estable con más ejemplos. Usa getServerSession(). Compatible con App Router vía route handler. | |
| Custom middleware simple | Sin dependencia externa — middleware.ts que valida un cookie de sesión. Más simple pero menos seguro. | |

**User's choice:** next-auth v5

---

| Option | Description | Selected |
|--------|-------------|----------|
| .env.local con bcrypt hash | ADMIN_EMAIL y ADMIN_PASSWORD_HASH en .env.local. Hash generado una vez con bcrypt. | ✓ |
| .env.local en texto plano | ADMIN_EMAIL y ADMIN_PASSWORD directamente. Más simple — aceptable para tool interno. | |
| Hardcodeado en auth.ts | Credenciales directamente en código. No recomendado — queda en git history. | |

**User's choice:** .env.local con bcrypt hash

---

| Option | Description | Selected |
|--------|-------------|----------|
| JWT | Sesión stateless en cookie httpOnly. No requiere DB. Funciona en Vercel serverless. | ✓ |
| Database session | Sesión guardada en base de datos. Requiere adapter (no hay DB en Phase 1). | |

**User's choice:** JWT

---

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect a /login | middleware.ts intercepta rutas protegidas y redirige. El matcher excluye /login y assets estáticos. | ✓ |
| Mostrar 401 en la página | Cada página individual maneja el estado no-autenticado. Más código repetido. | |

**User's choice:** Redirect a /login

---

## Config Persistence — dónde guardar API keys

| Option | Description | Selected |
|--------|-------------|----------|
| Archivo JSON server-side | Server Action escribe en data/settings.json. Simple, funciona en local. En Vercel se pierden al redeploy. | |
| Variables de entorno (.env.local) | Admin las setea manualmente. Settings screen solo muestra estado (read-only). | ✓ |
| localStorage (client-side) | Se guardan en el browser del admin. Sin backend. Inseguro para API keys. | |

**User's choice:** Variables de entorno (.env.local)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Muestra estado de conexión + botón de test | Cada integración muestra si está configurada y status. Botón "Probar conexión" hace un ping real. No hay campos editables. | ✓ |
| Muestra los valores (enmascarados) + permite editar | Inputs con valores actuales enmascarados. Al guardar escribe un nuevo .env.local via Server Action. | |

**User's choice:** Muestra estado de conexión + botón de test (read-only)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Una URL + una API Key por tool | N8N_URL + N8N_API_KEY, CHATWOOT_URL + CHATWOOT_TOKEN, OPENAI_API_KEY, AIRTABLE_API_KEY + AIRTABLE_BASE_ID, SLACK_WEBHOOK_URL. | ✓ |
| Definirlo en la implementación | Claude decide los nombres de env vars al implementar. | |

**User's choice:** Una URL + una API Key por tool (convención explícita)

---

## Migración de páginas existentes

| Option | Description | Selected |
|--------|-------------|----------|
| Migración completa en Phase 1 | Reemplazar globals.css + migrar todos los archivos de página a los nuevos tokens. Sidebar.tsx reescrito. | ✓ |
| Alias de compatibilidad en globals.css | Agregar aliases que mapean --txt → --text-1, etc. Migración incremental. | |
| Solo nuevas páginas en Phase 1 | Phase 1 agrega auth + settings con el nuevo diseño. Páginas existentes quedan oscuras. No cumple success criterion. | |

**User's choice:** Migración completa en Phase 1

---

| Option | Description | Selected |
|--------|-------------|----------|
| Mantener datos estáticos, solo migrar estilos | La seed data en lib/data.ts se queda. Phase 1 solo cambia la capa visual. | ✓ |
| Simplificar páginas a shells vacíos | Quitar el contenido actual y dejar solo el layout shell. Pierde la demo funcional existente. | |

**User's choice:** Mantener datos estáticos, solo migrar estilos

---

## Claude's Discretion

- Implementación exacta de cada "Probar conexión" API route (endpoint + auth header por tool)
- Estrategia de test para Slack webhook (POST test payload vs. solo verificar que la URL está seteada)
- Organización interna de `components/ui/` (un archivo por componente vs. agrupado)

## Deferred Ideas

- shadcn/ui initialization — recomendado antes de Phase 2 según UI-SPEC, no necesario en Phase 1
- Password reset flow — link estático en Phase 1, sin funcionalidad real
- Settings screen con inputs editables — deferred; .env.local es suficiente para MVP
