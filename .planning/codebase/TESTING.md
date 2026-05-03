# Testing

**Analysis Date:** 2026-04-25

## Summary

**No test infrastructure exists.** Zero test runner, zero test files, zero assertions. TypeScript strict mode and ESLint are the only automated quality gates.

## Current State

**Test Runner:** None
**Assertion Library:** None
**E2E Framework:** None
**Test Files:** 0

```json
// package.json — no test script
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
    // no "test" script
  }
}
```

## Quality Gates (existing)

| Gate | Tool | Coverage |
|------|------|----------|
| Type checking | TypeScript 5 (strict) | Compile-time type safety |
| Linting | ESLint 9 flat config + `eslint-config-next` | Code style, Next.js rules |
| Build verification | `next build` | Catches type errors and import issues |

## Test Gaps

- No unit tests for `lib/data.ts` helper functions (25+ pure functions — ideal test targets)
- No component tests for `Sidebar.tsx` or `TareasCliente.tsx`
- No integration tests for page routes
- No E2E tests for user flows
- `localStorage` persistence in `TareasCliente` has no coverage
- Utility functions like `getHealthColor()`, `calcularMetricas()` untested

## Recommended Stack (when tests are added)

**Unit / Component tests:**
- Framework: **Vitest** — native ESM, fast, compatible with Next.js App Router
- Component testing: **@testing-library/react** + `@vitejs/plugin-react`
- Config: `vitest.config.ts` at `agency-dashboard/` root

**E2E tests:**
- Framework: **Playwright** — first-class Next.js support
- Config: `playwright.config.ts` at `agency-dashboard/` root

**Recommended directory structure (when created):**
```
agency-dashboard/
├── __tests__/             # Unit tests
│   ├── lib/
│   │   └── data.test.ts   # Helper function tests (highest value first)
│   └── components/
│       └── Sidebar.test.tsx
└── e2e/                   # Playwright E2E tests
    ├── dashboard.spec.ts
    └── clientes.spec.ts
```

## Highest-Value First Tests

Priority order for first test additions:

1. **`lib/data.ts` helper functions** — all pure functions, no side effects, easy to unit test
   - `getHealthColor(score)` — returns CSS class string
   - `getEstadoLabel(estado)` — maps enum to display string
   - `calcularMetricas(cliente)` — computes derived metrics
   - `getAlertasCriticas()` — filters across clients
   - `getClientesEnRiesgo()` — filters by health score

2. **`TareasCliente.tsx` task state** — localStorage read/write, task toggle, task creation

3. **Client detail page** — `notFound()` behavior for invalid IDs

---

*Testing analysis: 2026-04-25*
*Update when test infrastructure is added*
