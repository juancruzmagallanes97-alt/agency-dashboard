'use client'
import { getTareasStats, categoriaColor, categoriaLabel, prioridadColor } from '@/lib/data'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { Tarea, TareaEstado, Cliente } from '@/lib/data'

const STORAGE_KEY = (id: string) => `tareas_${id}`

const estadoNext: Record<TareaEstado, TareaEstado> = {
  pendiente: 'en-progreso',
  'en-progreso': 'completado',
  completado: 'pendiente',
}

const estadoStyle: Record<TareaEstado, { label: string; style: React.CSSProperties }> = {
  pendiente:    { label: 'Pendiente',   style: { background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)' } },
  'en-progreso':{ label: 'En progreso', style: { background: 'rgba(232,160,32,0.1)', color: 'var(--warning)', border: '1px solid rgba(232,160,32,0.25)' } },
  completado:   { label: 'Completado',  style: { background: 'rgba(46,186,128,0.1)', color: 'var(--opportunity)', border: '1px solid rgba(46,186,128,0.25)' } },
}

export default function TareasBoard({ clientes, tareasDefault }: { clientes: Cliente[]; tareasDefault: Tarea[] }) {
  const [allTareas, setAllTareas] = useState<Tarea[]>(tareasDefault)

  useEffect(() => {
    const merged: Tarea[] = []
    for (const c of clientes) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY(c.id))
        if (saved) {
          merged.push(...JSON.parse(saved))
        } else {
          merged.push(...tareasDefault.filter(t => t.clienteId === c.id))
        }
      } catch {
        merged.push(...tareasDefault.filter(t => t.clienteId === c.id))
      }
    }
    setAllTareas(merged)
  }, [])

  function toggle(clienteId: string, tareaId: string) {
    setAllTareas(prev => {
      const updated = prev.map(t =>
        t.id !== tareaId ? t : {
          ...t,
          estado: estadoNext[t.estado],
          progreso: estadoNext[t.estado] === 'completado' ? 100 : t.progreso,
        }
      )
      const clienteTareas = updated.filter(t => t.clienteId === clienteId)
      localStorage.setItem(STORAGE_KEY(clienteId), JSON.stringify(clienteTareas))
      return updated
    })
  }

  const globalStats = getTareasStats(allTareas)
  const pct = globalStats.total > 0 ? Math.round((globalStats.completadas / globalStats.total) * 100) : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Tareas</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
          Configuraciones pendientes y estado de implementación — se marca manualmente
        </p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: globalStats.total, style: {} },
          { label: 'Pendientes', value: globalStats.pendientes, style: { color: 'var(--text-1)' } },
          { label: 'En progreso', value: globalStats.enProgreso, style: { color: 'var(--warning)' } },
          { label: 'Completadas', value: globalStats.completadas, style: { color: 'var(--opportunity)' } },
          { label: 'Alta prioridad', value: globalStats.altas, style: { color: 'var(--critical)' } },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-lg p-4 text-center"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-3)' }}>{s.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-1)', ...s.style }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Global progress */}
      <div
        className="rounded-lg px-5 py-4 mb-6"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[11px] uppercase tracking-wide shrink-0" style={{ color: 'var(--text-3)' }}>
            Progreso global
          </span>
          <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border-2)' }}>
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-bold font-mono shrink-0" style={{ color: 'var(--text-1)' }}>{pct}%</span>
        </div>
      </div>

      {/* Per-client sections */}
      {clientes.map(c => {
        const tareas = allTareas.filter(t => t.clienteId === c.id)
        const stats = getTareasStats(tareas)
        const prioOrd: Record<string, number> = { alta: 0, media: 1, baja: 2 }
        const activas = tareas.filter(t => t.estado !== 'completado').sort((a, b) => prioOrd[a.prioridad] - prioOrd[b.prioridad])
        const completadas = tareas.filter(t => t.estado === 'completado')

        return (
          <div
            key={c.id}
            className="rounded-lg mb-4"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            {/* Client header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{c.empresa}</span>
                <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                  {stats.completadas}/{stats.total} · {stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0}%
                </span>
                {stats.altas > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded text-red-400 bg-red-400/10 border border-red-400/20">
                    {stats.altas} alta
                  </span>
                )}
              </div>
              <Link
                href={`/clientes/${c.id}`}
                className="text-[11px]"
                style={{ color: 'var(--accent)' }}
              >
                Ver cliente →
              </Link>
            </div>

            {/* Active tasks */}
            {activas.map(t => (
              <div
                key={t.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--surface-1)]"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => toggle(c.id, t.id)}
                  className="w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center border transition-all"
                  style={
                    t.estado === 'en-progreso'
                      ? { background: 'rgba(232,160,32,0.15)', borderColor: 'var(--warning)' }
                      : { background: 'transparent', borderColor: 'var(--border-2)' }
                  }
                >
                  {t.estado === 'en-progreso' && <span className="text-[9px] text-amber-400 leading-none">◐</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm" style={{ color: 'var(--text-1)' }}>{t.titulo}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${categoriaColor[t.categoria]}`}>
                      {categoriaLabel[t.categoria]}
                    </span>
                    <span className={`text-[10px] font-medium ${prioridadColor[t.prioridad]}`}>
                      {t.prioridad === 'alta' ? '↑ alta' : t.prioridad === 'media' ? '→ media' : '↓ baja'}
                    </span>
                  </div>
                  {t.progreso > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="w-24 h-1 rounded-full" style={{ background: 'var(--border-2)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${t.progreso}%`, background: 'var(--accent)' }}
                        />
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>{t.progreso}%</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded shrink-0 mt-0.5" style={estadoStyle[t.estado].style}>
                  {estadoStyle[t.estado].label}
                </span>
              </div>
            ))}

            {/* Completed count (collapsed) */}
            {completadas.length > 0 && (
              <div className="px-5 py-3 text-[11px]" style={{ color: 'var(--text-3)' }}>
                ✓ {completadas.length} tarea{completadas.length > 1 ? 's' : ''} completada{completadas.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
