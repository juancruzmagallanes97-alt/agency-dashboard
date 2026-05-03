interface BadgeProps {
  variant: 'critical' | 'warning' | 'opportunity' | 'stable' | 'neutral'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

const variantStyles: Record<BadgeProps['variant'], { bg: string; border: string; color: string }> = {
  critical:    { bg: '#FFF0F0', border: '#FFC5C5', color: '#C0392B' },
  warning:     { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' },
  opportunity: { bg: '#F0FDF4', border: '#A7F3D0', color: '#065F46' },
  stable:      { bg: '#F0FDF4', border: '#A7F3D0', color: '#065F46' },
  neutral:     { bg: 'var(--surface-1)', border: 'var(--border)', color: 'var(--text-2)' },
}

export function Badge({ variant, children }: BadgeProps) {
  const s = variantStyles[variant]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.4,
      borderRadius: 4,
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
