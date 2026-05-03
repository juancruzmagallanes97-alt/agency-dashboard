# Agency Automation Intelligence SaaS

## Product Strategy Document — MVP

---

# 1. Visión y Posicionamiento

Una plataforma interna SaaS para la agencia que centraliza el monitoreo de automatizaciones, el estado operativo de clientes, las oportunidades de crecimiento y las recomendaciones estratégicas.

**Posicionamiento:**
> "Una plataforma de inteligencia de automatización que monitorea las automatizaciones de cada cliente, detecta oportunidades, y recomienda acciones para mejorar conversión, retención y crecimiento."

La plataforma transforma la gestión de automatizaciones de un servicio de mantenimiento reactivo a un sistema de crecimiento estratégico proactivo.

**El objetivo central es responder 4 preguntas por cada cliente:**

1. ¿Qué está funcionando?
2. ¿Qué está fallando?
3. ¿Qué se puede mejorar?
4. ¿Qué oportunidades nuevas existen?

Esto crea un loop continuo de crecimiento:

```
Monitorear → Detectar → Recomendar → Mejorar → Vender upgrade
```

---

# 2. Arquitectura del Sistema

La plataforma se compone de tres capas:

## Frontend (tu SaaS)
Aplicación web propia donde está todo centralizado:
- Dashboards de agencia y de cada cliente
- Perfiles de clientes con tags
- Panel de alertas activas
- Motor de recomendaciones y oportunidades
- Catálogo de automatizaciones
- Reportes y KPIs

## Capa de Datos (MVP: Airtable → futuro: base de datos custom)
Almacena toda la información operativa:
- Perfiles de clientes
- Estado de automatizaciones
- Historial de alertas y métricas
- Recomendaciones generadas
- Catálogo de automatizaciones disponibles

## Motor de Automatización (n8n)
Orquesta todo el sistema en background:
- Monitorea workflows, recursos y métricas de cada cliente
- Calcula health scores
- Genera alertas y recomendaciones por reglas
- Envía notificaciones a Slack (admin) y emails HTML (clientes)
- Genera y distribuye reportes programados

---

# 3. Roles de Usuario

## Agency Admin (vos)

Acceso global a toda la plataforma.

Puede:
- Ver todos los dashboards de clientes
- Ver el dashboard global de agencia
- Recibir alertas operacionales y de oportunidades en **Slack**
- Recibir todos los reportes en **Slack**
- Detectar oportunidades de upsell
- Gestionar perfiles, tags y planes de clientes
- Acceder a los dashboards de herramientas

---

## Client User (MVP: solo recibe emails)

En el MVP los clientes **no tienen login**. Reciben comunicación por **email HTML** automatizado:

- Reportes de performance
- Resumen ejecutivo mensual
- Recomendaciones detectadas
- Propuestas de mejora / upgrade

> Futuro: portal de cliente con login y acceso restringido a su propio dashboard.

---

# 4. Dashboard Global de Agencia

Vista maestra para operaciones internas. Es la pantalla principal de la plataforma.

Muestra en tiempo real:
- Clientes en riesgo (health score bajo)
- Alertas críticas activas
- Problemas de recursos detectados
- Oportunidades de upsell identificadas
- Oportunidades de crecimiento por cliente
- KPIs globales de la agencia

**Accesos directos de herramientas (barra superior o sidebar):**

| Botón | Acción |
|---|---|
| n8n | Abre el panel principal de n8n |
| GoHighLevel | Abre el CRM principal de GHL |
| Airtable | Abre la base de datos |
| OpenAI | Abre el dashboard de usage de OpenAI |
| Slack | Abre el canal de alertas de la agencia |

Un clic desde cualquier pantalla te lleva directamente a la herramienta correspondiente.

Funciona como el centro de operaciones y revenue de la agencia.

---

# 5. Perfiles de Clientes

Cada cliente tiene un perfil completo dentro de la plataforma con los siguientes campos y tags:

## Información base
- Nombre del cliente / empresa
- Nicho (tag): Dental / Gym / Clínica Estética / Inmobiliaria / etc.
- Plan activo (tag): Starter / Growth / Pro
- Fecha de inicio
- Contacto principal y email

