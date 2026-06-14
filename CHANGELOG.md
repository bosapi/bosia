# Changelog

All notable changes to Bosia are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.7.2] - 2026-06-14

### Changed

- New apps now get a brief to-do to swap placeholder content for real database data.

### Fixed

- Brief intake no longer installs the theme or asks you to start the app before the approval button shows.

## [0.7.1] - 2026-06-13

### Changed

- Inspector now sends the AI clear url/page/component fields so it edits the right file.

## [0.7.0] - 2026-06-13

### Added

- Restored `page.params` as a deprecated fallback; new code should read params from props.

### Changed

- Shop template now uses built-in SQLite instead of PostgreSQL — zero setup, no database server.

### Fixed

- Login/register no longer fail after the app sits idle — database connections now refresh automatically.

---

## [0.6.25] - 2026-06-12

### Added

- New "pages" you can add in one command — a whole screen made of ready-made sections.
- A full storefront: home, product list, product, and checkout pages, ready to drop in.
- 24 storefront sections: header, footer, product cards, cart drawer, checkout, and more.
- New "Clay" theme — warm paper tones with a terracotta accent and elegant serif headings.
- One store, six looks — switch between fashion, grocery, tech, beauty, garden, or general.

## [0.6.24] - 2026-06-12

### Removed

- Removed the Todo starter template and its todo feature/components ahead of rebuilding the card blocks.
- Replaced the single "feature (editorial)" card block with a full set of 29 cards.

### Added

- 17 ready-to-use hero sections for shops, schools, food, fashion, services, and apps.
- 29 ready-to-use card blocks: dashboards, profiles, products, media, notifications, and more.
- Six new themes: Paper, Carbon, Bloom, Terminal, Sage, and Grape.
- Every theme now ships matching shadows and a monospace font for numbers and code.
- Theme toggle now offers Light, Dark, and System (follows your OS) — System is the default.
- Dev server `POST /__bosia/hold` + `/__bosia/resume` control — a host orchestrator can hold the live-reload broadcast during a batch of edits and flush a single reload on resume. `hold` doubles as a heartbeat that re-arms a safety timer, so the hold survives arbitrarily long tasks and only auto-resumes if the heartbeats stop (orchestrator died) — never mid-task. Off by default, so plain `bosia dev` reloads exactly as before.

### Fixed

- `bosia add theme` now removes the template's default `:root`/`.dark` token block, so app.css no longer keeps two competing `:root` rules where the template's overrides the theme's.
- The "App server is starting…" page shown during a rebuild now reloads itself once the app is back, so the preview no longer gets stuck on it after a restart race.

### Changed

- Card blocks use your theme's brand colour, so they restyle when you switch themes.
- Pinned Svelte to ^5.56.3 across docs, demo, and all templates so everyone gets the latest fixes.

## [0.6.23] - 2026-06-11

### Fixed

- Block installer now skips blocks already installed this session, so shared block deps no longer rewrite files twice.

### Changed

- Shop feature drops unused component declarations (`typography`) and auth-overlap (`form`/`input`/`button`) for cleaner installs.
- Skills warn against installing the `postgres` or `pg` npm packages — Bun's built-in `Bun.SQL` covers Postgres.
- `bosia-bun-runtime` gains a Postgres section with the `FailedToOpenSocket` URL-string gotcha and object-form fix.
- `bosia-drizzle-feature` adds R11: registry files count relative imports from their `meta.json` target, not the source.

### Fixed

- Shop admin sidebar header now shows the Bosia logo SVG (theme-aware) and a working collapse trigger instead of a Unicode hex glyph and dead button.
- Shop admin sidebar user-menu dropdown is full-width, anchors from the chevron, rotates on open, and Sign out posts to `/logout` cleanly.
- Sidebar leaf items render as plain links again — `SidebarMenuItem` no longer mistakes whitespace around the icon snippet for nested children.
- Shop admin sidebar groups the Orders sub-pages (All / Pending / Refunds) under one collapsible parent for cleaner navigation.
- Theme toggle now actually switches all four templates (default/shop/todo/demo) — `dark:` utilities were silently OS-bound; templates now declare the class-based `dark` variant.
- Shop admin sidebar header logo renders at 20px instead of overflowing the rail at its native 200×200.
- `+server.ts` handlers can now `throw redirect(303, "/")` (and `throw error(...)`) — Bosia returns a real 303 / typed error response instead of swallowing it as a 500. The `/logout` POST now signs the user out and redirects to `/` as designed.

### Added

- New `bosia-shop-template` skill so agents extending a `bosia create … --template shop` scaffold don't re-install features or replace the wired sidebar/navbar.
- Shop dashboard pages now render a path-derived breadcrumb above the main content; `ui/breadcrumb` is wired into the `shop` feature.
- Home, login, and register pages set a `<title>` and `<meta name="description">` so the shop has basic SEO out of the box.

### Removed

- Dropped unused `postgres` runtime dep from `shop` template `package.json` (scaffold uses `Bun.SQL`).

## [0.6.22] - 2026-06-10

### Added

