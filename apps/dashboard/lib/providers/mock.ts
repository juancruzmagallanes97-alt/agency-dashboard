import { clientes, tareasDefault } from '../data'
import type { DataProvider } from './interface'

export class MockProvider implements DataProvider {
  async getClientes() {
    return clientes
  }

  async getCliente(id: string) {
    return clientes.find(c => c.id === id) ?? null
  }

  async getTareas(clienteId?: string) {
    if (clienteId) return tareasDefault.filter(t => t.clienteId === clienteId)
    return tareasDefault
  }

  async getAlertas(clienteId?: string) {
    const all = clientes.flatMap(c => c.alertas)
    if (clienteId) return all.filter(a => a.clienteId === clienteId)
    return all
  }

  async getRecomendaciones(clienteId?: string) {
    if (clienteId) {
      const c = clientes.find(c => c.id === clienteId)
      return c?.recomendaciones ?? []
    }
    return clientes.flatMap(c => c.recomendaciones)
  }
}
