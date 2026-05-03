# External Integrations

**Analysis Date:** 2026-04-25

## Overview

This is a read-only agency intelligence dashboard. All data is currently hardcoded in `agency-dashboard/lib/data.ts` (static TypeScript). There are no live API calls from the Next.js app itself — the app links out to external services but does not integrate programmatically with their APIs yet.

---

## Services Monitored / Linked

### n8n (Workflow Automation)
- **What it is:** Self-hosted workflow automation server
- **Role in system:** Runs all client automation workflows (AI chatbots, scheduling, sync jobs)
- **Self-hosted URL:** `http://129.121.56.240` (hardcoded in `agency-dashboard/lib/data.ts` line 70 as `const N8N`)
- **Current integration:** Dashboard displays workflow status (uptime, executions, errors) from static data in `lib/data.ts`
- **Direct links:** Each workflow card links to `${N8N}/workflow/${workflowId}` (opens n8n UI in new tab)
- **Future:** Will require n8n REST API integration to pull live workflow status
- **Config source:** `agency-dashboard/app/herramientas/n8n/page.tsx`

### GoHighLevel (CRM / Marketing Platform)
- **What it is:** All-in-one CRM, marketing automation, and messaging platform
- **Role in system:** Manages leads, conversations, and channels (WhatsApp, Instagram, Webchat, Facebook) for each client
- **External URL:** `https://app.gohighlevel.com` (per-client `ghlUrl` field in `lib/data.ts`)
- **Channels managed:** WhatsApp, Instagram, Webchat, Facebook
- **Current integration:** Dashboard shows channel conversion stats and links to GHL per client (static data)
- **Direct links:** "Abrir GHL →" button per client; individual client GHL links via `c.ghlUrl`
- **Config source:** `agency-dashboard/app/herramientas/ghl/page.tsx`, `agency-dashboard/lib/data.ts`

### OpenAI (AI Models)
- **What it is:** API provider for GPT-4o-mini and Whisper models
- **Role in system:** Powers AI chatbot fallback and audio transcription in client automation workflows
- **External URL:** `https://platform.openai.com/usage`
- **Models used (per `app/herramientas/openai/page.tsx`):**
  - `GPT-4o-mini` — Fallback if Gemini fails
  - `OpenAI Whisper` — Audio transcription
- **Current integration:** Token usage and cost displayed as static data
- **Future:** Requires OpenAI Usage API integration for live token/cost data
- **Config source:** `agency-dashboard/app/herramientas/openai/page.tsx`

### Google Gemini (AI Models)
- **What it is:** Google's generative AI API
- **Role in system:** Primary AI model for client chatbots (main conversation, vision)
- **External URL:** `https://aistudio.google.com`
- **Models used (per `app/herramientas/openai/page.tsx`):**
  - `Gemini 1.5 Flash` — Main conversation bot ("Vicky" for DC Gym)
  - `Gemini Flash Vision` — Image description
- **Current integration:** Usage tracked as static data alongside OpenAI
- **Config source:** `agency-dashboard/app/herramientas/openai/page.tsx`

### Anthropic Claude (AI Models)
- **What it is:** Anthropic's Claude AI API
- **Role in system:** Date parsing in client workflows
- **Models used:**
  - `Claude Haiku` — Natural language date parsing
- **Current integration:** Token usage tracked as static data
- **Config source:** `agency-dashboard/app/herramientas/openai/page.tsx`

### Airtable
- **What it is:** Cloud-based database/spreadsheet platform
- **Role in system:** Data sync target for client CRM data
- **External URL:** `https://airtable.com`
- **Current integration:** Referenced as a quick-access external link; `Airtable Sync` workflow exists for DC Gym (workflow ID `7cwl6PLmIBOC960K`)
- **Config source:** `agency-dashboard/app/herramientas/page.tsx`, `agency-dashboard/lib/data.ts`

---

## Data Storage

**Databases:**
- None currently — all data is static TypeScript in `agency-dashboard/lib/data.ts`
- No ORM, no database client, no connection strings in the Next.js app itself

**File Storage:**
- Local filesystem only (public assets in `agency-dashboard/public/`)

**Caching:**
- None (Next.js default caching only)

---

## Authentication & Identity

**Auth Provider:**
- None implemented — dashboard is currently unauthenticated (no login, no session management)
- `.env.local` exists and may contain keys for future auth setup

---

## Messaging Channels (Client-Facing)

These channels are used by the client automation system (n8n workflows + GHL), not by the Next.js dashboard directly:

- **WhatsApp** — Primary conversation channel for most clients
- **Instagram** — Secondary channel
- **Webchat** — Available on Growth plan (noted as upsell opportunity for DC Gym)
- **Facebook** — Supported, not active for current client

---

## Monitoring & Observability

**Error Tracking:**
- None implemented in the Next.js app

**Logs:**
- None configured — console only

---

## CI/CD & Deployment

**Hosting:**
- Vercel (implied by `.vercel` in `.gitignore`)

**CI Pipeline:**
- None configured

---

## Environment Configuration

**`.env.local` file present** (contents not read — gitignored per `.gitignore`)
- Likely contains API keys for future live integrations (n8n API, GHL API, OpenAI API, Gemini API)

**Required env vars (anticipated for live integration):**
- n8n API credentials (for live workflow status)
- GHL API key (for live CRM data)
- OpenAI API key (for live token usage)
- Google AI API key (for Gemini usage data)

---

## Webhooks & Callbacks

**Incoming:**
- None in the Next.js app currently

**Outgoing:**
- None in the Next.js app currently (n8n handles all outgoing webhooks on the automation server)

---

*Integration audit: 2026-04-25*