## Tags operativos
- Automatizaciones activas (tags por módulo)
- Canales habilitados: WhatsApp / Instagram / Webchat / Facebook
- Estado general: Estable / En riesgo / Crítico
- Oportunidades detectadas activas

## Vista de perfiles
Los perfiles se pueden filtrar y agrupar por:
- Nicho
- Plan
- Estado de salud
- Oportunidades activas

Esto permite priorizar atención de forma óptima y detectar patrones entre clientes del mismo nicho o plan.

---

# 6. Hub de Monitoreo por Cliente

Cada cliente tiene su propio dashboard interno con:

- Workflows activos e inactivos
- Estado de cada workflow
- Módulos de automatización habilitados
- Performance por canal
- Health Score actual
- Alertas activas
- Recomendaciones pendientes
- Oportunidades de crecimiento detectadas

**Accesos directos desde el dashboard del cliente:**

| Elemento clickeable | Acción |
|---|---|
| Nombre de un workflow | Abre ese workflow exacto en n8n |
| Título "GoHighLevel" o ícono | Abre el pipeline/contacto del cliente en GHL |
| Alerta activa | Abre el workflow o recurso que la generó |
| Módulo de automatización | Abre la automatización correspondiente en n8n |
| Health Score | Muestra el detalle del cálculo y qué lo baja |

Funciona como un centro de control operativo y estratégico por cliente.

---

# 7. Health Score del Cliente

Cada cliente recibe un puntaje de salud calculado automáticamente por n8n en base a:

- Estabilidad de workflows (uptime, errores, delays)
- Disponibilidad de recursos (tokens, API, storage)
- Performance de conversión por canal
- Cobertura de automatizaciones activas vs. disponibles

**Ejemplo:**
```
Health Score: 82/100 — Estable
Health Score: 54/100 — En riesgo
Health Score: 31/100 — Crítico
```

Permite priorizar qué clientes necesitan atención inmediata.

---

# 8. Sistema de Monitoreo y Alertas

Un sistema unificado que monitorea todo y genera alertas clasificadas por severidad.

## Qué monitorea

**Workflows (n8n API):**
- Uptime de workflows
- Ejecuciones fallidas
- Delays y errores
- Fallos de triggers
- Fallos de integraciones

**Recursos:**
- Uso de tokens AI (OpenAI API)
- Límites de API
- Conversaciones mensuales consumidas
- Uso de memoria / storage
- Límites de suscripción

## Clasificación de alertas

### 🔴 Crítico — Fallo operacional
- Workflow caído
- Fallo de API
- Recurso agotado

### 🟡 Warning — Riesgo de performance
- Alto abandono de conversaciones
- Recursos al límite (threshold)
- Ejecuciones con delay

### 🟢 Oportunidad — Crecimiento
- Automatizaciones disponibles no activas
- Oportunidades de follow-up detectadas
- Potencial de upgrade identificado

## Entrega de alertas

| Destinatario | Canal | Cuándo |
|---|---|---|
| Admin (vos) | **Slack** | Todas las alertas en tiempo real |
| Cliente | **Email HTML** | Alertas críticas + resumen semanal/mensual |

> MVP: los emails a clientes llegan a vos por ahora. Cuando habilites el envío directo, n8n cambia el destinatario.

---

# 9. Tracking de Métricas

Por cada cliente se registran y muestran:

- Conversaciones manejadas
- Leads seguidos
- Tiempo de respuesta promedio
- Performance por canal (WhatsApp, Instagram, Webchat, Facebook)
- Utilización de workflows
- Horas estimadas ahorradas

Demuestra el impacto de negocio medible de las automatizaciones.

---

# 10. Motor de Inteligencia (Recomendaciones + Oportunidades + Upsell)

El motor central de la plataforma. Corre en n8n con lógica de reglas, umbrales y detección de patrones.

Genera tres tipos de salidas:

## Recomendaciones operacionales
Basadas en gaps detectados:
- Falta automatización de follow-up
- Canal con mejor performance sin optimizar
- Abandono de conversación por encima del umbral
- Gaps básicos en flujos de workflow

## Oportunidades de crecimiento
Detecta y lista:
- Leads sin seguimiento automatizado
- Recordatorios faltantes
- Flujos post-venta ausentes
- Canales con bajo rendimiento mejorables

