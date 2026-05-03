# Requirements: Agency Automation Intelligence SaaS

**Defined:** 2026-04-25
**Core Value:** El admin puede abrir la plataforma y en 30 segundos saber qué clientes necesitan atención, qué oportunidades de upsell existen hoy y qué está funcionando — sin abrir n8n, Chatwoot ni Airtable por separado.

## v1 Requirements

### Design System (DSYS)

- [ ] **DSYS-01**: Admin ve la app con estética Notion — paleta neutra, tipografía Inter, whitespace generoso, sin dark mode pesado
- [ ] **DSYS-02**: Sidebar colapsable con jerarquía, íconos, estado activo y secciones agrupadas
- [ ] **DSYS-03**: Componentes base reutilizables disponibles en toda la app: Badge, Card, StatBlock, AlertRow, HealthBadge, MetricRow
- [ ] **DSYS-04**: Vistas tipo tabla/database con filtros y agrupación visual

### Auth (AUTH)

- [ ] **AUTH-01**: Admin puede hacer login con email/password
- [ ] **AUTH-02**: Sesión persiste entre refreshes de browser
- [ ] **AUTH-03**: Admin puede hacer logout desde cualquier pantalla

### Config (CONF)

- [ ] **CONF-01**: Admin configura URLs y API keys de n8n, Chatwoot, OpenAI, Airtable y Slack desde pantalla de Settings
- [ ] **CONF-02**: La plataforma verifica que cada conexión configurada está activa y muestra su estado

### Hub de Integraciones (INTG)

- [ ] **INTG-01**: Admin ve todas las herramientas conectadas (Chatwoot, n8n, Slack, Airtable, OpenAI) en un hub centralizado con indicador visual de estado (conectado / error / desconectado)
- [ ] **INTG-02**: Admin puede ejecutar un test de conexión por herramienta para verificar que funciona en el momento
- [ ] **INTG-03**: Admin ve métricas básicas de cada herramienta (conversaciones activas en Chatwoot, workflows activos en n8n, tokens consumidos en OpenAI, registros en Airtable)
- [ ] **INTG-04**: Admin puede agregar, editar o eliminar una integración desde el hub (URL, API key, nombre)

### Datos Reales (DATA)

- [ ] **DATA-01**: Datos de clientes se leen desde Airtable (reemplaza seed data estática de lib/data.ts)
- [ ] **DATA-02**: Datos de workflows y ejecuciones se leen desde n8n API por cliente
- [ ] **DATA-03**: Métricas de conversaciones, contactos y canales se leen desde Chatwoot API por cliente
- [ ] **DATA-04**: Uso de tokens y costos se lee desde OpenAI API
- [ ] **DATA-05**: Alertas, recomendaciones y Health Scores se persisten y leen desde Airtable

### Dashboard Global (DASH)

- [ ] **DASH-01**: Admin ve resumen de toda la agencia: clientes en riesgo, alertas críticas activas, oportunidades de upsell detectadas, KPIs globales
- [ ] **DASH-02**: Admin hace clic en un cliente en el dashboard global y va directo a su hub individual
- [ ] **DASH-03**: Admin hace clic en una alerta en el dashboard y ve el recurso exacto que la generó (deep link)
- [ ] **DASH-04**: Accesos directos a n8n, Chatwoot, Airtable, OpenAI y Slack disponibles en header o sidebar desde cualquier pantalla

### Clientes (CLIE)

- [ ] **CLIE-01**: Admin ve lista de clientes filtrable por nicho, plan, estado de salud y oportunidades activas
- [ ] **CLIE-02**: Admin puede agrupar clientes por nicho, plan o estado de salud
- [ ] **CLIE-03**: Admin puede crear un cliente nuevo con todos los campos del perfil: nombre, nicho, plan, canales habilitados, email de contacto, fecha de inicio, notas internas
- [ ] **CLIE-04**: Admin puede editar el perfil de un cliente existente
- [ ] **CLIE-05**: Admin ve tags operativos de cada cliente: automatizaciones activas, canales habilitados (WhatsApp / Instagram / Webchat / Facebook), estado (Estable / En riesgo / Crítico)

### Hub por Cliente (MNTR)

- [ ] **MNTR-01**: Admin ve dashboard individual del cliente: workflows activos/inactivos, Health Score actual, alertas activas y recomendaciones pendientes
- [ ] **MNTR-02**: Admin hace clic en un workflow y abre ese workflow exacto en n8n (deep link con workflowId)
- [ ] **MNTR-03**: Admin ve métricas de performance por canal del cliente (WhatsApp, Instagram, Webchat, Facebook): tasa de conversión, tiempo de respuesta, calidad de leads
- [ ] **MNTR-04**: Admin ve panel de upgrade del cliente: automatizaciones activas / disponibles con su plan / recomendadas con CTA de activación

### Health Score (HLTH)

