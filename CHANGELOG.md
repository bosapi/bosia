# Changelog

All notable changes to Bosia are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.10] - 2026-04-06

### Changed
- Restructured `todo` registry to nested subfolder pattern — each sub-component (`todo-form`, `todo-item`, `todo-list`) in its own folder with `meta.json` and barrel `index.ts`, matching the `ui/` convention
- `bosia add todo` now installs via group dependencies; `bosia add todo/todo-form` installs individual sub-components
- Moved UI component docs into `components/ui/` subfolder; added todo component docs under `components/todo/`
- Docs sidebar now supports nested nav groups — UI and Todo render as sub-groups under Components

## [0.1.9] - 2026-04-05

### Added
- Auto-detect `Cache-Control` on `/__bosia/data/` endpoint — when `cookies.get()` or `cookies.getAll()` is called during `load()` or `metadata()`, the response is marked `private, no-cache`; otherwise it's `public, max-age=0, must-revalidate` so CDNs can safely cache public page data
- Docs: dedicated Server Metadata guide — covers `metadata()` function, Open Graph/social tags, `lang`/`link` tags, data passing to `load()`, and all type references
- SEO infrastructure — `Metadata` type now supports `lang` and `link` fields; `<html lang>` is dynamic per page; `<link>` tags (canonical, hreflang) rendered in streaming SSR head
- Docs SEO — OG tags, Twitter cards, canonical URLs, and hreflang alternates on all docs pages (landing pages EN/ID + all content pages) via shared `buildSeoMeta()` helper
- `robots.txt` for docs site — static file at `docs/public/robots.txt` with sitemap reference
- `sitemap.xml` generation — post-build script scans `content/docs/` and writes `dist/static/sitemap.xml` with `<xhtml:link>` locale alternates for EN/ID pages

## [0.1.8] - 2026-04-04

### Changed
- Registry is now the single source of truth for template features — `bosia create --template drizzle` scaffolds a base skeleton then installs features (`todo`, `drizzle`) and components from the registry via `template.json`; eliminates ~20 duplicated files between the drizzle template and the registry
- `installFeature()` and `addComponent()` now accept `InstallOptions` (`skipInstall`, `skipPrompts`, `cwd`) for non-interactive, programmatic usage (used by `bosia create`)
- Registry `drizzle-index.ts` uses defensive `DATABASE_URL` check with `console.warn` instead of non-null assertion

## [0.1.7] - 2026-04-04

### Added
- Cookie secure defaults — `cookies.set()` now defaults to `{ path: "/", httpOnly: true, secure: true, sameSite: "Lax" }`; user-provided options override defaults via spread merge; `secure` is automatically disabled in dev mode so cookies work over `http://localhost`

### Changed
- Refactored drizzle template and todo feature to repository pattern — replaced loose `queries.ts` functions with `TodoRepository` (data access) and `TodoService` (business logic/validation) static classes; route files now act as thin controllers calling the service layer

## [0.1.6] - 2026-04-03

### Fixed
- Cookie RFC 6265 compliance — validate cookie names against the HTTP token spec instead of blindly `encodeURIComponent`-ing them; fixes interop with other servers/libraries that don't expect URL-encoded cookie names
- `.env` variable name validation — reject invalid identifiers (e.g. `MY-VAR`, `123BAD`) at parse time with clear error messages including filename and line number; prevents broken codegen
- `.env` parser escape sequence support — double-quoted values now process `\n`, `\r`, `\t`, `\\`, `\"` escape sequences; single-quoted values remain literal (no processing)

## [0.1.5] - 2026-04-01

### Added
- Graceful shutdown drain — on SIGTERM/SIGINT, in-flight requests are allowed up to 10s to complete before the server stops; new requests receive `503 Service Unavailable` with `Retry-After: 5`; `/_health` returns `503 { status: "shutting_down" }` so load balancers stop routing; idempotent shutdown prevents duplicate signal handling

