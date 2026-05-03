import type { DataProvider } from './interface'
import type {
  Cliente, Workflow, Alerta, Tarea, Recomendacion,
  Canal, WorkflowEstado, WorkflowTipo, AlertaTipo,
  Estado, Nicho, Plan, TareaCategoria, TareaEstado, TareaPrioridad,
} from '../data'
import { supabase } from '../supabase'

// ─── Row types (match Supabase table columns) ─────────────────────────────────

type Row_Cliente = {
  id: string; empresa: string; nombre: string | null
  nicho: string; plan: string; estado: string; health_score: number
  email: string | null; fecha_inicio: string | null
  canales: string[] | null; bot: string | null; sucursales: string[] | null
  ghl_url: string | null; n8n_base: string | null
  conversaciones: number | null; leads_follow_up: number | null
  tiempo_respuesta: number | null; horas_ahorradas: number | null
  conv_whatsapp: number | null; conv_instagram: number | null
  conv_webchat: number | null; conv_facebook: number | null
}

type Row_Workflow = {
  id: string; cliente_id: string; nombre: string; tipo: string | null
  estado: string | null; uptime: number | null; ultima_ejecucion: string | null
  errores_hoy: number | null; ejecuciones_hoy: number | null; n8n_url: string | null
}

type Row_Alerta = {
  id: string; cliente_id: string; tipo: string; titulo: string
  descripcion: string | null; fecha: string | null
  resuelta: boolean | null; url: string | null
}

type Row_Tarea = {
  id: string; cliente_id: string; titulo: string; descripcion: string | null
  categoria: string | null; prioridad: string | null; estado: string | null
  progreso: number | null; predefinida: boolean | null
}

