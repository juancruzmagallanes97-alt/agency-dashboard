import type { Cliente, Tarea, Alerta, Recomendacion } from '../data'

export interface DataProvider {
  getClientes(): Promise<Cliente[]>
  getCliente(id: string): Promise<Cliente | null>
  getTareas(clienteId?: string): Promise<Tarea[]>
  getAlertas(clienteId?: string): Promise<Alerta[]>
  getRecomendaciones(clienteId?: string): Promise<Recomendacion[]>
}