- New `shop` template scaffolds a storefront with auth, RBAC, S3 uploads, and products/orders/cart.
- New registry features `auth`, `rbac`, `shop` — composable in any Bosia app, not only the shop template.
- Four new themes: sunset, midnight, mono, amber. Twelve total now ship in the registry.
- Docs: file-upload skill explains MinIO / R2 / DO Spaces setup via `S3_ENDPOINT`, plus AWS Jakarta (`ap-southeast-3`).
- Docs: bun-runtime skill now covers `Bun.s3` (the zero-dep client behind the S3 adapter).
- Docs: both skills warn against inventing a non-standard `S3_URL` DSN — stick to Bun's discrete `S3_*` env names.
- Sidebar docs: decision table for leaf vs collapsible vs label-only items, plus a working user-menu footer pattern.
- New `bosia-sidebar` skill so AI agents stop wrapping `SidebarMenuItem` in `DropdownMenu` and start building the avatar dropdown.
- `DropdownMenu` gains `floating` mode, a `side` prop, and an `anchor` element prop — menus inside overflow-clipped parents (like Sidebar) actually appear, and can pop from a specific child (e.g. a chevron) rather than the whole trigger.

### Fixed

- Hydration crashed on components spreading `{...restProps}` because Svelte 5.55.x emits the exclude list as an Array but the runtime expects a Set; framework now pins svelte to ^5.56.3 which emits the Set form.
- `bosia create --template shop` now scaffolds Postgres tables by default instead of falling back to sqlite.
- Drizzle feature: workaround for Bun 1.3.x bug where `new Bun.SQL("postgres://...")` errored `FailedToOpenSocket`; the URL is now parsed into an object before passing to Bun.SQL.
- `bosia create` no longer 404s when a block depends on another block (e.g. `image-dialog` → `upload-area`).
- Auth feature: `/login` and `/register` server actions now import `features/auth` with the correct relative path.
- Sidebar user-menu dropdown was clipped by `Sidebar`'s overflow — `floating side="top"` now lets it open upward into the page.
- `DropdownMenuContent` floating mode: first open was mispositioned because the menu briefly rendered in normal flow before the fixed-position style applied. The class now sets `position: fixed` from the first paint, and the menu stays `visibility: hidden` until the measure resolves — so the first click lands at the same coordinates as subsequent clicks.
- Sidebar now lists all themes; bosia-theme-tokens skill no longer claims only two ship.
- Drizzle feature: typecheck failures when a project mixed engine variants — `drizzle/index.ts` now ships per-dialect (pg / mysql / sqlite) so `db.insert / update / delete / select / execute / run` all typecheck.
- `bun x bosia create --template shop` no longer scatters a stray `src/lib/utils.ts` next to the new project directory; the block installer now writes utils.ts into the project, not into `process.cwd()`.
- Registry + framework now use `tabWidth: 2` (matching templates and the wider Svelte/TS ecosystem) so scaffolded projects pass `bun run check` without reformatting.

### Changed

- Drizzle tables across all registry features are now plural (variable + SQL identifier + filename): `user` → `users`, `session` → `sessions`, `permission` → `permissions`, `file` → `files`, `product` → `products`, `order` → `orders`, `orderItem` → `orderItems`, `cartItem` → `cartItems`. Foreign-key columns stay singular (`userId`, `productId`). New R10 rule in `bosia-drizzle-feature` and updates to `bosia-database-setup` / `bosia-clean-architecture` codify the convention.

---

## [0.6.21] - 2026-06-09

### Added

- Drawer component — mobile bottom-sheet overlay with slide-up animation and tap-to-close.
- Image dialog block — pick multiple images via upload, URL, or existing library in one modal.
- `bosia-image-dialog` skill — guides AI agents to use the new picker for gallery/replace flows.
- `bosia-image-external` skill — guides AI agents to call bosapi's `image_external_search` tool for real stock photos with attribution.
- Reactive `page` export on `bosia/client` so apps can read `page.url.pathname` like SvelteKit (params still come from `$props()` on routes).
- `bosia add blocks/<cat>/<name>` now works as an alias for `bosia add block <cat>/<name>`.

### Changed

- Image dialog now pre-selects existing images on open so adding a new one no longer wipes them.
- `bosia add` keeps installing remaining files when one is owned by a different user, then prints a clear chown hint if it still cannot write.

---

## [0.6.20] - 2026-06-08

### Fixed

- Client hydration broken when a leaf chunk happened to share the `hydrate-*` filename prefix and sort before the actual entry. 0.6.19 hashed the entry filename but kept the manifest detector's `find(f => f.startsWith("hydrate"))` fallback, which returned the first match by array order — sometimes a tiny chunk like a `version.ts` import, exporting only constants. The HTML then loaded that no-op script as the entry, so `main()` never ran, `router.init()` never fired, and no page hydrated. Manifest now identifies the entry via Bun's `output.kind === "entry-point"`.

## [0.6.19] - 2026-06-08

### Fixed

- `.webmanifest` files in `public/` now serve correctly instead of returning 404.
- Apps no longer loop forever after a new deploy when old cached assets are missing on the server.

### Changed

- Client entry file is now hashed so each new build gets a fresh URL the browser cannot serve stale.

## [0.6.18] - 2026-06-07

### Fixed

- Pure-SSR apps (zero prerendered routes) now also mirror `public/` → `dist/static/` at build time, so production containers that drop `public/` keep serving `bosia-tw.css`, favicons, and other public assets. 0.6.17 only ran the mirror when SSG output existed.

### Changed

