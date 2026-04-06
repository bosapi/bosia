# Bosia — Roadmap

> Track what's done, what's next, and where we're headed.
> Current version: **0.1.10**

---

## Completed (v0.0.1 – v0.1.6)

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
- [x] Graceful shutdown drain — drain in-flight requests before stopping; return 503 from health check during shutdown
- [x] Concurrent build guard in dev — prevent overlapping builds when rapid file changes trigger `buildAndRestart()` while a build is already running

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
- [x] Open redirect validation on `redirect()`
- [x] Cookie RFC 6265 validation — validate names against HTTP token spec; use `encodeURIComponent` only for values

### Client
- [x] Client-side hydration
- [x] SPA router (client-side navigation)
- [x] Navigation progress bar
- [x] HMR via SSE in dev mode
- [x] Per-page CSR opt-out (`export const csr = false`)
- [x] Link prefetching — `data-bosia-preload` attribute for hover/viewport prefetch
- [x] Fix client-side navigation with query strings/hashes
- [x] Use `insertAdjacentHTML` for head injection — prevents re-parsing `<head>`, avoiding duplicate stylesheets and script re-execution

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
- [x] Static site output — merge prerendered HTML + client assets + public into `dist/static/` for static hosting
- [x] Validate `.env` variable names — reject invalid identifiers that break codegen
- [x] `.env` parser escape sequence support — handle `\n`, `\"`, etc. in quoted values

### Routing
- [x] Dynamic route prerendering with `entries()` export — enumerate dynamic route params for static prerendering

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
- [x] `todo` feature — `bosia feat todo` scaffolds todo schema, repository, service, routes, components, and seed data
- [x] `todo` component — `bosia add todo` installs todo-form, todo-item, todo-list components
- [x] Registry as single source of truth — `bosia create --template drizzle` installs features from registry via `template.json` instead of duplicating files

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
- [x] Nested registry structure for `todo` components — subfolder pattern matching `ui/`, with group install (`bosia add todo`) and individual install (`bosia add todo/todo-form`)
- [x] Nested docs sidebar — UI and Todo as sub-groups under Components
- [x] SEO infrastructure — `Metadata` type supports `lang` and `link` fields; dynamic `<html lang>`; `<link>` tag rendering in streaming SSR
- [x] Docs SEO — OG tags, Twitter cards, canonical URLs, hreflang alternates on all pages
- [x] `robots.txt` and `sitemap.xml` generation for docs site

### v0.1.0
- [x] Rename framework from `bosbun` to `bosia`
- [x] Dead code cleanup (`renderSSR`, `buildHtmlShell`, unexported internals)
- [x] `splitCsvEnv` helper for CSRF/CORS origin parsing

</details>

---

## v0.1.7 — Production Hardening

> Stability and security improvements for production workloads.

### Security
- [ ] Trusted proxy configuration — `TRUST_PROXY` env to control when `X-Forwarded-*` headers are trusted in CSRF checks
- [ ] CORS preflight validation — validate requested method/headers against allowed config
- [x] Cookie secure defaults — default `HttpOnly; Secure; SameSite=Lax` on `cookies.set()` with opt-out
- [x] Auto-detect `Cache-Control` on `/__bosia/data/` — `private, no-cache` when cookies accessed; `public, max-age=0, must-revalidate` otherwise
- [ ] CORS `Vary: Origin` on all responses when CORS is configured — prevent CDN caching bugs on non-matching origins
- [ ] Validate `CORS_MAX_AGE` env — reject non-numeric values instead of producing `NaN` header
- [ ] `allowExternal` redirect validation — still validate against `javascript:`, `data:`, `vbscript:` schemes even when `allowExternal: true`
- [ ] CSP nonce infrastructure — per-request nonce generation, inject into all framework `<script>` tags, expose nonce in hooks for user scripts
- [ ] Validate prerender `entries()` return values — sanitize path segments before URL substitution

### Server Reliability
- [ ] Stream backpressure handling — check `controller.desiredSize` to prevent memory buildup on slow/disconnected clients
- [ ] Prerender process cleanup — proper signal handling, verified termination, use random port instead of hardcoded 13572
- [ ] Streaming SSR error recovery — render proper error page instead of bare `<p>Internal Server Error</p>` when `render()` throws mid-stream
- [ ] Fix `buildAndRestart` recursive tail call — replace recursion with `while` loop to prevent stack growth under rapid file changes

