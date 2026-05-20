# Bosia — Roadmap

> Track what's done, what's next, and where we're headed.
> Current version: **0.5.6**

---

> Severity: 🔴 Critical · 🟠 Major · 🟡 Minor · ⚪ Trivial

---

## Completed (v0.0.1 – v0.1.26)

<details>
<summary>Click to expand completed items</summary>

### Core Framework

- [x] 🔴 SSR with Svelte 5 Runes (`$props`, `$state`)
- [x] 🔴 File-based routing (`+page.svelte`, `+layout.svelte`, `+server.ts`)
- [x] 🟠 Dynamic routes (`[param]`) and catch-all routes (`[...rest]`)
- [x] 🟡 Route groups (`(group)`) for layout grouping
- [x] 🟠 API routes — `+server.ts` with HTTP verb exports
- [x] 🟠 Error pages — `+error.svelte`

### Data Loading

- [x] 🔴 Plain `export async function load()` pattern (no wrapper)
- [x] 🟠 `$types` codegen — auto-generated `PageData`, `PageProps`, `LayoutData`, `LayoutProps`
- [x] 🟠 `parent()` data threading in layouts
- [x] 🟠 Streaming SSR for metadata (non-blocking `load()`)
- [x] 🟠 Form actions (SvelteKit-style)

### Server

- [x] 🔴 ElysiaJS HTTP server
- [x] 🟡 Gzip compression
- [x] 🟡 Static file caching (Cache-Control headers)
- [x] 🟡 `/_health` endpoint
- [x] 🟠 Cookie support (`cookies.get`, `cookies.set`, `cookies.delete`)
- [x] 🟠 Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- [x] 🟡 `DISABLE_X_FRAME_OPTIONS=true` env var to omit `X-Frame-Options` for intentional cross-origin iframe embedding
- [x] 🟠 Graceful shutdown handler (SIGTERM/SIGINT)
- [x] 🟠 `.env` file support with `$env` virtual module
- [x] 🟡 CORS configuration (framework-level)
- [x] 🟠 Session-aware fetch (cookies forwarded in internal API calls)
- [x] 🟡 Request timeouts on `load()` and `metadata()` functions
- [x] 🟠 Route PUT/PATCH/DELETE through `handleRequest()` — consistent CSRF, CORS, security headers, and cookie handling
- [x] 🟠 Graceful shutdown drain — drain in-flight requests before stopping; return 503 from health check during shutdown
- [x] 🟡 Concurrent build guard in dev — prevent overlapping builds when rapid file changes trigger `buildAndRestart()` while a build is already running
- [x] 🟡 Clean dev server shutdown — release `Bun.serve`, file watchers, and timers on SIGINT so the event loop drains naturally; outer `bun run` reports exit 0 instead of 130

### Security

- [x] 🔴 XSS escaping in HTML templates — sanitize `JSON.stringify()` output in `<script>` tags
- [x] 🔴 SSRF validation on `/__bosia/data/` — validate route path segment
- [x] 🔴 CSRF protection — Origin/Referer header validation for state-changing requests
- [x] 🟠 Strip stack traces from error responses in production
- [x] 🟠 Request body size limits
- [x] 🔴 Path traversal protection — validate static/prerendered file paths stay within allowed directories
- [x] 🟡 Cookie parsing error recovery — wrap `decodeURIComponent()` in try-catch
- [x] 🟡 Cookie option validation — whitelist/validate `domain`, `path`, `sameSite` values
- [x] 🟠 `PUBLIC_` env scoping — only expose vars declared in `.env` files
- [x] 🟠 Streaming error safety — validate route match before creating stream
- [x] 🟡 `safeJsonStringify` crash guard — try-catch for circular reference protection
- [x] 🟠 Open redirect validation on `redirect()`
- [x] 🟡 Cookie RFC 6265 validation — validate names against HTTP token spec; use `encodeURIComponent` only for values

### Client

- [x] 🔴 Client-side hydration
- [x] 🔴 SPA router (client-side navigation)
- [x] 🟡 Navigation progress bar
- [x] 🟠 HMR via SSE in dev mode
- [x] 🟡 Per-page CSR opt-out (`export const csr = false`)
- [x] 🟡 Link prefetching — `data-bosia-preload` attribute for hover/viewport prefetch
- [x] 🟠 Fix client-side navigation with query strings/hashes
- [x] 🟡 Use `insertAdjacentHTML` for head injection — prevents re-parsing `<head>`, avoiding duplicate stylesheets and script re-execution

### Build & Tooling

- [x] 🔴 Bun build pipeline (client + server bundles)
- [x] 🟠 Manifest generation (`dist/manifest.json`)
- [x] 🟠 Static route prerendering (`export const prerender = true`)
- [x] 🟠 Tailwind CSS v4 integration
- [x] 🟠 `$lib` alias → `src/lib/*`
- [x] 🟡 `bosia:routes` virtual module
- [x] 🟡 Validate Tailwind CSS binary exists before build
- [x] 🟡 Prerender fetch timeout
- [x] 🟡 Fix `withTimeout` timer leak
- [x] ⚪ Remove duplicate static file serving
- [x] 🟠 Static site output — merge prerendered HTML + client assets + public into `dist/static/` for static hosting
- [x] 🟡 Validate `.env` variable names — reject invalid identifiers that break codegen
- [x] 🟡 `.env` parser escape sequence support — handle `\n`, `\"`, etc. in quoted values

### Routing

- [x] 🟠 Dynamic route prerendering with `entries()` export — enumerate dynamic route params for static prerendering

### CLI

- [x] 🔴 `bosia dev` — dev server with file watching
- [x] 🔴 `bosia build` — production build
- [x] 🔴 `bosia start` — production server
- [x] 🟠 `bosia create` — scaffold new project (with `--template` flag and interactive picker)
- [x] 🟠 `bosia add` — registry-based UI component installation
- [x] 🟠 `bosia feat` — registry-based feature scaffolding
- [x] 🟡 `bosia add` index-based path resolution — resolves component names from `index.json` instead of blindly prefixing `ui/`
- [x] 🟡 `bosia feat` nested feature dependencies — `features` field in meta.json for recursive installation
- [x] 🟡 `bosia feat` overwrite prompt — asks before replacing existing files
- [x] 🟡 `bosia add` multi-component install — `bosia add button card input` installs all in one call
- [x] 🟡 `bosia add -y` / `--yes` flag — auto-confirm overwrite prompts for CI / scripts

### Templates & Features

- [x] 🟠 `todo` template (formerly `drizzle`) — PostgreSQL + Drizzle ORM with full CRUD todo demo
- [x] 🟠 `drizzle` feature — `bosia feat drizzle` scaffolds DB connection, schema aggregator, migrations dir, seed runner
- [x] 🟠 `todo` feature — `bosia feat todo` scaffolds todo schema, repository, service, routes, components, and seed data
- [x] 🟡 `todo` component — `bun x bosia@latest add todo` installs todo-form, todo-item, todo-list components
- [x] 🟡 Registry as single source of truth — `bosia create --template todo` installs features from registry via `template.json` instead of duplicating files

### Hooks & Middleware

- [x] 🟠 `hooks.server.ts` with `Handle` interface
- [x] 🟡 `sequence()` helper for composing middleware
- [x] 🟠 `RequestEvent` — `request`, `params`, `url`, `cookies`, `locals`

