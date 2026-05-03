---
phase: 01-foundation
plan: "01"
subsystem: foundation
tags: [auth, design-tokens, css, next-auth, inter-font]
dependency_graph:
  requires: []
  provides:
    - next-auth v5 config (auth.ts)
    - route protection proxy (proxy.ts)
    - NextAuth GET/POST handler
    - Notion-style CSS design tokens
    - Inter font loaded via next/font/google
  affects:
    - all pages (CSS tokens change)
    - all routes (proxy.ts route protection)
tech_stack:
  added:
    - next-auth@5.0.0-beta.31
    - bcryptjs@3.0.3
    - lucide-react@1.11.0
    - "@types/bcryptjs@2.4.6"
  patterns:
    - NextAuth Credentials provider with bcrypt password verification
    - Next.js 16 proxy.ts convention (renamed from middleware.ts)
    - CSS custom properties as design tokens with legacy aliases
    - Inter font via next/font/google with CSS variable injection
key_files:
  created:
    - apps/dashboard/auth.ts
    - apps/dashboard/proxy.ts
    - apps/dashboard/app/api/auth/[...nextauth]/route.ts
  modified:
    - apps/dashboard/app/globals.css
    - apps/dashboard/app/layout.tsx
    - apps/dashboard/package.json
    - apps/dashboard/package-lock.json
decisions:
  - key: legacy-css-aliases
    choice: Add --s1, --txt, --green etc. as aliases to new tokens
    rationale: Existing pages use old token names; aliases prevent breakage until pages are migrated in plan 01-03
  - key: proxy-convention
    choice: Use proxy.ts (not middleware.ts)
    rationale: Next.js 16 renamed middleware to proxy; confirmed by node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
  - key: inter-weight-500
    choice: Include weight 500 in Inter font load
    rationale: Plan prompt specified ['400', '500', '600']; the PLAN.md showed ['400', '600'] — used the more complete set from the task prompt
metrics:
  duration: "~12 minutes"
  completed: "2026-04-26"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 4
---

# Phase 01 Plan 01: Foundation Dependencies and Design Tokens Summary

**One-liner:** Installed next-auth@beta with bcrypt Credentials provider, created Next.js 16 proxy.ts route guard, replaced dark CSS tokens with Notion-style light palette (#FFFFFF base, #2383E2 accent), and loaded Inter font via next/font/google.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install auth deps + create stubs | 947387d | auth.ts, proxy.ts, app/api/auth/[...nextauth]/route.ts |
| 2 | Replace globals.css + update layout.tsx | 6c5bfa3 | app/globals.css, app/layout.tsx |

## Artifacts Created

### apps/dashboard/auth.ts
NextAuth v5 configuration with Credentials provider. Reads ADMIN_EMAIL and ADMIN_PASSWORD_HASH from environment variables. Uses bcryptjs.compare() for time-constant password comparison (mitigates T-01-01 timing attack).

### apps/dashboard/proxy.ts
Next.js 16 route protection (renamed from middleware.ts per v16 breaking change). Wraps auth() handler: redirects unauthenticated users to /login, redirects logged-in users away from /login. Matcher excludes _next/static, _next/image, favicon.ico, and api/auth.

### apps/dashboard/app/api/auth/[...nextauth]/route.ts
Minimal route handler exporting GET and POST from NextAuth handlers.

### apps/dashboard/app/globals.css
Full replacement with Notion-style light palette:
- Surfaces: --bg #FFFFFF, --surface-1 #F7F7F5, --surface-2 #EFEFED
- Accent: --accent #2383E2 (Notion blue)
- Text hierarchy: --text-1 #1A1A1A, --text-2 #6B6B6B, --text-3 #ABABAB
- Semantic tokens: --critical, --warning, --opportunity with -bg and -border variants
- Legacy aliases: --s1, --s2, --s3, --txt, --txt2, --txt3, --green, --red, --amber mapped to new tokens
- Removed: .hover-row, .hover-row2, .hover-border, .nav-item classes

### apps/dashboard/app/layout.tsx
Updated with Inter font loaded via next/font/google (weights 400, 500, 600), injected as --font-inter CSS variable. Applied to `<html>` via inter.variable class. Main content area updated to marginLeft 240px and padding 32px 40px.

## Build Status

`next build` exits 0 with 13 static pages generated and proxy (middleware) registered. No TypeScript errors.

## Deviations from Plan

### Auto-fixed Issues

None.

### Minor Adjustments

**1. Inter font weights — plan inconsistency**
- **Found during:** Task 2
- **Issue:** The PLAN.md task action shows `weight: ['400', '600']` but the task prompt (task_2 in execution context) specifies `weight: ['400', '500', '600']`
- **Fix:** Used `['400', '500', '600']` — the more complete set, compatible with Notion-style design that uses medium weight text
- **Files modified:** apps/dashboard/app/layout.tsx

**2. Dashboard is a nested git repository**
- **Found during:** Task 1 commit
- **Issue:** apps/dashboard/ contains its own .git directory — the parent repo treats the entire directory as an untracked nested repo, not individual files
- **Fix:** Committed all task-related files to the dashboard's own git repo (`git -C apps/dashboard`)
- **Impact:** SUMMARY.md and STATE.md updates must go to the parent repo; code commits go to the dashboard repo

## Threat Model Coverage

All T-01-xx threats from the plan are addressed:
- T-01-01: bcryptjs.compare() used (time-constant)
- T-01-02: Credentials only in process.env, never in code
- T-01-03: proxy.ts matcher covers all routes except static assets and auth API
- T-01-04: next-auth v5 handles HttpOnly+Secure+SameSite JWT cookies by default
- T-01-05: CSS tokens accepted as public — no secrets

## Known Stubs

None — all files created are functional implementations, not placeholders. Auth will be incomplete at runtime until ADMIN_EMAIL and ADMIN_PASSWORD_HASH environment variables are set, but this is a runtime configuration requirement, not a stub.

## Threat Flags

None — no new network surface beyond what the plan describes.

## Self-Check

- [x] apps/dashboard/auth.ts exists: FOUND
- [x] apps/dashboard/proxy.ts exists (not middleware.ts): FOUND
- [x] apps/dashboard/app/api/auth/[...nextauth]/route.ts exists: FOUND
- [x] globals.css contains --bg: #FFFFFF: FOUND
- [x] globals.css contains legacy aliases (--s1): FOUND
- [x] layout.tsx contains inter.variable: FOUND
- [x] Task 1 commit 947387d exists in dashboard repo: FOUND
- [x] Task 2 commit 6c5bfa3 exists in dashboard repo: FOUND
- [x] next build exits 0: CONFIRMED

## Self-Check: PASSED
