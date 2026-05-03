interface CardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className, noPadding = false }: CardProps) {
  return (
    <div
      className={className ?? ''}
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: noPadding ? 0 : 20,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        overflow: noPadding ? 'hidden' : undefined,
      }}
    >
      {children}
    </div>
  )
}
