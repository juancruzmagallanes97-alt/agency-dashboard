import type { ToolName } from '@/lib/config'

export interface RequiredConfigItem {
  label: string
  tool: ToolName
  envVar?: string
}

export interface AutomationEntry {
  id: string
  name: string
  description: string
  tools: ToolName[]
  requiredConfig: RequiredConfigItem[]
  n8nWorkflowHint?: string
}

export const automationsCatalog: AutomationEntry[] = [
  {
    id: 'seguimiento-post-clase',
    name: 'Seguimiento post clase de prueba',
    description: 'Envía un mensaje de WhatsApp o solicitud de reseña en Google 24h después de la primera clase de prueba de un nuevo prospecto.',
    tools: ['n8n', 'chatwoot'],
    requiredConfig: [
      { label: 'Webhook de entrada en n8n configurado', tool: 'n8n', envVar: 'N8N_API_URL' },
      { label: 'Canal de WhatsApp conectado en Chatwoot', tool: 'chatwoot', envVar: 'CHATWOOT_API_URL' },
      { label: 'Template de mensaje de seguimiento creado', tool: 'chatwoot' },
    ],
    n8nWorkflowHint: 'Seguimiento Trial',
  },
  {
    id: 'bienvenida-nuevo-socio',
    name: 'Bienvenida nuevo socio',
    description: 'Envía mensaje de bienvenida por WhatsApp y registra el contacto en el CRM cuando un nuevo socio se da de alta.',
    tools: ['n8n', 'chatwoot', 'airtable'],
    requiredConfig: [
      { label: 'Webhook de alta de socio configurado en n8n', tool: 'n8n', envVar: 'N8N_API_URL' },
      { label: 'Canal de WhatsApp conectado en Chatwoot', tool: 'chatwoot', envVar: 'CHATWOOT_API_URL' },
      { label: 'Base de clientes configurada en Airtable', tool: 'airtable', envVar: 'AIRTABLE_BASE_ID' },
    ],
    n8nWorkflowHint: 'Bienvenida Socio',
  },
  {
    id: 'recordatorio-pago',
    name: 'Recordatorio de pago',
    description: 'Envía recordatorio por WhatsApp 3 días antes del vencimiento de cuota y un seguimiento el día del vencimiento si no se registró el pago.',
    tools: ['n8n', 'chatwoot'],
    requiredConfig: [
      { label: 'Trigger programado (Cron) en n8n configurado', tool: 'n8n', envVar: 'N8N_API_URL' },
      { label: 'Canal de WhatsApp conectado en Chatwoot', tool: 'chatwoot', envVar: 'CHATWOOT_API_URL' },
      { label: 'Template de recordatorio de pago creado', tool: 'chatwoot' },
    ],
    n8nWorkflowHint: 'Recordatorio Pago',
  },
  {
    id: 'reporte-semanal-actividad',
    name: 'Reporte semanal de actividad',
    description: 'Genera y envía un resumen semanal con métricas de conversaciones, workflows ejecutados y tareas pendientes a Slack cada lunes.',
    tools: ['n8n', 'slack'],
    requiredConfig: [
      { label: 'Trigger semanal (Cron lunes) configurado en n8n', tool: 'n8n', envVar: 'N8N_API_URL' },
      { label: 'Webhook de Slack configurado', tool: 'slack', envVar: 'SLACK_WEBHOOK_URL' },
    ],
    n8nWorkflowHint: 'Reporte Semanal',
  },
]
