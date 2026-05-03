import { getClientes } from '@/lib/services/clients'
import { getTareas } from '@/lib/services/tasks'
import TareasBoard from './TareasBoard'

export default async function TareasPage() {
  const [clientes, tareasDefault] = await Promise.all([getClientes(), getTareas()])
  return <TareasBoard clientes={clientes} tareasDefault={tareasDefault} />
}