- Clean architecture skill: services may only call their own repository. Cross-feature is service → service, never service → other repository.
- Clean architecture skill: any file type (tables, validators, dtos, repositories, services) with 2+ files should promote into its matching subfolder; barrel still hides deep paths.
- Clean architecture skill: sub-feature folders (`auth/oauth/`) only when the sub-domain owns its own tables. `login/`/`register/`-style sub-domains that share parent tables stay under `services/`.

## [0.6.17] - 2026-06-07

### Changed

- Production runtime no longer needs `src/hooks.server.ts` or `bosia.config.ts` — build bundles them to `dist/hooks.server.js` and `dist/bosia.config.js`; runtime loads from `dist/` first and falls back to source for dev.
- Static assets in `public/` are also served from `dist/static/` in production, so containers can ship only `dist/` (plus `node_modules/`).

## [0.6.16] - 2026-06-06

### Changed

- Production runtime no longer needs `src/app.html` — build now writes parsed segments to `dist/app-html.json`, so Docker images can copy only `dist/`.
- Switched icons to `@lucide/svelte`; registry components import lucide directly instead of a custom wrapper.

### Removed

- Custom `registry/components/ui/icon` component and its hand-curated SVG map.

### Added

- `bosia-icon` skill telling AI agents to use `@lucide/svelte` (not deprecated `lucide-svelte`).

## [0.6.15] - 2026-06-05

### Fixed

- `parent()` now includes cached parent data on client-side navigation even when layout loaders are skipped.

## [0.6.14] - 2026-06-02

### Added

- `bosia.json` install manifest at project root. Every `feat`, `add`, and `add block` records what was installed (files, deps, options) so future sessions can list and (eventually) uninstall them.
- `bosia feat list` — show installed features with their options.
- `bosia add list` — show installed components and blocks.

## [0.6.13] - 2026-06-01

### Added

- `inspector` plugin: env var `BOSIA_INSPECTOR_AI_ENDPOINT` overrides the `aiEndpoint` option from `bosia.config.ts`. Lets sandboxed hosts (bosapi running the app in a podman container) point inspector POSTs at an address reachable from inside the sandbox, since the baked URL otherwise resolves to the container's own loopback.

## [0.6.12] - 2026-06-01

### Added

- `bosia create --no-install` flag: scaffold files only and skip the final `bun install` step. Lets hosts run the install in a sandbox (container, VM) instead of on the scaffolding host — fixes native-module arch mismatches when the host and runtime OS differ.

### Fixed

- `bosia create` now picks the project name from the first non-flag argument, so `create --local --no-install app` no longer scaffolds into a folder called `--local`.

## [0.6.11] - 2026-05-30

### Changed

- `feat file-upload` now ships private-by-default: the `file` table carries a NOT NULL `user_id`, the upload/list/delete API routes require `locals.user`, and `GET /uploads/<key>` checks ownership before streaming the bytes with `Cache-Control: private, no-store`. Apps that previously relied on anonymous public uploads need to add a user backfill and rerun the migration.
- `bosia-file-upload` skill now teaches AI to install [[bosia-auth-flow]] first, never to drop the `locals.user` check or point `UPLOAD_DIR` at `./public/uploads`.

### Fixed

- `+server.ts` API routes now win over the static fallthrough, so handlers can serve URLs ending in `.webp` / `.png` / `.pdf` (previously returned 404 because `isStaticPath` matched the extension and short-circuited into the static-file lookup).

## [0.6.10] - 2026-05-30

### Added

- `bosia sync` CLI: generates `.bosia/routes.ts`, `$types`, env modules without a full build (cheap codegen for `check`).
- Default template `bun run check` now runs `svelte-check` (catches template reference errors like `<Navbar {links} />` when only `navLinks` exists).
- Generated `$types.d.ts` now exports `Actions` (`Record<string, Action>`) so `+page.server.ts` actions type-check under svelte-check.
- New skill `bosia-database-setup` — on-demand engine swap + table creation, replacing `bosia-brief-database`.
- `bosia-auth-flow` R8: login/register must redirect server-side (`throw redirect(303)`), never `use:enhance` + client `goto()` — avoids cookie/nav race that drops the session.

### Changed

- Brief intake no longer asks the user about the database engine. Default = sqlite-file; load `bosia-database-setup` only when the user explicitly asks for postgres/mysql or new tables.
- Brief intake Quick Start is now five questions (palette + direction merged), with an explicit "infer, don't loop back" inference rule.
- Brief intake now ends with the `brief_request_approval` tool call (host UI renders a Setuju button) instead of a plain-text "Setuju?" question.
- `bosia-page-shell` skill triggers now include `+page.svelte`, `+layout.svelte`, `page shell`, `root layout` so AI auto-loads it before touching layout/page files.

### Removed

- Skill `bosia-brief-database` — superseded by `bosia-database-setup`.

### Fixed

