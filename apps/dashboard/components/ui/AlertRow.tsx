import { Badge } from '@/components/ui/Badge'

interface AlertRowProps {
  titulo: string
  clienteNombre: string
  fecha: string
  tipo: 'critico' | 'warning' | 'oportunidad'
  onClick?: () => void
}

const tipoBadgeVariant: Record<AlertRowProps['tipo'], 'critical' | 'warning' | 'opportunity'> = {
  critico:     'critical',
  warning:     'warning',
  oportunidad: 'opportunity',
}

const tipoDotColor: Record<AlertRowProps['tipo'], string> = {
  critico:     'var(--critical)',
  warning:     'var(--warning)',
  oportunidad: 'var(--opportunity)',
}

const tipoLabel: Record<AlertRowProps['tipo'], string> = {
  critico:     'Crítico',
  warning:     'Warning',
  oportunidad: 'Oportunidad',
}

export function AlertRow({ titulo, clienteNombre, fecha, tipo, onClick }: AlertRowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 80ms ease',
      }}
    >
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: tipoDotColor[tipo],
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 400,
          color: 'var(--text-1)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {titulo}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
          {clienteNombre} · {fecha}
        </div>
      </div>
      <Badge variant={tipoBadgeVariant[tipo]}>{tipoLabel[tipo]}</Badge>
    </div>
  )
}
