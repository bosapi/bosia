# Bosia — Roadmap

> Track what's done, what's next, and where we're headed.
> Current version: **0.1.3**

---

## Completed (v0.0.1 – v0.1.0)

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
- [x] Streaming SSR for metadata (non-blocking `load()`)
- [x] Form actions (SvelteKit-style)

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
- [x] Route PUT/PATCH/DELETE through `handleRequest()` — consistent CSRF, CORS, security headers, and cookie handling

### Security
- [x] XSS escaping in HTML templates — sanitize `JSON.stringify()` output in `<script>` tags
- [x] SSRF validation on `/__bosia/data/` — validate route path segment
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
- [x] Link prefetching — `data-bosia-preload` attribute for hover/viewport prefetch
- [x] Fix client-side navigation with query strings/hashes

### Build & Tooling
- [x] Bun build pipeline (client + server bundles)
- [x] Manifest generation (`dist/manifest.json`)
- [x] Static route prerendering (`export const prerender = true`)
- [x] Tailwind CSS v4 integration
- [x] `$lib` alias → `src/lib/*`
- [x] `bosia:routes` virtual module
- [x] Validate Tailwind CSS binary exists before build
- [x] Prerender fetch timeout
- [x] Fix `withTimeout` timer leak
- [x] Remove duplicate static file serving

### CLI
- [x] `bosia dev` — dev server with file watching
- [x] `bosia build` — production build
- [x] `bosia start` — production server
- [x] `bosia create` — scaffold new project (with `--template` flag and interactive picker)
- [x] `bosia add` — registry-based UI component installation
- [x] `bosia feat` — registry-based feature scaffolding
- [x] `bosia add` index-based path resolution — resolves component names from `index.json` instead of blindly prefixing `ui/`
- [x] `bosia feat` nested feature dependencies — `features` field in meta.json for recursive installation
- [x] `bosia feat` overwrite prompt — asks before replacing existing files

### Templates & Features
- [x] `drizzle` template — PostgreSQL + Drizzle ORM with full CRUD todo demo
- [x] `drizzle` feature — `bosia feat drizzle` scaffolds DB connection, schema aggregator, migrations dir, seed runner
- [x] `todo` feature — `bosia feat todo` scaffolds todo schema, queries, routes, components, and seed data
- [x] `todo` component — `bosia add todo` installs todo-form, todo-item, todo-list components

### Hooks & Middleware
- [x] `hooks.server.ts` with `Handle` interface
- [x] `sequence()` helper for composing middleware
- [x] `RequestEvent` — `request`, `params`, `url`, `cookies`, `locals`

### Docs & Ecosystem
- [x] Documentation site (Astro Starlight) — 14 pages
- [x] Indonesian (Bahasa Indonesia) translation with Starlight i18n
- [x] Deployment guides (Docker, Railway, Fly.io)
- [x] GitHub Actions for auto-publishing to npm and deploying docs
- [x] Dev server auto-restart on crash
- [x] Components documentation page with usage examples and prop tables
- [x] Interactive component previews in docs — live Svelte demos (button, badge, input, separator, avatar, card, dropdown-menu)

### v0.1.0
- [x] Rename framework from `bosbun` to `bosia`
- [x] Dead code cleanup (`renderSSR`, `buildHtmlShell`, unexported internals)
- [x] `splitCsvEnv` helper for CSRF/CORS origin parsing

</details>

---

## v0.1.1 — Production Hardening & Security

> Stability, reliability, and security improvements for production workloads.

### Security
- [ ] Trusted proxy configuration — `TRUST_PROXY` env to control when `X-Forwarded-*` headers are trusted in CSRF checks
- [ ] Cookie RFC 6265 validation — also review `encodeURIComponent` on cookie names (interop concern)
- [ ] Open redirect validation on `redirect()`
- [ ] CORS preflight validation — validate requested method/headers against allowed config

### Server Reliability
- [ ] Graceful shutdown drain — drain in-flight requests before stopping; return 503 from health check during shutdown
- [ ] Stream backpressure handling — check `controller.desiredSize` to prevent memory buildup on slow/disconnected clients
- [ ] Prerender process cleanup — proper signal handling, verified termination, use random port instead of hardcoded 13572
- [ ] Concurrent build guard in dev — prevent overlapping builds when rapid file changes trigger `buildAndRestart()` while a build is already running

### Client
- [ ] Use `insertAdjacentHTML` for head injection — current `innerHTML+=` re-parses entire `<head>`, risking duplicate stylesheets and script re-execution
- [ ] Bound prefetch cache size — `prefetchCache` grows unbounded between navigations

### Build
- [x] Static site output — merge prerendered HTML + client assets + public into `dist/static/` for static hosting (GitHub Pages, Netlify, etc.)
- [ ] Validate `.env` variable names — reject invalid identifiers that break codegen
- [ ] Fail build on tsconfig.json corruption — don't silently continue with degraded config
- [ ] `.env` parser escape sequence support — handle `\n`, `\"`, etc. in quoted values
- [ ] Tune gzip compression threshold — current 1024-byte threshold is low; consider raising to ~2KB

### DX
- [ ] Stale env cleanup in dev — reset removed `.env` vars on hot-reload

---

## v0.1.2 — Features & DX

> New capabilities and developer experience improvements.

### Data Loading
- [ ] `depends()` and `invalidate()` — selective data reloading
- [ ] `setHeaders()` in load functions — set response headers from loaders

### Navigation
- [ ] `beforeNavigate` / `afterNavigate` lifecycle hooks
- [ ] Scroll restoration and snapshot support (`export const snapshot`)

### Routing
- [x] Dynamic route prerendering with `entries()` export — enumerate dynamic route params for static prerendering
- [ ] Page option: `ssr` toggle (`export const ssr = false`)
- [ ] Page option: `trailingSlash` configuration
- [ ] Layout reset (`+layout@.svelte` or `+page@.svelte`)

### Server
- [ ] Structured logging with request correlation IDs

### Types
- [ ] Error page types in generated `$types.d.ts`

---

## v0.1.3 — Ecosystem & Observability

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