## Oportunidades de upsell
Genera propuestas de upgrade basadas en:
- Módulos disponibles que el cliente no tiene activos
- Patrones de conversión que mejorarían con automatización adicional
- Comparativa con clientes del mismo nicho en plan superior

**Ejemplo de lógica:**
```
Si abandono > 30% → recomendar automatización de follow-up
Si cliente en Starter y usa WhatsApp + Instagram → sugerir upgrade a Growth
Si lead sin contacto > 48hs → oportunidad de reminder automation
```

Esto permite vender tickets adicionales y upgrades de plan de forma sistemática y basada en datos reales de cada cliente.

---

# 11. Recomendaciones por Nicho

El motor sugiere automatizaciones específicas según el rubro del cliente.

## Dental
- Follow-up post-tratamiento
- Recordatorios de turno
- Reactivación de pacientes inactivos

## Gym
- Follow-up de trial
- Recordatorios de renovación
- Campaña de retención

## Clínica Estética
- Nurturing post-tratamiento
- Oferta de servicios relacionados
- Seguimiento de consultas sin conversión

## Inmobiliaria (y otros nichos)
- Seguimiento de leads fríos
- Recordatorios de visitas
- Flujos de cierre

Esto permite escalar recomendaciones consistentes a medida que crece la base de clientes.

---

# 12. Panel de Upgrade de Automatizaciones

Dentro del dashboard de cada cliente:

- **Automatizaciones activas**: módulos funcionando actualmente
- **Automatizaciones disponibles**: módulos que puede activar con su plan
- **Automatizaciones recomendadas**: módulos detectados como oportunidad

Cada módulo muestra:
- Estado actual
- Impacto esperado en conversión/retención
- Plan requerido para activarlo
- CTA de upgrade si aplica

Funciona como catálogo interno de upsell para la agencia.

---

# 13. Catálogo de Automatizaciones

Biblioteca interna de módulos disponibles.

Cada módulo incluye:
- Nombre y descripción
- Impacto de negocio esperado
- Plan requerido (Starter / Growth / Pro)
- Beneficio estimado para el cliente
- Nicho(s) donde aplica

Permite mantener recomendaciones de upsell consistentes y escalables.

---

# 14. Hub de Performance por Canal

Tracking de métricas por canal de comunicación:

| Canal | Métricas |
|---|---|
| WhatsApp | Tasa de conversión, tiempo de respuesta, calidad de leads |
| Instagram | Tasa de conversión, tasa de respuesta, calidad de leads |
| Webchat | Tasa de conversión, tiempo de respuesta, calidad de leads |
| Facebook | Tasa de conversión, tasa de respuesta, calidad de leads |

Muestra dónde concentrar esfuerzos y qué canal optimizar primero.

---

# 15. Análisis de Conversión Humana

Registra qué pasa después del handoff a un humano.

Mide:
- Tiempo de respuesta humana post-handoff
- Tasa de conversión humana
- Drop-offs después del handoff

Identifica fugas manuales en el proceso de conversión que pueden resolverse con automatización adicional.

---

# 16. Motor de Reportes

n8n genera y envía reportes automáticos por email.

## Reporte de Performance (mensual — al cliente)
Contenido en HTML:
- Resumen de performance del mes
- Horas ahorradas estimadas
- Mejoras logradas vs. mes anterior
- Oportunidades detectadas
- Propuestas de upgrade

## Reporte Ejecutivo Mensual (para reuniones de cuenta)
Contenido:
- Performance de workflows
- Comparativa mes anterior
- Horas ahorradas
- Nuevas oportunidades detectadas
- Próximas automatizaciones sugeridas

> MVP: ambos reportes llegan a vos (admin). Configurás el envío directo al cliente cuando estés listo.

## Alertas y resúmenes a Slack (admin)
- Todas las alertas críticas en tiempo real
- Digest diario / semanal de oportunidades
- Notificaciones de nuevos upsells detectados

---

# 17. Estructura de Planes

## Starter
Incluye:
- Monitoreo de workflows
- Monitoreo de recursos
- Recomendaciones básicas automáticas
- Reportes HTML mensuales

**Objetivo:** Mantener estabilidad operativa y detectar oportunidades básicas.

---

## Growth
Incluye todo Starter más:
- Automatización de follow-up
- Sistema de recordatorios
- Secuencias de recuperación
- Optimización de conversión

