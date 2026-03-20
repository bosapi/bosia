# Bunia — Roadmap

> Track what's done, what's next, and where we're headed.

---

## v0.0.x — Foundation (Current)

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

### Hooks & Middleware
- [x] `hooks.server.ts` with `Handle` interface
- [x] `sequence()` helper for composing middleware
- [x] `RequestEvent` — `request`, `params`, `url`, `cookies`, `locals`

### Streaming
- [x] Streaming SSR (`renderSSRStream()`)

---

## v0.1.x — Security & Production Hardening

> Industry-standard requirements. Must be done before shipping to real users.

### Security
- [x] XSS escaping in HTML templates — sanitize `JSON.stringify()` output in `<script>` tags
- [x] SSRF validation on `/__bunia/data` — validate `path` query param
- [x] CSRF protection — Origin/Referer header validation for state-changing requests
- [x] Strip stack traces from error responses in production
- [x] Request body size limits

### Production
- [x] Graceful shutdown handler (SIGTERM/SIGINT)
- [x] `.env` file support
- [x] CORS configuration (framework-level)

### Cleanup
- [ ] Remove duplicate type defs in template `app.d.ts`

---

## v0.2.x — DX & Robustness

> Important improvements, not blocking first release.

- [ ] Cookie RFC 6265 validation
- [ ] Request timeouts on `load()` functions
- [ ] Structured logging with request correlation IDs
- [ ] Dynamic route prerendering with `entries()` export
- [ ] Error page types in generated `$types.d.ts`
- [ ] Open redirect validation on `redirect()`

---

## v0.3.x — Ecosystem

> Nice-to-haves for a growing framework.

- [ ] Form actions (SvelteKit-style)
- [ ] Streaming SSR for metadata (non-blocking `load()`)
- [ ] Production sourcemaps
- [ ] Testing guide (Vitest + Playwright)
- [ ] Deployment guides (Docker, Railway, Fly.io)

---

## Not Planned

Intentional omissions — out of scope for the framework:

- `+page.ts` universal load (decided against)
- Image optimization (infrastructure concern)
- i18n (user's responsibility)
- Rate limiting (reverse proxy concern)
- Plugin/extension system (premature)