### Client
- [ ] Bound prefetch cache size — `prefetchCache` grows unbounded between navigations

### Build
- [ ] Fail build on tsconfig.json corruption — don't silently continue with degraded config
- [ ] Tune gzip compression threshold — current 1024-byte threshold is low; consider raising to ~2KB

### DX
- [ ] Stale env cleanup in dev — reset removed `.env` vars on hot-reload
- [ ] Document cookie forwarding risk — `load()` fetch helper forwards session cookies to all requests including external APIs

---

## v0.1.8 — Features & DX

> New capabilities and developer experience improvements.

### Data Loading
- [ ] `depends()` and `invalidate()` — selective data reloading
- [ ] `setHeaders()` in load functions — set response headers from loaders

### Navigation
- [ ] `beforeNavigate` / `afterNavigate` lifecycle hooks
- [ ] Scroll restoration and snapshot support (`export const snapshot`)

### Routing
- [ ] Page option: `ssr` toggle (`export const ssr = false`)
- [ ] Page option: `trailingSlash` configuration
- [ ] Layout reset (`+layout@.svelte` or `+page@.svelte`)
- [ ] Route-level `+error.svelte` — per-layout error boundaries instead of global-only

### Server
- [ ] Structured logging with request correlation IDs

### Forms
- [ ] `use:enhance` progressive enhancement — client-side fetch submission with automatic form state management (like SvelteKit)

### Types
- [ ] Error page types in generated `$types.d.ts`
- [ ] Typed route params — generate `{ slug: string }` from `[slug]` instead of `Record<string, string>`

---

## v0.1.9 — Ecosystem & Observability

> Nice-to-haves for a growing framework.

- [ ] Production sourcemaps — external source maps for debuggable production errors

---

## v0.2.0 — Test Integration (Phase 1 + 2)

> Built-in testing powered by `bun test`. See [TEST_PLAN.md](backup/TEST_PLAN.md) for full details.

### CLI
- [ ] `bosia test` command — wraps `bun test` with framework-aware defaults
- [ ] Auto-load `.env.test` (fallback `.env`) before running tests
- [ ] Set `BOSIA_ENV=test` automatically
- [ ] Pass through flags (`--watch`, `--coverage`, `--bail`, `--timeout`, etc.)

### Test Utilities (`bosia/testing`)
- [ ] `createRequestEvent()` — mock factory for testing `+server.ts` handlers and hooks
- [ ] `createLoadEvent()` — mock factory for testing `load()` functions
- [ ] `createMetadataEvent()` — mock factory for testing `metadata()` functions
- [ ] `mockCookies()` — in-memory cookie jar implementing `Cookies` interface
- [ ] `mockFetch()` — fetch interceptor for isolating loaders
- [ ] `createFormData()` — helper for building form action payloads

---

## v0.2.1 — Route & API Integration Testing (Phase 3)

> Test routes end-to-end without starting a real server.

- [ ] `createTestApp()` — build an in-process Elysia instance from the route manifest
- [ ] `testRequest()` — send HTTP requests to the test app, get standard `Response` back
- [ ] Support API routes, page routes (SSR HTML), and form actions
- [ ] Response assertion helpers: `expectJson()`, `expectRedirect()`, `expectHtml()`

---

## v0.2.2 — Component Testing (Phase 4)

> Render and assert on Svelte 5 components in tests.

- [ ] `renderComponent(Component, { props })` — SSR render a component, return HTML
- [ ] `renderPage(route, options?)` — full SSR pipeline (loader → layout → page)
- [ ] Snapshot testing support (built into `bun test`)
- [ ] Investigate `@testing-library/svelte` compatibility with Bun

---

## v0.3.0 — E2E Testing & Docs (Phase 5 + 6)

> Full browser testing with Playwright + comprehensive test docs.

- [ ] `startTestServer()` — spin up a real Bosia server on a random port for E2E
- [ ] `bosia test --e2e` — auto-launch Playwright with the server
- [ ] Playwright config template in `bosia create` scaffolding
- [ ] Test file examples in project templates
- [ ] `bosia feat test` scaffolder for generating test files
- [ ] Docs: testing overview, unit tests, integration tests, component tests, E2E

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
