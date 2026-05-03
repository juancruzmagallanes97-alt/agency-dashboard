'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowUp, ArrowDown, Users, Plus } from 'lucide-react'
import { getNichoLabel, getPlanLabel, canalIcon } from '@/lib/data'
import type { Cliente, Estado } from '@/lib/data'

type FilterEstado = 'todos' | Estado
type SortColumn = 'nombre' | 'healthScore' | 'plan' | null
type SortDirection = 'asc' | 'desc'

const filtros: { value: FilterEstado; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'estable', label: 'Estable' },
  { value: 'atencion', label: 'Atención' },
  { value: 'riesgo', label: 'En Riesgo' },
  { value: 'critico', label: 'Crítico' },
]

const AVATAR_COLORS = [
  { from: '#2383E2', to: '#1563C0' },
  { from: '#34D399', to: '#059669' },
  { from: '#F97316', to: '#C2410C' },
  { from: '#A855F7', to: '#7C3AED' },
  { from: '#F59E0B', to: '#D97706' },
]

const STATUS_COLOR: Record<string, string> = {
  estable:  'var(--status-estable)',
  atencion: 'var(--status-atencion)',
  riesgo:   'var(--status-riesgo)',
  critico:  'var(--status-critico)',
}

const STATUS_LABEL: Record<string, string> = {
  estable:  'Estable',
  atencion: 'Atención',
  riesgo:   'En riesgo',
  critico:  'Crítico',
}

function healthColor(score: number) {
  if (score >= 75) return 'var(--status-estable)'
  if (score >= 55) return 'var(--status-atencion)'
  if (score >= 35) return 'var(--status-riesgo)'
  return 'var(--status-critico)'
}

function SortIndicator({ col, sortCol, sortDir }: { col: SortColumn; sortCol: SortColumn; sortDir: SortDirection }) {
  if (sortCol !== col) return null
  return sortDir === 'asc'
    ? <ArrowUp style={{ display: 'inline', width: 11, height: 11, marginLeft: 4 }} />
    : <ArrowDown style={{ display: 'inline', width: 11, height: 11, marginLeft: 4 }} />
}