**Objetivo:** Aumentar performance de conversión.

---

## Pro
Incluye todo Growth más:
- Recomendaciones contextuales avanzadas
- Automatización de retención
- Campañas de fidelización
- Sugerencias por nicho
- Oportunidades predictivas

**Objetivo:** Maximizar retención y revenue del cliente.

---

# 18. Fuentes de Datos e Integraciones

| Herramienta | Qué aporta |
|---|---|
| **n8n API** | Estado de workflows, logs de ejecución, errores, uptime |
| **GoHighLevel API** | Leads, datos de conversión, pipelines, contactos |
| **OpenAI API** | Uso de tokens, métricas de requests AI |
| **Airtable** (MVP) | Base de datos: perfiles, métricas, alertas, recomendaciones |
| **Slack** | Recibe todas las alertas y reportes del admin |
| **Gmail / SMTP** | Envío de emails HTML a clientes |

---

# 19. Accesos Directos y Deep Links

Todo elemento relevante de la plataforma es clickeable y lleva directamente al recurso en la herramienta correspondiente. No hace falta abrir n8n, GHL o Airtable por separado — desde cualquier pantalla del SaaS llegás directo.

## Accesos globales (disponibles en toda la plataforma)

| Elemento | Destino |
|---|---|
| Botón / ícono n8n | Panel principal de n8n |
| Botón / ícono GoHighLevel | CRM principal de GHL |
| Botón / ícono Airtable | Base de datos |
| Botón / ícono OpenAI | Dashboard de usage de OpenAI |
| Botón / ícono Slack | Canal de alertas de la agencia |

## Accesos desde el dashboard global

| Elemento | Destino |
|---|---|
| Nombre de un cliente | Dashboard individual del cliente dentro del SaaS |
| Alerta crítica | Workflow o recurso que la generó (en n8n o GHL) |
| Oportunidad de upsell | Perfil del cliente + panel de upgrade |

## Accesos desde el dashboard del cliente

| Elemento | Destino |
|---|---|
| Nombre de un workflow | Ese workflow exacto en n8n |
| Título / ícono GoHighLevel | Pipeline o contacto del cliente en GHL |
| Alerta activa | Recurso que la generó en n8n o GHL |
| Módulo de automatización | Automatización correspondiente en n8n |
| Health Score | Vista de detalle con los factores que lo afectan |

## Accesos desde el panel de alertas

| Elemento | Destino |
|---|---|
| Alerta de workflow caído | Workflow en n8n |
| Alerta de recurso al límite | Dashboard de uso de OpenAI o GHL |
| Alerta de lead sin seguimiento | Contacto en GHL |

## Implementación técnica

Cada herramienta tiene URLs directas a recursos específicos (deep links):

- **n8n**: `https://[tu-instancia-n8n]/workflow/[workflowId]`
- **GHL**: URLs directas a pipelines, contactos y conversaciones
- **Airtable**: Links directos a registros y vistas

Airtable almacena los IDs y URLs de cada recurso por cliente. n8n los guarda al crear/actualizar automatizaciones. El frontend los usa para construir los links al renderizar cada elemento.

---

# 20. KPIs de Éxito de la Plataforma

Miden el valor real que genera el SaaS para la agencia:

- Horas ahorradas por cliente (y total agencia)
- Leads recuperados via automatización
- Upsells generados desde recomendaciones
- Mejoras de retención detectadas y ejecutadas
- Reducción de tiempo de respuesta operacional
- Clientes escalados de plan

### Cómo se calculan las horas ahorradas

Fórmula base:
```
Horas ahorradas = cantidad de conversaciones manejadas × tiempo promedio por conversación manual estimado
```

Ejemplo: si el cliente tuvo 200 conversaciones automatizadas y cada una tomaría 15 minutos de forma manual → 200 × 0.25hs = 50 horas ahorradas ese mes.

El tiempo promedio por conversación se define por nicho al dar de alta al cliente y se puede ajustar. n8n calcula el total automáticamente y lo incluye en el reporte mensual.

---

# 21. Roadmap MVP

## Fase 1 — Operaciones Base
- Auth de admin
- Perfiles de clientes con tags (nicho, plan, estado)
- Dashboard global de agencia
- Dashboard individual por cliente
- Monitoreo de workflows (n8n API)
- Monitoreo de recursos (OpenAI API)
- Sistema de alertas con clasificación (Crítico / Warning / Oportunidad)
- Alertas a Slack
- Health Score por cliente

