export interface ConnectionConfig {
  n8n:      { url: string; apiKey: string }
  airtable: { apiKey: string; baseId: string }
  ghl:      { apiKey: string }
  openai:   { apiKey: string; adminKey: string }
  slack:    { webhookUrl: string }
  chatwoot: { apiUrl: string; apiToken: string; accountId: string }
}

export type ToolName = 'n8n' | 'airtable' | 'ghl' | 'openai' | 'slack' | 'chatwoot'

export function getConfig(): ConnectionConfig {
  return {
    n8n: {
      url:    process.env.N8N_API_URL ?? '',
      apiKey: process.env.N8N_API_KEY ?? '',
    },
    airtable: {
      apiKey: process.env.AIRTABLE_API_KEY ?? '',
      baseId: process.env.AIRTABLE_BASE_ID ?? '',
    },
    ghl: {
      apiKey: process.env.GHL_API_KEY ?? '',
    },
    openai: {
      apiKey:   process.env.OPENAI_KEY       ?? '',
      adminKey: process.env.OPENAI_ADMIN_KEY ?? '',
    },
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL ?? '',
    },
    chatwoot: {
      apiUrl:    process.env.CHATWOOT_API_URL    ?? '',
      apiToken:  process.env.CHATWOOT_API_TOKEN  ?? '',
      accountId: process.env.CHATWOOT_ACCOUNT_ID ?? '',
    },
  }
}