type Row_Recomendacion = {
  id: string; cliente_id: string; titulo: string; tipo: string | null
  descripcion: string | null; impacto: string | null
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toWorkflow(r: Row_Workflow): Workflow {
  return {
    id:              r.id,
    nombre:          r.nombre,
    tipo:            (r.tipo as WorkflowTipo)     ?? 'principal',
    estado:          (r.estado as WorkflowEstado) ?? 'inactivo',
    uptime:          r.uptime          ?? 0,
    ultimaEjecucion: r.ultima_ejecucion ?? '—',
    erroresHoy:      r.errores_hoy     ?? 0,
    ejecucionesHoy:  r.ejecuciones_hoy ?? 0,
    n8nUrl:          r.n8n_url          ?? '',
  }
}

function toAlerta(r: Row_Alerta, clienteNombre: string): Alerta {
  return {
    id:            r.id,
    tipo:          (r.tipo as AlertaTipo) ?? 'warning',
    titulo:        r.titulo,
    descripcion:   r.descripcion  ?? '',
    clienteId:     r.cliente_id,
    clienteNombre,
    fecha:         r.fecha        ?? new Date().toISOString().split('T')[0],
    resuelta:      r.resuelta     ?? false,
    url:           r.url ?? undefined,
  }
}

function toTarea(r: Row_Tarea): Tarea {
  return {
    id:          r.id,
    clienteId:   r.cliente_id,
    titulo:      r.titulo,
    descripcion: r.descripcion   ?? '',
    categoria:   (r.categoria  as TareaCategoria)  ?? 'configuracion',
    prioridad:   (r.prioridad  as TareaPrioridad)   ?? 'media',
    estado:      (r.estado     as TareaEstado)      ?? 'pendiente',
    progreso:    r.progreso    ?? 0,
    predefinida: r.predefinida ?? true,
  }
}

function toRecomendacion(r: Row_Recomendacion): Recomendacion {
  return {
    id:          r.id,
    tipo:        (r.tipo as 'operacional' | 'crecimiento' | 'upsell') ?? 'operacional',
    titulo:      r.titulo,
    descripcion: r.descripcion ?? '',
    impacto:     (r.impacto as 'alto' | 'medio' | 'bajo') ?? 'medio',
  }
}

function toCliente(
  r: Row_Cliente,
  workflows:       Workflow[],
  alertas:         Alerta[],
  recomendaciones: Recomendacion[],
): Cliente {
  return {
    id:          r.id,
    nombre:      r.nombre   ?? r.empresa,
    empresa:     r.empresa,
    nicho:       (r.nicho  as Nicho) ?? 'gym',
    plan:        (r.plan   as Plan)  ?? 'starter',
    estado:      (r.estado as Estado) ?? 'estable',
    healthScore: r.health_score ?? 0,
    email:       r.email        ?? '',
    fechaInicio: r.fecha_inicio ?? '',
    canales:     (r.canales ?? []) as Canal[],
    workflows,
    metricas: {
      conversaciones:          r.conversaciones   ?? 0,
      leadsFollowUp:           r.leads_follow_up  ?? 0,
      tiempoRespuestaSegundos: r.tiempo_respuesta ?? 0,
      horasAhorradas:          r.horas_ahorradas  ?? 0,
      conversionPorCanal: {
        whatsapp:  r.conv_whatsapp  ?? 0,
        instagram: r.conv_instagram ?? 0,
        webchat:   r.conv_webchat   ?? 0,
        facebook:  r.conv_facebook  ?? 0,
      },
    },
    alertas,
    recomendaciones,
    ghlUrl:     r.ghl_url   ?? '',
    n8nBase:    r.n8n_base  ?? '',
    bot:        r.bot       ?? undefined,
    sucursales: r.sucursales ?? undefined,
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class SupabaseProvider implements DataProvider {

  async getClientes(): Promise<Cliente[]> {
    const [
      { data: clienteRows, error: ce },
      { data: wfRows },
      { data: alertaRows },
      { data: recoRows },
    ] = await Promise.all([
      supabase.from('clientes').select('*').order('empresa'),
      supabase.from('workflows').select('*'),
      supabase.from('alertas').select('*'),
      supabase.from('recomendaciones').select('*'),
    ])

    if (ce) throw new Error(`Supabase clientes: ${ce.message}`)

    const rows = (clienteRows ?? []) as Row_Cliente[]

    const wfByCliente    = groupBy((wfRows    ?? []) as Row_Workflow[],      r => r.cliente_id)
    const alertaByCliente = groupBy((alertaRows ?? []) as Row_Alerta[],       r => r.cliente_id)
    const recoByCliente  = groupBy((recoRows  ?? []) as Row_Recomendacion[], r => r.cliente_id)

    return rows.map(r => {
      const workflows = (wfByCliente.get(r.id)    ?? []).map(toWorkflow)
      const alertas   = (alertaByCliente.get(r.id) ?? []).map(a => toAlerta(a, r.empresa))
      const recos     = (recoByCliente.get(r.id)  ?? []).map(toRecomendacion)
      return toCliente(r, workflows, alertas, recos)
    })
  }

  async getCliente(id: string): Promise<Cliente | null> {
    const all = await this.getClientes()
    return all.find(c => c.id === id) ?? null
  }

  async getTareas(clienteId?: string): Promise<Tarea[]> {
    let q = supabase.from('tareas').select('*').order('prioridad')
    if (clienteId) q = q.eq('cliente_id', clienteId)
    const { data, error } = await q
    if (error) throw new Error(`Supabase tareas: ${error.message}`)
    return ((data ?? []) as Row_Tarea[]).map(toTarea)
  }

  async getAlertas(clienteId?: string): Promise<Alerta[]> {
    let q = supabase.from('alertas').select('*').order('fecha', { ascending: false })
    if (clienteId) q = q.eq('cliente_id', clienteId)
    const { data, error } = await q
    if (error) throw new Error(`Supabase alertas: ${error.message}`)
    return ((data ?? []) as Row_Alerta[]).map(r => toAlerta(r, ''))
  }

  async getRecomendaciones(clienteId?: string): Promise<Recomendacion[]> {
    let q = supabase.from('recomendaciones').select('*')
    if (clienteId) q = q.eq('cliente_id', clienteId)
    const { data, error } = await q
    if (error) throw new Error(`Supabase recomendaciones: ${error.message}`)
    return ((data ?? []) as Row_Recomendacion[]).map(toRecomendacion)
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const arr = map.get(k) ?? []
    arr.push(item)
    map.set(k, arr)
  }
  return map
}