### Fixed
- Concurrent build guard in dev — prevent overlapping `buildAndRestart()` when rapid file changes fire during an active build; queues one follow-up build instead of running builds in parallel

## [0.1.4] - 2026-03-30

### Added
- Open redirect validation on `redirect()` — rejects external URLs, protocol-relative URLs (`//evil.com`), and dangerous schemes (`javascript:`, `data:`, `vbscript:`) by default; opt in to external redirects with `redirect(303, url, { allowExternal: true })`

### Fixed
- Client-side navigation now scrolls to top when navigating to a new page (previously retained scroll position from the previous page)
- Back/forward browser navigation preserves scroll behavior (does not force scroll to top)
- Use `insertAdjacentHTML` for SSR head injection instead of `innerHTML+=` — prevents re-parsing the entire `<head>`, avoiding duplicate stylesheets and script re-execution

## [0.1.3] - 2026-03-29

### Added
- `bosia add` now resolves component paths from `registry/index.json` — top-level components like `todo` no longer get wrongly prefixed with `ui/`
- `bosia feat` now supports nested feature dependencies — `features` field in feature `meta.json` triggers recursive installation (e.g. `bosia feat todo` automatically installs `bosia feat drizzle`)
- `bosia feat` now prompts before overwriting existing files (previously silently replaced them)
- `drizzle` project template — PostgreSQL + Drizzle ORM starter with full CRUD todo demo, seed system, and REST API (`bosia create --template drizzle`)
- `drizzle` feature registry entry — `bosia feat drizzle` scaffolds DB connection singleton, schema aggregator, migrations directory, seed runner with `__bosia_seeds` tracking table, and `drizzle.config.ts`
- `todo` feature registry entry — `bosia feat todo` scaffolds todo schema, typed queries, routes with form actions, REST API, components, and seed data (depends on drizzle feature)
- `todo` component registry entry — `bosia add todo` installs todo-form, todo-item, todo-list Svelte components
- Feature registry support in `registry/index.json` — new `features` array alongside existing `components`

## [0.1.2] - 2026-03-28

### Added
- Docs site rebuilt as a Bosia app (dogfooding) — replaces Astro + Starlight with a fully Bosia-powered site at `docs/`
- Markdown pipeline with `marked` + `shiki` syntax highlighting (lazy-loaded, 6 grammars) and `gray-matter` frontmatter parsing
- File-based doc content at `docs/content/docs/` with mtime-keyed parse cache
- Docs layout with sidebar, navbar, dark mode toggle, and table of contents
- i18n support (EN + ID) via `/id/` URL prefix with locale-aware sidebar links and language switcher
- Live component preview system — `demo` frontmatter key renders interactive Svelte components above doc content (7 demos: button, badge, input, separator, avatar, card, dropdown-menu)
- Landing page with hero, features grid, and quick-start code block
- Dynamic route prerendering with `entries()` export — enumerate dynamic route params for static prerendering of `[param]` and `[...slug]` routes
- `generateStaticSite()` — merge prerendered HTML + client assets + public into `dist/static/` for static hosting (GitHub Pages, Netlify, etc.)
- GitHub Pages deployment workflow (`.github/workflows/docs.yml`)

### Changed
- Data endpoint switched from query-param (`/__bosia/data?path=...`) to path-based URLs (`/__bosia/data/guides/server-loaders.json`) — enables static hosting of data payloads for client-side navigation
- Prerendering now also generates JSON data payloads alongside HTML — client navigation works on fully static sites without a running server
- Extracted shared `dataUrl()` helper in `prefetch.ts` — eliminates duplicated URL-building logic across `App.svelte` and `prefetch.ts`
- `getVersion()` extracted to shared `$lib/utils` — eliminates duplicate implementations across server files
- `DocsSidebar` now uses `localizeUrl()` from `$lib/docs/i18n` instead of inline duplication
- Page `metadata()` now uses frontmatter `title` for dynamic `<title>` tags (e.g. `"Getting Started - Bosia Docs"`)
- `bosia add` registry URL switched from docs site API to raw GitHub (`raw.githubusercontent.com`)

