import { getClientes } from '@/lib/services/clients'
import ClientesTable from './ClientesTable'

export default async function Clientes() {
  const clientes = await getClientes()
  return <ClientesTable clientes={clientes} />
}
