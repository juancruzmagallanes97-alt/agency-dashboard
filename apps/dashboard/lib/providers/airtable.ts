import type { DataProvider } from './interface'
import type {
  Cliente, Workflow, Alerta, Tarea, Recomendacion,
  Canal, WorkflowEstado, WorkflowTipo, AlertaTipo,
  Estado, Nicho, Plan, TareaCategoria, TareaEstado, TareaPrioridad,
} from '../data'
import { getConfig } from '../config'

// ─── Airtable REST helper ─────────────────────────────────────────────────────

const AIRTABLE_BASE = 'https://api.airtable.com/v0'

interface AirtableRecord<T> { id: string; fields: T }
interface AirtablePage<T>   { records: AirtableRecord<T>[]; offset?: string }

async function fetchAll<T>(
  baseId: string,
  apiKey: string,
  table: string,
  filter?: string,
): Promise<AirtableRecord<T>[]> {
  const all: AirtableRecord<T>[] = []
  let offset: string | undefined

  do {
    const params = new URLSearchParams({ pageSize: '100' })
    if (offset) params.set('offset', offset)
    if (filter)  params.set('filterByFormula', filter)

    const url = `${AIRTABLE_BASE}/${baseId}/${encodeURIComponent(table)}?${params}`
    const res  = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next:    { revalidate: 60 },   // Next.js ISR — refresh every 60 s
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Airtable [${table}] ${res.status}: ${body}`)
    }

    const page = (await res.json()) as AirtablePage<T>
    all.push(...page.records)
    offset = page.offset
  } while (offset)

  return all
}

// ─── Airtable field shapes ────────────────────────────────────────────────────

type AF_Cliente = {
  'ID':               string
  'Empresa':          string
  'Nombre'?:          string
  'Nicho':            string
  'Plan':             string
  'Estado':           string
  'Health Score':     number
  'Email'?:           string
  'Fecha Inicio'?:    string
  'Canales'?:         string[]
  'Bot'?:             string
  'Sucursales'?:      string          // comma-separated
  'GHL URL'?:         string
  'N8N Base'?:        string
  'Conversaciones'?:  number
  'Leads Follow Up'?: number
  'Tiempo Respuesta'?: number
  'Horas Ahorradas'?: number
  'Conv WhatsApp'?:   number
  'Conv Instagram'?:  number
  'Conv Webchat'?:    number
  'Conv Facebook'?:   number
}

type AF_Workflow = {
  'ID':               string
  'Nombre':           string
  'Tipo'?:            string
  'Estado'?:          string
  'Uptime'?:          number
  'Ultima Ejecucion'?: string
  'Errores Hoy'?:     number
  'Ejecuciones Hoy'?: number
  'N8N URL'?:         string
  'Cliente ID'?:      string[]        // Lookup → Clientes.ID
}

type AF_Alerta = {
  'ID'?:              string
  'Titulo':           string
  'Tipo':             string
  'Descripcion'?:     string
  'Fecha'?:           string
  'Resuelta'?:        boolean
  'URL'?:             string
  'Cliente ID'?:      string[]        // Lookup → Clientes.ID
}

type AF_Tarea = {
  'ID'?:              string
  'Titulo':           string
  'Descripcion'?:     string
  'Categoria'?:       string
  'Prioridad'?:       string
  'Estado'?:          string
  'Progreso'?:        number
  'Cliente ID'?:      string[]        // Lookup → Clientes.ID
}

type AF_Recomendacion = {
  'ID'?:              string
  'Titulo':           string
  'Tipo'?:            string
  'Descripcion'?:     string
  'Impacto'?:         string
  'Cliente ID'?:      string[]        // Lookup → Clientes.ID
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapWorkflow(r: AirtableRecord<AF_Workflow>): Workflow {
  const f = r.fields
  const wfId = f['ID'] ?? r.id
  return {
    id:              wfId,
    nombre:          f['Nombre'],
    tipo:            (f['Tipo'] as WorkflowTipo)    ?? 'principal',
    estado:          (f['Estado'] as WorkflowEstado) ?? 'inactivo',
    uptime:          f['Uptime']          ?? 0,
    ultimaEjecucion: f['Ultima Ejecucion'] ?? '—',
    erroresHoy:      f['Errores Hoy']     ?? 0,
    ejecucionesHoy:  f['Ejecuciones Hoy'] ?? 0,
    n8nUrl:          f['N8N URL']          ?? '',
  }
}

function mapAlerta(
  r: AirtableRecord<AF_Alerta>,
  clienteId: string,
  clienteNombre: string,
): Alerta {
  const f = r.fields
  return {
    id:             f['ID'] ?? r.id,
    tipo:           (f['Tipo'] as AlertaTipo) ?? 'warning',
    titulo:         f['Titulo'],
    descripcion:    f['Descripcion']  ?? '',
    clienteId,
    clienteNombre,
    fecha:          f['Fecha']        ?? new Date().toISOString().split('T')[0],
    resuelta:       f['Resuelta']     ?? false,
    url:            f['URL'],
  }
}

function mapTarea(r: AirtableRecord<AF_Tarea>, clienteId: string): Tarea {
  const f = r.fields
  return {
    id:          f['ID'] ?? r.id,
    clienteId,
    titulo:      f['Titulo'],
    descripcion: f['Descripcion'] ?? '',
    categoria:   (f['Categoria'] as TareaCategoria)  ?? 'configuracion',
    prioridad:   (f['Prioridad'] as TareaPrioridad)   ?? 'media',
    estado:      (f['Estado'] as TareaEstado)          ?? 'pendiente',
    progreso:    f['Progreso'] ?? 0,
    predefinida: true,
  }
}

function mapRecomendacion(r: AirtableRecord<AF_Recomendacion>): Recomendacion {
  const f = r.fields
  return {
    id:          f['ID'] ?? r.id,
    tipo:        (f['Tipo'] as 'operacional' | 'crecimiento' | 'upsell') ?? 'operacional',
    titulo:      f['Titulo'],
    descripcion: f['Descripcion'] ?? '',
    impacto:     (f['Impacto'] as 'alto' | 'medio' | 'bajo') ?? 'medio',
  }
}

function mapCliente(
  r: AirtableRecord<AF_Cliente>,
  workflows:       Workflow[],
  alertas:         Alerta[],
  recomendaciones: Recomendacion[],
): Cliente {
  const f      = r.fields
  const canales = (f['Canales'] ?? []) as Canal[]

  return {
    id:           f['ID'],
    nombre:       f['Nombre'] ?? f['Empresa'],
    empresa:      f['Empresa'],
    nicho:        (f['Nicho'] as Nicho)    ?? 'gym',
    plan:         (f['Plan'] as Plan)      ?? 'starter',
    estado:       (f['Estado'] as Estado)  ?? 'estable',
    healthScore:  f['Health Score'] ?? 0,
    email:        f['Email']        ?? '',
    fechaInicio:  f['Fecha Inicio'] ?? '',
    canales,
    workflows,
    metricas: {
      conversaciones:          f['Conversaciones']   ?? 0,
      leadsFollowUp:           f['Leads Follow Up']  ?? 0,
      tiempoRespuestaSegundos: f['Tiempo Respuesta'] ?? 0,
      horasAhorradas:          f['Horas Ahorradas']  ?? 0,
      conversionPorCanal: {
        whatsapp:  f['Conv WhatsApp']  ?? 0,
        instagram: f['Conv Instagram'] ?? 0,
        webchat:   f['Conv Webchat']   ?? 0,
        facebook:  f['Conv Facebook']  ?? 0,
      },
    },
    alertas,
    recomendaciones,
    ghlUrl:     f['GHL URL']   ?? '',
    n8nBase:    f['N8N Base']  ?? '',
    bot:        f['Bot'],
    sucursales: f['Sucursales']
      ? f['Sucursales'].split(',').map(s => s.trim()).filter(Boolean)
      : undefined,
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

function clienteIdFrom(fields: { 'Cliente ID'?: string[] }): string {
  return fields['Cliente ID']?.[0] ?? ''
}

function groupBy<T>(
  items: T[],
  key: (item: T) => string,
): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    if (!k) continue
    const arr = map.get(k) ?? []
    arr.push(item)
    map.set(k, arr)
  }
  return map
}

export class AirtableProvider implements DataProvider {
  private readonly apiKey: string
  private readonly baseId: string
  private readonly t: Record<string, string>

  constructor() {
    const cfg = getConfig()
    this.apiKey = cfg.airtable.apiKey
    this.baseId = cfg.airtable.baseId
    this.t = {
      clientes:        process.env.AIRTABLE_CLIENTES_TABLE        ?? 'Clientes',
      workflows:       process.env.AIRTABLE_WORKFLOWS_TABLE       ?? 'Workflows',
      alertas:         process.env.AIRTABLE_ALERTAS_TABLE         ?? 'Alertas',
      tareas:          process.env.AIRTABLE_TAREAS_TABLE          ?? 'Tareas',
      recomendaciones: process.env.AIRTABLE_RECOMENDACIONES_TABLE ?? 'Recomendaciones',
    }
  }

  private q<T>(table: string, filter?: string) {
    return fetchAll<T>(this.baseId, this.apiKey, table, filter)
  }

  // Fetch all related records in parallel and group by clienteId
  private async fetchRelated() {
    const [wfRecs, alertaRecs, recoRecs] = await Promise.all([
      this.q<AF_Workflow>(this.t.workflows),
      this.q<AF_Alerta>(this.t.alertas),
      this.q<AF_Recomendacion>(this.t.recomendaciones),
    ])

    const workflowsMap       = groupBy(wfRecs,    r => clienteIdFrom(r.fields))
    const alertasRawMap      = groupBy(alertaRecs, r => clienteIdFrom(r.fields))
    const recomendacionesMap = groupBy(recoRecs,   r => clienteIdFrom(r.fields))

    return { workflowsMap, alertasRawMap, recomendacionesMap }
  }

  async getClientes(): Promise<Cliente[]> {
    const [clienteRecs, related] = await Promise.all([
      this.q<AF_Cliente>(this.t.clientes),
      this.fetchRelated(),
    ])

    const { workflowsMap, alertasRawMap, recomendacionesMap } = related

    return clienteRecs
      .filter(r => r.fields['ID'])
      .map(r => {
        const id      = r.fields['ID']
        const empresa = r.fields['Empresa']

        const workflows = (workflowsMap.get(id) ?? []).map(mapWorkflow)
        const alertas   = (alertasRawMap.get(id) ?? []).map(ar => mapAlerta(ar, id, empresa))
        const recos     = (recomendacionesMap.get(id) ?? []).map(mapRecomendacion)

        return mapCliente(r, workflows, alertas, recos)
      })
  }

  async getCliente(id: string): Promise<Cliente | null> {
    // Reuse getClientes — Airtable has no row-level cache benefit for single record
    const all = await this.getClientes()
    return all.find(c => c.id === id) ?? null
  }

  async getTareas(clienteId?: string): Promise<Tarea[]> {
    const filter = clienteId
      ? `FIND("${clienteId}", ARRAYJOIN({Cliente ID}))`
      : undefined
    const recs = await this.q<AF_Tarea>(this.t.tareas, filter)
    return recs.map(r => mapTarea(r, clienteIdFrom(r.fields) || clienteId || ''))
  }

  async getAlertas(clienteId?: string): Promise<Alerta[]> {
    const filter = clienteId
      ? `FIND("${clienteId}", ARRAYJOIN({Cliente ID}))`
      : undefined
    const recs = await this.q<AF_Alerta>(this.t.alertas, filter)
    return recs.map(r => {
      const cid = clienteIdFrom(r.fields) || clienteId || ''
      return mapAlerta(r, cid, '')
    })
  }

  async getRecomendaciones(clienteId?: string): Promise<Recomendacion[]> {
    const filter = clienteId
      ? `FIND("${clienteId}", ARRAYJOIN({Cliente ID}))`
      : undefined
    const recs = await this.q<AF_Recomendacion>(this.t.recomendaciones, filter)
    return recs.map(mapRecomendacion)
  }
}
