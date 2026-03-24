# Bunia — Roadmap

> Track what's done, what's next, and where we're headed.

---

## v0.0.1 — Foundation (Current)

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

### Client
- [x] Client-side hydration
- [x] SPA router (client-side navigation)
- [x] Navigation progress bar
- [x] HMR via SSE in dev mode
- [x] Per-page CSR opt-out (`export const csr = false`)

### Build & Tooling
- [x] Bun build pipeline (client + server bundles)
- [x] Manifest generation (`dist/manifest.json`)
- [x] Static route prerendering (`export const prerender = true`)
- [x] Tailwind CSS v4 integration
- [x] `$lib` alias → `src/lib/*`
- [x] `bunia:routes` virtual module

### CLI
- [x] `bunia dev` — dev server with file watching
- [x] `bunia build` — production build
- [x] `bunia start` — production server
- [x] `bunia create` — scaffold new project
- [x] `bunia add` — registry-based UI component installation
- [x] `bunia feat` — registry-based feature scaffolding

### Hooks & Middleware
- [x] `hooks.server.ts` with `Handle` interface
- [x] `sequence()` helper for composing middleware
- [x] `RequestEvent` — `request`, `params`, `url`, `cookies`, `locals`

### Streaming
- [x] Streaming SSR (`renderSSRStream()`)

---

## v0.0.2 — Security & Production Hardening

> Industry-standard requirements. Must be done before shipping to real users.

### Security
- [x] XSS escaping in HTML templates — sanitize `JSON.stringify()` output in `<script>` tags
- [x] SSRF validation on `/__bunia/data` — validate `path` query param
- [x] CSRF protection — Origin/Referer header validation for state-changing requests
- [x] Strip stack traces from error responses in production
- [x] Request body size limits

### Production
- [x] Graceful shutdown handler (SIGTERM/SIGINT)
- [x] `.env` file support with `bunia:env` virtual module
- [x] CORS configuration (framework-level)
- [x] Session-aware fetch (cookies forwarded in internal API calls)

---

## v0.0.3 — Critical Security Fixes

> Must be fixed before any production use. Exploitable vulnerabilities.

### Security
- [x] Path traversal protection — validate static/prerendered file paths stay within allowed directories
- [x] Cookie parsing error recovery — wrap `decodeURIComponent()` in try-catch to prevent crash on malformed cookies
- [x] Cookie option validation — whitelist/validate `domain`, `path`, `sameSite` values to prevent header injection
- [x] `PUBLIC_` env scoping — only expose vars declared in `.env` files, not all `PUBLIC_*` from `process.env`
- [ ] Trusted proxy configuration — `TRUST_PROXY` env to control when `X-Forwarded-*` headers are trusted in CSRF checks
- [x] Streaming error safety — validate route match before creating stream; catch all errors after first chunk sent
- [x] `safeJsonStringify` crash guard — try-catch around `JSON.stringify` for circular reference protection

---

## v0.0.4 — Production Hardening & DX

> Important improvements for production reliability and developer experience.

### Server Reliability
- [ ] Graceful shutdown drain — drain in-flight requests before stopping; return 503 from health check during shutdown
- [ ] Dev server auto-restart — restart app process when it crashes unexpectedly (not just on file change)
- [ ] Stream backpressure handling — check `controller.desiredSize` to prevent memory buildup on slow/disconnected clients
- [ ] Prerender process cleanup — proper signal handling, verified termination, configurable timeout
- [x] Request timeouts on `load()` and `metadata()` functions — prevent hung responses from slow data sources

### Data Loading
- [ ] `depends()` and `invalidate()` — selective data reloading
- [ ] `setHeaders()` in load functions — set response headers from loaders

### Navigation
- [ ] Link prefetching — `data-bunia-preload` attribute for hover/viewport prefetch
- [ ] `beforeNavigate` / `afterNavigate` lifecycle hooks
- [ ] Scroll restoration and snapshot support (`export const snapshot`)

### Routing
- [ ] Dynamic route prerendering with `entries()` export
- [ ] Page option: `ssr` toggle (`export const ssr = false`)
- [ ] Page option: `trailingSlash` configuration
- [ ] Layout reset (`+layout@.svelte` or `+page@.svelte`)

### Server
- [ ] Cookie RFC 6265 validation
- [ ] Open redirect validation on `redirect()`
- [ ] Structured logging with request correlation IDs
- [ ] CORS preflight validation — validate requested method/headers against allowed config

### Build
- [ ] Validate Tailwind CSS binary exists before build — clear error message if missing
- [ ] Validate `.env` variable names — reject invalid identifiers that break codegen
- [ ] Fail build on tsconfig.json corruption — don't silently continue with degraded config

### DX
- [ ] Stale env cleanup in dev — reset removed `.env` vars on hot-reload
- [x] Prerender fetch timeout — prevent infinite build hangs on slow routes

### Types
- [ ] Error page types in generated `$types.d.ts`

---

## v0.0.5 — Ecosystem & Observability

> Nice-to-haves for a growing framework.

- [x] Form actions (SvelteKit-style)
- [x] Streaming SSR for metadata (non-blocking `load()`)
- [ ] Production sourcemaps — external source maps for debuggable production errors
- [ ] Testing guide (Vitest + Playwright)
- [ ] Deployment guides (Docker, Railway, Fly.io)

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