### Docs & Ecosystem

- [x] 🟠 Documentation site (Astro Starlight) — 14 pages
- [x] 🟡 Indonesian (Bahasa Indonesia) translation with Starlight i18n
- [x] 🟡 Deployment guides (Docker, Railway, Fly.io)
- [x] 🟠 GitHub Actions for auto-publishing to npm and deploying docs
- [x] 🟡 Dev server auto-restart on crash
- [x] 🟡 Components documentation page with usage examples and prop tables
- [x] 🟡 Interactive component previews in docs — live Svelte demos (button, badge, input, separator, avatar, card, dropdown-menu)
- [x] 🟡 Nested registry structure for `todo` components — subfolder pattern matching `ui/`, with group install (`bun x bosia@latest add todo`) and individual install (`bun x bosia@latest add todo/todo-form`)
- [x] 🟡 Nested docs sidebar — UI and Todo as sub-groups under Components
- [x] 🟠 SEO infrastructure — `Metadata` type supports `lang` and `link` fields; dynamic `<html lang>`; `<link>` tag rendering in streaming SSR
- [x] 🟡 Docs SEO — OG tags, Twitter cards, canonical URLs, hreflang alternates on all pages
- [x] 🟡 `robots.txt` and `sitemap.xml` generation for docs site

### v0.1.0

- [x] 🟡 Rename framework from `bosbun` to `bosia`
- [x] ⚪ Dead code cleanup (`renderSSR`, `buildHtmlShell`, unexported internals)
- [x] 🟡 `splitCsvEnv` helper for CSRF/CORS origin parsing

</details>

---

## v0.2.0 — Production Hardening

> Stability, security, and performance improvements for production workloads.

### Security

> Findings #1–#7 below come from the v0.4.5 security audit — see `backup/SECURITY_ISSUE_1.md` for full context, attack scenarios, and proposed diffs.

- [x] Cookie secure defaults — default `HttpOnly; Secure; SameSite=Lax` on `cookies.set()` with opt-out
- [x] Auto-detect `Cache-Control` on `/__bosia/data/` — `private, no-cache` when cookies accessed; `public, max-age=0, must-revalidate` otherwise
- [x] 🔴 `load()` `fetch` cookie scoping — `makeFetch` now forwards the `Cookie` header only to same-origin requests or origins in the `INTERNAL_HOSTS` allowlist; third-party hosts get no cookie. User-supplied `init.headers.cookie` is preserved
- [x] 🔴 **Audit #1** — `allowExternal` redirect validation — still validate against `javascript:`, `data:`, `vbscript:` schemes even when `allowExternal: true` (move `DANGEROUS_SCHEMES` check above the early return in `errors.ts:32`)
- [x] 🟠 **Audit #4** — Trusted proxy configuration — `TRUST_PROXY` env to control when `X-Forwarded-*` headers are trusted in CSRF checks (`csrf.ts:37-40`)
- [x] 🟠 **Audit #6** — CSP nonce infrastructure — per-request nonce generation, inject into all framework `<script>` tags, expose nonce in hooks for user scripts, opt-in `CSP_DIRECTIVES` env emits matching `Content-Security-Policy` header
- [x] 🟠 **Audit #2** — CORS preflight validation — validate `Access-Control-Request-Method` / `Access-Control-Request-Headers` against allowed config in `handlePreflight` (`cors.ts:53-69`)
- [x] 🟠 **Audit #3** — CORS `Vary: Origin` on all responses when CORS is configured — prevent CDN caching bugs on non-matching origins (set at `server.ts` request level, not only in `getCorsHeaders`)
- [x] 🟡 **Audit #5** — Validate prerender `entries()` return values — reject `/`, `\`, `..` in dynamic segment values before URL substitution (`prerender.ts:44-50`)
- [x] 🟡 Escape `lang` attribute in HTML shell — `<html lang="${lang}">` injects `lang` raw; if a `metadata()` derives `lang` from URL/user input it can break out of the attribute
- [x] ⚪ Validate `CORS_MAX_AGE` env — reject non-numeric values instead of producing `NaN` header

#### Security test coverage (from audit)

- [x] 🟡 Test: `allowExternal: true` still rejects `javascript:` / `data:` / `vbscript:` URLs
- [x] 🟡 Test: `handlePreflight` rejects when `Access-Control-Request-Method` is not in `allowedMethods`
- [x] 🟡 Test: `Vary: Origin` is present on CORS-configured responses even when requesting origin doesn't match
- [x] 🟡 Test: dedicated `safePath()` unit test file (currently only covered indirectly via static file serving)
- [x] 🟡 Test: `substituteParams()` rejects malicious entry values containing path-traversal characters
- [x] 🟡 Test: `TRUST_PROXY` env gates `X-Forwarded-*` header trust in CSRF checks

### Performance

- [x] 🟠 Parallelize client + server builds — run both `Bun.build()` calls with `Promise.all()` instead of sequentially (~500-1000ms savings)
- [x] 🟠 Parallelize Tailwind CSS with builds — run Tailwind CLI concurrently with client+server builds (~500-800ms savings); ensure output exists before manifest step
- [x] 🟡 Convert `sequence()` middleware recursion to loop — `apply(i+1, e)` pattern risks stack overflow with many handlers; use iterative approach

### Server Reliability

- [x] 🟠 Stream backpressure handling — check `controller.desiredSize` to prevent memory buildup on slow/disconnected clients
- [x] 🟠 Streaming SSR error recovery — render proper error page instead of bare `<p>Internal Server Error</p>` when `render()` throws mid-stream
- [x] 🟠 `renderPageWithFormData` loader error handling — currently does not catch `HttpError`/`Redirect` thrown from `loadRouteData()` after a successful form action; let them surface as proper redirect/error responses instead of crashing the request
- [x] 🟡 Prerender process cleanup — proper signal handling, verified termination (`await child.exited` after `kill()`), use random port instead of hardcoded 13572
- [x] 🟡 Fix `buildAndRestart` recursive tail call — replace recursion with `while` loop to prevent stack growth under rapid file changes

### Client

- [x] 🟡 Bound prefetch cache size — `prefetchCache` grows unbounded between navigations; add LRU eviction (max ~50 entries)
- [x] 🟡 Prefetch cache TTL — stale prefetch data served after long idle; discard entries older than 30s on `consumePrefetch()`
- [x] 🟠 Router click handler must respect modifier/middle clicks — `router.svelte.ts` currently SPA-navigates on Cmd/Ctrl/Shift/Alt+click and middle-click, breaking "open in new tab/window". Bail when `e.button !== 0`, any modifier key is held, `e.defaultPrevented`, or anchor has `rel="external"`

### Build

- [x] 🟡 Fail build on tsconfig.json corruption — don't silently continue with degraded config
- [x] 🟡 `compress()` threshold uses character count not byte count — `body.length` on a UTF-8 string under-counts multi-byte content; switch to `Buffer.byteLength` or `TextEncoder().encode(...).length` before threshold check
- [x] 🟡 `.env` parser inline-comment stripping — `KEY="value" # note` currently keeps ` # note` as part of the value; strip trailing comment after the closing quote
- [x] ⚪ Tune gzip compression threshold — raised to 2KB (`GZIP_MIN_BYTES = 2048`); small responses fit in single TCP packet, gzip overhead outweighs savings below this size