### Removed
- `/api/registry/` routes from docs app — registry now served directly from GitHub

### Fixed
- Added viewport meta tag to root layout for correct mobile rendering
- Silent `catch {}` in syntax highlighter now logs errors with language context

---

## [0.1.1] - 2026-03-27

### Added
- Component registry — 12 Svelte 5 UI components (avatar, badge, button, card, chart, data-table, dropdown-menu, icon, input, navbar, separator, sidebar) in `registry/components/`
- Interactive component previews in docs — live, clickable demos on 7 component pages (button, badge, input, separator, avatar, card, dropdown-menu) using hydrated Svelte components via `@astrojs/svelte`
- `bosia add --local` flag for installing components from the local registry during development
- `bosia add` now auto-creates `src/lib/utils.ts` (cn utility) if it doesn't exist
- Path-based component names — `bosia add shop/cart` installs to `src/lib/components/shop/cart/`; names without a path default to `ui/` prefix
- Overwrite prompt — `bosia add` asks to replace or skip when a component already exists in the project
- Components documentation — dedicated sidebar group with individual pages for all 12 components

---

## [0.1.0] - 2026-03-26

### Changed
- Rename framework from `bosbun` to `bosia` — package name, CLI binary, virtual modules (`bosia:routes`), generated directory (`.bosia/`), internal endpoints (`/__bosia/`), window globals (`__BOSIA_*`), CSS classes, data attributes, documentation site, and all references
- `bosia create` template picker now uses arrow-key selection instead of typed input (powered by `@clack/prompts`)

---

## [0.0.8] - 2026-03-26

### Changed
- Rename `bosbun:env` virtual module to `$env` — SvelteKit-style import path (`import { VAR } from "$env"`)

### Added
- Dev server auto-restart — app process is automatically restarted when it crashes unexpectedly; stops after 3 rapid crashes within 5s to prevent crash loops
- Documentation site built with Astro Starlight — 14 pages covering getting started, routing, server loaders, API routes, form actions, middleware hooks, environment variables, styling, security, CLI reference, API reference, deployment, and SvelteKit differences
- GitHub Actions workflow for auto-deploying docs to GitHub Pages on push to `main`
- Indonesian (Bahasa Indonesia) documentation — full translation of all 15 doc pages with Starlight i18n, language switcher, and `/id/` URL prefix

### Removed
- Remove unused `renderSSR` function from `renderer.ts` (fully replaced by `renderSSRStream`)
- Remove unused `buildHtmlShell` function and `_shell` cache from `html.ts`
- Remove dead `buildHtmlShell` import from `renderer.ts`
- Un-export `STATIC_EXTS`, `DEFAULT_CSRF_CONFIG`, and `matchPattern` — internal-only, not part of public API

### Changed
- Use `splitCsvEnv` helper for CSRF/CORS origin parsing in `server.ts` — eliminates duplicate `.split(",").map().filter()` pattern

### Fixed
- Route PUT/PATCH/DELETE through `handleRequest()` — these methods now get CSRF, CORS, security headers, cookie handling, and user hooks applied consistently (previously returned bare 404 responses)
- Fix `withTimeout` timer leak — `setTimeout` is now cleared via `.finally()` when the main promise resolves, preventing dangling timers under load
- Remove duplicate static file serving — removed `@elysiajs/static` plugin; all static files now served through `resolve()` with consistent path traversal protection, CSRF, CORS, security headers, and user hooks
- Fix `_shellOpen` and `_shell` caching in dev — hoist `cacheBust` to module level so it's computed once at startup (stable within a process, fresh after dev server restart on rebuild)
- Fix client-side navigation with query strings/hashes — `currentRoute` now initialized with full path (including search + hash) for consistent deduplication; `findMatch` in both `router.navigate()` and `App.svelte` now receives only the pathname, so query-driven patterns like pagination work via client-side navigation instead of falling back to full page reloads

