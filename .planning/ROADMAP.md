# Roadmap: Agency Automation Intelligence SaaS

## Overview

This platform is a **segundo cerebro / organizador central** for the agency. It does NOT replace any tool. n8n keeps running automations, Chatwoot keeps handling conversations, Airtable keeps storing records, OpenAI keeps processing tokens, Slack keeps delivering messages. Each tool does its work inside its own system. This platform is the organizing layer that indexes all of them and shows the entire automation ecosystem from one place.

The admin opens this platform and sees everything that is happening across all tools and all clients — without switching tabs. The Integration Hub is the first expression of that mission: a live view of every connected tool and its status. The Global Dashboard is the daily command view: what needs attention, what is working, what opportunities exist. Tasks, clients, health scores, alerts, recommendations, and reports are all organized from this single place.

The seven phases move from shell to functional: visual foundation and auth first, then the Integration Hub as a standalone first-class feature, then live data replacing static seeds, then the full daily-use "segundo cerebro" experience (global ecosystem view, clients, tasks), then per-client monitoring depth, then intelligence and reporting, and finally the guided onboarding workflow.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Design system, auth, and config — the visual and access layer every other phase depends on *(completed 2026-04-30)*
- [x] **Phase 2: Integration Hub** - First-class, standalone hub connecting every tool with live status, metrics, and management — the central concept of the organizer *(completed 2026-05-01)*
- [ ] **Phase 3: Data Layer** - Replace all static seed data with live reads from Airtable, n8n, Chatwoot, and OpenAI
- [ ] **Phase 4: Global View + Clients + Tasks** - The daily "segundo cerebro" experience: ecosystem command view, full client roster, and task management linked to clients and automations
- [ ] **Phase 5: Client Hub + Health Score + Alerts** - Per-client monitoring depth: live workflow status, calculated health scores, and the full alert system with Slack delivery
- [ ] **Phase 6: Intelligence + Metrics + Reports** - Operational recommendations, upsell detection, performance metrics, and automated n8n reports
- [ ] **Phase 7: Client Onboarding** - Guided 10-step checklist to activate a new client end-to-end from the platform

## Phase Details

### Phase 1: Foundation
**Goal**: Admin can access a visually complete, Notion-style app with secure login and configured external connections
**Depends on**: Nothing (builds on existing app shell)
**Requirements**: DSYS-01, DSYS-02, DSYS-03, DSYS-04, AUTH-01, AUTH-02, AUTH-03, CONF-01, CONF-02
**Success Criteria** (what must be TRUE):
  1. Admin opens the app and sees a clean, Notion-style UI with neutral palette, Inter typography, and generous whitespace — the previous dark-heavy theme is gone
  2. Admin can collapse and expand the sidebar; it shows section hierarchy, icons, and clear active state
  3. Badge, Card, StatBlock, AlertRow, HealthBadge, and MetricRow components render correctly across all page shells
  4. Table/database views render with working column filters and visual grouping
  5. Admin can log in with email/password, session persists across browser refreshes, and logout is accessible from any screen
  6. Admin reaches the Settings screen, enters URLs and API keys for n8n, Chatwoot, OpenAI, Airtable, and Slack, saves them, and the platform shows a live status for each connection
**Plans**: TBD
**UI hint**: yes

### Phase 2: Integration Hub
**Goal**: Connect each tool, see its live status, access it directly — the first expression of the platform's core mission as organizer. This is a standalone, first-class feature: the admin has a dedicated hub where every external tool is visible, testable, and manageable from one screen.
**Depends on**: Phase 1
**Requirements**: INTG-01, INTG-02, INTG-03, INTG-04
**Success Criteria** (what must be TRUE):
  1. Admin opens the Integration Hub and sees every connected tool (Chatwoot, n8n, Slack, Airtable, OpenAI) with a live visual indicator: connected (green), error (red), or disconnected (gray)
  2. Admin clicks "Test" on any individual integration and receives an immediate pass/fail result for that connection in real time
  3. Admin sees live metrics per integration on the hub screen: active conversations in Chatwoot, active workflows in n8n, tokens consumed in OpenAI, record count in Airtable
  4. Admin can add a new integration, edit an existing one (URL, API key, display name), or remove one — all from the hub without going to Settings
  5. Navigating from the Integration Hub to any tool (e.g., clicking the n8n card) opens that tool directly in a new tab using the configured URL
**Plans**: 2 plans
Plans:
- [x] 02-01-PLAN.md — Config + API route extension + Automation Catalog data module
- [x] 02-02-PLAN.md — /configuracion page UI extension: Chatwoot card, metric lines, skeleton loading, catalog accordion
**UI hint**: yes

### Phase 3: Data Layer
**Goal**: The platform reads live data from all external sources — static seed data is fully replaced and every screen reflects the actual state of the agency
**Depends on**: Phase 2
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. Client profiles shown across the app come from Airtable — the static seed data in lib/data.ts is no longer the source of truth for any screen
  2. Workflow and execution data for each client is fetched from the n8n API; changing a workflow status in n8n is reflected in the platform on next load
  3. Conversation metrics per client (WhatsApp, Instagram, Webchat, Facebook) are fetched from the Chatwoot API
  4. Token usage and estimated cost are read from the OpenAI API and appear on any screen that shows OpenAI data
  5. Alerts, recommendations, and Health Scores are persisted to Airtable by n8n and read from Airtable by the frontend — there is no hardcoded alert or score anywhere in the codebase
**Plans**: TBD

