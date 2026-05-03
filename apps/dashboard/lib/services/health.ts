import provider from '../providers'

export async function getClientesEnRiesgo() {
  const all = await provider.getClientes()
  return all.filter(c => c.estado === 'critico' || c.estado === 'riesgo')
}