### DX

- [x] 🟠 **Audit #7** — Dev proxy must forward `X-Forwarded-Host` / `X-Forwarded-Proto` to the inner app server (`dev.ts:208-220`) — without them the inner CSRF check derives `expectedOrigin = http://localhost:APP_PORT` while the browser's `Origin` is `http://localhost:DEV_PORT`, causing same-origin POST/form actions to 403 in dev (audit rates 🟡 — DX-only, production unaffected — but keeping 🟠 per project policy)
- [x] 🟡 Stale env cleanup in dev — reset removed `.env` vars on hot-reload

---

## v0.2.1 — Features & DX

> New capabilities and developer experience improvements.

### Data Loading

- [x] 🟠 `depends()` and `invalidate()` — selective data reloading
- [x] 🟡 Prefetch sends the loader cache mask — hover/viewport `data-bosia-preload` was warming the data endpoint with no mask, re-running every loader server-side; now it sends the same `_invalidated` bits as a real nav
- [ ] 🟡 `setHeaders()` in load functions — set response headers from loaders

### Navigation

- [ ] 🟠 `beforeNavigate` / `afterNavigate` lifecycle hooks
- [ ] 🟠 Scroll restoration and snapshot support (`export const snapshot`)

### Routing

- [ ] 🟠 Layout reset (`+layout@.svelte` or `+page@.svelte`)
- [x] 🟠 Route-level `+error.svelte` — per-layout error boundaries instead of global-only
- [x] 🟡 Page option: `ssr` toggle (`export const ssr = false`)
- [x] 🟡 Page option: `trailingSlash` configuration

### Forms

- [x] 🟠 `use:enhance` progressive enhancement — client-side fetch submission with automatic form state management (like SvelteKit)

### Types

- [x] 🟠 Typed route params — generate `{ slug: string }` from `[slug]` instead of `Record<string, string>`
- [x] 🟡 Error page types in generated `$types.d.ts`

### Server

- [ ] 🟡 Structured logging with request correlation IDs

### DX

- [ ] 🟡 Cache route scanning in dev mode — skip `fs.readdirSync()` re-scan when changed file is not a route file (`+page`/`+layout`/`+server`/`+error`)
- [ ] 🟡 Remove hardcoded 200ms SSE delay — poll `/_health` instead of `Bun.sleep(200)` before broadcasting reload
- [ ] 🟡 Smarter dev rebuild triggers — filter watcher by extension; skip rebuilds for `.md`, test files, and non-source changes

---

## v0.2.2 — Ecosystem, Observability & Scale

> Nice-to-haves for a growing framework and performance at scale.

- [ ] 🟡 Production sourcemaps — external source maps for debuggable production errors

### Performance (at scale)

- [x] 🟠 Request deduplication — deduplicate concurrent identical GET requests to same route; share in-flight loader promise instead of running twice. Scope dedup key by route+params (exclude user-specific loaders). Reworked in 0.3.1 around a folder convention: dedup ON by default keyed on URL only; per-user routes opt out by living under `(private)`
- [x] 🔴 Dedup key cross-user data leak — replaced cookie-fingerprint identity with a folder convention. Routes under any `(private)` group folder skip dedup entirely and run per-request; all other routes are deduped on URL alone. Apps with per-user content must place routes under `(private)` (dashboards, carts, settings) or User B will receive User A's loader result. See `docs/guides/request-deduplication.md` for safety rules
- [ ] 🟡 Trie-based route matcher — replace linear O(n) route scan with radix trie for O(k) matching (k = URL segments). Matters when route count exceeds ~100
- [x] 🟡 Compiled route regex — pre-compile route patterns to `RegExp` at startup instead of parsing on every match

---

## v0.2.3 — CLI & Feature Installer

> Per-file install strategies so features can safely contribute to shared files.

### CLI / Feat

- [x] 🟠 `bosia feat` per-file strategies — `meta.json` `files: FileEntry[]` with `strategy` field: `write` (default), `skip-if-exists`, `append-line`, `append-block`, `merge-json`. Replaces all-or-nothing replace prompt for shared files like `src/features/drizzle/schemas.ts`
- [ ] 🟡 Document `meta.json` schema and strategies in `docs/` (CLI / `bosia feat` page)
- [ ] 🟡 `bosia feat <name> --dry-run` — preview file actions (write/skip/append/merge) without touching disk
- [ ] 🟡 Validation: error early when two installed features write to the same target with `write` strategy (force one to declare append-line/append-block)
- [ ] 🟠 `auth` feature scaffold — uses `append-block` to register hooks in `src/hooks.server.ts` and routes barrel
- [ ] 🟡 `s3` / `storage` feature — bucket client + upload route using new strategies
- [ ] 🟡 Track installed features per project (`.bosia/installed.json`) — enable `bosia feat list` and uninstall

---

## v0.3.0 — Test Integration (Phase 1 + 2)

> Built-in testing powered by `bun test`. See [TEST_PLAN.md](backup/TEST_PLAN.md) for full details.

### DX

- [x] 🟡 Prettier formatting — root config + scripts (`format`, `format:check`); all 3 templates ship matching `.prettierrc.json` so scaffolded projects format-on-create. Pre-commit hook auto-formats staged files. No lint.

### CLI

- [x] 🟠 `bosia test` command — wraps `bun test` with framework-aware defaults
- [x] 🟡 Auto-load `.env.test` (fallback `.env`) before running tests
- [x] 🟡 Set `BOSIA_ENV=test` automatically
- [x] 🟡 Pass through flags (`--watch`, `--coverage`, `--bail`, `--timeout`, etc.)
- [x] 🟡 Unit tests for core pure utilities (`matcher`, `cookies`, `csrf`, `cors`, `errors`, `html`, `dedup`, `env`)
- [x] 🟡 Unit tests for build/codegen helpers (`scanner`, `routeTypes`, `envCodegen`, `hooks.sequence`, `paths.resolveBosiaBin`, `lib/utils.cn`, `cli/registry.mergePkgJson`, `prerender` path/URL helpers)

### Test Utilities (`bosia/testing`)

- [ ] 🟠 `createRequestEvent()` — mock factory for testing `+server.ts` handlers and hooks
- [ ] 🟠 `createLoadEvent()` — mock factory for testing `load()` functions
- [ ] 🟡 `createMetadataEvent()` — mock factory for testing `metadata()` functions
- [ ] 🟠 `mockCookies()` — in-memory cookie jar implementing `Cookies` interface
- [ ] 🟡 `mockFetch()` — fetch interceptor for isolating loaders
- [ ] 🟡 `createFormData()` — helper for building form action payloads

---

## v0.3.1 — Route & API Integration Testing (Phase 3)

> Test routes end-to-end without starting a real server.

- [ ] 🟠 `createTestApp()` — build an in-process Elysia instance from the route manifest
- [ ] 🟠 `testRequest()` — send HTTP requests to the test app, get standard `Response` back
- [ ] 🟠 Support API routes, page routes (SSR HTML), and form actions
- [ ] 🟡 Response assertion helpers: `expectJson()`, `expectRedirect()`, `expectHtml()`

---

## v0.3.2 — Component Testing (Phase 4)

> Render and assert on Svelte 5 components in tests.

