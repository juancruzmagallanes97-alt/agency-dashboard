import provider from '../providers'

export async function getClientes() {
  return provider.getClientes()
}

export async function getCliente(id: string) {
  return provider.getCliente(id)
}
