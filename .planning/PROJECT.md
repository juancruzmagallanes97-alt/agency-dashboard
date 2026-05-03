# Agency Automation Intelligence SaaS

## What This Is

Un segundo cerebro operativo para la agencia: un panel unificado que indexa y centraliza todas las herramientas de automatización e IA (n8n, Chatwoot, Airtable, Slack, OpenAI) sin reemplazarlas. Cada herramienta sigue haciendo su trabajo en su propio sistema; esta plataforma es el organizador central que ve todo desde un solo lugar. Responde 4 preguntas por cada cliente: qué está funcionando, qué está fallando, qué se puede mejorar y qué oportunidades nuevas existen. UX al estilo Notion.

## Core Value

El admin abre la plataforma y ve el ecosistema completo de automatizaciones desde un solo lugar — estado de cada herramienta, clientes que necesitan atención, tareas pendientes y oportunidades de upsell — sin tener que abrir n8n, Chatwoot ni Airtable por separado.

## Requirements

### Validated

- ✓ App shell Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript — existente
- ✓ Sidebar de navegación global con todas las secciones — existente
- ✓ Routing: dashboard global, clientes (lista + detalle), alertas, herramientas, tareas — existente
- ✓ Tipos TypeScript para clientes, alertas, automatizaciones, tareas — existente
- ✓ Catálogo de automatizaciones (seed data) — existente
- ✓ Panel de tareas por cliente con persistencia en localStorage — existente

### Active

**UX / Design System**
- [ ] Redesign visual completo estilo Notion: paleta neutra, tipografía limpia, whitespace generoso
- [ ] Sidebar colapsable con jerarquía, íconos y estado activo refinado
- [ ] Vistas tipo tabla/database con filtros y agrupaciones (clientes, alertas, recomendaciones)
- [ ] Componentes reutilizables: Badge, Card, StatBlock, AlertRow, HealthBadge, MetricRow

**Auth & Config**
- [ ] Auth de admin (NextAuth o similar) — login único, sesión persistente
- [ ] Pantalla de configuración: URLs de n8n, GHL, OpenAI, Slack, Airtable

**Datos reales — Capa de datos**
- [ ] Reemplazar seed data estática por datos reales desde Airtable (perfiles, métricas, alertas, recomendaciones)
- [ ] API routes Next.js para cada fuente de datos (Airtable, n8n API, GHL API, OpenAI API)

**Dashboard Global de Agencia**
- [ ] Vista maestra con clientes en riesgo, alertas críticas activas, oportunidades de upsell, KPIs globales
- [ ] Accesos directos globales a n8n, GHL, Airtable, OpenAI, Slack desde header/sidebar

**Perfiles de Clientes**
- [ ] Vista lista filtrable y agrupable por nicho, plan, estado de salud, oportunidades activas
- [ ] Perfil completo: nombre, nicho, plan, canales habilitados, fecha inicio, contacto, notas
- [ ] Tags operativos: automatizaciones activas, canales, estado (Estable / En riesgo / Crítico)
- [ ] Crear/editar/archivar cliente desde la UI

**Hub de Monitoreo por Cliente**
- [ ] Dashboard individual: workflows activos/inactivos, Health Score, alertas activas, recomendaciones pendientes
- [ ] Deep links: clic en workflow → abre ese workflow en n8n; clic en GHL → pipeline del cliente
- [ ] Métricas por canal (WhatsApp, Instagram, Webchat, Facebook)
- [ ] Panel de upgrade: automatizaciones activas / disponibles / recomendadas con CTA

**Health Score**
- [ ] Cálculo automático por n8n basado en 4 factores: workflows, recursos, conversión, cobertura
- [ ] Vista de detalle del Health Score (qué factor lo baja y cuánto)
- [ ] Histórico de Health Score por cliente

**Sistema de Alertas**
- [ ] Alertas clasificadas: Crítico (🔴) / Warning (🟡) / Oportunidad (🟢)
- [ ] Panel global de alertas con filtros por severidad, cliente y fecha
- [ ] Marcar alerta como resuelta / pospuesta desde la UI
- [ ] Envío de alertas a Slack (webhook) — todas las alertas en tiempo real

