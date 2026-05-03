interface StatBlockProps {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'critical'
}

export function StatBlock({ label, value, sub, variant = 'default' }: StatBlockProps) {
  const dotColor = variant === 'critical' ? 'var(--critical)' : 'var(--opportunity)'
  const valueColor = variant === 'critical' ? 'var(--critical)' : 'var(--text-1)'

  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={{
          fontSize: 12,
          fontWeight: 400,
          color: 'var(--text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 600,
        color: valueColor,
        lineHeight: 1.2,
        marginTop: 8,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)', marginTop: 8 }}>
          {sub}
        </div>
      )}
    </div>
  )
}