- [ ] **HLTH-01**: Cada cliente tiene un Health Score 0–100 calculado por n8n basado en 4 factores: estabilidad de workflows, disponibilidad de recursos, performance de conversión, cobertura de automatizaciones
- [ ] **HLTH-02**: Admin puede ver el detalle del Health Score de un cliente: qué factor lo baja, cuánto pesa cada uno y qué acción lo mejoraría
- [ ] **HLTH-03**: El Health Score se actualiza automáticamente (n8n recalcula y escribe en Airtable periódicamente)

### Alertas (ALRT)

- [ ] **ALRT-01**: Las alertas están clasificadas y visualmente diferenciadas: Crítico 🔴 (fallo operacional) / Warning 🟡 (riesgo de performance) / Oportunidad 🟢 (crecimiento)
- [ ] **ALRT-02**: Admin ve panel global de alertas filtrable por severidad, cliente y fecha
- [ ] **ALRT-03**: Admin puede marcar una alerta como resuelta o pospuesta desde el panel
- [ ] **ALRT-04**: Alertas críticas y warnings se envían automáticamente a Slack vía webhook
- [ ] **ALRT-05**: Cada alerta incluye deep link al recurso exacto que la generó (workflow en n8n, conversación en Chatwoot)

### Tareas / Segundo Cerebro (TASK)

- [ ] **TASK-01**: Admin puede crear una tarea pendiente ligada a un cliente con título, prioridad (alta / media / baja) y fecha límite
- [ ] **TASK-02**: Admin puede convertir una alerta o recomendación en tarea con un clic (contexto heredado automáticamente)
- [ ] **TASK-03**: Admin ve todas las tareas en una vista global filtrable por cliente, prioridad y vencimiento
- [ ] **TASK-04**: Admin ve las tareas pendientes del cliente directamente en su dashboard individual
- [ ] **TASK-05**: Admin puede marcar tareas como completadas, en progreso o pospuestas

### Motor de Inteligencia (INTL)

- [ ] **INTL-01**: Motor detecta y muestra recomendaciones operacionales por cliente: workflows lentos, canales con bajo rendimiento sin optimizar, gaps en flujos básicos
- [ ] **INTL-02**: Motor detecta y muestra oportunidades de crecimiento: leads sin seguimiento automatizado, recordatorios faltantes, flujos post-venta ausentes
- [ ] **INTL-03**: Motor genera oportunidades de upsell basadas en plan actual, nicho y uso real: módulos disponibles no activos, comparativa con clientes similares en plan superior
- [ ] **INTL-04**: Las recomendaciones incluyen sugerencias específicas por nicho: Dental (follow-up post-tratamiento, recordatorios de turno), Gym (follow-up de trial, retención), Clínica Estética (nurturing, oferta relacionada), Inmobiliaria (leads fríos, recordatorios de visita)

### Métricas (METR)

- [ ] **METR-01**: Por cliente: conversaciones manejadas, leads seguidos, tiempo de respuesta promedio y horas estimadas ahorradas
- [ ] **METR-02**: Cálculo automático de horas ahorradas: conversaciones × tiempo promedio por conversación manual (configurable por nicho al dar de alta al cliente)
- [ ] **METR-03**: Comparativa de performance entre canales del cliente para identificar cuál optimizar primero

### Reportes (RPRT)

- [ ] **RPRT-01**: n8n genera y envía reporte de performance mensual en HTML al email del admin con: resumen del mes, horas ahorradas, mejoras vs. mes anterior, oportunidades detectadas, propuestas de upgrade
- [ ] **RPRT-02**: n8n genera reporte ejecutivo mensual para reuniones de cuenta: performance de workflows, comparativa, nuevas oportunidades, próximas automatizaciones sugeridas
- [ ] **RPRT-03**: n8n envía digest diario/semanal de oportunidades y alertas a Slack

### Onboarding de Clientes (ONBR)

- [ ] **ONBR-01**: Admin puede seguir el Framework de Alta de Cliente como checklist guiado en la UI (10 pasos: perfil, n8n, Chatwoot, OpenAI, umbrales, alertas, email, Health Score, catálogo, revisión final)
- [ ] **ONBR-02**: La plataforma verifica conexiones de n8n y Chatwoot de un cliente nuevo directamente desde el checklist de onboarding

---

## v2 Requirements

### Acceso del Cliente

- **CLIE-v2-01**: Cliente puede hacer login y ver solo su propio dashboard (versión restringida del hub)
- **CLIE-v2-02**: Cliente ve sus automatizaciones activas, reportes históricos y recomendaciones desde su portal

### Inteligencia Avanzada

- **INTL-v2-01**: Motor predice problemas antes de que ocurran ("este cliente agotará tokens en 5 días al ritmo actual")
- **INTL-v2-02**: Motor detecta qué workflows y prompts funcionan mejor y recomienda replicarlos a clientes del mismo nicho
- **INTL-v2-03**: Predicción de revenue por cliente: LTV proyectado, probabilidad de churn, revenue potencial de upgrades recomendados

