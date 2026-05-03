export type Nicho = 'dental' | 'gym' | 'clinica-estetica' | 'inmobiliaria'
export type Plan = 'starter' | 'growth' | 'pro'
export type Estado = 'estable' | 'atencion' | 'riesgo' | 'critico'
export type Canal = 'whatsapp' | 'instagram' | 'webchat' | 'facebook'
export type AlertaTipo = 'critico' | 'warning' | 'oportunidad'
export type WorkflowEstado = 'activo' | 'inactivo' | 'error'
export type WorkflowTipo = 'principal' | 'tool' | 'sub' | 'sync' | 'scheduled'

export interface Workflow {
  id: string
  nombre: string
  tipo: WorkflowTipo
  estado: WorkflowEstado
  uptime: number
  ultimaEjecucion: string
  erroresHoy: number
  ejecucionesHoy: number
  n8nUrl: string
}

export interface Alerta {
  id: string
  tipo: AlertaTipo
  titulo: string
  descripcion: string
  clienteId: string
  clienteNombre: string
  fecha: string
  resuelta: boolean
  url?: string
}

export interface Recomendacion {
  id: string
  tipo: 'operacional' | 'crecimiento' | 'upsell'
  titulo: string
  descripcion: string
  impacto: 'alto' | 'medio' | 'bajo'
}

export interface AnalyticsConsultas {
  horario: { hora: number; cantidad: number }[]
  topPreguntas: { pregunta: string; veces: number; categoria: string }[]
}

export interface Metricas {
  conversaciones: number
  leadsFollowUp: number
  tiempoRespuestaSegundos: number
  horasAhorradas: number
  conversionPorCanal: Record<Canal, number>
}

export interface Cliente {
  id: string
  nombre: string
  empresa: string
  nicho: Nicho
  plan: Plan
  estado: Estado
  healthScore: number
  email: string
  fechaInicio: string
  canales: Canal[]
  workflows: Workflow[]
  metricas: Metricas
  alertas: Alerta[]
  recomendaciones: Recomendacion[]
  ghlUrl: string
  n8nBase: string
  bot?: string
  sucursales?: string[]
  analyticsConsultas?: AnalyticsConsultas
}

const N8N = 'http://129.121.56.240'