**Motor de Inteligencia**
- [ ] Recomendaciones operacionales por reglas (gaps en workflows, canales sin optimizar)
- [ ] Oportunidades de crecimiento detectadas (leads sin seguimiento, flujos faltantes)
- [ ] Oportunidades de upsell por plan y nicho
- [ ] Recomendaciones específicas por nicho: Dental, Gym, Clínica Estética, Inmobiliaria

**Tracking de Métricas**
- [ ] Por cliente: conversaciones manejadas, leads seguidos, tiempo de respuesta, horas ahorradas
- [ ] Performance por canal con comparativa entre canales
- [ ] Cálculo de horas ahorradas (fórmula: conversaciones × tiempo promedio por nicho)

**Motor de Reportes**
- [ ] Reporte de performance mensual en HTML (generado por n8n, enviado por email)
- [ ] Reporte ejecutivo mensual para reuniones de cuenta
- [ ] Alertas y digest diario/semanal a Slack

**Framework de Alta de Cliente**
- [ ] Checklist de onboarding guiado en la UI (10 pasos del framework)
- [ ] Verificación de conexiones (n8n, GHL, OpenAI) desde la plataforma

### Out of Scope

- Portal de cliente con login — v2.0 cuando haya 3+ clientes activos y MVP estable
- Recomendaciones predictivas — requiere 2-3 meses de datos históricos
- Motor de Best Practices entre clientes — requiere 5+ clientes mismo nicho
- Revenue Intelligence / predicción de churn — v2.0 avanzada, 6+ meses de datos
- Customer Journey Intelligence completo — requiere integración GHL sólida + 3 meses de datos
- Análisis de conversión humana profundo — datos de handoff insuficientes en MVP
- Migración de Airtable a DB custom — Airtable funciona para MVP; migrar con 10+ clientes
- Tool Intelligence Hub dashboards avanzados — v2.0 cuando el monitoreo básico esté maduro
- Multi-tenancy / acceso multi-agencia — uso interno de una sola agencia

## Context

**Codebase existente:** `agency-dashboard/` — Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript. Estructura de rutas completa (dashboard, clientes, alertas, herramientas, tareas). Actualmente usa datos estáticos en `lib/data.ts` con seed data. Paleta dark actual será reemplazada por diseño Notion-style.

**Stack de integración:** n8n como motor de automatización y monitoreo, Airtable como capa de datos MVP, GoHighLevel como CRM (sub-accounts por cliente), OpenAI API para uso de tokens, Slack para alertas admin.

**Usuario único MVP:** Agency Admin (solo vos). Los clientes no tienen login — reciben comunicación por email HTML automatizado generado por n8n.

**Referencia de diseño:** Notion — paleta neutra clara/oscura, tipografía Inter, whitespace generoso, sidebar colapsable con jerarquía, tablas/vistas con filtros y agrupaciones, transiciones suaves. Sin widgets de dashboard corporativos rígidos.

**Referencia de producto:** GoHighLevel — potencia operativa de un CRM/ops platform completo. Cada feature tiene utilidad real para la operación diaria, no solo para parecer completo.

## Constraints

- **Tech stack**: Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript — continuar con la base existente
- **Datos MVP**: Airtable como backend de datos (no base de datos custom hasta 10+ clientes)
- **Single user**: Solo Agency Admin en MVP, sin sistema de roles complejo
- **n8n como orquestador**: El motor de inteligencia y reportes corre en n8n, no en el frontend
- **No-replacement principle**: La plataforma no replica funcionalidad de las herramientas — las indexa. Deep links llevan directo al recurso exacto en cada tool.
- **Deep links**: Airtable almacena IDs y URLs de recursos de n8n/Chatwoot; el frontend los usa para construir los links

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Continuar sobre agency-dashboard/ existente | Estructura de rutas y tipos ya establecidos correctamente | — Pending |
| Airtable como capa de datos MVP | Funciona perfecto para MVP, migrar a DB custom con 10+ clientes | — Pending |
| n8n como motor de inteligencia | Toda la lógica de reglas, health scores y reportes corre en n8n, no en el frontend | — Pending |
| UX estilo Notion | Limpio, sin ruido, familiar, escalable visualmente | — Pending |
| Auth solo admin en MVP | Un solo usuario, no vale la pena sistema multi-rol hasta tener portal de clientes | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-25 after initialization*
