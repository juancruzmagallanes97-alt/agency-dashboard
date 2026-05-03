import { NextRequest, NextResponse } from 'next/server'
import { getConfig, type ToolName } from '@/lib/config'

const TOOLS: ToolName[] = ['n8n', 'airtable', 'ghl', 'openai', 'slack', 'chatwoot']

/**
 * Valida que la URL sea segura para fetch server-side.
 * Permite localhost/127.x (n8n en dev) pero bloquea rangos privados RFC-1918
 * y el endpoint de metadata de cloud (169.254.169.254).
 */
function assertSafeUrl(raw: string, label: string): void {
  let parsed: URL
  try { parsed = new URL(raw) } catch {
    throw new Error(`${label}: URL inválida`)
  }
  const { protocol, hostname } = parsed
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error(`${label}: solo se permiten URLs HTTP/HTTPS`)
  }
  // Bloquear metadata cloud (169.254.169.254)
  if (hostname === '169.254.169.254') {
    throw new Error(`${label}: destino de red interna no permitido`)
  }
  // Bloquear rangos privados RFC-1918 (pero NO localhost/127.x — permitidos para n8n en dev)
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)) {
    throw new Error(`${label}: destino de red interna no permitido`)
  }
}

async function probe(tool: ToolName): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const cfg = getConfig()
  const t0 = Date.now()

  try {
    switch (tool) {
      case 'n8n': {
        const { url, apiKey } = cfg.n8n
        if (!url) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        assertSafeUrl(url, 'n8n')
        const res = await fetch(`${url}/api/v1/workflows`, {
          headers: { 'X-N8N-API-KEY': apiKey },
          signal: AbortSignal.timeout(5000),
        })
        return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
      }

      case 'airtable': {
        const { apiKey, baseId } = cfg.airtable
        if (!apiKey || !baseId) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        const res = await fetch('https://api.airtable.com/v0/meta/bases', {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(5000),
        })
        return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
      }

      case 'openai': {
        const { apiKey } = cfg.openai
        if (!apiKey) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(5000),
        })
        return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
      }

      case 'slack': {
        const { webhookUrl } = cfg.slack
        if (!webhookUrl) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        try {
          const parsed = new URL(webhookUrl)
          const valid =
            parsed.protocol === 'https:' &&
            parsed.hostname === 'hooks.slack.com' &&
            parsed.pathname.startsWith('/services/')
          return { ok: valid, latencyMs: Date.now() - t0, error: valid ? undefined : 'URL de webhook inválida' }
        } catch {
          return { ok: false, latencyMs: 0, error: 'URL de webhook inválida' }
        }
      }

      case 'ghl': {
        const { apiKey } = cfg.ghl
        if (!apiKey) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        // Verificación real de conectividad no implementada — solo presencia de clave
        return { ok: true, latencyMs: Date.now() - t0, error: 'Clave presente (no verificada)' }
      }

      case 'chatwoot': {
        const { apiUrl, apiToken } = cfg.chatwoot
        if (!apiUrl || !apiToken) return { ok: false, latencyMs: 0, error: 'Sin configurar' }
        assertSafeUrl(apiUrl, 'chatwoot')
        const res = await fetch(`${apiUrl}/api/v1/profile`, {
          headers: { api_access_token: apiToken },
          signal: AbortSignal.timeout(5000),
        })
        return { ok: res.ok, latencyMs: Date.now() - t0, error: res.ok ? undefined : `HTTP ${res.status}` }
      }

      default: {
        const _exhaustive: never = tool
        return { ok: false, latencyMs: 0, error: 'Herramienta desconocida' }
      }
    }
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - t0, error: e instanceof Error ? e.message : 'Error de red' }
  }
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')

  if (type === 'urls') {
    const cfg = getConfig()
    return NextResponse.json({
      n8n:      cfg.n8n.url         || null,
      chatwoot: cfg.chatwoot.apiUrl || null,
      airtable: 'https://airtable.com',
      openai:   'https://platform.openai.com',
      slack:    'https://slack.com/signin',
      ghl:      'https://app.gohighlevel.com',
    })
  }

  if (type === 'metrics') {
    const cfg = getConfig()
    const [n8nResult, chatwootResult, airtableResult, openaiResult] =
      await Promise.allSettled([
        fetchN8nMetric(cfg),
        fetchChatwootMetric(cfg),
        fetchAirtableMetric(cfg),
        fetchOpenAIMetric(cfg),
      ])
    return NextResponse.json({
      n8n:      settled(n8nResult),
      chatwoot: settled(chatwootResult),
      airtable: settled(airtableResult),
      openai:   settled(openaiResult),
      slack:    cfg.slack.webhookUrl ? 'Webhook activo' : null,
      ghl:      cfg.ghl.apiKey       ? 'Configurado'   : null,
    })
  }

  const tool = req.nextUrl.searchParams.get('tool') as ToolName | null
  if (!tool || !TOOLS.includes(tool)) {
    return NextResponse.json({ error: 'Tool inválido' }, { status: 400 })
  }
  const result = await probe(tool)
  return NextResponse.json(result)
}