### Phase 4: Global View + Clients + Tasks
**Goal**: The daily "segundo cerebro" experience — the ecosystem command view shows everything running across all tools and clients from one screen; the client roster is fully operational with CRUD; tasks can be created, linked to clients and automations, and managed globally
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, CLIE-01, CLIE-02, CLIE-03, CLIE-04, CLIE-05, TASK-01, TASK-02, TASK-03, TASK-04, TASK-05
**Success Criteria** (what must be TRUE):
  1. Admin opens the Global Dashboard and sees — on one screen without scrolling — clients at risk, active critical alerts, detected upsell opportunities, and agency-wide KPIs drawn from live data across all integrated tools; this is the ecosystem command view
  2. Clicking a client on the dashboard navigates to that client's hub; clicking an alert shows the exact resource that generated it (deep link to n8n workflow or Chatwoot conversation)
  3. Quick-access shortcuts to n8n, Chatwoot, Airtable, OpenAI, and Slack are visible and clickable from the header or sidebar on every screen
  4. Admin can filter the client list by niche, plan, health status, and active opportunities; group by niche, plan, or health status; and each client row shows operational tags (active automations, enabled channels, Estable/En riesgo/Crítico)
  5. Admin can create a client with all profile fields and edit an existing client; changes persist to Airtable
  6. Admin can create a task linked to a client or directly to an automation (e.g., "follow up on workflow X for client Y"), convert an alert or recommendation into a task with one click (context and linked automation inherited automatically), view all tasks in a global filtered view and per-client, and mark tasks as completed / in progress / postponed
**Plans**: TBD
**UI hint**: yes

### Phase 5: Client Hub + Health Score + Alerts
**Goal**: Each client has a full monitoring hub showing live workflow status, a calculated health score with drill-down, and the complete alerts system with Slack delivery
**Depends on**: Phase 4
**Requirements**: MNTR-01, MNTR-02, MNTR-03, MNTR-04, HLTH-01, HLTH-02, HLTH-03, ALRT-01, ALRT-02, ALRT-03, ALRT-04, ALRT-05
**Success Criteria** (what must be TRUE):
  1. Admin opens a client's hub and sees active/inactive workflows, the current Health Score, active alerts, and pending recommendations — all live from Airtable and n8n
  2. Admin clicks a workflow in the client hub and opens that exact workflow in n8n using its workflowId deep link; channel metrics (WhatsApp, Instagram, Webchat, Facebook) show conversion rate, response time, and lead quality
  3. Admin sees the client's upgrade panel: active automations, automations available under the current plan, and recommended ones with an activation CTA
  4. Every client displays a Health Score 0–100 with a detail breakdown — which of the 4 factors (workflow stability, resource availability, conversion performance, automation coverage) is dragging the score, how much each weighs, and what action would improve it; the score updates automatically as n8n recalculates and writes to Airtable
  5. Alerts are visually classified as Critical (red) / Warning (yellow) / Opportunity (green); the global alerts panel is filterable by severity, client, and date; admin can mark any alert as resolved or postponed
  6. Critical and warning alerts are automatically sent to Slack via webhook; each alert includes a deep link to the exact workflow in n8n or conversation in Chatwoot that triggered it
**Plans**: TBD
**UI hint**: yes

### Phase 6: Intelligence + Metrics + Reports
**Goal**: The platform surfaces actionable recommendations and upsell opportunities per client, shows granular performance metrics, and n8n delivers automated monthly and digest reports
**Depends on**: Phase 5
**Requirements**: INTL-01, INTL-02, INTL-03, INTL-04, METR-01, METR-02, METR-03, RPRT-01, RPRT-02, RPRT-03
**Success Criteria** (what must be TRUE):
  1. Each client displays operational recommendations (slow workflows, low-performing channels, missing basic flows) and growth opportunities (leads without follow-up, missing post-sale flows) — generated by the n8n rules engine, not hardcoded
  2. Upsell opportunities appear per client based on current plan, niche, and actual usage; niches Dental, Gym, Clínica Estética, and Inmobiliaria each have at least one specific recommendation template rendered
  3. Each client shows per-metric data: conversations handled, leads followed up, average response time, and estimated hours saved (calculated as conversations × configurable average time per niche)
  4. Admin sees a channel-by-channel performance comparison for each client identifying which channel to optimize first
  5. n8n sends a monthly HTML performance report to the admin email, a monthly executive report suitable for account meetings, and a daily or weekly Slack digest of opportunities and alerts — all triggered and formatted by n8n, displayed as received in the platform
**Plans**: TBD

### Phase 7: Client Onboarding
**Goal**: Admin can activate a new client end-to-end through a guided 10-step checklist in the UI that verifies live connections before completion
**Depends on**: Phase 6
**Requirements**: ONBR-01, ONBR-02
**Success Criteria** (what must be TRUE):
  1. Admin opens the onboarding flow for a new client and works through 10 clearly labeled steps: client profile, n8n setup, Chatwoot setup, OpenAI setup, alert thresholds, alert configuration, email setup, Health Score initialization, automation catalog assignment, and final review
  2. During the checklist, the platform pings the client's n8n and Chatwoot connections in real time and shows pass/fail — admin cannot mark those steps complete with a failing connection
  3. Completing the checklist results in a fully configured client entry in Airtable, visible in the clients list with correct profile, tags, and initial Health Score
  4. Admin can return to a partially completed onboarding checklist and resume from the last completed step
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete | 2026-04-30 |
| 2. Integration Hub | 2/2 | Complete | 2026-05-01 |
| 3. Data Layer | 0/TBD | Not started | - |
| 4. Global View + Clients + Tasks | 0/TBD | Not started | - |
| 5. Client Hub + Health Score + Alerts | 0/TBD | Not started | - |
| 6. Intelligence + Metrics + Reports | 0/TBD | Not started | - |
| 7. Client Onboarding | 0/TBD | Not started | - |
