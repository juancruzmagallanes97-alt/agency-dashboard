import provider from '../providers'

export async function getAlertas(clienteId?: string) {
  return provider.getAlertas(clienteId)
}

export async function getAlertasCriticas() {
  const all = await provider.getAlertas()
  return all.filter(a => a.tipo === 'critico' && !a.resuelta)
}

export async function getAlertasActivas() {
  const all = await provider.getAlertas()
  return all.filter(a => !a.resuelta)
}