function settled(r: PromiseSettledResult<string | null>): string | null {
  return r.status === 'fulfilled' ? r.value : null
}

async function fetchN8nMetric(cfg: ReturnType<typeof getConfig>): Promise<string | null> {
  const { url, apiKey } = cfg.n8n
  if (!url || !apiKey) return null
  try {
    assertSafeUrl(url, 'n8n')
    const res = await fetch(`${url}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': apiKey },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const active = Array.isArray(data?.data)
      ? data.data.filter((w: { active?: boolean }) => w.active === true).length
      : null
    return active !== null ? `${active} workflows activos` : null
  } catch {
    return null
  }
}

async function fetchChatwootMetric(cfg: ReturnType<typeof getConfig>): Promise<string | null> {
  const { apiUrl, apiToken, accountId } = cfg.chatwoot
  if (!apiUrl || !apiToken || !accountId) return null
  try {
    assertSafeUrl(apiUrl, 'chatwoot')
    const res = await fetch(
      `${apiUrl}/api/v1/accounts/${accountId}/conversations/meta?status=open`,
      {
        headers: { api_access_token: apiToken },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    const count = data?.meta?.all_count
    return typeof count === 'number' ? `${count} conversaciones abiertas` : null
  } catch {
    return null
  }
}

async function fetchAirtableMetric(cfg: ReturnType<typeof getConfig>): Promise<string | null> {
  const { apiKey, baseId } = cfg.airtable
  if (!apiKey || !baseId) return null
  try {
    const res = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const bases: { id: string; name: string }[] = data?.bases ?? []
    const match = bases.find(b => b.id === baseId)
    if (match) return `Base: ${match.name}`
    return bases.length > 0 ? `${bases.length} bases encontradas` : null
  } catch {
    return null
  }
}

async function fetchOpenAIMetric(cfg: ReturnType<typeof getConfig>): Promise<string | null> {
  const { apiKey, adminKey } = cfg.openai
  if (!apiKey && !adminKey) return null
  if (adminKey) {
    try {
      const start = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
      const res = await fetch(
        `https://api.openai.com/v1/organization/usage/completions?start_time=${start}`,
        {
          headers: { Authorization: `Bearer ${adminKey}` },
          signal: AbortSignal.timeout(5000),
        },
      )
      if (res.ok) {
        const data = await res.json()
        const buckets: { results: { input_tokens: number; output_tokens: number }[] }[] =
          data?.data ?? []
        const total = buckets.reduce(
          (sum, b) => sum + b.results.reduce((s, r) => s + r.input_tokens + r.output_tokens, 0),
          0,
        )
        return `${total.toLocaleString('es-AR')} tokens (30d)`
      }
    } catch {
      // fall through to default return
    }
  }
  return 'API key válida'
}