export const clientes: Cliente[] = [
  {
    id: 'dc-gym',
    nombre: 'DC Gym',
    empresa: 'DC Gym',
    nicho: 'gym',
    plan: 'growth',
    estado: 'estable',
    healthScore: 84,
    email: 'info@dcgym.com',
    fechaInicio: '2025-01-01',
    canales: ['whatsapp', 'instagram'],
    ghlUrl: 'https://app.gohighlevel.com',
    n8nBase: N8N,
    bot: 'Vicky',
    sucursales: ['Villanueva', 'Benavídez'],
    workflows: [
      {
        id: 'Ax3qNiWZyYwCLI8H', nombre: 'Main Dispatcher', tipo: 'principal',
        estado: 'activo', uptime: 99.4, ultimaEjecucion: 'hace 3 min',
        erroresHoy: 0, ejecucionesHoy: 47, n8nUrl: `${N8N}/workflow/Ax3qNiWZyYwCLI8H`,
      },
      {
        id: 'DGVATxiTTRm9iR5z', nombre: 'Asignar Sucursal', tipo: 'tool',
        estado: 'activo', uptime: 100, ultimaEjecucion: 'hace 22 min',
        erroresHoy: 0, ejecucionesHoy: 12, n8nUrl: `${N8N}/workflow/DGVATxiTTRm9iR5z`,
      },
      {
        id: '5zeDnWNKSbU4JYR8', nombre: 'Agendar Clase de Prueba', tipo: 'tool',
        estado: 'activo', uptime: 100, ultimaEjecucion: 'hace 1 hora',
        erroresHoy: 0, ejecucionesHoy: 8, n8nUrl: `${N8N}/workflow/5zeDnWNKSbU4JYR8`,
      },
      {
        id: 'Oe53lTc1TpLJr2l6', nombre: 'Escalar a Humano', tipo: 'tool',
        estado: 'activo', uptime: 100, ultimaEjecucion: 'hace 2 horas',
        erroresHoy: 0, ejecucionesHoy: 3, n8nUrl: `${N8N}/workflow/Oe53lTc1TpLJr2l6`,
      },
      {
        id: 'z3SODBeblgU1VYjE', nombre: 'Obtener FAQ', tipo: 'tool',
        estado: 'activo', uptime: 99.1, ultimaEjecucion: 'hace 8 min',
        erroresHoy: 0, ejecucionesHoy: 31, n8nUrl: `${N8N}/workflow/z3SODBeblgU1VYjE`,
      },
      {
        id: '3xxLz9oHr6tsVMH6', nombre: 'Format Date ISO', tipo: 'sub',
        estado: 'activo', uptime: 100, ultimaEjecucion: 'hace 1 hora',
        erroresHoy: 0, ejecucionesHoy: 8, n8nUrl: `${N8N}/workflow/3xxLz9oHr6tsVMH6`,
      },
      {
        id: '7cwl6PLmIBOC960K', nombre: 'Airtable Sync', tipo: 'sync',
        estado: 'activo', uptime: 99.8, ultimaEjecucion: 'hace 2 min',
        erroresHoy: 0, ejecucionesHoy: 288, n8nUrl: `${N8N}/workflow/7cwl6PLmIBOC960K`,
      },
      {
        id: 'UJqAwLtp6TMLBiQq', nombre: 'Consultar Producto', tipo: 'tool',
        estado: 'activo', uptime: 100, ultimaEjecucion: 'hace 3 horas',
        erroresHoy: 0, ejecucionesHoy: 5, n8nUrl: `${N8N}/workflow/UJqAwLtp6TMLBiQq`,
      },
      {
        id: 'kwLPMwgSis8SfFDZ', nombre: 'Recordatorios Clase de Prueba', tipo: 'scheduled',
        estado: 'activo', uptime: 99.6, ultimaEjecucion: 'hace 28 min',
        erroresHoy: 0, ejecucionesHoy: 48, n8nUrl: `${N8N}/workflow/kwLPMwgSis8SfFDZ`,
      },
    ],
    metricas: {
      conversaciones: 47,
      leadsFollowUp: 12,
      tiempoRespuestaSegundos: 8,
      horasAhorradas: 94,
      conversionPorCanal: { whatsapp: 34, instagram: 21, webchat: 0, facebook: 0 },
    },
    alertas: [
      {
        id: 'a1', tipo: 'oportunidad',
        titulo: 'Webchat disponible sin activar',
        descripcion: 'El plan Growth incluye webchat. Gyms con webchat tienen 15% más de conversión en leads web.',
        clienteId: 'dc-gym', clienteNombre: 'DC Gym', fecha: 'hoy', resuelta: false,
      },
    ],
    recomendaciones: [
      {
        id: 'r1', tipo: 'crecimiento',
        titulo: 'Agregar follow-up post-trial',
        descripcion: 'Leads que hacen clase de prueba sin conversión en 48hs. Un follow-up automatizado convierte 2-4 más por semana.',
        impacto: 'alto',
      },
      {
        id: 'r2', tipo: 'upsell',
        titulo: 'Campaña de retención de socios',
        descripcion: 'Socios sin visita detectados en 30 días. Campaña automática de reactivación recupera 10-15% de inactivos.',
        impacto: 'medio',
      },
    ],
    analyticsConsultas: {
      horario: [
        { hora: 0, cantidad: 2 }, { hora: 1, cantidad: 1 }, { hora: 2, cantidad: 0 },
        { hora: 3, cantidad: 0 }, { hora: 4, cantidad: 0 }, { hora: 5, cantidad: 3 },
        { hora: 6, cantidad: 9 }, { hora: 7, cantidad: 24 }, { hora: 8, cantidad: 31 },
        { hora: 9, cantidad: 28 }, { hora: 10, cantidad: 19 }, { hora: 11, cantidad: 15 },
        { hora: 12, cantidad: 22 }, { hora: 13, cantidad: 18 }, { hora: 14, cantidad: 12 },
        { hora: 15, cantidad: 10 }, { hora: 16, cantidad: 11 }, { hora: 17, cantidad: 17 },
        { hora: 18, cantidad: 32 }, { hora: 19, cantidad: 41 }, { hora: 20, cantidad: 35 },
        { hora: 21, cantidad: 24 }, { hora: 22, cantidad: 14 }, { hora: 23, cantidad: 6 },
      ],
      topPreguntas: [
        { pregunta: '¿Cuáles son los horarios de clases?', veces: 312, categoria: 'horarios' },
        { pregunta: '¿Cuánto cuesta la membresía mensual?', veces: 287, categoria: 'precios' },
        { pregunta: '¿Puedo agendar una clase de prueba gratis?', veces: 234, categoria: 'trial' },
        { pregunta: '¿Dónde están ubicados?', veces: 198, categoria: 'ubicacion' },
        { pregunta: '¿Tienen personal training?', veces: 156, categoria: 'servicios' },
        { pregunta: '¿Cómo cancelo o pauso mi membresía?', veces: 89, categoria: 'admin' },
        { pregunta: '¿Qué diferencia hay entre los planes?', veces: 76, categoria: 'precios' },
        { pregunta: '¿Tienen estacionamiento?', veces: 54, categoria: 'ubicacion' },
      ],
    },
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getEstadoColor(estado: Estado) {
  const map = {
    estable: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    atencion: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    riesgo: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    critico: 'text-red-400 bg-red-400/10 border-red-400/20',
  }
  return map[estado]
}

export function getEstadoLabel(estado: Estado) {
  const map = { estable: 'Estable', atencion: 'Atención', riesgo: 'En riesgo', critico: 'Crítico' }
  return map[estado]
}

export function getEstadoDot(estado: Estado) {
  const map = { estable: 'bg-[#484848]', atencion: 'bg-[#9b9b9b]', riesgo: 'bg-[#c8c8c4]', critico: 'bg-[#e8e8e4]' }
  return map[estado]
}

export function getPlanColor(_plan: Plan) {
  return 'text-[#9b9b9b] bg-[#272727] border-[#3a3a3a]'
}

export function getPlanLabel(plan: Plan) {
  const map = { starter: 'Starter', growth: 'Growth', pro: 'Pro' }
  return map[plan]
}

export function getNichoLabel(nicho: Nicho) {
  const map = { dental: 'Dental', gym: 'Gym', 'clinica-estetica': 'Clínica Estética', inmobiliaria: 'Inmobiliaria' }
  return map[nicho]
}

export function getHealthEmoji(score: number) {
  if (score >= 80) return '◆'
  if (score >= 60) return '◈'
  if (score >= 40) return '◇'
  return '○'
}

export function getHealthColor(_score: number) {
  return { text: 'text-[#e8e8e4]', bg: 'bg-[#484848]', bar: 'bg-[#9b9b9b]' }
}

export function getAlertaColor(tipo: AlertaTipo) {
  const map = {
    critico:    { text: '#f0f0f0', badge: 'text-[#f0f0f0] bg-[#2a2a2a] border-[#444]', dot: 'bg-[#f0f0f0]', border: '', bg: '' },
    warning:    { text: '#9b9b9b', badge: 'text-[#9b9b9b] bg-[#222] border-[#333]',     dot: 'bg-[#9b9b9b]', border: '', bg: '' },
    oportunidad:{ text: '#666666', badge: 'text-[#888] bg-[#1a1a1a] border-[#2a2a2a]',  dot: 'bg-[#666]',    border: '', bg: '' },
  }
  return map[tipo]
}

export function getAlertaLabel(tipo: AlertaTipo) {
  const map = { critico: 'Crítico', warning: 'Warning', oportunidad: 'Oportunidad' }
  return map[tipo]
}

export function getWorkflowTipoLabel(tipo: WorkflowTipo) {
  const map = { principal: 'Principal', tool: 'Tool', sub: 'Sub', sync: 'Sync', scheduled: 'Scheduled' }
  return map[tipo]
}

export function getWorkflowTipoColor(_tipo: WorkflowTipo) {
  return 'text-[#9b9b9b] bg-[#222222] border-[#333333]'
}

export const canalLabel: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  webchat: 'Webchat',
  facebook: 'Facebook',
}

export const canalIcon: Record<string, string> = {
  whatsapp: '💬',
  instagram: '📸',
  webchat: '🌐',
  facebook: '👥',
}

export function getTotalAlertas() {
  return clientes.flatMap(c => c.alertas).filter(a => !a.resuelta)
}

export function getAlertasCriticas() {
  return getTotalAlertas().filter(a => a.tipo === 'critico')
}

export function getClientesEnRiesgo() {
  return clientes.filter(c => c.estado === 'critico' || c.estado === 'riesgo')
}

export function getOportunidadesUpsell() {
  return clientes.flatMap(c =>
    c.recomendaciones.filter(r => r.tipo === 'upsell').map(r => ({ ...r, cliente: c }))
  )
}

export interface AutomatizacionCatalogo {
  id: string
  nombre: string
  descripcion: string
  planMinimo: Plan
  nichos: Nicho[]
  impacto: string
}

export const catalogoAutomatizaciones: AutomatizacionCatalogo[] = [
  { id: 'cat1', nombre: 'Bot de atención 24/7', descripcion: 'Responde automáticamente WhatsApp e Instagram las 24hs.', planMinimo: 'starter', nichos: ['gym', 'dental', 'clinica-estetica', 'inmobiliaria'], impacto: 'Ningún lead sin respuesta' },
  { id: 'cat2', nombre: 'Detección de sucursal', descripcion: 'Identifica a qué sucursal pertenece cada lead y lo asigna.', planMinimo: 'starter', nichos: ['gym'], impacto: 'Cero confusión entre sucursales' },
  { id: 'cat3', nombre: 'Agendado de clase de prueba', descripcion: 'Reserva clases de prueba directo desde la conversación.', planMinimo: 'starter', nichos: ['gym', 'clinica-estetica'], impacto: 'Más trials agendados sin empleada' },
  { id: 'cat4', nombre: 'Escalado a humano', descripcion: 'Deriva automáticamente a empleada cuando el bot no puede resolver.', planMinimo: 'starter', nichos: ['gym', 'dental', 'clinica-estetica', 'inmobiliaria'], impacto: 'Cero conversaciones perdidas' },
  { id: 'cat5', nombre: 'Recordatorios de clase de prueba', descripcion: 'Envía recordatorio 24h y 2h antes para reducir no-shows.', planMinimo: 'growth', nichos: ['gym', 'clinica-estetica'], impacto: 'Reduce no-show 30-50%' },
  { id: 'cat6', nombre: 'Consulta de productos', descripcion: 'Responde consultas de indumentaria/stock desde Airtable.', planMinimo: 'growth', nichos: ['gym'], impacto: 'Empleada libre de consultas de stock' },
  { id: 'cat7', nombre: 'Sync de datos en tiempo real', descripcion: 'Mantiene precios y FAQ actualizados desde Airtable cada 5 min.', planMinimo: 'growth', nichos: ['gym', 'dental', 'clinica-estetica', 'inmobiliaria'], impacto: 'Cambios sin tocar n8n' },
  { id: 'cat8', nombre: 'Follow-up post-trial', descripcion: 'Secuencia automática para socios que hicieron trial sin convertir.', planMinimo: 'growth', nichos: ['gym'], impacto: 'Convierte 20-30% más de trials' },
  { id: 'cat9', nombre: 'Campaña de retención', descripcion: 'Detecta socios inactivos y lanza campaña de reactivación.', planMinimo: 'pro', nichos: ['gym', 'clinica-estetica'], impacto: 'Recupera 10-15% de inactivos' },
  { id: 'cat10', nombre: 'Recordatorio de renovación', descripcion: 'Avisa antes del vencimiento de membresía.', planMinimo: 'pro', nichos: ['gym'], impacto: 'Reduce churn mensual' },
]

const planJerarquia: Record<Plan, number> = { starter: 0, growth: 1, pro: 2 }

export function getAutomatizacionesPorCliente(clienteId: string) {
  const c = clientes.find(c => c.id === clienteId)
  if (!c) return { habilitadas: [], deshabilitadas: [], porHabilitar: [] }

  const nombresActuales = c.workflows.map(w => w.nombre)
  const disponiblesParaPlan = catalogoAutomatizaciones.filter(a =>
    planJerarquia[a.planMinimo] <= planJerarquia[c.plan] && a.nichos.includes(c.nicho)
  )

  const habilitadas = c.workflows.filter(w => w.estado === 'activo' || w.estado === 'error')
  const deshabilitadas = c.workflows.filter(w => w.estado === 'inactivo')
  const porHabilitar = disponiblesParaPlan.filter(a => !nombresActuales.includes(a.nombre))

  return { habilitadas, deshabilitadas, porHabilitar }
}

// ─── Tareas ──────────────────────────────────────────────────────────────────

export type TareaCategoria = 'workflow' | 'herramienta' | 'integracion' | 'canal' | 'kpi' | 'automatizacion' | 'configuracion'
export type TareaEstado = 'pendiente' | 'en-progreso' | 'completado'
export type TareaPrioridad = 'alta' | 'media' | 'baja'

export interface Tarea {
  id: string
  clienteId: string
  titulo: string
  descripcion: string
  notas?: string
  categoria: TareaCategoria
  prioridad: TareaPrioridad
  estado: TareaEstado
  progreso: number        // 0–100
  predefinida: boolean
}

export const tareasDefault: Tarea[] = [
  {
    id: 'dcg-t1', clienteId: 'dc-gym',
    titulo: 'Configurar Slack webhook para alertas de error',
    descripcion: 'slack.com/apps → Incoming Webhooks → Add to Slack → copiar URL → usar en Error Workflow de n8n.',
    categoria: 'herramienta', prioridad: 'alta', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t2', clienteId: 'dc-gym',
    titulo: 'Crear Error Workflow global en n8n',
    descripcion: 'n8n → Settings → Error Workflow → nuevo workflow con nodo HTTP Request que envía mensaje al webhook de Slack cuando cualquier workflow falla.',
    categoria: 'workflow', prioridad: 'alta', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t3', clienteId: 'dc-gym',
    titulo: 'WF-02 — Manejar horarios llenos en el calendario',
    descripcion: 'El agendado de clase de prueba no tiene manejo del caso donde el calendar de GHL está completo. Falta agregar un branch que avise al lead y proponga horarios alternativos.',
    categoria: 'workflow', prioridad: 'media', estado: 'en-progreso', progreso: 80, predefinida: true,
  },
  {
    id: 'dcg-t4', clienteId: 'dc-gym',
    titulo: 'Conectar métricas reales desde GHL API',
    descripcion: 'Las métricas actuales (conversaciones, leads) son datos estáticos. Conectar endpoint de GHL para mostrar datos en tiempo real en el dashboard.',
    categoria: 'integracion', prioridad: 'media', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t5', clienteId: 'dc-gym',
    titulo: 'Activar canal Webchat (incluido en plan Growth)',
    descripcion: 'El plan Growth incluye webchat pero no está activo. Instalar widget en el sitio web de DC Gym. Conversiones esperadas: +15%.',
    categoria: 'canal', prioridad: 'media', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t6', clienteId: 'dc-gym',
    titulo: 'Implementar WF de follow-up post-trial',
    descripcion: 'Leads que hacen clase de prueba y no convierten en 48hs deben recibir seguimiento automático. Crear nuevo workflow en n8n con secuencia de 2 mensajes.',
    categoria: 'automatizacion', prioridad: 'alta', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t7', clienteId: 'dc-gym',
    titulo: 'Cargar stock de indumentaria en Airtable',
    descripcion: 'La tabla Productos de Airtable está vacía. El WF-07 (Consultar Producto) busca ahí pero no encuentra nada. Cargar catálogo actual de ropa.',
    categoria: 'configuracion', prioridad: 'baja', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t8', clienteId: 'dc-gym',
    titulo: 'Implementar campaña de retención de socios inactivos',
    descripcion: 'Socios sin visita en 30 días detectados por GHL. Crear workflow que envíe mensaje automático de reactivación con oferta de clase gratis.',
    categoria: 'automatizacion', prioridad: 'media', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t9', clienteId: 'dc-gym',
    titulo: 'Configurar alertas de saldo bajo en APIs',
    descripcion: 'Configurar alertas en OpenAI, Google AI Studio y Anthropic para recibir email cuando el saldo baje de $5. Evita que el bot se corte sin aviso.',
    categoria: 'herramienta', prioridad: 'media', estado: 'en-progreso', progreso: 40, predefinida: true,
  },
  {
    id: 'dcg-t10', clienteId: 'dc-gym',
    titulo: 'WF-04 — Verificar cache de FAQ después de edición en Airtable',
    descripcion: 'El cache de Redis tarda 5 min en actualizarse. Documentar proceso para la empleada: editar Airtable → esperar 5 min → testear con mensaje de prueba.',
    categoria: 'configuracion', prioridad: 'baja', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t11', clienteId: 'dc-gym',
    titulo: 'KPI — Conectar tasa de conversión de trials real',
    descripcion: 'La tasa de conversión trial→socio no se está midiendo. Agregar tracking en GHL pipeline para calcular % real de trials que se convierten.',
    categoria: 'kpi', prioridad: 'media', estado: 'pendiente', progreso: 0, predefinida: true,
  },
  {
    id: 'dcg-t12', clienteId: 'dc-gym',
    titulo: 'Documentar proceso de escalado a empleada',
    descripcion: 'Crear guía para las empleadas de cómo reactivar el bot después de atender manualmente una conversación (desmarcar bot_paused en GHL).',
    categoria: 'configuracion', prioridad: 'baja', estado: 'pendiente', progreso: 0, predefinida: true,
  },
]

export const categoriaLabel: Record<TareaCategoria, string> = {
  workflow: 'Workflow',
  herramienta: 'Herramienta',
  integracion: 'Integración',
  canal: 'Canal',
  kpi: 'KPI',
  automatizacion: 'Automatización',
  configuracion: 'Configuración',
}

export const categoriaColor: Record<TareaCategoria, string> = {
  workflow:      'text-[#9b9b9b] bg-[#222222] border-[#333333]',
  herramienta:   'text-[#9b9b9b] bg-[#222222] border-[#333333]',
  integracion:   'text-[#9b9b9b] bg-[#222222] border-[#333333]',
  canal:         'text-[#9b9b9b] bg-[#222222] border-[#333333]',
  kpi:           'text-[#9b9b9b] bg-[#222222] border-[#333333]',
  automatizacion:'text-[#9b9b9b] bg-[#222222] border-[#333333]',
  configuracion: 'text-[#9b9b9b] bg-[#222222] border-[#333333]',
}

export const prioridadColor: Record<TareaPrioridad, string> = {
  alta:  'text-[#f0f0f0]',
  media: 'text-[#9b9b9b]',
  baja:  'text-[#444444]',
}

export function getTareasPorCliente(clienteId: string) {
  return tareasDefault.filter(t => t.clienteId === clienteId)
}

export function getTareasStats(tareas: Tarea[]) {
  return {
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado === 'pendiente').length,
    enProgreso: tareas.filter(t => t.estado === 'en-progreso').length,
    completadas: tareas.filter(t => t.estado === 'completado').length,
    altas: tareas.filter(t => t.prioridad === 'alta' && t.estado !== 'completado').length,
  }
}
