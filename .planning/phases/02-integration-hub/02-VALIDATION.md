---
phase: 2
slug: integration-hub
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-01
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no jest, vitest, or pytest detected in project |
| **Config file** | none |
| **Quick run command** | `npm run build` (type check + compile) |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (catches type errors from ToolName union changes)
- **After every plan wave:** Run `npm run build && npm run lint` + manual browser check
- **Before `/gsd-verify-work`:** Build must be green + manual 5-step protocol passed
- **Max feedback latency:** ~15 seconds (build) + ~2 minutes (manual check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | INTG-01 | — | Credentials stay server-side | manual | `npm run build` | ✅ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | INTG-02 | T-2-01 | `tool` param validated against allowlist | manual | `npm run build` | ✅ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | INTG-03 | T-2-02 | Metric responses never echo credentials | manual | `npm run build` | ✅ W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | INTG-04 | — | N/A | manual | `npm run build` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No new test infrastructure required — project has no existing test framework and Phase 2 does not mandate adding one. TypeScript strict mode + build output covers compile-time correctness.

*Existing infrastructure covers all phase requirements via build + manual verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 6 integration cards render including Chatwoot | INTG-01 | No test infra | Open /configuracion — verify Chatwoot card present alongside n8n, Airtable, GHL, OpenAI, Slack |
| Skeleton shimmer visible then metrics appear | INTG-03 | Visual state machine | Hard-reload page, watch cards — skeleton shimmer then metric text appears |
| Test button updates StatusDot to amber then result | INTG-02 | Async UI state | Click "Testear" on any card — dot goes amber, then green/red with label |
| Automation catalog accordion — single open | INTG-04 | Interaction state | Click item A → expands. Click item B → A collapses, B expands. Click B again → collapses |
| Checklist item toggle | INTG-04 | Local UI state | Click checkbox → fills accent, label gets strikethrough |
| Unconfigured tool shows "No configurado" | INTG-01 | Env-dependent state | Remove a credential key from server config, restart dev server — card shows "No configurado" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