---

## [0.0.7] - 2026-03-25

### Added
- Multi-template support for `bosbun create`: interactive template picker when no `--template` flag is given; includes `default` (minimal starter) and `demo` (full-featured with hooks, API routes, blog, form actions, catch-all routes)
- GitHub Actions workflow for auto-publishing to npm on push to `main` — only publishes when `package.json` version is greater than the currently published version; prereleases tagged as `next`, stable as `latest`

### Updated
- Package description and README to better reflect the framework's identity — emphasizes file-based routing, no Node.js/Vite/adapters philosophy, and full feature set

### Changed
- Replaced 🐰 emoji branding with new block-style SVG logo across all UI templates, CLI output, and favicon; favicon now served as `/favicon.svg` instead of blank `data:,` URI

### Fixed
- `bosbun create` now pins bosbun to the current version (`^x.y.z`) instead of `*`, ensuring new projects use the same version as the CLI that created them
- Tailwind CSS binary resolution: handle bun's flat dependency hoisting — `tailwindcss` binary is now found whether deps are nested (`node_modules/bosbun/node_modules/`) or hoisted (`node_modules/`); same fix applied to `NODE_PATH` in dev, build, start, and prerender
- Client hydration crash ("Cannot read properties of undefined (reading 'call')"): when bosbun is installed via npm (not workspace symlink), `hydrate.ts` resolved `"svelte"` from the framework's location while compiled components resolved `"svelte/internal/client"` from the app's `node_modules` — two separate Svelte runtime copies with independent hydration state; fixed by forcing all `svelte` imports to resolve from the app's directory via `onResolve` in the build plugin
- `NODE_PATH` resolution for Tailwind CSS: hoisted `node_modules` path was incorrectly included in workspace setups, confusing the Tailwind CLI resolver; now only adds the parent `node_modules` to `NODE_PATH` when bosbun is actually installed as a dependency (detected via `node_modules/bosbun/` path)

## [0.0.6] - 2026-03-25

### Changed
- Renamed framework from `bunia` to `bosbun` — package name, CLI binary, virtual modules (`bosbun:routes`, `bosbun:env`), generated directory (`.bosbun/`), internal endpoints (`/__bosbun/`), window globals (`__BOSBUN_*`), CSS classes, and all documentation

## [0.0.5] - 2026-03-24

### Added
- Link prefetching: `data-bosbun-preload="hover"` prefetches on mouseenter, `data-bosbun-preload="viewport"` prefetches when link scrolls into view; attribute can be placed on ancestor elements (e.g. `<nav>`) to apply to all links inside; 5s TTL cache eliminates the network request on click

## [0.0.4] - 2026-03-23

### Added
- Request timeouts: `LOAD_TIMEOUT` (default 5s) and `METADATA_TIMEOUT` (default 3s) env vars abort slow `load()` and `metadata()` functions; set to `0` or `Infinity` to disable
- Prerender fetch timeout: `PRERENDER_TIMEOUT` env var (default 5s) aborts slow route fetches during build — prevents infinite build hangs

### Fixed
- Security: `PUBLIC_*` env vars injected into client HTML are now scoped to keys declared in `.env` files only — system env vars that happen to start with `PUBLIC_` are no longer leaked to the browser
- Streaming SSR: metadata errors now return proper error responses (correct status codes) instead of broken partial HTML; post-stream errors produce valid HTML structure; XSS-safe error message encoding via `safeJsonStringify`
- `safeJsonStringify` no longer crashes on circular references — falls back to `null` with a console error
- Security: path traversal protection on all static file serving (`/public`, `/dist/client`, prerendered pages) — resolved paths are validated to stay within allowed directories
- Cookie parsing no longer crashes on malformed percent-encoding (e.g. `%ZZ`) — falls back to raw value
- Cookie `set()` now validates `domain` and `path` (rejects `;`, `\r`, `\n`) and whitelists `sameSite` to `Strict`/`Lax`/`None` — prevents header injection

