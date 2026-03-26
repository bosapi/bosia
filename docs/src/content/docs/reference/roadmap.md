---
title: Roadmap
description: What's done, what's next, and where Bosbun is headed.
---

> Track what's done, what's next, and where we're headed.
> Current version: **0.0.8**

---

## Completed (v0.0.1 – v0.0.7)

<details>
<summary>Click to expand completed items</summary>

### Core Framework
- [x] SSR with Svelte 5 Runes (`$props`, `$state`)
- [x] File-based routing (`+page.svelte`, `+layout.svelte`, `+server.ts`)
- [x] Dynamic routes (`[param]`) and catch-all routes (`[...rest]`)
- [x] Route groups (`(group)`) for layout grouping
- [x] API routes — `+server.ts` with HTTP verb exports
- [x] Error pages — `+error.svelte`

### Data Loading
- [x] Plain `export async function load()` pattern (no wrapper)
- [x] `$types` codegen — auto-generated `PageData`, `PageProps`, `LayoutData`, `LayoutProps`
- [x] `parent()` data threading in layouts

### Server
- [x] ElysiaJS HTTP server
- [x] Gzip compression
- [x] Static file caching (Cache-Control headers)
- [x] `/_health` endpoint
- [x] Cookie support (`cookies.get`, `cookies.set`, `cookies.delete`)
- [x] Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- [x] Graceful shutdown handler (SIGTERM/SIGINT)
- [x] `.env` file support with `$env` virtual module
- [x] CORS configuration (framework-level)
- [x] Session-aware fetch (cookies forwarded in internal API calls)
- [x] Request timeouts on `load()` and `metadata()` functions

### Security
- [x] XSS escaping in HTML templates — sanitize `JSON.stringify()` output in `<script>` tags
- [x] SSRF validation on `/__bosbun/data` — validate `path` query param
- [x] CSRF protection — Origin/Referer header validation for state-changing requests
- [x] Strip stack traces from error responses in production
- [x] Request body size limits
- [x] Path traversal protection — validate static/prerendered file paths stay within allowed directories
- [x] Cookie parsing error recovery — wrap `decodeURIComponent()` in try-catch
- [x] Cookie option validation — whitelist/validate `domain`, `path`, `sameSite` values
- [x] `PUBLIC_` env scoping — only expose vars declared in `.env` files
- [x] Streaming error safety — validate route match before creating stream
- [x] `safeJsonStringify` crash guard — try-catch for circular reference protection

### Client
- [x] Client-side hydration
- [x] SPA router (client-side navigation)
- [x] Navigation progress bar
- [x] HMR via SSE in dev mode
- [x] Per-page CSR opt-out (`export const csr = false`)
- [x] Link prefetching — `data-bosbun-preload` attribute for hover/viewport prefetch
- [x] Form actions (SvelteKit-style)
- [x] Streaming SSR for metadata (non-blocking `load()`)

### Build & Tooling
- [x] Bun build pipeline (client + server bundles)
- [x] Manifest generation (`dist/manifest.json`)
- [x] Static route prerendering (`export const prerender = true`)
- [x] Tailwind CSS v4 integration
- [x] `$lib` alias → `src/lib/*`
- [x] `bosbun:routes` virtual module
- [x] Validate Tailwind CSS binary exists before build
- [x] Prerender fetch timeout

### CLI
- [x] `bosbun dev` — dev server with file watching
- [x] `bosbun build` — production build
- [x] `bosbun start` — production server
- [x] `bosbun create` — scaffold new project (with `--template` flag and interactive picker)
- [x] `bosbun add` — registry-based UI component installation
- [x] `bosbun feat` — registry-based feature scaffolding

### Hooks & Middleware
- [x] `hooks.server.ts` with `Handle` interface
- [x] `sequence()` helper for composing middleware
- [x] `RequestEvent` — `request`, `params`, `url`, `cookies`, `locals`

### Docs & Ecosystem
- [x] Deployment guides (Docker, Railway, Fly.io)
- [x] Indonesian (Bahasa Indonesia) documentation translation with Starlight i18n

</details>

---

## v0.0.8 — Critical Bug Fixes

> Security and correctness issues that must be fixed before production use.

### Security
- [x] Route PUT/PATCH/DELETE through `handleRequest()` — currently these methods bypass CSRF, CORS, security headers, and cookie handling for non-API routes
- [ ] Trusted proxy configuration — `TRUST_PROXY` env to control when `X-Forwarded-*` headers are trusted in CSRF checks

