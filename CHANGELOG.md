# Changelog

All notable changes to Bunia are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.0.1] - 2026-03-19

### Added

#### Core Framework
- **SSR + Svelte 5 Runes** — Server-side rendering with full Svelte 5 Runes support (`$props`, `$state`, etc.)
- **File-based routing** — Automatic route discovery via `src/routes/` directory structure (`+page.svelte`, `+page.server.ts`, `+layout.svelte`, `+layout.server.ts`, `+server.ts`)
- **Dynamic routes** — `[param]` segments with typed params
- **Catch-all routes** — `[...catchall]` segments for wildcard matching
- **Route groups** — `(group)` directory syntax for layout grouping without URL segments
- **API routes** — `+server.ts` files for REST endpoints (GET, POST, etc.)
- **Error pages** — `+error.svelte` for custom error handling with HTTP status codes

#### Data Loading
- **`load()` function** — Plain `export async function load({ params, cookies })` pattern (no wrapper needed)
- **`$types` codegen** — Auto-generated `.bunia/types/src/routes/**/$types.d.ts` per route directory
  - `PageData`, `PageProps` for pages
  - `LayoutData`, `LayoutProps` for layouts
  - `import type { PageData } from './$types'` resolves transparently via `tsconfig.json` `rootDirs`

#### Server
- **ElysiaJS server** — Runs on port 3001 (dev) / 3000 (prod)
- **Gzip compression** — Automatic response compression
- **Static file caching** — Cache-Control headers for assets
- **`/_health` endpoint** — Returns `{ status: "ok", timestamp }` for health checks
- **Cookie support** — `Cookies` interface on `RequestEvent` and `LoadEvent`
  - `cookies.get(name)` / `cookies.set(name, value, options)` / `cookies.delete(name)`
  - `Set-Cookie` headers applied automatically in response

#### Client
- **Client-side hydration** — Full hydration of SSR-rendered pages
- **Client-side router** — SPA navigation without full page reloads
- **Navigation progress bar** — Visual loading indicator during page transitions
- **HMR** — Hot module replacement in development
- **CSR opt-out** — Per-page option to disable client-side rendering (`export const csr = false`)

#### Build
- **Bun build pipeline** — Fast bundling via Bun with Svelte plugin
- **Client bundle** — Output to `dist/client/`
- **Server bundle** — Output to `dist/server/index.js`
- **Manifest** — `dist/manifest.json` for route/asset mapping
- **Static prerendering** — Opt-in prerendering of routes at build time (`export const prerender = true`)
- **Tailwind CSS v4** — Integrated via `@tailwindcss/cli`
- **`$lib` alias** — `$lib/*` maps to `src/lib/*`
- **`bunia:routes` virtual module** — Auto-generated route registry at build time

#### CLI
- **`bunia dev`** — Start dev server with file watching and HMR
- **`bunia build`** — Production build
- **`bunia start`** — Start production server from `dist/server/index.js`
- **`bunia create`** — Scaffold a new project from the default template

#### Hooks
- **`hooks.server.ts`** — `Handle` middleware interface with `sequence()` helper
- **`RequestEvent`** — `request`, `params`, `url`, `cookies`, `locals`
- **`LoadEvent`** — `params`, `url`, `cookies`, `locals`

#### Developer Experience
- **Default project template** — `packages/bunia/templates/default/` for `bunia create`
- **Dockerfile** — Multi-stage Docker build for the demo app
- **TypeScript** — Full type coverage; `tsconfig.json` auto-patched on first build
- **README** — Monorepo, framework, demo app, and template READMEs

---

## [0.0.0] - 2026-03-19

### Added
- Initial framework scaffolding: `matcher.ts`, `scanner.ts`, `types.ts`
- Core SSR server (`server.ts`) and client router (`App.svelte`, `router.svelte.ts`)
- Client-side hydration with HMR support (`hydrate.ts`)
- Dev server with proxy and file watcher (`dev.ts`)
- CLI entry point with `dev`, `build`, `start`, `create` commands
- Demo application (`apps/demo/`)