### Changed
- Route matching: routes are now sorted by priority at build time (exact → dynamic → catch-all, then segment depth); `findMatch()` does a single pass instead of 3 passes — O(n) best-case with early exit

## [0.0.3] - 2026-03-21

### Added
- Streaming SSR metadata: `metadata()` export in `+page.server.ts` sends `<title>`, `<meta>` tags in the initial HTML head before `load()` completes; 3-chunk streaming flow (head open → metadata + spinner → rendered content); `MetadataEvent` and `Metadata` types exported from `bosbun`; SEO-friendly — crawlers see metadata without JS execution; `metadata()` can return `data` object that gets passed to `load()` via `event.metadata` to avoid duplicate queries
- Form actions (SvelteKit-style): `actions` export in `+page.server.ts` for handling form POST submissions; `fail()` helper and `ActionFailure` class for returning validation errors; `ActionData` type auto-generated in `$types.d.ts`; `form` prop passed to page components; named actions via `action="?/name"` attribute; re-runs `load()` after action; proper status codes (400 for failures, 200 for success, 303 for redirects)

---

## [0.0.2] - 2026-03-20

### Added
- `.env` file support with `bosbun:env` virtual module: prefix-based classification (`PUBLIC_STATIC_*`, `PUBLIC_*`, `STATIC_*`, private); load order `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`; build-time codegen of `.bosbun/env.server.ts`, `.bosbun/env.client.ts`, `.bosbun/types/env.d.ts`; `window.__BOSBUN_ENV__` injected at SSR for dynamic public vars; CLI loads env before spawning subprocesses
- Graceful shutdown: SIGTERM/SIGINT handlers call `app.stop()` then `process.exit(0)`; force-exit after 10s if stop hangs
- Request body size limits: `BODY_SIZE_LIMIT` env var (`512K`, `1M`, `Infinity`, or bytes); defaults to `512K`; wired into Elysia/Bun server config for 413 enforcement before handlers run
- CSRF protection: Origin/Referer header validation on all non-safe requests (POST/PUT/PATCH/DELETE); blocked requests return 403 with a descriptive message; exports `CsrfConfig` type from `bosbun`
- CORS configuration: `CORS_ALLOWED_ORIGINS` env var (comma-separated); `getCorsHeaders()` adds `Access-Control-Allow-Origin` + `Vary: Origin` for matching origins; OPTIONS preflight returns 204 with `Access-Control-Allow-Methods/Headers/Max-Age`; exports `CorsConfig` type from `bosbun`
- Strip stack traces in production: `handleRequest` wrapped in try/catch; Elysia `.onError()` safety net; all `console.error` calls log full error in dev and message-only in prod

### Removed
- Duplicate `PageLoadEvent` and `LayoutLoadEvent` interfaces from template `app.d.ts`; use `import type { LoadEvent } from "bosbun"` instead

### Fixed
- XSS: escape `<`, `>`, `&`, U+2028, U+2029 in JSON embedded in SSR `<script>` tags (`safeJsonStringify`)
- SSRF: validate `path` query param on `/__bosbun/data` — reject non-root-relative paths, double-slash URLs, and traversal sequences

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
- **`$types` codegen** — Auto-generated `.bosbun/types/src/routes/**/$types.d.ts` per route directory
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
- **`bosbun:routes` virtual module** — Auto-generated route registry at build time

#### CLI
- **`bosbun dev`** — Start dev server with file watching and HMR
- **`bosbun build`** — Production build
- **`bosbun start`** — Start production server from `dist/server/index.js`
- **`bosbun create`** — Scaffold a new project from the default template

#### Hooks
- **`hooks.server.ts`** — `Handle` middleware interface with `sequence()` helper
- **`RequestEvent`** — `request`, `params`, `url`, `cookies`, `locals`
- **`LoadEvent`** — `params`, `url`, `cookies`, `locals`

#### Developer Experience
- **Default project template** — `packages/bosbun/templates/default/` for `bosbun create`
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