## Fase 2 — Inteligencia y Comunicación
- Motor de recomendaciones por reglas
- Motor de oportunidades de crecimiento
- Panel de upgrade con catálogo
- Reporte HTML mensual (email)
- Reporte ejecutivo mensual
- Tracking de métricas por canal
- Recomendaciones por nicho (reglas fijas por rubro)

## Fase 3 — Expansión Operativa
- Automatización de retención
- Análisis de conversión humana básico
- Deep links completos a todas las herramientas
- Ajuste de umbrales de alerta desde la UI (sin tocar n8n)
- Historial de alertas y recomendaciones por cliente

---

# 22. Framework de Alta de Cliente

Todo lo que hay que configurar, habilitar y verificar cada vez que entra un cliente nuevo a la plataforma. Seguir este orden garantiza que el monitoreo, las alertas y los reportes funcionen correctamente desde el día uno.

---

## Paso 1 — Crear el perfil del cliente

- [ ] Nombre del cliente / empresa
- [ ] Nicho (tag): Dental / Gym / Clínica Estética / Inmobiliaria / otro
- [ ] Plan activo (tag): Starter / Growth / Pro
- [ ] Email de contacto principal
- [ ] Canales habilitados: WhatsApp / Instagram / Webchat / Facebook
- [ ] Fecha de inicio de servicio
- [ ] Notas internas relevantes

---

## Paso 2 — Conectar n8n

- [ ] Identificar todos los workflows activos del cliente en n8n
- [ ] Registrar el `workflowId` de cada uno en Airtable (para monitoreo y deep links)
- [ ] Verificar que cada workflow tiene nombre descriptivo en n8n
- [ ] Confirmar que los workflows están activos y sin errores previos
- [ ] Registrar los workflows disponibles (no activos) que el cliente podría activar

**Test:**
- [ ] Ejecutar manualmente cada workflow y confirmar que corre sin errores
- [ ] Verificar que n8n API devuelve el estado correcto de cada workflow

---

## Paso 3 — Conectar GoHighLevel

- [ ] Identificar el sub-account del cliente en GHL
- [ ] Registrar la URL del pipeline principal del cliente
- [ ] Registrar la URL del contacto/cuenta del cliente para deep link
- [ ] Confirmar acceso a datos de leads, conversiones y pipelines vía API

**Test:**
- [ ] Verificar que la plataforma lee correctamente leads y conversiones del cliente desde GHL API
- [ ] Confirmar que el deep link al pipeline abre el recurso correcto

---

## Paso 4 — Conectar OpenAI (si el cliente usa AI)

- [ ] Confirmar si el cliente usa workflows con OpenAI
- [ ] Registrar el identificador de uso (organización o proyecto) en Airtable
- [ ] Establecer umbral de tokens mensual para alertas

**Test:**
- [ ] Verificar que la plataforma lee el uso de tokens actual del cliente
- [ ] Confirmar que una lectura por encima del umbral genera alerta correctamente

---

## Paso 5 — Configurar umbrales de alertas

Definir los valores que disparan alertas para este cliente específico:

- [ ] Umbral de abandono de conversación (ej: > 30%)
- [ ] Umbral de tokens AI (ej: > 80% del límite mensual)
- [ ] Umbral de storage / recursos (ej: > 85%)
- [ ] Tiempo máximo sin ejecución de un workflow antes de alertar (ej: > 24hs)
- [ ] Tiempo máximo de respuesta humana post-handoff (ej: > 2hs)

---

## Paso 6 — Verificar alertas a Slack

- [ ] Confirmar que las alertas del cliente aparecen en el canal de Slack correcto
- [ ] Simular una alerta crítica (ej: desactivar un workflow manualmente) y verificar que llega a Slack
- [ ] Simular una alerta de warning (ej: elevar uso de tokens artificialmente en test) y verificar
- [ ] Confirmar que la alerta incluye: cliente, tipo, descripción y link directo al recurso

---

## Paso 7 — Configurar y probar el email HTML al cliente

