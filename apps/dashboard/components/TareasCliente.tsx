'use client'
import { useState, useEffect } from 'react'
import {
  Tarea, TareaCategoria, TareaEstado, TareaPrioridad,
  categoriaLabel, categoriaColor, prioridadColor, getTareasStats,
} from '@/lib/data'

const STORAGE_KEY = (id: string) => `tareas_${id}`

const estadoNext: Record<TareaEstado, TareaEstado> = {
  pendiente: 'en-progreso',
  'en-progreso': 'completado',
  completado: 'pendiente',
}

const estadoLabel: Record<TareaEstado, string> = {
  pendiente: 'Pendiente',
  'en-progreso': 'En progreso',
  completado: 'Completado',
}

export default function TareasCliente({ clienteId, defaultTareas }: { clienteId: string; defaultTareas: Tarea[] }) {
  const defaults = defaultTareas
  const [tareas, setTareas] = useState<Tarea[]>(defaults)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<{
    titulo: string; descripcion: string; categoria: TareaCategoria; prioridad: TareaPrioridad
  }>({ titulo: '', descripcion: '', categoria: 'configuracion', prioridad: 'media' })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(clienteId))
      if (saved) setTareas(JSON.parse(saved))
    } catch {}
  }, [clienteId])

  function save(updated: Tarea[]) {
    setTareas(updated)
    localStorage.setItem(STORAGE_KEY(clienteId), JSON.stringify(updated))
  }

  function toggleEstado(id: string) {
    save(tareas.map(t => {
      if (t.id !== id) return t
      const next = estadoNext[t.estado]
      return {
        ...t,
        estado: next,
        progreso: next === 'completado' ? 100 : next === 'pendiente' ? 0 : t.progreso,
      }
    }))
  }

  function adjustProgreso(id: string, delta: number) {
    save(tareas.map(t =>
      t.id !== id ? t : { ...t, progreso: Math.min(100, Math.max(0, t.progreso + delta)) }
    ))
  }

  function updateNotas(id: string, notas: string) {
    save(tareas.map(t => t.id !== id ? t : { ...t, notas }))
  }

  function addTarea() {
    if (!form.titulo.trim()) return
    const t: Tarea = {
      id: `custom-${Date.now()}`,
      clienteId,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria,
      prioridad: form.prioridad,
      estado: 'pendiente',
      progreso: 0,
      predefinida: false,
    }
    save([...tareas, t])
    setForm({ titulo: '', descripcion: '', categoria: 'configuracion', prioridad: 'media' })
    setFormOpen(false)
  }

  const stats = getTareasStats(tareas)
  const prioOrd: Record<TareaPrioridad, number> = { alta: 0, media: 1, baja: 2 }
  const activas = tareas
    .filter(t => t.estado !== 'completado')
    .sort((a, b) => prioOrd[a.prioridad] - prioOrd[b.prioridad])
  const completadas = tareas.filter(t => t.estado === 'completado')
  const pct = stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0

  return (
    <div className="rounded-xl" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Tareas &amp; Configuraciones</span>
            {stats.altas > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>
                {stats.altas} pendiente{stats.altas > 1 ? 's' : ''} importantes
              </span>
            )}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
            {stats.completadas} de {stats.total} completadas · {pct}%
          </div>
        </div>
        <button
          onClick={() => setFormOpen(p => !p)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}
        >
          + Nueva tarea
        </button>
      </div>

      {/* Global progress bar */}
      <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="h-1 rounded-full" style={{ background: 'var(--border-2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: pct === 100 ? 'var(--text-1)' : 'var(--text-3)' }}
          />
        </div>
      </div>

      {/* New task form */}
      {formOpen && (
        <div className="px-6 py-5 space-y-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <input
            type="text"
            placeholder="Nombre de la tarea"
            value={form.titulo}
            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addTarea()}
            className="w-full text-sm px-3 py-2 rounded-lg outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-1)' }}
            autoFocus
          />
          <textarea
            placeholder="Qué hay que hacer (descripción)"
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            rows={2}
            className="w-full text-xs px-3 py-2 rounded-lg outline-none resize-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
          />
          <div className="flex gap-2">
            <select
              value={form.categoria}
              onChange={e => setForm(p => ({ ...p, categoria: e.target.value as TareaCategoria }))}
              className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
            >
              {(Object.keys(categoriaLabel) as TareaCategoria[]).map(c => (
                <option key={c} value={c}>{categoriaLabel[c]}</option>
              ))}
            </select>
            <select
              value={form.prioridad}
              onChange={e => setForm(p => ({ ...p, prioridad: e.target.value as TareaPrioridad }))}
              className="text-xs px-3 py-2 rounded-lg outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <button
              onClick={addTarea}
              className="text-xs px-4 py-2 rounded-lg font-semibold"
              style={{ background: 'var(--text-1)', color: 'var(--bg)' }}
            >
              Agregar
            </button>
            <button
              onClick={() => setFormOpen(false)}
              className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border-2)' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Pending + in progress tasks */}
      {activas.map(t => (
        <TareaRow
          key={t.id}
          tarea={t}
          onToggle={toggleEstado}
          onAdjust={adjustProgreso}
          onUpdateNotas={updateNotas}
        />
      ))}

      {/* Completed */}
      {completadas.length > 0 && (
        <div>
          <div
            className="px-6 py-2 text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-3)', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
          >
            Completadas — {completadas.length}
          </div>
          {completadas.map(t => (
            <TareaRow
              key={t.id}
              tarea={t}
              onToggle={toggleEstado}
              onAdjust={adjustProgreso}
              onUpdateNotas={updateNotas}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TareaRow({
  tarea: t,
  onToggle,
  onAdjust,
  onUpdateNotas,
}: {
  tarea: Tarea
  onToggle: (id: string) => void
  onAdjust: (id: string, delta: number) => void
  onUpdateNotas: (id: string, notas: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const done = t.estado === 'completado'
  const inProgress = t.estado === 'en-progreso'

  return (
    <div
      className="hover:bg-[var(--surface-1)]"
      style={{ borderBottom: '1px solid var(--border)', opacity: done ? 0.45 : 1 }}
    >
      {/* Main row */}
      <div className="flex items-start gap-4 px-6 py-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(t.id)}
          className="w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center border transition-all"
          style={
            done
              ? { background: 'var(--text-1)', borderColor: 'var(--text-1)' }
              : inProgress
                ? { background: 'var(--surface-2)', borderColor: 'var(--border-2)' }
                : { background: 'transparent', borderColor: 'var(--border-2)' }
          }
          title={`→ ${estadoLabel[estadoNext[t.estado]]}`}
        >
          {done && <span style={{ fontSize: 8, color: 'var(--bg)', fontWeight: 700, lineHeight: 1 }}>✓</span>}
          {inProgress && <span style={{ fontSize: 8, color: 'var(--text-3)', lineHeight: 1 }}>●</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2 flex-wrap">
            <button
              onClick={() => setExpanded(p => !p)}
              className="text-sm font-medium text-left"
              style={{
                color: 'var(--text-1)',
                textDecoration: done ? 'line-through' : 'none',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              }}
            >
              {t.titulo}
            </button>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${categoriaColor[t.categoria]}`}>
              {categoriaLabel[t.categoria]}
            </span>
            <span className={`text-[10px] font-medium ${prioridadColor[t.prioridad]}`}>
              {t.prioridad}
            </span>
          </div>

          {/* Description — always visible */}
          {t.descripcion && (
            <div className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-3)' }}>
              {t.descripcion}
            </div>
          )}

          {/* Progress bar */}
          {!done && (
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex-1 h-px" style={{ background: 'var(--border-2)' }}>
                {t.progreso > 0 && (
                  <div
                    className="h-full transition-all"
                    style={{ width: `${t.progreso}%`, background: 'var(--text-2)', height: 1 }}
                  />
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onAdjust(t.id, -10)}
                  className="w-5 h-5 rounded flex items-center justify-center text-xs"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
                >−</button>
                <span className="text-[11px] font-mono w-8 text-center" style={{ color: 'var(--text-3)' }}>
                  {t.progreso}%
                </span>
                <button
                  onClick={() => onAdjust(t.id, 10)}
                  className="w-5 h-5 rounded flex items-center justify-center text-xs"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
                >+</button>
              </div>
            </div>
          )}

          {/* Expandable notes */}
          {expanded && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>
                Notas
              </div>
              <textarea
                value={t.notas ?? ''}
                onChange={e => onUpdateNotas(t.id, e.target.value)}
                placeholder="Escribí tus notas aquí..."
                rows={3}
                className="w-full text-xs px-3 py-2 rounded-lg outline-none resize-none"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-2)',
                  color: 'var(--text-2)',
                  lineHeight: 1.6,
                }}
              />
            </div>
          )}
        </div>

        {/* Estado + expand button */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-xs"
            style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Notas"
          >
            {expanded ? '▲' : '▽'}
          </button>
          <span
            className="text-[10px] px-2 py-0.5 rounded-md"
            style={{ background: 'var(--surface-2)', color: 'var(--text-3)', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}
          >
            {estadoLabel[t.estado]}
          </span>
        </div>
      </div>
    </div>
  )
}
