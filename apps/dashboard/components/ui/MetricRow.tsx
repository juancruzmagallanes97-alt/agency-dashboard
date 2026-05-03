interface MetricRowProps {
  label: string
  value: string | number
  unit?: string
  dimLabel?: boolean
}

export function MetricRow({ label, value, unit, dimLabel = false }: MetricRowProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{
        fontSize: 14,
        fontWeight: 400,
        color: dimLabel ? 'var(--text-3)' : 'var(--text-2)',
      }}>
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-1)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)', marginLeft: 4 }}>
            {unit}
          </span>
        )}
      </span>
    </div>
  )
}
