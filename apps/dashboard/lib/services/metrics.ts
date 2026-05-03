import provider from '../providers'

export async function getOportunidadesUpsell() {
  const clientes = await provider.getClientes()
  return clientes.flatMap(c =>
    c.recomendaciones
      .filter(r => r.tipo === 'upsell')
      .map(r => ({ ...r, cliente: c }))
  )
}

export async function getRecomendaciones(clienteId?: string) {
  return provider.getRecomendaciones(clienteId)
}
