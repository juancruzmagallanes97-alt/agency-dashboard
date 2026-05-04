'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Loader2, CheckCircle2, Zap, BarChart3, MessageSquare, Bot, Eye, EyeOff } from 'lucide-react'

// ─── Left panel — value props ─────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Dashboard unificado',
    desc:  'Estado de cada cliente, workflow y alerta en un solo lugar.',
  },
  {
    icon: Bot,
    title: 'Agentes 24/7',
    desc:  'WhatsApp, Instagram y Webchat respondiendo automáticamente.',
  },
  {
    icon: MessageSquare,
    title: 'Chatwoot integrado',
    desc:  'Toda la atención al cliente indexada, sin abrir otra pestaña.',
  },
  {
    icon: Zap,
    title: 'Automatizaciones n8n',
    desc:  'Workflows que trabajan mientras vos hacés crecer el negocio.',
  },
]

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', telefono: '', mensaje: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/prospects', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })

    if (res.ok) {
      setDone(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Error al enviar. Intentá de nuevo.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <CheckCircle2 style={{ width: 48, height: 48, color: 'var(--status-estable)', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
          ¡Recibimos tu solicitud!
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
          Te vamos a contactar en las próximas 24 horas<br />para mostrarte cómo funciona la plataforma.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          background: 'var(--critical-bg)', border: '1px solid var(--critical-border)',
          borderRadius: 6, padding: '8px 14px', marginBottom: 16,
          fontSize: 13, color: 'var(--critical)',
        }}>
          {error}
        </div>
      )}

      {([
        { key: 'nombre',   label: 'Tu nombre',    type: 'text',  required: true  },
        { key: 'empresa',  label: 'Empresa',       type: 'text',  required: true  },
        { key: 'email',    label: 'Email',          type: 'email', required: true  },
        { key: 'telefono', label: 'WhatsApp',       type: 'tel',   required: false },
      ] as const).map(({ key, label, type, required }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {label}{required && <span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>}
          </label>
          <input
            type={type}
            required={required}
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            style={inputStyle}
            onFocus={focusInput}
            onBlur={blurInput}
          />
        </div>
      ))}

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          ¿Qué necesitás automatizar?
        </label>
        <textarea
          rows={3}
          value={form.mensaje}
          onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
          placeholder="Contanos brevemente tu situación actual..."
          style={{ ...inputStyle, height: 'auto', resize: 'none', padding: '10px 12px', lineHeight: 1.5 }}
          onFocus={focusInput}
          onBlur={blurInput}
        />
      </div>

      <button type="submit" disabled={loading} style={submitStyle(loading)}>
        {loading ? (
          <><Loader2 className="animate-spin" style={{ width: 14, height: 14 }} /> Enviando...</>
        ) : (
          'Solicitar demo gratuita'
        )}
      </button>
    </form>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [showPassword, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const data   = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email:    data.get('email'),
      password: data.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          background: 'var(--critical-bg)', border: '1px solid var(--critical-border)',
          borderRadius: 6, padding: '8px 14px', marginBottom: 16,
          fontSize: 13, color: 'var(--critical)',
        }}>
          {error}
        </div>
      )}

      {([
        { name: 'email',    label: 'Email',       type: 'email',    auto: 'email'            },
        { name: 'password', label: 'Contraseña',  type: 'password', auto: 'current-password' },
      ] as const).map(({ name, label, auto }) => (
        <div key={name} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {label}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              name={name}
              type={name === 'password' ? (showPassword ? 'text' : 'password') : 'email'}
              required
              autoComplete={auto}
              style={{ ...inputStyle, paddingRight: name === 'password' ? 38 : 12 }}
              onFocus={focusInput}
              onBlur={blurInput}
            />
            {name === 'password' && (
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 0,
                }}
              >
                {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            )}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: 20 }} />

      <button type="submit" disabled={loading} style={submitStyle(loading)}>
        {loading ? (
          <><Loader2 className="animate-spin" style={{ width: 14, height: 14 }} /> Ingresando...</>
        ) : (
          'Acceder al panel'
        )}
      </button>
    </form>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', height: 38,
  border: '1px solid var(--border)', borderRadius: 7,
  padding: '0 12px', fontSize: 13,
  color: 'var(--text-1)', background: 'var(--bg)',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 100ms ease, box-shadow 100ms ease',
}

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--accent)'
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(35,131,226,0.15)'
}

function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--border)'
  e.currentTarget.style.boxShadow   = 'none'
}

function submitStyle(loading: boolean): React.CSSProperties {
  return {
    width: '100%', height: 40,
    background: 'var(--accent)', color: '#fff',
    borderRadius: 8, fontSize: 13, fontWeight: 600,
    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'opacity 100ms ease',
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'var(--bg)',
    }}>
      {/* Left — branding / value props */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px',
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#fff',
          }}>
            A
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Agency Intelligence</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', margin: 0, lineHeight: 1.15, maxWidth: 440 }}>
          El cerebro operativo<br />
          <span style={{ color: 'var(--accent)' }}>de tu agencia</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', marginTop: 16, marginBottom: 48, maxWidth: 400, lineHeight: 1.7 }}>
          Controlá todos tus clientes, automatizaciones e integraciones desde un solo panel. Sin abrir n8n, Chatwoot ni Airtable por separado.
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: 'rgba(35,131,226,0.1)', border: '1px solid rgba(35,131,226,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 17, height: 17, color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Herramientas integradas
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['WhatsApp Business', 'n8n', 'Chatwoot', 'OpenAI', 'Airtable', 'Slack'].map(tool => (
              <span key={tool} style={{
                fontSize: 11, color: 'var(--text-3)',
                border: '1px solid var(--border)', borderRadius: 20,
                padding: '3px 10px', background: 'var(--surface-2)',
              }}>
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — auth forms */}
      <div style={{
        width: 440, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 40px',
        flexShrink: 0,
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
              Accedé a tu panel
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
              Ingresá con tus credenciales de administrador.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
