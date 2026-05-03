interface HealthBadgeProps {
  score: number
  showLabel?: boolean
}

function getHealthColors(score: number) {
  if (score >= 80) return { text: '#065F46', bg: '#F0FDF4', border: '#A7F3D0', label: 'Estable' }
  if (score >= 60) return { text: '#92400E', bg: '#FFFBEB', border: '#FDE68A', label: 'Atención' }
  if (score >= 40) return { text: '#9A3412', bg: '#FFF7ED', border: '#FED7AA', label: 'En Riesgo' }
  return { text: '#C0392B', bg: '#FFF0F0', border: '#FFC5C5', label: 'Crítico' }
}

export function HealthBadge({ score, showLabel = false }: HealthBadgeProps) {
  const colors = getHealthColors(score)
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      borderRadius: 4,
      border: `1px solid ${colors.border}`,
      background: colors.bg,
    }}>
      <span style={{
        fontSize: 14,
        fontWeight: 600,
        color: colors.text,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {score}
      </span>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 400, color: colors.text }}>
          {colors.label}
        </span>
      )}
    </span>
  )
}