### Bug Fixes
- [x] Fix `withTimeout` timer leak — `setTimeout` in `Promise.race` is never cleared when the main promise resolves, causing dangling timers under load
- [x] Fix `_shellOpen` caching in dev — `buildHtmlShellOpen()` caches `Date.now()` cache-bust value on first call, making it stale for subsequent requests
- [x] Fix client-side navigation with query strings/hashes — `navigate()` deduplication compares inconsistently (pathname vs full path)
- [x] Remove duplicate static file serving — `staticPlugin` and manual `resolve()` both serve from `public/`, causing double handling and inconsistent security

### Dead Code Cleanup
- [x] Remove `renderSSR` function from `renderer.ts` — fully replaced by `renderSSRStream`, never called
- [x] Remove `buildHtmlShell` function and `_shell` variable from `html.ts` — never called anywhere
- [x] Remove unused `buildHtmlShell` import from `renderer.ts`
- [x] Remove `export` from `STATIC_EXTS` in `html.ts` — only used internally by `isStaticPath`
- [x] Remove `export` from `DEFAULT_CSRF_CONFIG` in `csrf.ts` — only used as default parameter in same file
- [x] Remove `export` from `matchPattern` in `matcher.ts` — only used by `findMatch` in same file
- [x] Use `splitCsvEnv` for CSRF/CORS origin parsing in `server.ts` — eliminate duplicate `.split(",").map().filter()` pattern

---

## v0.0.9 — Production Hardening

> Stability and reliability improvements for production workloads.

### Server Reliability
- [ ] Graceful shutdown drain — drain in-flight requests before stopping; return 503 from health check during shutdown
- [x] Dev server auto-restart — restart app process when it crashes unexpectedly (not just on file change)
- [ ] Stream backpressure handling — check `controller.desiredSize` to prevent memory buildup on slow/disconnected clients
- [ ] Prerender process cleanup — proper signal handling, verified termination, use random port instead of hardcoded 13572
- [ ] Concurrent build guard in dev — prevent overlapping builds when rapid file changes trigger `buildAndRestart()` while a build is already running

### Server
- [ ] Cookie RFC 6265 validation — also review `encodeURIComponent` on cookie names (interop concern)
- [ ] Open redirect validation on `redirect()`
- [ ] CORS preflight validation — validate requested method/headers against allowed config

### Client
- [ ] Use `insertAdjacentHTML` for head injection — current `innerHTML+=` re-parses entire `<head>`, risking duplicate stylesheets and script re-execution
- [ ] Bound prefetch cache size — `prefetchCache` grows unbounded between navigations

### Build
- [ ] Validate `.env` variable names — reject invalid identifiers that break codegen
- [ ] Fail build on tsconfig.json corruption — don't silently continue with degraded config
- [ ] `.env` parser escape sequence support — handle `\n`, `\"`, etc. in quoted values
- [ ] Tune gzip compression threshold — current 1024-byte threshold is low; consider raising to ~2KB

### DX
- [ ] Stale env cleanup in dev — reset removed `.env` vars on hot-reload

---

## v0.0.10 — Features & DX

> New capabilities and developer experience improvements.

### Data Loading
- [ ] `depends()` and `invalidate()` — selective data reloading
- [ ] `setHeaders()` in load functions — set response headers from loaders

### Navigation
- [ ] `beforeNavigate` / `afterNavigate` lifecycle hooks
- [ ] Scroll restoration and snapshot support (`export const snapshot`)

### Routing
- [ ] Dynamic route prerendering with `entries()` export
- [ ] Page option: `ssr` toggle (`export const ssr = false`)
- [ ] Page option: `trailingSlash` configuration
- [ ] Layout reset (`+layout@.svelte` or `+page@.svelte`)

### Server
- [ ] Structured logging with request correlation IDs

### Types
- [ ] Error page types in generated `$types.d.ts`

---

## v0.0.11 — Ecosystem & Observability

> Nice-to-haves for a growing framework.

- [ ] Production sourcemaps — external source maps for debuggable production errors
- [ ] Testing guide (Vitest + Playwright)

---

## Not Planned

Intentional omissions — out of scope for the framework:

- `+page.ts` / `+layout.ts` universal load (decided against)
- Image optimization (infrastructure concern)
- i18n (user's responsibility)
- Rate limiting (reverse proxy concern)
- Plugin/extension system (premature)
- Adapter system (intentionally tied to Bun + Elysia)
- Service worker tooling (out of scope)