- [ ] Confirmar email de destino (por ahora: tu email de admin)
- [ ] Cargar nombre del cliente y datos del negocio en la plantilla HTML
- [ ] Enviar email de prueba con datos del cliente
- [ ] Verificar que el formato HTML se ve correctamente en el email
- [ ] Confirmar que los datos del reporte (workflows, métricas, horas ahorradas) son correctos

---

## Paso 8 — Verificar Health Score

- [ ] Confirmar que el Health Score del cliente se calcula y aparece en su dashboard
- [ ] Revisar que los 4 factores (workflows, recursos, conversión, cobertura) tienen datos cargados
- [ ] Verificar que el score cambia correctamente si simulás un fallo

---

## Paso 9 — Cargar automatizaciones en el catálogo del cliente

- [ ] Marcar las automatizaciones activas del cliente en el panel de upgrade
- [ ] Marcar las automatizaciones disponibles según su plan
- [ ] Verificar que las recomendaciones automáticas del motor son coherentes con el perfil del cliente
- [ ] Confirmar que el panel de upgrade muestra correctamente activas / disponibles / recomendadas

---

## Paso 10 — Revisión final antes de activar

- [ ] Health Score calculado y visible ✓
- [ ] Workflows monitoreados y con deep links ✓
- [ ] Alertas funcionando en Slack ✓
- [ ] Email HTML de prueba enviado y aprobado ✓
- [ ] Recomendaciones coherentes con el nicho y plan ✓
- [ ] Deep links a n8n y GHL funcionando ✓
- [ ] Perfil completo con todos los tags ✓

**El cliente está listo para ser monitoreado.**

---

# 23. Guía de Uso para el Admin (Vos)

Cómo entender, operar y sacarle el máximo provecho a la plataforma día a día.

---

## Cómo leer el Dashboard Global

Es tu pantalla de inicio. Te dice en 30 segundos el estado de toda la agencia.

**Lo primero que mirás:**
1. **Clientes en rojo (Crítico)** → atención inmediata, algo está caído o sin recursos
2. **Alertas críticas activas** → cuántas hay y de qué clientes
3. **Oportunidades de upsell** → clientes con potencial de upgrade detectado hoy
4. **KPIs globales** → tendencia general de la agencia (subiendo o bajando)

**Regla de prioridad:**
```
Crítico → Warning → Oportunidad
```
Siempre resolvés los críticos primero, luego revisás warnings, luego aprovechás oportunidades.

---

## Cómo leer el Health Score

| Rango | Estado | Qué hacer |
|---|---|---|
| 80–100 | Estable ✅ | Monitoreo regular, buscar oportunidades |
| 60–79 | Atención ⚠️ | Revisar qué factor lo baja, prevenir antes de que caiga |
| 40–59 | En riesgo 🟡 | Contactar al cliente, revisar workflows y recursos |
| 0–39 | Crítico 🔴 | Acción inmediata, algo está fallando |

Hacé clic en el Health Score de cualquier cliente para ver exactamente qué factor lo está bajando.

---

## Cómo actuar ante una alerta

**Alerta Crítica (rojo):**
1. Hacé clic en la alerta → te lleva directo al recurso en n8n o GHL
2. Identificá la causa (workflow caído, API sin respuesta, recurso agotado)
3. Resolvé en n8n o contactá al proveedor si es un límite externo
4. Una vez resuelto, marcá la alerta como resuelta en la plataforma
5. Considerá si necesitás avisar al cliente

**Alerta Warning (amarillo):**
1. Revisá el recurso o workflow afectado
2. Evaluá si es tendencia o pico puntual
3. Ajustá el umbral o tomá acción preventiva
4. Si es recurrente → puede convertirse en una recomendación para el cliente

**Alerta Oportunidad (verde):**
1. Revisá el contexto del cliente (nicho, plan, conversiones actuales)
2. Si el motor recomienda una automatización → evaluá si es momento de proponerla
3. Usá el panel de upgrade para preparar la propuesta
4. Generá el email o reunión de upsell

---

## Rutina Diaria Recomendada

**Mañana (5–10 min):**
- [ ] Abrir el Dashboard Global
- [ ] Resolver alertas críticas si las hay
- [ ] Revisar warnings activos
- [ ] Revisar oportunidades de upsell nuevas

**Tarde (opcional, 5 min):**
- [ ] Confirmar que no aparecieron alertas nuevas
- [ ] Revisar si algún cliente bajó su Health Score durante el día

