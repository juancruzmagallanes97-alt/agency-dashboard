# Technology Stack

**Analysis Date:** 2026-04-25

## Languages

**Primary:**
- TypeScript 5.x - All application code (`.ts`, `.tsx` files)

**Secondary:**
- CSS (custom properties via `app/globals.css`) - Design tokens and global styles

## Runtime

**Environment:**
- Node.js (current LTS implied by `@types/node ^20`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.4 - Full-stack React framework (App Router)
  - NOTE: This is a non-standard/future version with breaking changes vs training data. Per `agency-dashboard/AGENTS.md`: "Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."
- React 19.2.4 - UI rendering
- React DOM 19.2.4 - DOM rendering

**CSS/Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework (PostCSS plugin approach, `@import "tailwindcss"` syntax)
- `@tailwindcss/postcss ^4` - PostCSS integration for Tailwind v4
- Custom CSS variables for all design tokens (defined in `app/globals.css`)

**Build/Dev:**
- Next.js dev server (`next dev`) - Development
- Next.js build (`next build`) - Production build
- ESLint 9 - Linting with `eslint-config-next` core-web-vitals + typescript presets

## Key Dependencies

**Critical:**
- `next` 16.2.4 - Framework with App Router, file-based routing, Server Components
- `react` / `react-dom` 19.2.4 - Component model
- `tailwindcss ^4` - Styling system

**Development Only:**
- `typescript ^5` - Type checking
- `eslint ^9` + `eslint-config-next 16.2.4` - Code quality
- `@types/node ^20`, `@types/react ^19`, `@types/react-dom ^19` - Type definitions

## Configuration

**TypeScript (`agency-dashboard/tsconfig.json`):**
- Target: `ES2017`
- Strict mode enabled
- Module resolution: `bundler`
- Path alias: `@/*` maps to project root
- Next.js TypeScript plugin active

**ESLint (`agency-dashboard/eslint.config.mjs`):**
- Uses flat config format (`defineConfig`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

**PostCSS (`agency-dashboard/postcss.config.mjs`):**
- Single plugin: `@tailwindcss/postcss`

**Next.js (`agency-dashboard/next.config.ts`):**
- Minimal config — no custom settings active

**Environment:**
- `.env.local` file exists (contents not read — gitignored)
- All `.env*` files are gitignored

## Design Tokens

Defined as CSS custom properties in `agency-dashboard/app/globals.css`:
- `--bg` `--s1` `--s2` `--s3` — Dark background layers
- `--border` `--border2` — Border colors
- `--txt` `--txt2` `--txt3` — Text hierarchy
- `--accent` (`#E8642A`) — Orange brand accent
- Color palette: `--green`, `--red`, `--amber` referenced in component code

## Platform Requirements

**Development:**
- Node.js ^20
- npm

**Production:**
- Vercel (implied by `.vercel` in `.gitignore`)
- Or any Node.js platform supporting Next.js standalone builds

---

*Stack analysis: 2026-04-25*