export default function ClientesTable({ clientes }: { clientes: Cliente[] }) {
  const [filtroEstado, setFiltroEstado] = useState<FilterEstado>('todos')
  const [sortCol, setSortCol] = useState<SortColumn>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const clientesFiltrados = clientes.filter(c =>
    filtroEstado === 'todos' ? true : c.estado === filtroEstado
  )

  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    if (!sortCol) return 0
    const mult = sortDir === 'asc' ? 1 : -1
    if (sortCol === 'nombre') return mult * a.empresa.localeCompare(b.empresa)
    if (sortCol === 'healthScore') return mult * (a.healthScore - b.healthScore)
    if (sortCol === 'plan') return mult * a.plan.localeCompare(b.plan)
    return 0
  })

  function handleSort(col: SortColumn) {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortCol(null); setSortDir('asc') }
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Users style={{ width: 18, height: 18, color: 'var(--text-3)', opacity: 0.6 }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Clientes</h1>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
            {clientesOrdenados.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} activo{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          disabled
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 500, color: 'var(--text-3)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '7px 14px', cursor: 'not-allowed', opacity: 0.5,
          }}
        >
          <Plus style={{ width: 13, height: 13 }} />
          Nuevo cliente
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {filtros.map(f => {
          const active = filtroEstado === f.value
          const statusColor = f.value !== 'todos' ? STATUS_COLOR[f.value] : null
          return (
            <button
              key={f.value}
              onClick={() => setFiltroEstado(f.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: active ? 500 : 400,
                padding: '5px 12px',
                borderRadius: 20,
                border: `1px solid ${active ? (statusColor ?? 'var(--accent)') : 'var(--border)'}`,
                background: active ? (statusColor ? `${statusColor}18` : 'var(--accent-bg)') : 'transparent',
                color: active ? (statusColor ?? 'var(--accent)') : 'var(--text-3)',
                cursor: 'pointer',
                transition: 'all 100ms ease',
              }}
            >
              {statusColor && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                  background: statusColor,
                }} />
              )}
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 140px 100px 110px 160px 100px',
          background: 'var(--surface-1)',
          borderBottom: '1px solid var(--border)',
          padding: '0 20px',
        }}>
          {[
            { label: 'Cliente', col: 'nombre' as SortColumn, align: 'left' },
            { label: 'Estado', col: null, align: 'left' },
            { label: 'Plan', col: 'plan' as SortColumn, align: 'left' },
            { label: 'Canales', col: null, align: 'left' },
            { label: 'Workflows', col: null, align: 'left' },
            { label: 'Health', col: 'healthScore' as SortColumn, align: 'right' },
          ].map(({ label, col, align }) => (
            <div
              key={label}
              onClick={col ? () => handleSort(col) : undefined}
              style={{
                fontSize: 10, fontWeight: 400, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.09em',
                height: 38, display: 'flex', alignItems: 'center',
                justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
                cursor: col ? 'pointer' : 'default',
                userSelect: 'none',
              }}
            >
              {label}
              {col && <SortIndicator col={col} sortCol={sortCol} sortDir={sortDir} />}
            </div>
          ))}
        </div>

        {/* Rows */}
        {clientesOrdenados.length === 0 ? (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            fontSize: 13, color: 'var(--text-3)',
            background: 'var(--surface-1)',
          }}>
            Ningún cliente coincide con el filtro seleccionado
          </div>
        ) : (
          clientesOrdenados.map((c, i) => {
            const av = AVATAR_COLORS[i % AVATAR_COLORS.length]
            const statusColor = STATUS_COLOR[c.estado]
            const workflowsActivos = c.workflows.filter(w => w.estado === 'activo').length
            const workflowsError = c.workflows.filter(w => w.estado === 'error').length
            const alertasCriticas = c.alertas.filter(a => a.tipo === 'critico' && !a.resuelta).length
            const hColor = healthColor(c.healthScore)

            return (
              <Link
                key={c.id}
                href={`/clientes/${c.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 140px 100px 110px 160px 100px',
                  padding: '0 20px',
                  height: 52,
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface-1)',
                  textDecoration: 'none',
                  transition: 'background 100ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-1)')}
              >
                {/* Empresa */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(145deg, ${av.from}, ${av.to})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    border: `2px solid ${statusColor}`,
                  }}>
                    {c.empresa[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{c.empresa}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                      {getNichoLabel(c.nicho)}
                      {c.bot && <span style={{ marginLeft: 6, opacity: 0.7 }}>· {c.bot}</span>}
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: statusColor,
                  }} />
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{STATUS_LABEL[c.estado]}</span>
                  {alertasCriticas > 0 && (
                    <span style={{
                      fontSize: 10, color: 'var(--status-critico)',
                      background: 'rgba(239,68,68,0.1)', borderRadius: 10,
                      padding: '1px 5px', marginLeft: 2,
                    }}>
                      {alertasCriticas}
                    </span>
                  )}
                </div>

                {/* Plan */}
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    padding: '3px 8px', borderRadius: 6,
                    border: '1px solid var(--border-2)',
                    background: 'var(--surface-2)',
                    color: 'var(--text-3)',
                  }}>
                    {getPlanLabel(c.plan)}
                  </span>
                </div>

                {/* Canales */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {c.canales.map(canal => (
                    <span key={canal} style={{ fontSize: 14 }} title={canal}>{canalIcon[canal]}</span>
                  ))}
                </div>

                {/* Workflows */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                    {workflowsActivos} activo{workflowsActivos !== 1 ? 's' : ''}
                  </span>
                  {workflowsError > 0 && (
                    <span style={{
                      fontSize: 10, color: 'var(--status-critico)',
                      background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '1px 5px',
                    }}>
                      {workflowsError} error
                    </span>
                  )}
                </div>

                {/* Health */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  <div style={{
                    width: 36, height: 4, borderRadius: 2,
                    background: 'var(--border-2)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${c.healthScore}%`,
                      background: hColor, borderRadius: 2,
                      transition: 'width 400ms ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: hColor, fontVariantNumeric: 'tabular-nums', minWidth: 24, textAlign: 'right' }}>
                    {c.healthScore}
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