---

## Rutina Semanal

- [ ] Revisar la evolución del Health Score de cada cliente (¿subió o bajó?)
- [ ] Revisar las oportunidades acumuladas de la semana
- [ ] Evaluar qué clientes tienen potencial de upgrade y prepará el pitch
- [ ] Verificar que los reportes del mes se van armando correctamente

---

## Rutina Mensual

- [ ] Revisar y aprobar los reportes HTML antes de enviarlos a clientes
- [ ] Preparar el reporte ejecutivo mensual por cliente
- [ ] Evaluar clientes en Starter que podrían moverse a Growth
- [ ] Evaluar clientes en Growth que podrían moverse a Pro
- [ ] Revisar el catálogo de automatizaciones: ¿hay módulos nuevos para agregar?
- [ ] Ajustar umbrales de alerta si alguno está generando demasiado ruido

---

## Cómo usar el Motor de Recomendaciones

El motor corre automáticamente, pero vos decidís qué hacer con cada recomendación.

**Una recomendación puede ser:**
- **Operacional**: algo que hay que arreglar (ej: workflow lento)
- **De crecimiento**: una oportunidad que el cliente no está aprovechando
- **De upsell**: un módulo que el cliente debería activar (y vos deberías vender)

**Qué hacer con cada una:**
1. Revisá el contexto del cliente (nicho, plan, historial)
2. Si tiene sentido → actuá o preparate para proponerlo
3. Si no aplica en este momento → marcala como "pospuesta" para no perderla
4. Si el motor la genera repetidamente → es una señal fuerte de que vale la pena

---

## Cómo agregar un cliente nuevo

1. Ir a **Perfiles de Clientes** → Nuevo cliente
2. Completar todos los campos del perfil
3. Seguir el **Framework de Alta de Cliente** (Sección 22) paso a paso
4. Al finalizar el checklist → el cliente queda activo en el monitoreo

---

## Cómo leer los Reportes

**Reporte de performance mensual (para el cliente):**
- Revisalo antes de enviarlo
- Verificá que los números sean correctos (horas ahorradas, conversiones, workflows)
- Ajustá si hay algo que explicar mejor antes de enviarlo

**Reporte ejecutivo (para vos en reunión de cuenta):**
- Usalo como base para la reunión mensual con el cliente
- Revisá las oportunidades destacadas → son el punto de partida para el upsell

---

## Señales de que algo anda mal (a nivel plataforma)

- Un cliente con Health Score estable baja repentinamente sin alerta → revisar conexión con n8n o GHL
- Las alertas de Slack dejaron de llegar → verificar el workflow de alertas en n8n
- Un reporte mensual no se generó → revisar el workflow de reportes en n8n
- Las métricas de un cliente no se actualizan → revisar la conexión con la API correspondiente

Para cualquiera de estos casos: ir directo a n8n vía el acceso rápido y revisar el workflow responsable.

---

# 24. Versión 2.0 — Lo que falta agregar

Todo lo que está planificado pero no entra en el MVP. Esta sección es para saber qué viene después, cuándo tiene sentido sumarlo y qué necesitás tener funcionando antes.

---

## Bloque A — Acceso del Cliente

### Portal de cliente con login
El cliente puede entrar a la plataforma con usuario y contraseña y ver solo su propia información.

**Qué incluye:**
- Login con auth seguro
- Dashboard propio (versión restringida del hub de cliente)
- Vista de sus automatizaciones activas
- Acceso a sus reportes históricos
- Vista de recomendaciones y upgrades disponibles

**Cuándo sumarlo:**
Cuando tengas 3+ clientes activos y monitoreados correctamente. Antes de eso no vale la pena — primero validá que el sistema funciona para vos.

**Qué necesitás antes:**
- MVP 100% estable y corriendo
- Al menos un ciclo completo de reportes enviados y revisados
- Definir qué ve y qué no ve el cliente

---

## Bloque B — Inteligencia Avanzada

### Recomendaciones predictivas
En vez de solo detectar lo que ya pasó, el motor predice problemas antes de que ocurran.

**Ejemplos:**
- "Este cliente va a agotar sus tokens en 5 días al ritmo actual"
- "La tasa de abandono subió 3 días seguidos, probable problema en el flujo"