### Customer Journey Intelligence

- **JOUR-v2-01**: Trazabilidad completa del recorrido de un lead: canal de origen, automatizaciones tocadas, punto de abandono, tiempo de conversión

### Tool Intelligence Hub (avanzado)

- **TOOL-v2-01**: Dashboards avanzados por herramienta: n8n (workflows más fallidos), Chatwoot (agentes con mejor conversión), OpenAI (costo por cliente)

### Análisis de Conversión Humana (profundo)

- **CONV-v2-01**: Trazabilidad de qué pasa después del handoff humano: tiempo de respuesta por agente, tasa de cierre, drop-offs

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Portal de cliente con login | v2 — esperar hasta 3+ clientes activos y MVP estable |
| Recomendaciones predictivas | Requiere 2–3 meses de datos históricos por cliente |
| Motor de Best Practices entre clientes | Requiere 5+ clientes activos en el mismo nicho |
| Revenue Intelligence / predicción de churn | v2 avanzada — mínimo 6 meses de datos |
| Customer Journey Intelligence completo | Requiere integración Chatwoot sólida + 3 meses de datos |
| Análisis de conversión humana profundo | Datos de handoff insuficientes en MVP |
| Migración de Airtable a DB custom | Airtable cubre el MVP; migrar cuando haya 10+ clientes activos |
| Multi-tenancy / múltiples agencias | Uso interno de una sola agencia en el MVP |
| GoHighLevel (GHL) | Reemplazado por Chatwoot como herramienta de conversaciones — se puede incorporar en v2 si se necesita CRM dedicado |

---

## Traceability

*Updated 2026-04-25 — revised to 7-phase structure (Integration Hub promoted to standalone Phase 2; Data Layer = Phase 3; Dashboard/Clients/Tasks = Phase 4; Client Hub/Health/Alerts = Phase 5; Intelligence/Metrics/Reports = Phase 6; Onboarding = Phase 7).*

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSYS-01 | Phase 1 | Pending |
| DSYS-02 | Phase 1 | Pending |
| DSYS-03 | Phase 1 | Pending |
| DSYS-04 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| CONF-01 | Phase 1 | Pending |
| CONF-02 | Phase 1 | Pending |
| INTG-01 | Phase 2 | Pending |
| INTG-02 | Phase 2 | Pending |
| INTG-03 | Phase 2 | Pending |
| INTG-04 | Phase 2 | Pending |
| DATA-01 | Phase 3 | Pending |
| DATA-02 | Phase 3 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |
| DATA-05 | Phase 3 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| CLIE-01 | Phase 4 | Pending |
| CLIE-02 | Phase 4 | Pending |
| CLIE-03 | Phase 4 | Pending |
| CLIE-04 | Phase 4 | Pending |
| CLIE-05 | Phase 4 | Pending |
| TASK-01 | Phase 4 | Pending |
| TASK-02 | Phase 4 | Pending |
| TASK-03 | Phase 4 | Pending |
| TASK-04 | Phase 4 | Pending |
| TASK-05 | Phase 4 | Pending |
| MNTR-01 | Phase 5 | Pending |
| MNTR-02 | Phase 5 | Pending |
| MNTR-03 | Phase 5 | Pending |
| MNTR-04 | Phase 5 | Pending |
| HLTH-01 | Phase 5 | Pending |
| HLTH-02 | Phase 5 | Pending |
| HLTH-03 | Phase 5 | Pending |
| ALRT-01 | Phase 5 | Pending |
| ALRT-02 | Phase 5 | Pending |
| ALRT-03 | Phase 5 | Pending |
| ALRT-04 | Phase 5 | Pending |
| ALRT-05 | Phase 5 | Pending |
| INTL-01 | Phase 6 | Pending |
| INTL-02 | Phase 6 | Pending |
| INTL-03 | Phase 6 | Pending |
| INTL-04 | Phase 6 | Pending |
| METR-01 | Phase 6 | Pending |
| METR-02 | Phase 6 | Pending |
| METR-03 | Phase 6 | Pending |
| RPRT-01 | Phase 6 | Pending |
| RPRT-02 | Phase 6 | Pending |
| RPRT-03 | Phase 6 | Pending |
| ONBR-01 | Phase 7 | Pending |
| ONBR-02 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 56 total
- Mapped to phases: 56/56
- Unmapped: 0
- Phase distribution: Phase 1 (9) + Phase 2 (4) + Phase 3 (5) + Phase 4 (14) + Phase 5 (12) + Phase 6 (10) + Phase 7 (2) = 56

---
*Requirements defined: 2026-04-25*
*Last updated: 2026-04-25 — phase mapping revised to 7-phase structure*
