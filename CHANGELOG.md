# Changelog

All notable changes to Bunia are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.0.4] - 2026-03-23

### Fixed
- Security: `PUBLIC_*` env vars injected into client HTML are now scoped to keys declared in `.env` files only — system env vars that happen to start with `PUBLIC_` are no longer leaked to the browser
- Streaming SSR: metadata errors now return proper error responses (correct status codes) instead of broken partial HTML; post-stream errors produce valid HTML structure; XSS-safe error message encoding via `safeJsonStringify`

## [0.0.3] - 2026-03-23

### Changed
- Route matching: routes are now sorted by priority at build time (exact → dynamic → catch-all, then segment depth); `findMatch()` does a single pass instead of 3 passes — O(n) best-case with early exit

## [0.0.3] - 2026-03-21

### Added
- Streaming SSR metadata: `metadata()` export in `+page.server.ts` sends `<title>`, `<meta>` tags in the initial HTML head before `load()` completes; 3-chunk streaming flow (head open → metadata + spinner → rendered content); `MetadataEvent` and `Metadata` types exported from `bunia`; SEO-friendly — crawlers see metadata without JS execution; `metadata()` can return `data` object that gets passed to `load()` via `event.metadata` to avoid duplicate queries
- Form actions (SvelteKit-style): `actions` export in `+page.server.ts` for handling form POST submissions; `fail()` helper and `ActionFailure` class for returning validation errors; `ActionData` type auto-generated in `$types.d.ts`; `form` prop passed to page components; named actions via `action="?/name"` attribute; re-runs `load()` after action; proper status codes (400 for failures, 200 for success, 303 for redirects)

---

## [0.0.2] - 2026-03-20

### Added
- `.env` file support with `bunia:env` virtual module: prefix-based classification (`PUBLIC_STATIC_*`, `PUBLIC_*`, `STATIC_*`, private); load order `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`; build-time codegen of `.bunia/env.server.ts`, `.bunia/env.client.ts`, `.bunia/types/env.d.ts`; `window.__BUNIA_ENV__` injected at SSR for dynamic public vars; CLI loads env before spawning subprocesses
- Graceful shutdown: SIGTERM/SIGINT handlers call `app.stop()` then `process.exit(0)`; force-exit after 10s if stop hangs
- Request body size limits: `BODY_SIZE_LIMIT` env var (`512K`, `1M`, `Infinity`, or bytes); defaults to `512K`; wired into Elysia/Bun server config for 413 enforcement before handlers run
- CSRF protection: Origin/Referer header validation on all non-safe requests (POST/PUT/PATCH/DELETE); blocked requests return 403 with a descriptive message; exports `CsrfConfig` type from `bunia`
- CORS configuration: `CORS_ALLOWED_ORIGINS` env var (comma-separated); `getCorsHeaders()` adds `Access-Control-Allow-Origin` + `Vary: Origin` for matching origins; OPTIONS preflight returns 204 with `Access-Control-Allow-Methods/Headers/Max-Age`; exports `CorsConfig` type from `bunia`
- Strip stack traces in production: `handleRequest` wrapped in try/catch; Elysia `.onError()` safety net; all `console.error` calls log full error in dev and message-only in prod

### Removed
- Duplicate `PageLoadEvent` and `LayoutLoadEvent` interfaces from template `app.d.ts`; use `import type { LoadEvent } from "bunia"` instead

### Fixed
- XSS: escape `<`, `>`, `&`, U+2028, U+2029 in JSON embedded in SSR `<script>` tags (`safeJsonStringify`)
- SSRF: validate `path` query param on `/__bunia/data` — reject non-root-relative paths, double-slash URLs, and traversal sequences

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
