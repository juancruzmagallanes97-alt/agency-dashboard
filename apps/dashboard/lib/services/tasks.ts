import provider from '../providers'

export async function getTareas(clienteId?: string) {
  return provider.getTareas(clienteId)
}