**Cuándo sumarlo:**
Cuando tengas datos históricos de al menos 2–3 meses por cliente para que el modelo tenga con qué trabajar.

---

### Motor de Best Practices entre clientes
Detecta qué workflows, prompts y patrones de automatización funcionan mejor y recomienda replicarlos a otros clientes del mismo nicho.

**Ejemplo:**
- El flujo de follow-up del cliente A (Dental) tiene 40% conversión → recomendarlo a todos los clientes Dental

**Cuándo sumarlo:**
Cuando tengas 5+ clientes activos en el mismo nicho con datos comparables.

---

### Análisis de Conversión Humana (profundo)
Trazabilidad completa de qué pasa después del handoff humano: tiempo de respuesta, tasa de cierre, drop-offs por agente.

**Cuándo sumarlo:**
Cuando el cliente tenga datos suficientes de conversaciones con handoff y quieras identificar si el problema está en la automatización o en el humano.

---

### Revenue Intelligence
Predicción de revenue por cliente basada en conversiones, upgrades históricos y oportunidades detectadas.

**Incluye:**
- Proyección de LTV (lifetime value) por cliente
- Predicción de churn
- Revenue potencial si se activan los upgrades recomendados

**Cuándo sumarlo:**
Versión 2.0 avanzada. Requiere datos históricos sólidos de al menos 6 meses.

---

## Bloque C — Dashboards de Herramientas

### Tool Intelligence Hub
Dashboards individuales dentro de tu SaaS para cada herramienta integrada.

**n8n:**
- Uso de ejecuciones
- Workflows más fallidos
- Performance general de la instancia

**GoHighLevel:**
- Contactos totales vs. activos
- Performance de pipelines
- Fuentes de leads con mejor conversión

**Airtable:**
- Uso de registros y storage
- Tablas más utilizadas

**OpenAI:**
- Tokens consumidos vs. disponibles
- Costo estimado mensual
- Modelos más usados

**Slack:**
- Alertas enviadas por período
- Tipos de alerta más frecuentes
- Clientes con más incidencias

**Cuándo sumarlo:**
Cuando el monitoreo básico ya esté maduro y quieras tener visibilidad operativa de las herramientas en sí, no solo de los clientes.

---

## Bloque D — Customer Journey Intelligence

Trazabilidad completa del recorrido de cada lead desde el primer contacto hasta el cierre o pérdida.

**Muestra:**
- De dónde vino el lead (canal)
- Qué automatizaciones tocó
- En qué punto abandonó (si abandonó)
- Cuánto tardó en convertir
- Qué automatización influyó más en el cierre

**Cuándo sumarlo:**
Cuando tengas integración sólida con GHL y suficientes datos de leads por cliente (mínimo 3 meses).

---

## Bloque E — Infraestructura

### Migración de Airtable a base de datos custom
Reemplazar Airtable como capa de datos por una base de datos propia (PostgreSQL, Supabase, etc.).

**Por qué hacerlo:**
- Airtable tiene límites de registros y velocidad
- Una DB propia es más barata a escala
- Más control sobre la estructura de datos

**Cuándo sumarlo:**
Cuando llegués a 10+ clientes activos o cuando los límites de Airtable empiecen a molestarte. No antes — Airtable funciona perfecto para el MVP.

---

### Migración a frontend más personalizado
Reemplazar las vistas embebidas o la UI actual por un frontend custom más completo.

**Cuándo sumarlo:**
Cuando el MVP esté validado, tengas feedback de uso real propio y quieras invertir en una UI más pulida y escalable.

---

## Resumen de prioridades v2.0

| # | Módulo | Cuándo |
|---|---|---|
| 1 | Portal de cliente con login | 3+ clientes activos |
| 2 | Recomendaciones predictivas | 2–3 meses de datos |
| 3 | Tool Intelligence Hub | MVP maduro |
| 4 | Motor de Best Practices | 5+ clientes mismo nicho |
| 5 | Customer Journey Intelligence | 3+ meses de datos GHL |
| 6 | Análisis conversión humana profundo | Datos de handoff disponibles |
| 7 | Revenue Intelligence | 6+ meses de datos |
| 8 | Migración a DB custom | 10+ clientes activos |
| 9 | Frontend custom | MVP validado |

---