- `$env` ambient declaration now picked up by `tsc` / `svelte-check` (template tsconfig `include` extended with `.bosia/types/**/*.d.ts`).
- `bosia:routes` virtual module ambient now reachable by consumers (triple-slash reference added to `bosia`'s `src/lib/index.ts`).
- UI components no longer crash on plain http: switched id generation from `crypto.randomUUID` / `Math.random` to Svelte's built-in `$props.id()`.
- `bosia feat drizzle` now defaults to a persistent sqlite file instead of in-memory, so data survives restarts out of the box.
- Twelve UI components no longer crash with `props_id_invalid_placement` — `$props.id()` is now assigned to its own variable before being interpolated into id strings.

## [0.6.9] - 2026-05-29

### Fixed

- Anchor links (`href="#section"`) now scroll to the target heading instead of jumping to the top.
- Static assets with query strings (e.g. `/favicon.ico?v=2`) now resolve correctly instead of 404'ing.

### Changed

- Marked `beforeNavigate` / `afterNavigate` navigation hooks as done in the roadmap (already shipped).
- Static assets now served from a boot-time manifest in production (single Map lookup, no per-request stat).

## [0.6.8] - 2026-05-29

### Removed

- `/about` page from the default project template — new projects now start with a clean home page only.

### Fixed

- Sidebar no longer crashes with `crypto.randomUUID is not a function` in non-HTTPS / sandboxed runtimes.

### Added

- `cart` icon — `<Icon name="cart" />` now renders the shopping-cart symbol.
- New skill `bosia-data-table` so AI uses the registry data table instead of hand-rolled HTML tables.
- New skill `bosia-debug-discipline` — after two failed fixes, AI reads framework source before guessing again.

### Changed

- `bosia-crud-flow` now mandates `use:enhance` + the correct `export const actions = { … }` shape (silent no-op was the bug).
- `bosia-drizzle-feature` now mandates UUID primary keys (pg + sqlite) and `sql\`CURRENT_TIMESTAMP\`` for timestamps.
- `bosia-file-upload` now requires unlinking the file on delete so storage doesn't fill with orphans.
- `bosia-navigation` now mandates the registry sidebar with ≥3 menu items + empty states.
- `bosia-page-shell` now explains how child layout `load` must spread parent data (cart-count bug).

## [0.6.7] - 2026-05-28

### Fixed

- `bosia feat file-upload` now installs the upload-area and crop-image blocks properly (was 404'ing).
- `bosia add block -y` skips overwrite prompts so scripted installs no longer hang.
- File upload now actually compresses images (was crashing on Bun.Image API mismatch).
- Uploaded image URLs are now relative so they render on any host (preview, prod, localhost).
- Routing/dashboard/CRUD skills now hard-rule authenticated pages into (private), never (public).

### Added

- `FeatureMeta.blocks[]` — features can now declare block dependencies separate from components.
- New skill `bosia-page-shell` so AI agents stop putting navbar/footer inside every page.
- New skill `bosia-query-defaults` so every list is paginated and sorted newest-first.

## [0.6.6] - 2026-05-27

### Fixed

- Build now finds binaries (e.g. `tailwindcss`) when deps are hoisted to a monorepo root `node_modules`.
- Audit no longer false-flags `<DemoComponent />` when bound via sibling `{@const DemoComponent = ...}`.

### Changed

- Docs CI install now uses `--linker=hoisted` so registry blocks can resolve docs-declared deps.
- Switched docs domain to `bosia.dev` and moved hosting to Cloudflare Pages.
- Docs, READMEs, and templates now lead with the production-ready story (security, performance, reliability).

## [0.6.5] - 2026-05-27

### Added

- Build now catches `<Card.Root>` typos at compile time — names missing from the import file fail clearly.

### Fixed

- Cookie `sameSite` now accepts lowercase (`lax`, `strict`, `none`) — matches SvelteKit/Express.
- Cookies passed `secure:true` over HTTP get auto-downgraded with a warn — fixes silent login loops in dev/preview.

### Changed

- `Secure` cookie flag is now decided per-request from the transport protocol, not from `NODE_ENV`. Set `TRUST_PROXY=true` to honor `x-forwarded-proto` behind reverse proxies.

## [0.6.4] - 2026-05-26

### Changed

- Crop and upload blocks now share one combined demo — pick a file, optionally crop, upload.

### Fixed

- Crop demo no longer breaks on CORS — uses your picked file (object URL) instead of a remote image.
- Docs pages no longer 404 in dev — content path now resolves from the project root, not the bundle location.
- Crop block's preview area no longer collapses to 0 height — uses inline style as a safe fallback when the host's Tailwind scan doesn't reach the registry source.
- Docs Tailwind now scans `registry/blocks/**` so block-defined utility classes get generated.

### Added

- Tiny `/api/demo-upload` endpoint in docs so the upload demo completes end-to-end without a 500.
- New `file-upload` feature: a ready backend for the upload block — shrinks images and saves locally or to S3.
- `bun x bosia feat` now lets each feature declare its own flags — `file-upload` exposes `-d sqlite|postgres|mysql`; `-y` (auto-confirm, use defaults) stays a feat-level flag.
- New `bosia-file-upload` skill teaches the AI when and how to wire image uploads.

## [0.6.3] - 2026-05-25

### Added

- New skill teaches the AI how to query the database correctly without breaking.
- Skills API now lists each skill's reference files with URLs so AI agents can fetch them.
- Drizzle skill now covers migrations, dev-server restart, and the common AI failure modes.
- New skill enforces clean controller → service → repository layout so the AI stops putting database calls in pages.
- New file blocks: image cropper with zoom/aspect presets, and drag-and-drop upload area with progress.
- Crop block now resizes and re-compresses output (defaults 1920×1080 @ 0.85, WebP for round crops).

### Fixed

- Svelte component libraries (like `svelte-easy-crop`) now resolve at build time via the `svelte` export condition.
- Fixed page-server crash (`b0 is not defined` / `bundle_full_exports is not defined`) caused by an overly broad resolver — now uses Bun's `conditions` option instead.
- Crop block exposes a `crossOrigin` prop and removes `h-full` from the outer wrapper so it lays out correctly inside unsized parents.
- Crop demo now uses an image source that returns `Access-Control-Allow-Origin: *` (the previous Picsum URL was being blocked by `crossorigin="anonymous"` and rendered as a broken image).

### Changed

- `db:migrate` now runs bun-native instead of needing `better-sqlite3`/`@libsql/client`.
- Drizzle skills updated so each feature gets its own repository, service, and validator files.

## [0.6.2] - 2026-05-24

### Fixed

- Response cache no longer breaks SSE endpoints (auto-skips `text/event-stream`).
- Response cache now respects `Cache-Control: no-store|private|no-cache` headers.

## [0.6.1] - 2026-05-24

### Changed

- Updated SvelteKit differences documentation.

## [0.6.0] - 2026-05-24

### Added

- Database drizzle feature now supports postgres, mysql, and sqlite (choose via URL)
- New database intake skill guides users through engine selection during app setup
- Server response caching with automatic compression (gzip + brotli)
- Invalidate specific cached pages using `invalidate()` and `invalidateAll()` helpers
- Per-route cache opt-out with `export const cache = false`
- New response-cache guide with setup instructions and examples

### Changed

- CSP-enabled apps now skip caching to avoid nonce conflicts
- Server-side invalidate functions moved to bosia/server (browser bundle cleanup)

### Fixed

- Safari dev server now works (fixed proxy encoding issue)
- Browser hydration no longer crashes from missing process variable
- Type checking now passes on inspector error reporter

## [0.5.13] - 2026-05-23

### Added

- New skills: bosia-env (environment variable prefixes) and bosia-cors (cross-origin config)

### Changed

- Inspector now shows full component chain (outer page → inner component) so AI edits right file

### Added

- HTML comments track component call-sites for inspector overlay reconstruction
- Production now handles uncaught errors (logs and exits cleanly for restart)
- New MAX_INFLIGHT env var limits concurrent requests to prevent OOM under load

## [0.5.12] - 2026-05-22

### Fixed

- Dev server no longer misses file edits via atomic writes (added 5s mtime poll safety net)
- Dev crash loop no longer hangs (now retries with exponential backoff forever)
- Error pages now auto-reload when source is fixed (instead of stuck on error screen)

## [0.5.11] - 2026-05-21

### Fixed

- Fixed inspector in dev mode

## [0.5.10] - 2026-05-20

### Added

- New `goto()` function for programmatic page navigation without full reload
- New `beforeNavigate()` and `afterNavigate()` hooks to hook into navigation lifecycle
- New navigation guide documenting all navigation patterns (link, goto, form redirect)
- New bosia-navigation skill for AI agents building navigation features

### Fixed

- Hydration errors now log to console (previously silent with stuck loading spinner)
- Error pages no longer show loading spinner that blocks clicking links

## [0.5.9] - 2026-05-20

### Added

- New `src/app.html` template support for customizing HTML shell
- New `bosia add font` command to add Google Fonts to src/app.css
- New bosia-app-css skill teaching font import order for Tailwind

## [0.5.8] - 2026-05-19

### Fixed

- Dev no longer crashes on bind directives in Svelte components (fixed shadow variable)
- Dev no longer fails when multiple routes import same component with styles

## [0.5.7] - 2026-05-19

### Added

- Inspector now shows runtime error badge in corner; click to see list and send to AI

### Changed

- Route params now passed as separate `params` prop (not nested in `data.params`)
- Starter templates now organize public pages under `(public)/` route group

### Fixed

- Inspector stack traces now point to correct source line in .svelte files

## [0.5.6] - 2026-05-18

### Fixed

- Build and dev can now run simultaneously (build no longer deletes dev output)

## [0.5.5] - 2026-05-18

### Changed

- Dev server now writes to .bosia/dev/ instead of ./dist/ to avoid conflicts with prod builds

### Added

- New BOSIA_OUT_DIR env var lets you build to a custom output folder

## [0.5.4] - 2026-05-17

### Fixed

- Dev no longer crashes on pages with multiple routes but no component styles

### Added

- New IDLE_TIMEOUT setting for slow streaming responses (chat, etc)
- Six new brief-intake skills guide users through app design questions (name, audience, colors)
- New bosia-frontend-design skill forces aesthetic consistency (fonts, colors, memorable detail)
- Brief-intake now collects design direction and stores in BRIEF.md for consistency

### Changed

- Component installation now batches 1-3 items per call (faster, avoids timeouts)
- All page scaffolds now read BRIEF.md to inherit design direction
- Brief review now checks that design direction was committed and applied

## [0.5.3] - 2026-05-16

### Added

- API routes can now be prerendered as static .json files at build time

### Changed

- Docs API endpoints now use framework prerender instead of hand-rolled JSON generation
- API response field changed from `mdFile` to `content` for consistency

### Fixed

- Dev .json URLs now work correctly for dynamic routes with catch-all siblings
- Docs pages no longer crash with syntax highlighter in production builds

## [0.5.2] - 2026-05-15

### Added

- New chat design skills: message composer and message feed with built-in markdown renderer
- `bosia add` now accepts multiple components in one call
- New `-y` / `--yes` flag on `bosia add` for CI/script automation
- Docs site now has /api/components and /api/blocks JSON endpoints

## [0.5.1] - 2026-05-15

### Added

- New DISABLE_X_FRAME_OPTIONS env var lets apps be embedded as iframes
- Docs site now has public /api/skills endpoint for AI agents to read guides

### Changed

- New projects ship with Inspector plugin enabled by default (Alt+click to edit)

### Fixed

- Dev no longer gets stuck on "App server is starting" after file save

## [0.5.0] - 2026-05-14

### Changed

- Page data now embedded as JSON in HTML (faster parsing than JavaScript)

### Added

- Pages/layouts now skip reloading data when dependencies didn't change
- New `depends()` API lets loaders declare custom dependencies
- New `invalidate()` / `invalidateAll()` helpers for selective cache invalidation
- Loaders now auto-track reads and only re-fetch when inputs change
- New data invalidation guide with examples

### Fixed

- Link prefetches now tell server which loaders are cached (no unnecessary re-runs)

## [0.4.6] - 2026-05-13

### Added

- New CSP_DIRECTIVES env var for strict Content Security Policy with nonces
- New event.locals.nonce field to use nonces on custom inline scripts

### Changed

- CSP nonce only generated when CSP is enabled (performance improvement when off)

### Fixed

- Redirects now reject javascript:/data:/vbscript: URLs (security)
- CSRF checks no longer trust forwarded headers by default (set TRUST_PROXY to enable)
- CORS responses now always include Vary: Origin header (cache safety)
- Prerender now validates dynamic routes don't escape output folder
- CORS preflight now checks methods and headers against allow-list
- Dev CSRF checks now work correctly behind proxy

## [0.4.5] - 2026-05-11

### Added

- Two new registry kinds: Blocks (ready-made UI sections) and Themes (color/font packs)
- New `bosia add block` and `bosia add theme` commands
- First theme ships: editorial (serif + warm cream)
- Docs site has Blocks and Themes sections with previews

## [0.4.4] - 2026-05-09

### Fixed

- Production builds no longer fail with CSS duplication errors on many routes

## [0.4.3] - 2026-05-09

### Changed

- Page route resolution now happens once per request (not 3-4 times) — slightly faster

### Fixed

- Production builds no longer fail with CSS errors from Svelte inline styles

### Removed

- Removed redundant API route pre-handler, removed bun-plugin-svelte dependency

## [0.4.2] - 2026-05-07

### Fixed

- New projects now ship with working .gitignore file
- `bun run check` now passes on freshly created projects

### Added

- New `bun run check:templates` script validates template integrity

## [0.4.1] - 2026-05-06

### Added

- New inspector plugin: Alt+click any element to jump to its source code in your editor

## [0.4.0] - 2026-05-05

### Added

- New plugin system with bosia.config.ts (zero overhead if unused)
- New server-timing plugin shows request timing in browser DevTools
- New defineConfig helper for type-safe configs

### Changed

- server-timing metric name changed from `total` to `handler`

### Fixed

- Plugin imports now resolve correctly from node_modules

## [0.3.4] - 2026-05-04

### Added

- Error pages can now be nested in any route folder (not just root)
- In-app errors now use nearest error page without full reload

### Fixed

- Ctrl+C now cleanly stops dev server (no misleading error code)

## [0.3.3] - 2026-05-03

### Added

- New testing guide with bun test examples
- Error pages now have type hints via ./$types

### Changed

- Build now fails clearly on malformed tsconfig.json

### Fixed

- Form submissions without JavaScript now work correctly

## [0.3.2] - 2026-05-02

### Fixed

- Ctrl+C now stops server on first press (not requiring second press)
- Server now shows proper error page instead of broken partial content
- Build cleanup prevents port conflicts when building multiple times
- Rapid file saves no longer trigger duplicate rebuilds

## [0.3.1] - 2026-05-01

### Added

- Public pages now share single server request (faster, less load)
- New `(private)` folder pattern for per-user pages (dashboards, etc)

### Fixed

- Fixed security issue where users could see each other's data
- Fixed crash when creating new projects
- .env deletions now take effect immediately in dev server

## [0.3.0] - 2026-04-30

### Added

- New `bosia test` command with auto-configured environment
- 167 automated tests for framework utilities and build tools
- Automatic code formatting with Prettier across all templates
- New `trailingSlash` option to control URL format

### Fixed

- Fixed trailingSlash setting being silently ignored

### Changed

- Route params now have proper TypeScript types (errors on wrong param names)

## [0.2.3] - 2026-04-29

### Added

- Feature install now merges files instead of replacing them (preserves customizations)
- Forms now submit without full page reload (progressive enhancement)
- New `ssr = false` option for client-only pages

### Security

- Page language tag validation (prevents code injection via lang attribute)
- CORS_MAX_AGE validation at startup

### Changed

- Compression threshold raised to 2KB (small responses faster without compression)

### Fixed

- Non-English character compression now works correctly
- .env comment parsing now ignores inline comments after value

## [0.2.2] - 2026-04-28

### Security

- Fixed cookies being sent to third-party APIs (only forwarded to own server now)

### Changed

- Link prefetch cache limited to 50 entries (prevent unbounded memory growth)
- Prefetch data expires after 30 seconds (shows fresh content when idle)

### Fixed

- Cmd/Ctrl+click and middle-click no longer intercepted by router

## [0.2.1] - 2026-04-26

### Changed

- Route matching now faster (patterns compiled once at startup)

## [0.2.0] - 2026-04-25

### Added

- Multiple visitors to same page now share single server call (less load)

### Changed

- Builds now 500–1000ms faster (client + server bundles in parallel)
- Tailwind compiles during build (saves another 500–800ms)
- Middleware handlers now loop instead of nesting (prevent call stack issues)

## [0.1.26] - 2026-04-24

### Added

- Direction, Kbd, ScrollArea, Resizable, Menubar, ContextMenu components

### Changed

- Kbd component can now trigger actual keyboard shortcuts

## [0.1.25] - 2026-04-23

### Added

- AspectRatio and RangeCalendar components

### Fixed

- Component previews now display in correct position in docs
- Restored missing previews for sidebar, navbar, chart, data-table, icon
- Floating UI elements no longer cut off in preview containers

## [0.1.24] - 2026-04-22

### Added

- Popover now supports hover trigger with configurable close delay
- Popovers can now be controlled programmatically
- Sidebar submenus open on hover when collapsed

## [0.1.23] - 2026-04-21

### Added

- 12 Typography components (H1–H4, P, Blockquote, etc) for consistent text styling
- 6 new icons: terminal, book, package, hash, map, circle
- SidebarTrigger button for programmatic sidebar control
- Sidebar now has collapsed icon-only mode with hover submenus

### Changed

- Sidebar demo redesigned with company header and user avatar footer

### Fixed

- Sidebar text/labels properly hidden in icon-only mode
- Text no longer overflows during collapse animation
- Icons now properly centered in collapsed sidebar

## [0.1.22] - 2026-04-20

### Added

- Empty component for no-content states
- Carousel component with autoplay and keyboard navigation

## [0.1.21] - 2026-04-19

### Added

- Form component with validation state management (Zod/Valibot compatible)

## [0.1.20] - 2026-04-18

### Added

- Item, Collapsible, DatePicker components

## [0.1.19] - 2026-04-17

### Added

- Table components (Table, Header, Body, Row, Cell) for data display
- Calendar component with month/year nav and date constraints

### Removed

- Removed clsx dependency (functionality moved to cn() utility)

## [0.1.18] - 2026-04-16

### Added

- NativeSelect component (styled native dropdown for mobile/forms)
- InputOTP component with copy-paste and SMS autofill

## [0.1.17] - 2026-04-14

### Added

- ButtonGroup component for connected button rows/columns

## [0.1.16] - 2026-04-12

### Added

- InputGroup component with prefix/suffix text and icons
- Combobox component with searchable filtering
- Command component for keyboard-driven palette search

## [0.1.15] - 2026-04-11

### Added

- Accordion, Pagination, Breadcrumb, NavigationMenu components

## [0.1.14] - 2026-04-10

### Added

- Tabs, HoverCard, Popover, Progress, Alert, AlertDialog components
- Sonner toast notification system
- Tooltip, Spinner, Skeleton components

## [0.1.13] - 2026-04-09

### Added

- Toggle, Textarea, Switch, Field, ToggleGroup, Slider components

## [0.1.12] - 2026-04-08

### Added

- Select, RadioGroup, Label, Dialog, Checkbox components

## [0.1.11] - 2026-04-07

### Changed

- `--template drizzle` renamed to `--template todo`

## [0.1.10] - 2026-04-06

### Changed

- Todo components now organized in subfolders like UI components
- Component docs moved to dedicated subfolders
- Docs sidebar shows UI and Todo as separate groups

## [0.1.9] - 2026-04-05

### Added

- Auto cache headers (private for user content, cacheable for public)
- Metadata documentation page for SEO/social sharing
- Open Graph, Twitter card, canonical tags on all docs
- Automatic sitemap.xml generation with language alternates

## [0.1.8] - 2026-04-04

### Changed

- Drizzle template now uses registry features (keeps in sync automatically)
- Feature/component install now supports non-interactive mode for scripts
- Missing DATABASE_URL now shows clear warning

## [0.1.7] - 2026-04-04

### Added

- Cookies now have secure defaults (httpOnly, secure, SameSite: Lax)

### Changed

- Todo feature split into cleaner data/logic/handler layers

## [0.1.6] - 2026-04-03

### Fixed

- Cookie names now follow HTTP standard (work with other servers)
- Invalid .env variable names now show clear error with line number
- .env double-quoted values now support escape sequences (\n, \t, \\)

## [0.1.5] - 2026-04-01

### Added

- Server graceful shutdown (waits up to 10s for in-flight requests)

### Fixed

- Rapid file saves no longer trigger multiple builds (queued instead)

## [0.1.4] - 2026-03-30

### Added

- redirect() now blocks external URLs by default (security)

### Fixed

- Page navigation now scrolls to top as expected
- Back/forward buttons no longer force scroll to top
- Stylesheets/scripts no longer duplicated in page head

## [0.1.3] - 2026-03-29

### Added

- `bosia add` now installs top-level components to correct path
- `bosia feat` auto-installs required dependencies and asks before overwriting
- New `--template drizzle` with PostgreSQL + todo demo
- New `bosia feat drizzle` and `bosia feat todo` features
- Component registry now supports features

## [0.1.2] - 2026-03-28

### Added

- Docs rebuilt using Bosia with Markdown parsing and Shiki syntax highlighting
- Docs now have sidebar, navbar, dark mode, i18n (EN/ID)
- Live component demos in documentation
- Landing page with hero and quick-start
- Dynamic route prerendering with `entries()` export
- `generateStaticSite()` for static hosting
- GitHub Actions deployment workflow for GitHub Pages

### Changed

- Data endpoint now uses path-based URLs (for static hosting)
- Prerendered pages include data files for client-side navigation
- `bosia add` now fetches from GitHub directly

### Fixed

- Mobile rendering now works with viewport meta tag
- Syntax highlighter errors now logged with language name

## [0.1.1] - 2026-03-27

### Added

- Component registry with 12 UI components (avatar, badge, button, card, etc)
- Live, interactive component demos in docs
- `bosia add --local` for local registry during development
- Custom component paths (`bosia add shop/cart`)
- `cn()` utility auto-created by `bosia add`
- Confirm/skip prompt when component already exists

## [0.1.0] - 2026-03-26

### Changed

- Renamed framework from bosbun to bosia
- Template picker now uses arrow keys for navigation

## [0.0.8] - 2026-03-26

### Changed

- Environment import path changed from bosbun:env to $env

### Added

- Dev server now auto-restarts on crash (stops after 3 rapid crashes)
- Added docs site with 14 pages
- Full Indonesian documentation translations
- Automated GitHub Pages deployment

### Removed

- Removed unused renderSSR and buildHtmlShell functions
- Made internal APIs private (STATIC_EXTS, DEFAULT_CSRF_CONFIG, etc)

### Fixed

- PUT/PATCH/DELETE now use full middleware pipeline
- Fixed timer memory leak on request timeout
- Fixed caching bug with old HTML shells
- Client navigation with query strings/fragments now works

## [0.0.7] - 2026-03-25

### Added

- `bosbun create` now shows an interactive template picker — choose between `default` (minimal starter) and `demo` (full-featured with blog, API routes, form actions, and more).
- Added automated npm publishing — new versions are published automatically when the version in `package.json` is bumped.

### Updated

- Updated the package description and README to better explain what Bosia is and what makes it different.

### Changed

- Replaced the rabbit emoji with a new SVG logo across all templates, CLI output, and the favicon.

### Fixed

- Fixed `bosbun create` to pin the framework to the version used when creating the project instead of always pulling the latest.
- Fixed Tailwind CSS not being found in certain install layouts (hoisted vs. nested `node_modules`).
- Fixed a crash on first page load when Bosia is installed via npm — caused by two separate copies of the Svelte runtime being loaded at the same time.
- Fixed an incorrect path being added for Tailwind CSS resolution in monorepo setups.

## [0.0.6] - 2026-03-25

### Changed

- Renamed framework from bunia to bosbun

## [0.0.5] - 2026-03-24

### Added

- Link prefetching on hover and scroll (5s cache)

## [0.0.4] - 2026-03-23

### Added

- Data loading timeouts (load: 5s, metadata: 3s; configurable)
- Build timeout for static prerendering

### Fixed

- System PUBLIC\_ env vars no longer leaked to browser
- Streaming errors now return proper status and error page
- JSON serialization no longer crashes on circular references
- Path traversal attacks now blocked on static files
- Invalid cookie percent-encoding now fails gracefully
- Cookie domain/path validation prevents header injection

### Changed

- Routes now sorted and matched more efficiently

## [0.0.3] - 2026-03-21

### Added

- metadata() function for server-side page metadata (SEO-friendly)
- Form actions in +page.server.ts with validation and named actions

## [0.0.2] - 2026-03-20

### Added

- .env file support with prefix-based access control (PUBLIC*, STATIC*, server-only)
- Graceful shutdown with 10s safety net for in-progress requests
- Configurable request body size limit (default 512KB)
- CSRF protection on form submissions and API mutations
- CORS support via CORS_ALLOWED_ORIGINS env var
- Error responses now hide stack traces in production

### Fixed

- XSS vulnerability: special chars in JSON now properly escaped
- SSRF risk: internal data endpoint now validates path parameter

## [0.0.1] - 2026-03-19

### Added

#### Core

- SSR with Svelte 5 Runes support
- File-based routing (+page.svelte, +layout.ts, +server.ts)
- Dynamic and catch-all routes with typed parameters
- Route groups for shared layouts
- Error pages with HTTP status codes

#### Data Loading

- load() function with auto-typed $types codegen
- PageData/PageProps and LayoutData/LayoutProps types

#### Server

- ElysiaJS server (port 3001 dev, 3000 prod)
- Gzip compression, static file caching
- /\_health endpoint for monitoring
- Cookie support with Set-Cookie headers

#### Client

- Client-side hydration and router (instant page navigation)
- Navigation progress bar and HMR
- CSR opt-out with `export const csr = false`

#### Build

- Bun build pipeline with Svelte plugin
- Client/server bundles with manifest
- Static prerendering with `export const prerender = true`
- Tailwind CSS v4 built-in
- $lib alias for clean imports

#### CLI

- bosbun dev/build/start/create commands

#### Developer Experience

- Project template with Dockerfile
- Full TypeScript support with auto-patched tsconfig
- Hooks middleware system with sequence() helper

## [0.0.0] - 2026-03-19

### Added

- Initial framework scaffolding and core SSR/client infrastructure
- Dev server with proxy and file watcher
- CLI with dev/build/start/create commands
- Demo application