- [ ] 🟠 `renderComponent(Component, { props })` — SSR render a component, return HTML
- [ ] 🟠 `renderPage(route, options?)` — full SSR pipeline (loader → layout → page)
- [ ] 🟡 Snapshot testing support (built into `bun test`)
- [ ] 🟡 Investigate `@testing-library/svelte` compatibility with Bun

---

## v0.4.0 — Plugin Core

> First-party plugin system. Standardize OpenAPI / OpenTelemetry / server-timing as plugins; let third parties drop in any Elysia plugin. Full design in `plans/plugin-feature.md`.

### Config & Types

- [x] 🔴 `bosia.config.ts` loader — `packages/bosia/src/core/config.ts`; resolve from `process.cwd()`, compile via `Bun.build({ target: "bun" })`, cache, default to `{ plugins: [] }`
- [x] 🔴 Public types in `packages/bosia/src/lib/index.ts` — `BosiaPlugin`, `BosiaConfig`, `BuildContext`, `DevContext`, `RenderContext`, `defineConfig` helper

### Elysia Hooks

- [x] 🔴 `backend.before` / `backend.after` mount points in `server.ts` — `before` runs raw routes (e.g. `/openapi.json`) bypassing framework middleware; `after` receives `RouteManifest` for introspection

### Build Hooks

- [x] 🟠 `build.preBuild` / `build.postScan` / `build.postBuild` in `build.ts` — call `preBuild` before `loadEnv`, `postScan` after `scanRoutes()`, `postBuild` after `generateStaticSite()`
- [x] 🟠 `build.bunPlugins(target)` merged into client + server `Bun.build()` plugin arrays

### Render Hooks

- [x] 🟠 `render.head` fragments injected before `</head>` in `buildMetadataChunk`
- [x] 🟠 `render.bodyEnd` fragments injected before `</body>` in `buildHtmlTail`
- [x] 🟠 `RenderContext` (request, route, metadata) threaded from `renderer.ts` into `html.ts` builders

### First-Party Plugin

- [x] 🟠 `bosia/plugins/server-timing` — exercises `backend.before`; adds `Server-Timing: handler;dur=...` header

### Docs & Demo

- [x] 🟡 `docs/content/docs/guides/plugins.md` — usage guide
- [x] 🟡 `apps/demo/bosia.config.ts` — server-timing wired

---

## v0.4.1 — OpenAPI Plugin

> Auto-bridge file routes to OpenAPI spec.

- [ ] 🟠 `bosia/plugins/openapi` first-party plugin
- [ ] 🟠 `build.postScan` reads `RouteManifest`, emits `dist/openapi.json`
- [ ] 🟠 Runtime mount via `backend.before` — `GET /openapi.json`, `GET /docs` (Scalar/Swagger UI)
- [ ] 🟡 Optional `schema` export on `+server.ts` (TypeBox or Zod, decide later)
- [ ] 🟡 Docs: OpenAPI usage page

---

## v0.4.2 — OpenTelemetry Plugin

> Tracing + metrics for production apps.

- [ ] 🟠 `bosia/plugins/opentelemetry` first-party plugin
- [ ] 🟠 OTLP exporter config via env vars (`OTEL_EXPORTER_OTLP_ENDPOINT`, etc.)
- [ ] 🟠 Trace `backend.before` request → response, `load()` calls, render time
- [ ] 🟡 Verify `dev` parity — telemetry must work in `bosia dev`

---

## v0.4.1 — Inspector Plugin ✅ (shipped 2026-05-06)

> Click element in browser → open exact source file:line in editor / hand off to AI agent. No Vite, no React-style fiber tree — does it via compile-time attribute injection.

### Compile-Time

- [x] 🟠 `bosia/plugins/inspector` first-party plugin (dev-only)
- [x] 🟠 Contributes Bun plugin via `build.bunPlugins()` — runs before `SveltePlugin()` and replaces its `.svelte` `onLoad` with an injecting variant
- [x] 🟠 Parses `.svelte` source with `svelte/compiler` `parse()`, walks `RegularElement` nodes, injects `data-bosia-loc="<relpath>:<line>:<col>"` via `magic-string` (preserves source maps)
- [x] 🟡 Skips `<svelte:*>` and component (capitalized) tags
- [x] 🟡 Strips attribute from production builds (no-op when not dev)

### Runtime Overlay

- [x] 🟠 Dev-only client overlay injected via `render.bodyEnd` — alt+hover highlights element, alt+click captures `data-bosia-loc`
- [x] 🟠 `POST /__bosia/locate` endpoint (mounted via `backend.before`) — receives `{ file, line, col }`, opens editor (or POSTs to `aiEndpoint` with comment)
- [x] 🟡 Editor integration — `code -g file:line` (configurable via `inspector({ editor: "code" | "cursor" | "zed" })`)
- [x] 🟡 Toast feedback — overlay shows "opened <file>:<line>" on click

### Docs

- [x] 🟡 `docs/content/docs/guides/inspector.md` — usage + AI-agent workflow

---

## v0.4.2 — Template fixes ✅ (shipped 2026-05-07)

> Make a freshly scaffolded project pass `bun run check` out of the box.

- [x] 🟠 Ship `.gitignore` with `bun x bosia create` — npm pack strips `.gitignore`, so templates store it as `_gitignore` and `copyDir` restores the dotfile name on copy
- [x] 🟡 Ignore generated Tailwind output `public/bosia-tw.css` in template `.prettierignore` and `.gitignore` (default, demo, todo) so `bun run check` succeeds on a clean scaffold
- [x] 🟡 `bun run check:templates` — packs via `bun pm pack`, extracts the tarball, and asserts each `templates/*` still has the expected files (no install, no scaffold) so this class of regression fails locally before publishing

---

## v0.5.1 — Inspector default in all templates ✅ (shipped 2026-05-15)

> Ship every scaffolding template with a minimal `bosia.config.ts` so freshly scaffolded projects get Alt+click-to-source out of the box.

- [x] 🟡 Add `bosia.config.ts` to `packages/bosia/templates/{default,demo,todo}/` enabling `inspector({ editor: "code" })`. `copyDir` in `cli/create.ts` copies it as-is (not in the exclusion list); no template substitutions needed. Production-safe (plugin self-disables under `NODE_ENV=production`)
- [x] ⚪ Note preconfigured state in `docs/content/docs/guides/inspector.md` so existing-project users still find the manual setup steps

---

## v0.5.5 — Dev/Build dist collision ✅ (shipped 2026-05-18)

> Dev and build no longer share `./dist`. Dev writes to `.bosia/dev/`; standalone `bun run build` keeps writing to `./dist/`.

- [x] 🟠 Decouple URL namespace (`/dist/client/...`) from on-disk location via `OUT_DIR` in `paths.ts` (reads `BOSIA_OUT_DIR`, default `./dist`)
- [x] 🟠 `dev.ts` hardcodes `.bosia/dev` and passes `BOSIA_OUT_DIR` to spawned build + app-server children; never reads the env itself
- [x] 🟠 `build.ts`, `prerender.ts`, `html.ts`, `server.ts`, `cli/start.ts` all read from `OUT_DIR` instead of hardcoded `./dist` literals
- [x] 🟡 Verification path: `BOSIA_OUT_DIR=.bosia/verify bun run build` produces full artifacts (manifest, client, server, prerendered, static, route-manifest) without touching `./dist`. Catches what `tsc --noEmit` + `svelte-check` miss (route scan, prerender child, server-entry compile). Verified at `apps/demo`

---

## v0.5.6 — Build/dev `.bosia/` cleanup collision ✅ (shipped 2026-05-18)

> Follow-up to v0.5.5. `OUT_DIR` was split, but `build.ts` still blanket-wiped `./.bosia` at startup — clobbering a concurrently-running `bosia dev` whose compiled server lives at `.bosia/dev/`. Cleanup is now scoped.

- [x] 🔴 `build.ts` cleanup is scoped to `OUT_DIR` (this build's artifacts) plus only the codegen files this build owns (`.bosia/routes.ts`, `.bosia/routes.client.ts`, `.bosia/env.server.ts`, `.bosia/env.client.ts`, `.bosia/types`). No more blanket `.bosia/` rmSync. Fixes `ENOENT reading .bosia/dev/server/+page-*.js` mid-request when `bun run build` runs alongside `bun run dev`.

---

## v0.5.7 — `params` as a top-level page/layout prop ✅ (shipped 2026-05-19)

> Match SvelteKit: `+page.svelte` and `+layout.svelte` receive `params` as a sibling prop of `data`, not nested under `data.params`. Network protocol (data endpoint payload, SSR injection) is unchanged — `params` is stripped at the component boundary.

- [x] 🟠 `App.svelte` passes `params` as a separate prop on pages and layouts; SSR branch strips merged `params` off `pageData` via local helper
- [x] 🟠 `hydrate.ts` seeds `appState.pageData` without the merged `params` key (still seeds `appState.routeParams` from same payload)
- [x] 🟠 `routeTypes.ts` codegen: `PageData` / `LayoutData` no longer intersect `{ params: Params }`; `PageProps` / `LayoutProps` declare `params: Params` as a sibling of `data`
- [x] 🟡 Update demo + template `blog/[slug]/+page.svelte` and docs (`README.md`, `docs/content/docs/guides/routing.md`) to consume `params` as a top-level prop
- [x] 🟡 Standardize `default` and `todo` starter templates on the `(public)/` route group convention used by `demo`, so scaffolded projects are ready to add authenticated areas (e.g. `(app)/`, `(admin)/`) without restructuring later

### Same-day addition (2026-05-19) — Inspector runtime error capture

> Inspector now captures live client + server runtime errors and surfaces them in a passive badge inside the running app. Manual "Send to AI" per row reuses the existing alt-click → `aiEndpoint` handoff. Live-only (no server buffer, no SSE replay), dev-only (production unaffected — plugin self-disables).

- [x] 🟠 Server capture: Elysia `.onError()` hook + `uncaughtException` / `unhandledRejection` process listeners installed lazily inside `backend.before()`. `uncaughtException` rethrows so `dev.ts` crash-recovery still triggers. 500ms dedup window on `source:message:firstFrame` prevents render-loop floods (`packages/bosia/src/core/plugins/inspector/index.ts`)
- [x] 🟠 SSE broadcaster at `/__bosia/errors` — module-scoped controller Set, `event: bosia-error` data frames, 25s `:ping` keepalive, abort-driven cleanup. No replay buffer (live-only contract)
- [x] 🟠 Reorder Elysia onError chain in `server.ts`: base 500 responder now registered **after** `plugin.backend.before` loop so plugin handlers fire first. Without this fix the inspector handler would never run because the base handler returned a truthy Response and short-circuited the chain
- [x] 🟠 Client capture in `overlay.ts`: `window.error` + `unhandledrejection` listeners + EventSource subscription to `/__bosia/errors`. Unified list, stable ids, UI dedup
- [x] 🟠 Floating badge UI bottom-right (`● N errors`) → click → expandable panel with per-row stack details, Dismiss, and AI-only "Send to AI" button. Badge hidden when list empty
- [x] 🟠 Sourcemap resolution dev-only — `build.ts` now emits `sourcemap: "linked"` in dev (`"none"` in production). New `inspector/sourcemap.ts` lazy-resolves compiled stack frames → source `(file, line, col)` via `@jridgewell/trace-mapping` at POST time only for the error the user clicks "Send to AI" on. Per-process `Map<path, TraceMap>` cache; cache resets on app respawn so edits are never stale. Graceful degradation when `.map` is missing
- [x] 🟡 Last-interaction context: track the most recent `data-bosia-loc` the user clicked/keyed on and append `Last user interaction: <file>:<line>:<col>` to the comment payload. Helps the AI when the throw site is deep in framework code but the originating button/input is the relevant location
- [x] 🟡 `errorsEnabled?: boolean` (default `true`) config flag on `InspectorOptions` — opt out of the whole feature without removing the plugin
- [x] 🟡 AI-only action button — overlay still surfaces the badge for visibility without `aiEndpoint`, but the "Send to AI" button only renders when configured. Standalone bosia apps in editor-mode see display-only errors

---

## v0.5.8 — `bind:*` shadow crash fix ✅ (shipped 2026-05-19)

> Dev pages using `<input bind:value={state}>` (or any `bind:*` on writable state) crashed the browser with `RangeError: Maximum call stack size exceeded` on first render. Root cause was a name collision between Svelte 5's dev compile output and Bun's bundler — Svelte wraps the binding in a named `function get()` for `$inspect` stack traces; Bun rewrites `$.get` to a named import `get`; the function name then shadows the import and recurses into itself. Production was unaffected (anonymous arrow functions).

- [x] 🔴 Post-process Svelte compile output in `packages/bosia/src/core/plugins/inspector/bun-plugin.ts` and `packages/bosia/src/core/svelteCompiler.ts` to rename the inner `get` / `set` to `$$g` / `$$s` (length-preserving so cached source-map columns stay accurate, names absent from `svelte/internal/client` exports). Dev-only — prod compile uses anonymous arrows so the shim is skipped.
- [x] 🔴 Inject Inspector-extracted component CSS via a runtime `<style>` element instead of a `loader: "css"` virtual module. Bun's `splitting: true` names CSS chunks after the importing JS chunk's `[name]` (not the virtual module's uid), so when ≥2 routes share a styled `.svelte` component the bundler emits identical `+page-<hash>.css` chunks and fails with `Multiple files share the same output path`. Runtime injection sidesteps CSS chunking entirely. Dev-only — Inspector is disabled in prod.

---

## v0.5.9 — `src/app.html` template ✅ (shipped 2026-05-20)

> SvelteKit-style document shell customization. Users can create `src/app.html` with `%bosia.head%` and `%bosia.body%` placeholders to control HTML chrome (lang attribute, data attributes, favicon, analytics script placement). Immediate trigger: runtime lang mutation from metadata (honors cookie/header). Broader value: full chrome control without hardcoding.

- [x] 🟠 `packages/bosia/src/core/appHtml.ts` — parse, validate, cache template with invalidation for HMR
- [x] 🟠 Placeholders: `%bosia.head%`, `%bosia.body%` (required); `%bosia.lang%`, `%bosia.nonce%`, `%bosia.assets%`, `%bosia.env.PUBLIC_*%` (optional)
- [x] 🟠 Update `html.ts` builders (`buildHtml`, `buildHtmlShellOpen`, `buildMetadataChunk`, `buildHtmlTail`) to accept optional segments and slot user chrome
- [x] 🟠 Update `renderer.ts` to load template once per process and thread through 6 call sites
- [x] 🟠 Validation at build time in `build.ts` — fail fast if required placeholders missing
- [x] 🟡 Scaffold `src/app.html` in templates (`default`, `todo`) and demo with `%bosia.lang%` and `data-theme` attributes
- [x] 🟡 Favicon detection: if user's `headOpen` contains `rel="icon"`, skip framework default favicon injection
- [x] 🟡 Unit tests: template loading, validation, parsing, caching, interpolation, segment structure
- [x] 🟡 New skill `bosia-app-css` documenting canonical `src/app.css` order and the Tailwind v4 / LightningCSS `@import url(...)` ordering rule (font imports must come before `@import "tailwindcss"`, else silently dropped from `public/bosia-tw.css`). Catalog index `docs/content/skills/SKILL.md` updated (33 → 34 skills); slotted under design conventions next to `bosia-theme-tokens`. Trigger: real-world incident in `toko-mainan-anak` where Fredoka font-family declarations rendered but the Google Fonts `@import` was stripped by LightningCSS because it sat after `@source "../src"`.
- [x] 🟡 New CLI command `bosia add font "<Family>" "<url>"` (`packages/bosia/src/cli/font.ts` → reuses existing `mergeFontImports()` from `cli/fonts.ts`). Prepends `@import url(...)` to `src/app.css` with `/* bosia-font: <Family> */` marker so it survives Tailwind v4 / LightningCSS ordering. Idempotent. Wired into `cli/index.ts` (`add font` subcommand) with usage and example. Companion AI tool `bosia_add_font` added in Bosapi (`bosapi/src/features/ai/tools/bosia.ts`) so the agent stops hand-editing app.css and uses the safe path.

---

## v0.5.10 — `$types` resolution inside `.svelte` files

> `tsc --noEmit` resolves `./$types` from `.svelte` files via the `rootDirs: [".", ".bosia/types"]` trick, so `bun run check` and `bun run build` both type-check `params` / `PageProps` correctly. But `svelte-language-server` (used by Zed, VS Code w/ Svelte extension, etc.) runs `.svelte` script blocks through a preprocessor and doesn't honor `rootDirs` from inside that virtual TS document — the editor reports `Cannot find module './$types'` and `params` collapses to implicit `any`. SvelteKit avoids this by shipping a dedicated language-tools plugin (`@sveltejs/language-tools`) that **synthesizes** `$types` virtually at LSP time. Bosia needs the same.
>
> Acceptance: in a freshly scaffolded Bosia app, hovering `PageProps` in `+page.svelte` shows the generated type, autocomplete on `params.` lists only the route's dynamic segments, and no "module not found" diagnostic appears for `./$types`. Same behavior in Zed and VS Code.

- [ ] 🟠 Investigate options: (a) TypeScript Language Service plugin that hooks `moduleResolution` for `$types` specifiers from `.svelte` files; (b) fork/extend `svelte-language-server` config; (c) shim by re-exporting from a plain `.ts` barrel the LSP already sees. Pick the lowest-friction path.
- [ ] 🟠 Ship the plugin/shim from `packages/bosia` and wire it into the scaffolding templates' `tsconfig.json` (`compilerOptions.plugins` or `svelte.config.js`) so new apps work out of the box.
- [ ] 🟡 Verify in Zed and VS Code on `apps/demo/src/routes/(public)/blog/[slug]/+page.svelte`: hover shows `Params = { slug: string }`, autocomplete on `params.` lists `slug`, typing `params.foo` red-squiggles.
- [ ] 🟡 Document the editor setup step in `docs/content/docs/guides/routing.md` (or a new "Editor setup" guide) — what extension to install, what `tsconfig.json` looks like.
- [ ] ⚪ Note the limitation + workaround in the meantime under `docs/content/docs/reference/sveltekit-differences.md`.

---

## v0.5.4 — Brief intake skills ✅ (shipped 2026-05-17)

> Six new design-track skills that gather product brief (identity / voice / visual / platform) into `BRIEF.md` at app root before any UI emit. Closes the "agent invents palette + tone every turn" drift bug.

- [x] 🟠 `bosia-brief-intake` — orchestrator. Walks the four group skills in order, writes `BRIEF.md`, chains `bosia-brief-review`. Auto-trigger surface: empty BRIEF.md.
- [x] 🟡 `bosia-brief-identity` — name, tagline, audience, language, formality, self-reference. Locks sapaan + UI string language for the rest of the session.
- [x] 🟡 `bosia-brief-voice` — tone adjectives, emoji/exclamation policy, microcopy spine table (5 rows: empty / error / confirm-destructive / success / primary action), domain glossary, copy no-go.
- [x] 🟡 `bosia-brief-visual` — palette intent → theme pick decision matrix, shape, density, type, icons, custom marks. Runs `bosia_add_theme` + `--primary`/`--accent` override.
- [x] 🟡 `bosia-brief-platform` — form factors, primary surface, ID format regex, number/date `Intl` formatters, imagery aspect ratios, first-screen scaffold queue, MVP feature list (cap 7).
- [x] 🟡 `bosia-brief-review` — quality gate. P0/P1 checks: sections complete, theme installed matches brief, formatter modules scaffolded, sapaan consistent, no emoji leak in product strings, first-screen names resolve to real catalog entries.
- [x] 🟡 Catalog `SKILL.md` index updated — 25 → 31, new section "Brief intake — design ✦", discovery order gains step 0 "check BRIEF.md".

### Hotfix (same-day, 2026-05-17)

- [x] 🔴 Fix `bosia dev` build crashing with `Multiple files share the same output path` on apps with multiple style-less `+page.svelte` routes. `inspector`'s per-svelte virtual CSS chunk (`packages/bosia/src/core/plugins/inspector/bun-plugin.ts`) now skips emission when `result.css.code` is empty/whitespace, and replaces dots in the basename so Bun's `[name]-[hash].[ext]` chunk naming yields a unique `[name]` per route instead of collapsing every `+page.svelte` to `[name]="+page"`. Production builds were unaffected (inspector self-disables under `NODE_ENV=production`).

### Same-day addition (2026-05-17)

- [x] 🟡 `bosia-frontend-design` — new design-convention skill. Forces aesthetic stance (direction / typography / dominant colour + sharp accent / one memorable detail) before any UI emit. Avoids the "AI default" look (soft purple gradient, Inter, evenly-distributed feature cards). Adapted from `nexu-io/open-design` `frontend-design`; bodies rewritten for Svelte 5 + Bosia semantic tokens + registry-first composition. Ships with `references/aesthetic-directions.md` (11 starter directions: brutally-minimal, editorial, brutalist, retro-futuristic, maximalist, soft-pastel, luxury, industrial, organic, playful, art-deco) and a `BRIEF.md § Aesthetic` template. Catalog `SKILL.md` index 31 → 32; design-conventions section gains the third row.
- [x] 🟡 `bosia-frontend-design` wired into `bosia-brief-intake` as step 4 (after `bosia-brief-visual`), so every new app's BRIEF.md ends with a populated `## Aesthetic` section before any feature work. Quick-start opener bumped 5 → 6 questions. `bosia-brief-visual` hands off to the stance step. `bosia-brief-review` gains P0 checks B18 (stance committed, no AI-default direction/fonts), B19 (fonts wired in `app.css @theme`, not per-component), B20 (accent override applied to `:root` so the stance is load-bearing, not decorative). Halting failure extends to B1–B10 + B18–B20.
- [x] 🟡 Stance consumption wired downstream — no collision with stance-picking. `bosia-design-review` gains a P1 check confirming each emit honors § Aesthetic (direction, memorable detail, fonts from `app.css @theme`) without re-picking. Six page scaffolds (`bosia-landing`, `bosia-saas-landing`, `bosia-blog`, `bosia-pricing`, `bosia-mobile-screen`, `bosia-dashboard`) gain a workflow step 1 "Read BRIEF.md § Aesthetic and apply" plus a matching P0 item. Each scaffold is a pure consumer of the stance — no skill duplicates stance-picking responsibility.
- [x] 🟡 `bosia-brief-intake` ships first two reference files: `references/quick-start-script.md` (6-question opener with palette-intent → direction inference defaults) and `references/example-brief.md` (Dombaku-style fully-filled BRIEF.md including § Aesthetic). Frontmatter `targets.files` on `bosia-frontend-design` (BRIEF.md + src/app.css) and `bosia-brief-intake` (+ src/app.css) updated. Catalog `SKILL.md` Brief-intake table gains a footnote pointing readers to the stance step under design conventions.

---

## v0.5.3 — API prerender ✅ (shipped 2026-05-16)

> Same prerender ergonomics for `+server.ts` routes as pages already had. Drop the docs-only static-API post-build pipeline.

- [x] 🟠 Framework: `+server.ts` honors `export const prerender = true` — `detectPrerenderRoutes` scans `manifest.apis`, dynamic routes call `entries()`, `prerenderApiOutPath()` writes a single `.json` per route (no trailing-slash variants). Fetched body is written verbatim — handlers decide the payload shape (`packages/bosia/src/core/prerender.ts`)
- [x] 🟡 Dev runtime alias: API routes with `prerender = true` are also served at `<path>.json`, matching the URL static hosts will serve in prod. Non-prerender routes get no alias (`packages/bosia/src/core/server.ts`)
- [x] 🟡 Unit tests for `prerenderApiOutPath` and `substituteParams` rest-segment cases (`packages/bosia/test/prerender-api.test.ts`)
- [x] 🟡 Docs API routes migrated: `/api/skills`, `/api/skills/[name]`, `/api/components`, `/api/components/[...path]`, `/api/blocks`, `/api/blocks/[...path]` all opt into framework prerender. Dynamic routes export `entries()` from `listSkills()` / `listRegistry()`
- [x] 🟡 Removed `generateSkillsApi()` + `generateRegistryApi()` from `docs/scripts/post-build.ts` — post-build returns to sitemap-only

### Hotfix (same-day, 2026-05-16)

- [x] 🔴 Fix dev `.json` alias resolution: catch-all sibling routes (`/api/components/[...path]`, `/api/blocks/[...path]`, `/api/skills/[name]`) were absorbing the `.json` suffix into their rest-segment param, causing 4xx in dev. Logic now tries the bare path first when the URL ends in `.json` and prefers it only if the matched route opted into `prerender = true`. Extracted into `packages/bosia/src/core/apiResolver.ts` so it can be unit-tested independently of the bundler-virtual `bosia:routes` module
- [x] 🔴 Fix `/api/skills/<name>` JSON shape: was emitting raw `SKILL.md` markdown into a `.json` file. Handler now returns `Response.json({ name, content })` with frontmatter stripped via `gray-matter`, matching the v0.5.2 post-build shape
- [x] 🟡 New `packages/bosia/test/apiResolver.test.ts` — 10 cases covering flat-route alias, catch-all precedence, `[name]` precedence, non-prerender fall-through, and `module()` throw → fallback
- [x] 🟡 New `docs/test/api-prerender.test.ts` — post-build sanity over `dist/static/api/**/*.json`: every artifact parses as JSON; list endpoints expose `{skills|components|blocks}[]`; skill detail returns `{name, content}` (not raw `---` markdown); component/block detail returns `{name, content, ...}`. Would have caught both hotfix bugs at v0.5.3 release
- [x] 🟡 Renamed registry detail field `mdFile` → `content` in `/api/components/<path>` and `/api/blocks/<path>` responses to match `/api/skills/<name>` shape (`docs/src/lib/registry/list.ts`)
- [x] 🔴 Fix production-build docs crash on every page with code blocks (`b is not a function (b({}))` / `A is not a function (createHighlighter)`). Lazy `await import("shiki")` triggered Bun code-splitter to produce a chunk that called into its parent at top-level eval before the parent's named exports were initialized. Switched to static `import { createHighlighter } from "shiki"` in `docs/src/lib/docs/markdown.ts` — shiki is now bundled inline with the page-server bundle, no cross-chunk circular eval
- [x] 🟡 Normalize `path` field on `/api/skills`, `/api/components`, `/api/blocks` index + detail responses to the full detail-endpoint URL (e.g. `/api/components/ui/button.json`); skills detail gains `path`. Breaking for components/blocks index consumers that read bare-segment `path`. Internal `RegistrySummary.path` and `entries()` prerender seed remain segment-form (test in `docs/test/api-prerender.test.ts` asserts full-URL shape and on-disk resolution)

---

## v0.5.2 — CLI ergonomics & registry API ✅ (shipped 2026-05-15)

> Multi-component install and AI-discovery parity with skills.

- [x] 🟠 `bosia add` accepts multiple component names in one call; new `-y`/`--yes` flag auto-confirms overwrite prompt for CI use
- [x] 🟡 Static `/api/components.json` + `/api/components/{path}.json` and `/api/blocks.json` + `/api/blocks/{path}.json` emitted by `docs/scripts/post-build.ts` (superseded in v0.5.3 by the framework prerender)

---

## v0.4.4 — Build CSS collision hotfix ✅ (shipped 2026-05-09)

> Republish of 0.4.3 with a missed regression in the Svelte build path fixed.

- [x] 🔴 Restore `app.css` → JS no-op resolve in `core/plugin.ts`. Without it, every dynamic-imported route chunk that transitively reaches `app.css` produces an identical CSS sidecar (`+page-<hash>.css`) and Bun fails the build with `Multiple files share the same output path`. Tailwind CLI continues to emit the real stylesheet at `public/bosia-tw.css` (loaded via `<link>`); the bundler never needs the source CSS
- [x] 🟡 Regression test `packages/bosia/test/svelte-build.test.ts` — 12 dummy routes + shared app.css; fails without the no-op, passes with it

---

## v0.4.3 — Request pipeline perf ✅ (shipped 2026-05-09)

> Cut redundant work from the per-request hot path.

### Done

- [x] 🟠 Resolve page route once per request and thread through `renderSSRStream` / `renderPageWithFormData` / form-action handler
- [x] 🟡 Cache `getPublicDynamicEnv()` at module scope
- [x] 🟠 Linear `parent()` data merging in layout loaders — O(d²) → O(d) with per-layer snapshot
- [x] 🟡 Drop redundant `onBeforeHandle` apiRoutes scan; non-GET catch-alls already cover every method
- [x] 🟠 Inline Svelte compile, drop `bun-plugin-svelte` — own `.svelte` / `.svelte.[tj]s` `onLoad` with `css: "injected"` (browser) / `css: "external"` (server). Eliminates the dynamic-import CSS-sidecar collision at the root and removes the double-compile workaround in `core/plugin.ts`

### Open

- [ ] 🟠 **Truly progressive SSR streaming** — `renderSSRStream` is currently blocking before first byte (load → render → enqueue prebuilt chunks). Real blocker is a parallel-aware loader runner that can flush layout/page chunks as each loader resolves (the trie matcher is unrelated — tracked separately under Performance (at scale)). `depends()` / `invalidate()` (shipped v0.5.0) is no longer a prerequisite
- [x] 🟡 **Reduce `safeJsonStringify` cost on large loader payloads** — done in v0.5.0 by migrating `__BOSIA_PAGE_DATA__`, `__BOSIA_LAYOUT_DATA__`, `__BOSIA_FORM_DATA__` to `<script type="application/json">` islands. Client reads via `JSON.parse(document.getElementById(id).textContent)`. Escape surface drops from 5 JS-context sequences to `</script` / `<!--` only; clean payloads are byte-identical to `JSON.stringify`. System globals (`__BOSIA_ENV__`, deps, SSR flag) kept as inline JS — small/fixed-shape, no benefit

> Reference: `backup/PERFORM_ISSUES.md` (full request-pipeline review, 2026-05-08).

---

## v0.4.5 — Blocks & Themes Registry

> Two new registry kinds: **Blocks** (composed UI sections) and **Themes** (token sets). Closes the design-quality gap for LLM-generated apps (Bosapi) and hand-coders alike. Primitives stay unchanged.

### CLI

- [x] 🟠 `bun x bosia@latest add block <category>/<name>` — install a block to `src/lib/blocks/<path>/`
- [x] 🟠 `bun x bosia@latest add theme <name>` — install a theme to `src/lib/themes/<name>.css`, patch `app.css` import
- [x] 🟡 Extend CLI dispatcher (`packages/bosia/src/cli/index.ts`) for `add block`/`add theme` sub-args
- [x] 🟡 Refactor `add.ts` — parameterize destination root; `RegistryIndex` gains `blocks: string[]`, `themes: string[]`
- [x] 🟡 `block.ts` handler — recursive primitive deps via `addComponent()`, optional font `@import` merge into `app.css`
- [x] 🟡 `theme.ts` handler — copy `tokens.css`, swap `@import` in `app.css` (one-active-theme), font `@import` merge

### Registry content

- [x] 🟠 Extend `registry/index.json` with `blocks` and `themes` arrays
- [x] 🟠 `registry/themes/neutral/` — extracted from current `apps/demo/src/app.css` `@theme` block
- [x] 🟠 `registry/themes/editorial/` — warm cream palette + Instrument Serif display
- [x] 🟠 `registry/blocks/cards/feature-editorial/` — first block; matches Open Design reference (eyebrow numeral, serif title, tight leading, circular CTA)
- [x] 🟡 Refactor `apps/demo/src/app.css` to `@import "./lib/themes/neutral.css"` (visually unchanged)

### Docs

- [x] 🟡 `docs/content/docs/blocks/overview.md` + per-block pages
- [x] 🟡 `docs/content/docs/themes/overview.md` + per-theme pages + `creating-themes.md`
- [x] 🟡 `CardFeatureEditorialDemo.svelte` registered in `nav.ts` and `[...slug]/+page.svelte` demos map

---

## v0.5.0 — Full Plugin Lifecycle

> Complete the plugin surface; uninstall + virtual modules.

- [ ] 🟠 `dev.onStart` + `dev.onFileChange` wired in `dev.ts`
- [ ] 🟠 `client.onHydrate` + `client.onNavigate` in `core/client/hydrate.ts` + `router.svelte.ts`
- [ ] 🟠 Virtual modules from plugins — extend `core/plugin.ts` resolver pattern
- [ ] 🟡 Plugin uninstall via `bosia feat`
- [ ] 🟡 Docs: full plugin authoring guide

---

## v0.6.0 — E2E Testing & Docs (Phase 5 + 6)

> Full browser testing with Playwright + comprehensive test docs.

- [ ] 🟠 `startTestServer()` — spin up a real Bosia server on a random port for E2E
- [ ] 🟠 `bosia test --e2e` — auto-launch Playwright with the server
- [ ] 🟡 Playwright config template in `bosia create` scaffolding
- [ ] 🟡 Test file examples in project templates
- [ ] 🟡 `bosia feat test` scaffolder for generating test files
- [x] 🟠 Docs: testing guide for end-user apps using `bun test` (unit-level; integration/component/E2E pending utilities)

---

## v0.7.0 — CSS Pipeline Overhaul

> Replace the `app.css` no-op workaround with a proper CSS dedup pipeline. Single global stylesheet doesn't scale: large apps need per-route CSS chunks, component-scoped styles, and code-split delivery.

### Problem

- Tailwind CLI runs separately from Bun build → bundler has no view of CSS module graph
- Bun's `splitting: true` emits one CSS sidecar per chunk that imports a shared CSS file → collision when N routes transitively import `app.css`
- Current fix (`plugin.ts` intercepts `app.css` → empty JS module) ships ALL utilities in one `public/bosia-tw.css` regardless of which route uses them
- Doesn't scale: 100+ route apps load every utility on every page; can't lazy-load route-specific CSS; can't tree-shake unused per-route styles

### Goals

- [ ] 🟠 CSS module graph dedup — bundler tracks every CSS import, identical content emitted once, referenced by N entries (Vite-style)
- [ ] 🟠 Per-route CSS chunks — each route ships only the CSS it actually uses, loaded via `<link>` injected at SSR
- [ ] 🟠 Drop `app.css` no-op interception in `core/plugin.ts` once dedup lands
- [ ] 🟡 Component `<style>` blocks: continue with `css: "injected"` (already scoped + deduped via `cssHash`)
- [ ] 🟡 Tailwind into bundler hot path — port `@tailwindcss/vite` shape to Bun plugin API so utilities are scanned + emitted as part of the build, not a parallel CLI step

### Approach Options

1. **Wait on Bun upstream** — file/track issue for CSS chunk dedup under `splitting: true`. Lowest effort, unbounded timeline.
2. **Custom Bun plugin** — own CSS pipeline in `core/cssPipeline.ts`: intercept all `.css` imports, hash contents, emit one shared chunk per unique source, track route → chunk mapping, inject `<link>` tags via `render.head` per request.
3. **Static layout import workaround** — make root `+layout.svelte` a static import (not dynamic) in `routes.client.ts`. Collapses `app.css` into entry chunk → no per-route duplication. Cheapest fix, but loses dynamic layout chains.

### Acceptance

- [ ] Builds with 100+ routes succeed without the `app.css` no-op
- [ ] Each route ships ≤ what it imports (verified by inspecting `dist/client/*.css` sizes)
- [ ] Component `<style>` still scoped via `cssHash`
- [ ] No regression in `test/svelte-build.test.ts` (CSS collision regression test)

---

## Not Planned

Intentional omissions — out of scope for the framework:

- `+page.ts` / `+layout.ts` universal load (decided against)
- Image optimization (infrastructure concern)
- i18n (user's responsibility)
- Rate limiting (reverse proxy concern)
- Adapter system (intentionally tied to Bun + Elysia)
- Service worker tooling (out of scope)
