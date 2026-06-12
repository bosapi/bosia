# Bosia — Roadmap

> Track what's done, what's next, and where we're headed.
> Current version: **0.6.25**

---

## 0.6.25 — Port the Mercato storefront (new `page` tier + 24 blocks + clay theme)

> Ports the standalone Mercato React storefront (one template, six store "purposes", four full page templates) into Bosia. Adds a brand-new **`page` registry tier** (a page = a group of blocks, no backend) installed via `bosia add page <name>` to `src/lib/pages/<name>/`. Sections harvested into 24 `storefront/*` blocks (semantic tokens only, brand → `primary`, sale → `destructive`), pages composed from them via `$lib/blocks/storefront/*` sharing one runes cart. Five purposes map to existing themes (fashion→editorial · grocery→forest · tech→paper · beauty→bloom · garden→sage); the sixth ships a new `clay` theme.

- [x] 🟠 New `page` registry tier + CLI — `packages/bosia/src/cli/page.ts` (`runAddPage`, models `block.ts`), routed in `addRouter.ts` (+ `pages/...` alias) and `index.ts`; `pages` added to the `Manifest` (`recordPage`) and `RegistryIndex`; `bosia add list` shows installed pages; dispatch tests in `registry.test.ts`.
- [x] 🟠 Harvested 24 sections under `registry/blocks/storefront/*` — `store` (runes cart/favs/drawer `.svelte.ts` + sample catalogue + per-purpose seed), `header`/`footer`, home sections, `product-card`/`grid`/`featured-collection`/`cart-drawer`, listing `filter-sidebar`/`sort-bar`, PDP `product-gallery`/`product-options`/`trust-row`/`pdp-accordions`, checkout `checkout-form`/`promo-field`/`order-summary`/`order-confirmed`. Registered in `registry/index.json`.
- [x] 🟠 Added the `clay` theme (`registry/themes/clay/`) — warm paper neutrals, terracotta primary, soft warm shadows, Newsreader/Hanken Grotesk/Geist Mono fonts; registered in `registry/index.json` (19 themes).
- [x] 🟠 Four pages under `registry/pages/storefront/{home,listing,product,checkout}/` — composition only, one shared `createCart()` wired through header/grids/drawer; each `meta.json` lists its block/ui deps so the installer recurses.
- [x] ⚪ Docs — new **Pages** section (`pages/overview` with the purpose→theme table + 4 page pages), 6 grouped `blocks/storefront/*` pages, `themes/clay`; 10 demos registered; nav Pages group + Storefront block group + Clay theme; new `bosia-storefront` skill + skills-index row; docs `$lib/blocks`/`$pages` aliases + `registry/pages` Tailwind `@source`.

---

## 0.6.24 — Port the Hero Stock hero system (17 blocks)

> Ports the standalone Hero Stock React design system (17 full-bleed hero sections across 6 verticals) into a new `heros/` block category alongside `cards/` and `files/`. Per-vertical hardcoded accents (flare/cobalt/grape/gold/blush) collapse to **`primary`**; dark photo heroes invert to `bg-foreground text-background`. Theme-agnostic semantic tokens only, so each hero restyles across all 18 themes — no new theme added.

- [x] 🟠 Ported 17 hero blocks under `registry/blocks/heros/*` (commerce ×7, education ×2, food ×2, fashion ×2, services ×2, saas ×2); inline Tailwind on semantic tokens, inlined nav/badges/ratings/specs, interactive pickers as local `$state`, kept the original Unsplash images. Registered in `registry/index.json`.
- [x] ⚪ Docs — 17 per-hero pages (one `.md` per hero, each backed by its `meta.json` so `/api/blocks` lists each hero with its own install line + category, mirroring `files/`); single-hero live previews; new `bosia-heros` skill cataloguing all 17; nav grouped by vertical (`Heros — Commerce`, etc.); row added to the skills index.

---

## 0.6.24 — Port the Cardstock card system (29 blocks + 6 themes)

> Replaces the single `cards/feature-editorial` block (now removed — it painted its numeral with `accent`, a subtle hover background, so it never followed the brand). The new cards map the brand colour to **`primary`** and reference semantic tokens only, so they restyle across every theme.

- [x] 🟠 Extended the theme contract on all 12 existing themes — added `--font-mono` and theme-scoped elevation (`--shadow-xs/sm/md/lg` wired through `--elevation-*` per `:root`/`.dark`; midnight gets a faint primary glow).
- [x] 🟠 Added 6 Cardstock themes — `paper`, `carbon` (brutalist hard-offset shadows), `bloom` (diffuse tint), `terminal` + `grape` (dark glow), `sage`; each with light + dark, registered in `registry/index.json` (18 themes) + docs pages + nav.
- [x] 🟠 Ported 29 card blocks under `registry/blocks/cards/*` (data, people, commerce, media, utility, auth); inline Tailwind on semantic tokens, status colours shadcn-style (emerald/amber/blue/destructive), sparkline/ring/mini-bars as inline SVG. Registered in `registry/index.json`.
- [x] 🟠 Removed `registry/blocks/cards/feature-editorial/`; re-pointed tests, CLI help, docs demo/page, and the `bosia-landing`/`bosia-saas-landing`/`bosia-block-compose` skills to `cards/feature` (now takes `title`/`body`/`icon`/`cta` props).
- [x] ⚪ Docs — 6 per-category card pages with live demo galleries + per-card install lines; new `bosia-cards` skill cataloguing all 29.

---

## 0.6.24 — Remove the Todo template + feature ahead of rebuilding card blocks

> The `todo` starter template (and its `todo` feature/components) was the original CRUD demo. We're rebuilding the card blocks from scratch, so the todo scaffold is being pulled to clear the way. The `editorial` card block stays for now — it can't be removed until the replacement card blocks exist.

- [x] 🟠 Deleted `packages/bosia/templates/todo/`, `registry/features/todo/`, `registry/components/todo/`, and `docs/content/docs/components/todo/`.
- [x] 🟠 `registry/index.json` — dropped `todo` from `features` and the four `todo*` `components` entries.
- [x] 🟠 `packages/bosia/src/cli/{create,index,add,feat}.ts` — removed the `todo` template description/example and re-pointed the stale `todo` doc-comment examples at still-present features.
- [x] ⚪ Docs — removed the Todo template rows and component pages from `getting-started.md`, `components/overview.md`, `reference/cli.md`, `guides/inspector.md`, the docs `nav.ts` Todo group, and the `bosia-block-compose` skill's example registry listing.

---

## 0.6.24 — Three-state theme switcher (Light / Dark / System)

> Theme switching was binary (light/dark) and the logic was duplicated across four places, each slightly different — the registry navbar never even persisted or synced with the FOUC result. This unifies the semantics (`theme` ∈ `light|dark|system`, missing = system, default System) and ships a single cycle toggle.

- [x] 🟠 `packages/bosia/src/core/html.ts` — extracted the inline FOUC bootstrap (duplicated 4×) into one `THEME_INIT_JS` constant; now resolves an explicit `system` value live against `prefers-color-scheme`, backwards-compatible with stored `dark`/`light`.
- [x] 🟠 `registry/components/ui/navbar/navbar.svelte` — replaced the buggy `isDark` boolean (never persisted, started out of sync with FOUC) with a 3-state `light/dark/system` cycle that persists to `localStorage`, syncs the DOM, and follows live OS changes while in System mode. Button shows Sun / Moon / Monitor.
- [x] 🟠 `docs/src/lib/components/ThemeToggle.svelte` + `docs/src/routes/+layout.svelte` — mirror the same 3-state logic and system-aware FOUC script (Monitor inline SVG added).
- [x] ⚪ `docs/content/docs/guides/styling.md` + `docs/content/docs/components/ui/navbar.md` — document the three modes, storage values, and cycle pattern.
- [x] ⚪ Bumped `svelte` to `^5.56.3` in the 5 stale `package.json` files (docs, 4 templates); root, `packages/bosia`, and `apps/demo` were already current.

---

## 0.6.24 — `add theme` strips the template's default `:root`/`.dark` block

> A theme's `tokens.css` defines its own `:root`/`.dark`, but the template's `app.css` already ships a default `:root`/`.dark` block earlier in the file. After `add theme` both coexisted at the same specificity and the template's (earlier) won — so the installed theme's colours never fully applied until someone hand-deleted the template block (observed in a titoko build transcript).

- [x] 🟠 `packages/bosia/templates/{default,shop,demo}/src/app.css` — wrapped the default `:root`/`.dark` token block in `/* bosia-theme-vars */ … /* /bosia-theme-vars */` sentinels so removal targets exactly the template defaults, never user-authored `:root` rules. `@theme {}` (Tailwind token mapping) stays above the markers, untouched.
- [x] 🟠 `packages/bosia/src/cli/theme.ts` — `runAddTheme` now calls `stripTemplateThemeVars(appCssPath)` after wiring the `@import`, removing the sentinel-bounded block (idempotent: a no-op once removed or on apps that never had it). The installed theme's `:root` becomes the only one, so its tokens win.

---

## 0.6.23 (2026-06-11) — Surface yesterday's shop-template bugs in skills + ban the `postgres` npm pkg

> Yesterday's 0.6.22 shipped the `shop` template and patched 5 install-blocking bugs in code. Three of them reflect cross-cutting gotchas future registry/framework authors WILL hit again, and the shop `package.json` still carried a stale `postgres` dep that the `Bun.SQL` scaffold doesn't need. This is a doc/clarity follow-up: surface the gotchas in the skills layer (where future AI runs will read them) and remove the stale dep so the lock file doesn't keep installing it.

- [x] 🟠 `packages/bosia/src/core/dev.ts` — the proxy's "App server is starting…" 503 (returned while the inner app is mid-rebuild) is now an HTML page carrying the same `/__bosia/sse` reload client as the dev-500 page, instead of bare `text/plain`. A live-reload racing into a rebuild window used to land here and stick forever (no SSE connection in the document), which surfaced in titoko as a preview frozen on "app server is running" until a manual reload; now the next `broadcastReload()` once the app binds reloads it automatically. Body keeps the literal "App server is starting" phrase so titoko's proxy retry still matches.
- [x] 🟠 `packages/bosia/src/core/dev.ts` — reload-hold control for host orchestrators: `POST /__bosia/hold` suppresses the `/__bosia/sse` reload broadcast (rebuilds keep running, latest code stays ready), `POST /__bosia/resume` clears the hold and flushes exactly one reload if any rebuild fired meanwhile. Both idempotent. `hold` doubles as a heartbeat: the first call opens the window, later calls only re-arm a 90s safety timer (preserving any queued reload), so the hold lasts as long as the orchestrator keeps pinging — the timer auto-resumes ONLY if pings stop (orchestrator crash), never mid-task. Defaults off — plain `bosia dev` behaviour is unchanged. (Lets titoko collapse N per-edit AI reloads into one when the agent finishes.)
- [x] 🟠 `packages/bosia/templates/shop/package.json` — drop unused `"postgres": "^3.4.0"`; scaffold uses Bun-native `drizzle-orm/bun-sql` against `Bun.SQL`, no userland driver needed.
- [x] 🟠 `docs/content/skills/bosia-bun-runtime/SKILL.md` — new `## Postgres — Bun.SQL` section with the object-form snippet + Bun 1.3.x `FailedToOpenSocket` URL-string gotcha; banned-packages table gains `postgres` and `pg` rows pointing at `Bun.SQL` + `drizzle-orm/bun-sql`.
- [x] 🟠 `docs/content/skills/bosia-database-setup/SKILL.md` — reversed the misleading "`bun add postgres`" line into a "**no install**" directive cross-linking [[bosia-bun-runtime]]; R5 gains a one-liner about the URL-string gotcha so the gotcha is discoverable from the database side without duplicating code.
- [x] 🟠 `docs/content/skills/bosia-drizzle-feature/SKILL.md` — new R11 ("Registry files use import paths from their **target** location") covering `meta.json#files[].target` depth, with the `auth` feature's 3-up `../../../features/auth` import as the canonical example; P0 checklist gains a matching gate.
- [x] 🟠 `registry/components/ui/sidebar/sidebar-menu-item.svelte` — `hasChildren = $derived(!!children && !href)` so leaf items with a `{#snippet icon()}` body don't accidentally render as collapsible parents (Svelte 5 populates `children` from whitespace around named snippets, flipping leaves into accordion mode with a dead chevron).
- [x] 🟠 `registry/features/shop/admin-sidebar.svelte` — Orders is now a parent grouping `All orders` / `Pending` / `Refunds` under one `SidebarMenuItem`, demonstrating the parent/leaf branching in the shipped scaffold (and matching `SidebarDemo` shape). Logo `<img>` tags also gain `h-5 w-5` so the SVG renders at 20px in the sidebar header rather than overflowing at its native 200×200.
- [x] ⚪ `docs/content/skills/bosia-shop-template/SKILL.md` — new skill bundling the eight rules an agent extending a shop scaffold needs (don't re-install features, edit `AdminSidebar`/`PublicNavbar` in place, no `postgres`/`pg`/`@aws-sdk` deps, new routes under `(private)/dashboard/`, services not `db.select` in routes, seeds start at `003_*`, `Bun.s3` for uploads, `+server.ts` logout pattern). Cross-links `[[bosia-auth-flow]]` / `[[bosia-rbac]]` / `[[bosia-sidebar]]` / `[[bosia-dashboard]]` / `[[bosia-file-upload]]` / `[[bosia-clean-architecture]]` / `[[bosia-query-defaults]]` / `[[bosia-bun-runtime]]`. Inventory cross-link to `backup/SHOP_TEMPLATE.md` for human reference.
- [x] 🟠 `packages/bosia/src/core/server.ts` — API-route (`+server.ts`) handler now treats `throw redirect(...)` and `throw error(...)` the same way page actions do (303 Response / typed JSON error) instead of crashing into the generic 500 branch. Also supports `return redirect(...)`. Discovered via the shop `POST /logout` flow throwing `Redirect { status: 303, location: "/" }` and getting reported as `API route error` 500.
- [x] 🟠 `packages/bosia/templates/{default,shop,todo,demo}/src/app.css` — add `@custom-variant dark (&:where(.dark, .dark *));`. Tailwind v4 defaults `dark:` to `@media (prefers-color-scheme: dark)`, so the navbar's `document.documentElement.classList.toggle("dark")` was a no-op — `dark:bg-*`, `dark:text-*`, `dark:block`, `dark:hidden` (including the theme-aware logo swap) only fired when the OS itself was in dark mode. The custom-variant rebinds `dark:` to the `.dark` class selector so the toggle actually drives the theme across every template scaffold.
- [x] 🟠 `registry/features/shop/admin-sidebar.svelte` — header rebuilt per `SidebarDemo` canonical pattern: theme-aware logo `<button>` (Bosia SVG) that doubles as a collapse toggle, brand row with `Shop Admin` / `Storefront` subtitle, and a real `<SidebarTrigger {collapsed} onclick={() => (collapsed = !collapsed)} />` so the trigger button actually toggles (was a dead `<SidebarTrigger class="ml-auto" />`). Footer dropdown reworked per `bosia-sidebar` R5/R6.5/R6.6 — `DropdownMenu bind:open class="block w-full"`, `DropdownMenuTrigger` `justify-between`, `<span bind:this={chevronEl}>` chevron with `style:transform` rotation, `DropdownMenuContent floating side="top" align="end" anchor={chevronEl}` so the menu pops above the chevron, and Sign out is a real `<form method="POST" action="/logout"><button type="submit">` outside `DropdownMenuItem` so it doesn't double-wrap interactives.
- [x] 🟠 `registry/features/shop/meta.json` — add `"ui/breadcrumb"` to `components` so `bosia create … --template shop` actually scaffolds the breadcrumb files.
- [x] 🟠 `packages/bosia/templates/shop/src/routes/(private)/+layout.svelte` — derive `segments` from `page.url.pathname`, render `<Breadcrumb>` above `{@render children()}` so dashboard / products / orders get a breadcrumb for free; last segment becomes `<BreadcrumbPage>`, earlier ones become `<BreadcrumbLink>` pointing at the cumulative path.
- [x] 🟠 `packages/bosia/templates/shop/src/routes/(public)/+page.svelte` — add a `<svelte:head>` with `<title>Welcome to your shop</title>` + `<meta name="description">` so the home page has basic SEO instead of an empty `<head>`.
- [x] 🟠 `registry/features/auth/login-page.svelte` + `register-page.svelte` — sibling `<meta name="description">` inside the existing `<svelte:head>` (login: "Sign in to your account."; register: "Create your account. The first account becomes the admin.").
- [ ] ⚪ CLI-internal bugs (block-deps 404 routing, `--local` flag drop, dialect default under `skipPrompts:true`) deliberately omitted — code-only fixes, no public API to document.
- [x] 🟠 `packages/bosia/src/cli/block.ts` — session-level `installed` Set mirrors `add.ts:40`; `runAddBlock` early-returns when a block is already installed in this session. Without it, `files/upload-area` was re-written during shop scaffold because both `file-upload` and `files/image-dialog` pull it.
- [x] ⚪ `registry/features/shop/meta.json` — drop `ui/typography` (unused) and `ui/form` / `ui/input` / `ui/button` (already declared by `auth`; component installer dedupes via `add.ts:116` so removal is safe).

---

## 0.6.22 (2026-06-10) — `shop` template + `auth` / `rbac` / `shop` registry features

> Templates today bottom-out at `todo` (one CRUD feature). The most common "build me an app" prompt is a storefront, but there was no auth, no permission system, no product/order domain in the registry — every consumer reinvented login from scratch. This adds three composable registry features (`auth`: email/password + sessions via `Bun.password` argon2id, no `argon2` npm dep; `rbac`: `(userId, resource, action, scope)` rows with `*` wildcards and `locals.can()`; `shop`: products/orders/cart with repositories, services, and a `PublicNavbar`/`AdminSidebar` pair) and a thin `shop` template that declares `features: ["auth","rbac","file-upload","shop"]` so `bosia create my-shop --template shop` wires everything via the existing `installFeature` plumbing — no CLI changes needed.

- [x] 🟠 `registry/features/auth/` — multi-dialect (pg/mysql/sqlite) `user`/`session` tables, `Bun.password.hash({ algorithm: "argon2id" })` (zero npm crypto deps), opaque base64url session tokens, cookie-based resolver via `event.cookies`, sequence-able `authHandle`, `(public)/login` + `(public)/register` pages with `<!-- EDIT THIS FILE -->` AI markers, `POST /logout`, `valibot` + `drizzle-valibot` deps, `SESSION_SECRET` env var.
- [x] 🟠 `registry/features/rbac/` — `permission` table with composite PK, `can(userId, resource, action, scope?)` reader with `*` wildcards, `lib/rbac/resources.ts` registry (extended via append-block by feature consumers), `auth-handle.ts` rewritten on install to attach `locals.can(...)`, `001_rbac_bootstrap.ts` seed grants `('*','*','')` to the first registered user (idempotent), `App.Locals` extension declared via append-block.
- [x] 🟠 `registry/features/shop/` — multi-dialect `product`/`order`/`order_item`/`cart_item` tables, `valibot` validators, repositories + services for products / orders / cart, `PublicNavbar.svelte` (composes `ui/navbar`) and `AdminSidebar.svelte` (composes `ui/sidebar` with `@lucide/svelte` icons + `DropdownMenu floating side="top"` footer), `resources.append.ts` adds eight `shop.*` permissions via append-block, empty `002_shop.ts` seed scaffold.
- [x] 🟠 `packages/bosia/templates/shop/` — thin glue only: `template.json` declares `features: ["auth","rbac","file-upload","shop"]`; ships `hooks.server.ts` (`sequence(dbHandle, authHandle, loggingHandle)`), `(public)/+layout` with `PublicNavbar`, `(private)/+layout.server.ts` gate redirecting to `/login?next=…`, empty `(private)/dashboard/+page.svelte`, `.env.example` with `STORAGE_DRIVER=s3` + `S3_*` skeleton, README with first-user-becomes-admin note. Verbatim default landing copy, swapped to "Welcome to your shop."
- [x] ⚪ `packages/bosia/src/cli/create.ts` — `TEMPLATE_DESCRIPTIONS` map gains `shop: "Online store starter with auth, RBAC, S3 uploads, products/orders/cart"`.
- [x] ⚪ `docs/content/docs/getting-started.md` — template table gains a `shop` row.

---

## 0.6.22 (2026-06-10) — Sidebar docs + skill (fix three AI mis-uses) + `DropdownMenu` floating mode

> AI agents kept hitting the same three failures when scaffolding a sidebar: (1) wrapping leaf `SidebarMenuItem`s in `DropdownMenu` so the `href` was swallowed and "Dashboard" became un-clickable; (2) skipping the user footer because the doc's stub only showed `v0.1.0`; (3) building the user row as plain markup so Profile/Settings/Sign out had nowhere to live. During the docs/demo build we found the would-be fix (compose `DropdownMenu` in `SidebarFooter`) didn't actually work — `Sidebar` has `overflow-hidden` for the collapse width transition, so the default `position: absolute` menu was clipped invisible. Patched `DropdownMenu` with an opt-in `floating` mode (`position: fixed`, trigger rect via context, viewport clamp) plus a `side` prop so consumers can anchor upward from a bottom trigger.

- [x] ⚪ `docs/content/docs/components/ui/sidebar.md` — new "Choosing the right item shape" decision table (leaf vs. parent vs. label-only) with bold "never wrap in `DropdownMenu`" callout; new "User Footer" section (avatar + name + email, respects `collapsed` via `getSidebarContext()`); new "User Menu (Profile / Logout)" section composing `SidebarFooter` + `DropdownMenu` + `Avatar` with **`floating side="top" anchor={chevronEl}`** so the menu escapes `Sidebar`'s overflow clip and opens from the chevron. No skill cross-references inside the component doc — component docs target humans, skills live in their own tree.
- [x] ⚪ `docs/content/skills/bosia-sidebar/SKILL.md` — new skill matching `bosia-navigation` / `bosia-dashboard` house style. STOP block names the three failures. R1–R7 cover leaf/parent shape, no-foreign-trigger, `icon` snippet usage, `bind:collapsed` placement, user-footer composition, the floating/side/align table, and `trigger="hover"` opt-in. P0 checklist gates clickable leaves, working dropdown, `floating side="top"`, `justify-start` chevron, and `+server.ts` Sign-out.
- [x] 🟠 `registry/components/ui/dropdown-menu/dropdown-menu.svelte` — context now exposes `triggerEl` + `setTriggerEl(el)`. `dropdown-menu-trigger.svelte` — `bind:this` on the button, syncs via `untrack` so the registration doesn't loop. `dropdown-menu-content.svelte` — new `floating` (default `false`), `side: "top" | "bottom"` (default `"bottom"`), and `anchor?: HTMLElement` props. When floating, computes `position: fixed` from `anchor.getBoundingClientRect()` (falls back to trigger), clamps to the viewport (8px margin), and re-positions on `scroll`/`resize`. `anchor` lets the menu open from a specific element (e.g. a chevron) instead of the whole trigger row. Non-floating call sites are unchanged.
- [x] ⚪ `docs/src/lib/components/demos/SidebarDemo.svelte` — leading "Dashboard" leaf with `LayoutDashboard` icon (demonstrates R1); user footer rebuilt with `DropdownMenu` + `Avatar` + `AvatarFallback`, `justify-start` on the trigger (fixes chevron position), `floating side="top" align="start"` on the content (so the menu actually opens).

---

## 0.6.21 (2026-06-09) — Fix three AI-agent app-building failures (block install, EACCES, `page` export)

> AI agents building user apps via Bosia hit three reproducible failures: (1) `bosia add blocks/cards/feature-editorial` 404'd because the CLI only routed `block` (singular) to the block installer — the alias form fell through to `runAdd` and was treated as a component → `registry/components/blocks/cards/feature-editorial/meta.json` 404. (2) `bosia add ui/typography` aborted mid-loop on EACCES when a file already existed with foreign uid (tenant apps run sandboxed as `bosapi-app-N`; a follow-up install as the bosapi user couldn't overwrite). (3) `bosia-page-shell`, `bosia-seo`, `bosia-navigation` skills teach `import { page } from "bosia/client"`, but `page` was never exported — the import threw at module load.

- [x] 🟠 `packages/bosia/src/cli/addRouter.ts` — new dispatcher; routes `blocks/<cat>/<name>` tokens to `runAddBlock`, splits mixed batches (components + blocks) into one `runAdd` call plus per-block calls.
- [x] 🟠 `packages/bosia/src/cli/index.ts` — `add` case calls `routeAdd` with injected runners; help text adds the alias.
- [x] 🟠 `packages/bosia/src/cli/registry.ts` — new `writeRegistryFile(dest, content)` helper does unlink + retry on EACCES/EPERM, then surfaces a chown hint if still failing.
- [x] 🟠 `packages/bosia/src/cli/add.ts` and `block.ts` — component/block file write loops route through the new helper.
- [x] 🟠 `packages/bosia/src/core/client/page.svelte.ts` (new) — reactive `page` object backed by `$derived` over `router.currentRoute`; exposes `page.url` and `page.pathname`. No `params` getter — Bosia already plumbs `params` into `+page.svelte` / `+layout.svelte` via `$props()`, matching modern SvelteKit `$app/state`.
- [x] 🟠 `packages/bosia/src/lib/client.ts` — re-export `page`.
- [x] 🟠 `docs/content/skills/bosia-block-compose/SKILL.md` — canonical `bosia add block cards/feature-editorial` example.
- [x] 🟠 `docs/content/skills/bosia-saas-landing/SKILL.md` and `bosia-landing/SKILL.md` — split single install line into per-category calls (theme / components / block).
- [x] 🟠 `docs/content/skills/bosia-svelte-runes/SKILL.md` R6.5 — illustrative "removed import" example switched from `page` to a deleted `cn` utility so the lesson no longer contradicts the now-real `page` export.
- [x] ⚪ `packages/bosia/test/registry.test.ts` — coverage for `routeAdd` dispatch (block, alias, mixed batch, multi-block, plain components), `readRegistryJSON` blocks-category path, `writeRegistryFile` happy-path/overwrite.
- [x] ⚪ `packages/bosia/test/page-store.test.ts` (new) — compile-and-wiring checks for the `page` module (compiles via `svelte/compiler`, output references `derived`, `bosia/client` re-exports `page`).

---

## 0.6.21 (2026-06-09) — `bosia-image-dialog` skill + block (multi-image picker)

> AI-generated apps seed `images.unsplash.com/photo-…` placeholders into markup (per `bosapi/src/features/ai/system-prompt.ts` rule 10), but there was no UI primitive for swapping them out without clobbering — `files/upload-area` opens an empty drop zone with no concept of an "existing image," and nothing existed for multi-image fields at all. New `files/image-dialog` block composes `UploadArea` + an External URL tab + an existing-images gallery (current entity + user's library via `GET /api/files`). Returns `string[]` of URLs on Confirm so the caller atomically replaces the parent field. No server changes — reuses the `file-upload` feat as-is.

- [x] 🟠 `registry/blocks/files/image-dialog/` — `block.svelte` (Dialog + Tabs + selection state, embeds `UploadArea` for the Upload tab, fetches `/api/files` once on mount for the library) and `meta.json` (deps: `ui/button`, `ui/dialog`, `ui/input`, `ui/label`, `ui/sonner`, `ui/tabs`, `blocks/files/upload-area`).
- [x] 🟠 `registry/index.json` — add `files/image-dialog` to `blocks`.
- [x] ⚪ `docs/content/skills/bosia-image-dialog/SKILL.md` — workflow steering, P0/P1 checklist, anti-patterns (single-image flows, id-vs-url storage, merge-with-stale-state).
- [x] ⚪ `docs/content/skills/bosia-file-upload/SKILL.md` — cross-reference the new dialog for replace-existing / gallery flows.
- [x] ⚪ `docs/content/docs/blocks/files/image-dialog.md` + `docs/src/lib/components/demos/FilesImageDialogDemo.svelte` registered in `docs/src/routes/(docs)/[...slug]/+page.svelte`.
- [x] ⚪ `docs/src/lib/docs/nav.ts` — insert Image Dialog under Blocks → Files.

---

## 0.6.21 (2026-06-09) — Drawer component (mobile bottom-sheet)

> Drawer was the last unbuilt Priority-2 overlay in `backup/COMPONENT_PLAN.md`. Mobile action sheets had no first-class component — devs were styling Dialog into a bottom-pinned shape per app. Scope: tap-to-close only, bottom direction only, mirrors Dialog's API so consumers can swap Dialog ↔ Drawer at a breakpoint with minimal churn. No drag gesture, no snap points, no extra deps (pure Svelte 5 runes + Tailwind v4, in line with the no-deps-in-framework rule).

- [x] 🟠 `registry/components/ui/drawer/` — 8 svelte sub-components (`drawer`, `drawer-content`, `drawer-trigger`, `drawer-close`, `drawer-header`, `drawer-title`, `drawer-description`, `drawer-footer`) + `index.ts` + `meta.json`. Mirrors Dialog plumbing (focus trap, escape, scroll lock, `$props.id()`) with slide-up `translateY` animation, bottom-pinned panel, decorative handle bar.
- [x] 🟠 `registry/index.json` — add `ui/drawer`.
- [x] 🟠 `docs/content/docs/components/ui/drawer.md` — usage, props, sub-components, accessibility, Drawer-vs-Dialog guidance.
- [x] 🟠 `docs/src/lib/components/demos/DrawerDemo.svelte` + register in `docs/src/routes/(docs)/[...slug]/+page.svelte`.
- [x] 🟠 `docs/src/lib/docs/nav.ts` — insert Drawer entry under UI children.
- [x] ⚪ `docs/content/skills/bosia-drawer/SKILL.md` — workflow steering for AI agents (mobile-first contract, P0/P1 checklist).
- [x] ⚪ `backup/COMPONENT_PLAN.md` — flip Drawer to `[x]`.

---

## 0.6.19 (2026-06-08) — `.webmanifest` 404 + stale-build recovery

> Two unrelated production bugs surfaced on komba (pure-SSR) after the 0.6.18 deploy. **(1)** `/site.webmanifest` returned 404 because the static-ext whitelist (`isStaticPath`) was missing the extension. **(2)** Users with the app already open got stuck on a never-ending loading state on certain navigations after a new build was deployed — root cause: the SPA bootstrap entry `hydrate.js` was unhashed while its content (embedded chunk hashes) changes every build, and Cloudflare overrode the origin's `no-cache` header to `max-age=14400`. Old `hydrate.js` then references hashed chunks that no longer exist on the server → `import()` rejects → router only `console.warn`s → UI hangs.

- [x] 🟠 `packages/bosia/src/core/server/staticServer.ts` — add `.webmanifest` to the `isStaticPath` whitelist.
- [x] 🟠 `packages/bosia/src/core/build.ts:156-170` — hash the client entry filename (`naming.entry: "[name]-[hash].[ext]"`) so `staticManifest` serves it as `immutable` and per-build URL changes invalidate the browser cache automatically.
- [x] 🟠 `packages/bosia/src/core/client/hydrate.ts` — add a production-only `unhandledrejection` handler that detects failed dynamic `import()` (Chromium/Safari/Firefox messages) and triggers `location.replace(?_v=…)`. Loop-guard via `sessionStorage["bosia:reload-attempt"]` (10s window).
- [ ] ⚪ Follow-up: surface a stale-build event on the router (`onStaleChunk` hook?) so apps can show a soft toast instead of a hard reload — defer until the safety net proves insufficient.

---

## 0.6.18 (2026-06-07) — pure-SSR apps still lost `public/` in production containers

> Bug: komba (pure SSR, zero prerendered routes) redeployed on 0.6.17 — `/bosia-tw.css` 404'd because `generateStaticSite()` early-returned when `dist/prerendered/` didn't exist, so `public/` never got mirrored to `dist/static/`. The 0.6.17 staticManifest walked `dist/static/` correctly, but the folder was empty for SSR-only apps. Fix: always mirror `public/` → `dist/static/` at build time; skip the prerender+client copy when there's no SSG output, but never skip the public mirror.

- [x] 🟠 `packages/bosia/src/core/prerender.ts` — `generateStaticSite()` now copies `public/` unconditionally; SSG-specific copies (prerendered + client mirror) gated on `dist/prerendered/` existing.
- [x] 🟠 Test: build emits `dist/static/` with `public/` contents even when no prerendered routes exist.

---

## Same-day addition (2026-06-06) — replace custom `<Icon>` wrapper with `@lucide/svelte`

> The hand-curated `registry/components/ui/icon` (95 inline SVG paths in `icons.ts`) plus 28 registry components with hardcoded `<svg>` blocks duplicated work every time a new glyph was needed. Decision: drop the wrapper, import each icon from the official `@lucide/svelte` Svelte components. Skill added so AI consumers know to use the scoped package (not the deprecated `lucide-svelte`).

- [x] 🟠 `apps/demo/package.json`, `docs/package.json` — add `@lucide/svelte` dep.
- [x] 🟠 `registry/components/ui/icon/` — delete; remove `ui/icon` from `registry/index.json`.
- [x] 🟠 Migrate 17 registry components (accordion, select, checkbox, pagination, calendar, carousel, sidebar, breadcrumb, command, date-picker, input-otp, radio-group, resizable, navigation-menu, combobox, navbar, blocks/files/upload-area, blocks/files/crop-image) from inline `<svg>` / `<Icon>` to direct `@lucide/svelte` imports. Update each component's `meta.json` (`npmDeps` adds `@lucide/svelte`, drop `ui/icon` dep).
- [x] 🟠 Update 3 skill examples (`bosia-dashboard`, `bosia-mobile-screen`, `bosia-empty-states`) and the docs `SidebarDemo`.
- [x] 🟠 `docs/content/docs/components/ui/icon.md` rewritten as `@lucide/svelte` guide with deprecation callout; `docs/content/docs/components/overview.md`, `navbar.md`, `upload-area.md`, `crop-image.md` callouts updated; `docs/src/lib/components/IconGrid.svelte` deleted.
- [x] ⚪ New `docs/content/skills/bosia-icon/` skill steering AI agents toward `@lucide/svelte` (never `lucide-svelte`).

---

## Same-day addition (2026-06-06) — production runtime needed `src/app.html`

> Bug report from komba Dockerfile build: runner stage copies only `dist/`, `package.json`, `node_modules`, `CHANGELOG.md`. Container boots → `core/renderer.ts:119` calls `getAppHtmlSegments()` at module load → reads `src/app.html` from `process.cwd()` → file missing → throws `src/app.html is required but not found`. Unlike SvelteKit (whose Vite plugin compiles `app.html` into the build bundle), Bosia kept the template as a runtime file. Forces every consumer to copy `src/` into the runtime image or hand-list `src/app.html`.

Decision: emit parsed segments to `dist/app-html.json` during build; renderer reads dist first, falls back to `src/app.html` for dev/HMR. Zero app changes — `dist/` is already in every Docker COPY.

- [x] 🟠 `packages/bosia/src/core/appHtml.ts` — add `writeAppHtmlSegments(segments, outDir)` (serializes to `${outDir}/app-html.json`); `getAppHtmlSegments(cwd)` now tries persisted artifact first, falls back to `loadAppHtmlTemplate(cwd)`.
- [x] 🟠 `packages/bosia/src/core/build.ts` — after writing route-manifest, call `writeAppHtmlSegments(appHtml)` so production runtime has the segments inside `dist/`.

---

## 0.6.17 (2026-06-07) — production runtime also needed `src/hooks.server.ts`, `bosia.config.ts`, and `public/`

> Same komba Dockerfile incident as `src/app.html` above. Once dist contained `app-html.json`, the app booted but every authenticated request 303'd to `/login`. Root causes: `core/server.ts:53` reads `src/hooks.server.ts` from `process.cwd()` (no fallback) so user hooks never registered → `event.locals.user` always `undefined` → `(private)/+layout.server.ts` redirected to login forever. Same shape for `core/config.ts loadBosiaConfig` (reads `bosia.config.ts` from cwd, runs Bun.build at server start). And `core/staticManifest.ts` only walked `./public` — production images that drop `public/` lost `/bosia-tw.css`, `/favicon.svg`, etc.

Decision: extend the dist-first / src-fallback pattern (already used for `app-html.json`) to hooks, config, and static assets. Build emits self-contained ESM artifacts under `dist/`; runtime prefers them and falls back to source for dev. Static manifest walks `dist/static/` (which the build already populates by copying `public/`) so containers can drop `public/`.

- [x] 🟠 `packages/bosia/src/core/build.ts` — new `bundleRuntimeUserFiles(cwd)` step after server bundle: read user's `package.json` deps, externalize npm packages + bosia/elysia/bun/svelte, Bun.build `src/hooks.server.ts` → `dist/hooks.server.js` and `bosia.config.{ts,js,mjs}` → `dist/bosia.config.js`. Single-file output; relative project imports inline.
- [x] 🟠 `packages/bosia/src/core/server.ts` — hook loader checks `${OUT_DIR}/hooks.server.js` first, falls back to `src/hooks.server.ts`. Log line reports which path won.
- [x] 🟠 `packages/bosia/src/core/config.ts` — `loadBosiaConfig` checks `${OUT_DIR}/bosia.config.js` first, dynamic-imports it directly (skips Bun.build at server start); falls back to the existing compile-from-source path for dev.
- [x] 🟠 `packages/bosia/src/core/staticManifest.ts` — walk `${outDir}/static/` (mirror of `public/` written by build) so prod images can ship only `dist/`. `addOnce` keeps `public/` canonical when both exist (dev double-walk).

---

## Same-day addition (2026-06-04) — `parent()` returns `{}` on client-side JSON nav

> Bug report from komba app: `+page.server.ts` calling `(await parent()).farmId` worked on SSR but returned `undefined` on every client-side navigation, breaking any page that pulls layout data through `parent()` (14 routes affected). Root cause in `core/renderer.ts` (`loadRouteData`): the client data endpoint `/__bosia/data/<route>.json` ships a `LoaderMask` that marks already-cached layout servers as `layouts[i] === false`. The renderer's skip path sets `layoutData[ls.depth] = null` and **does not contribute the skipped layer's data to `parentData`** (see comment at lines 299–303: "skipped loaders contribute `{}` to parent and the response slot is `null`; the client merges with its cached data"). The page server then runs with `parent = async () => ({})`, so any `parent()` consumer sees an empty object. SSR works because nothing is skipped. Workaround in user code: move shared values onto `event.locals` via `hooks.server.ts` and read from `locals` in page servers. But every Bosia app written against SvelteKit muscle memory will hit this silently.

Decision: make `parent()` see the real parent chain even when layer loaders are skipped. Two viable shapes — pick one:

- **A (server-side):** when handling `/__bosia/data/*.json`, accept a `parentSnapshots` payload in the POST body (the client already has the cached data per skipped layer); merge those into `parentData` before running the page loader. Lowest churn, no extra round-trips.
- **B (client-side):** when a page loader is selected to re-run and any ancestor layout is skipped, re-run those layouts server-side too. Simpler invariant ("parent() always sees fresh data") but defeats the whole point of selective re-runs.

A is preferred. Plus a P0 doc/skill update so the workaround (`locals`-based farm/user scope) is the documented pattern even after the framework fix lands, since `locals` is also better for typed access.

- [ ] 🟠 `packages/bosia/src/core/client/router.svelte.ts` — when issuing `/__bosia/data/<route>.json`, include the cached `parentSnapshots: Record<depth, Record<string, any>>` in the request body for every layout layer being skipped.
- [ ] 🟠 `packages/bosia/src/core/server.ts` (or wherever the `/__bosia/data` route is wired) — parse `parentSnapshots` from the body and forward into `loadRouteData` via a new arg.
- [ ] 🟠 `packages/bosia/src/core/renderer.ts` — `loadRouteData` accepts `parentSnapshots?: Record<number, Record<string, any>>`; in the skip branch, `parentData = { ...parentData, ...(parentSnapshots?.[ls.depth] ?? {}) }` so downstream loaders see the same data they would on SSR. Trust boundary note: client-supplied parent data is just a perf hint, never authoritative — code that relies on auth/role/farmId for authorization must still read from `event.locals` populated by `hooks.server.ts`.
- [ ] ⚪ `docs/content/skills/bosia-routing/SKILL.md` (or a new skill rule in `bosia-auth-flow`) — add R: "Don't use `parent()` for scope identifiers (farmId, orgId, userId) — read from `event.locals` populated in `hooks.server.ts`." Include a one-paragraph explainer that `parent()` is fine for view-layer data but `locals` is the source of truth for cross-loader scope.
- [ ] ⚪ Regression test under `apps/demo` (or new `apps/parent-data-nav`): a layout server returning `{ orgId }`, a child `+page.server.ts` asserting `(await parent()).orgId === "..."`. Verify SSR pass AND a client-nav JSON fetch pass.

---

## Same-day addition (2026-05-30) — file-upload private-by-default + skill rule

> 0.6.11 made `/uploads/<key>.webp` reach `+server.ts`, but the registry's default handler had no auth and no ownership check, and the `file` table had no `userId` column — so every `bosia feat file-upload` app shipped with anonymous public uploads. Decision: private-by-default + auth as hard prereq. Plain `text("user_id")` on the `file` table (no FK, so the feature stays independent of any specific auth feature). All three API routes (`POST /api/files`, `GET /api/files`, `DELETE /api/files/[id]`) gate on `locals.user`; `GET /uploads/[...path]` looks up the file row by `key`, returns 404 on ownership mismatch (not 403, to prevent enumeration), responds with `Cache-Control: private, no-store` and `Content-Type` from the DB row. Skill updated with R5.5 explaining the model, anti-patterns banning the obvious bypasses, and P0 checklist gating on a 401 + 404 verification curl.

- [x] 🟠 `registry/features/file-upload/file.{sqlite,pg,mysql}.table.ts` — add `user_id` NOT NULL (text for sqlite/pg, varchar(36) for mysql).
- [x] 🟠 `registry/features/file-upload/file.repository.ts` — `getAllByUser(userId)`, `getByKey(key)`, `getOwned(id, userId)`, `remove(id, userId)` — ownership is part of every query.
- [x] 🟠 `registry/features/file-upload/file.service.ts` — `upload(file, userId)` stores userId; `getAll(userId)` filters; `getByKey(key)` exposes the row for the route's ownership check; `remove(id, userId)` rejects on ownership mismatch.
- [x] 🟠 `registry/features/file-upload/api-files-server.ts`, `api-files-id-server.ts`, `uploads-static-server.ts` — all gated on `locals.user`; uploads-static responds with `Content-Type: record.mime` + `Cache-Control: private, no-store`.
- [x] 🟠 `docs/content/skills/bosia-file-upload/SKILL.md` — new R5.5 "Files are private by default", new anti-patterns (remove auth check, repoint to `public/uploads`, drop `user_id`), P0 checklist gates on 401 + cross-user 404 curl verifications, [[bosia-auth-flow]] declared a hard prereq.

---

## Same-day addition (2026-05-30) — API routes shadow static fallthrough

> Bug report from fotoku app: `/uploads/<uuid>.webp` returned 404 even though a `+server.ts` was registered at `/uploads/[...path]`. Root cause in `core/server.ts`: the static-files block (`isStaticPath(path)` — matches by extension, `.webp`/`.png`/`.pdf`/etc.) ran BEFORE `resolveApiMatch`, so any URL ending in a static extension short-circuited into the static handler and was looked up against `./public`, `dist/client`, `dist/static` only — never reaching the user's route. Fix: swap the order so `resolveApiMatch` runs first; static + prerender fall through only when no API route matches. Verified via `apps/demo` (`/uploads/sample.webp` now serves with `X-Handler: uploads-route`; `/favicon.svg` and `/bosia-tw.css` still 200 via fallthrough).

- [x] 🟠 `packages/bosia/src/core/server.ts` — move the API-match block (`+server.ts` resolution + cache + error handling) above the static-files block and prerender block. No logic change inside the moved block.
- [x] ⚪ `apps/demo/src/routes/uploads/[...path]/+server.ts`, `apps/demo/uploads/sample.webp`, `apps/demo/src/routes/(public)/uploads-test/+page.svelte` — regression demo so `/uploads-test` renders an image served via the +server.ts handler.

---

## Same-day addition (2026-05-30) — fix `props_id_invalid_placement` in UI components

> Svelte 5 requires `$props.id()` to be the entire RHS of a top-level `const` declaration. Nine UI components were calling it inside a template literal (`const baseId = \`tabs-${$props.id()}\`;`), which throws at component init. Sister components (`alert-dialog`, `dialog`, `field`) already had the correct shape — used as the reference pattern.

- [x] 🟠 `registry/components/ui/{accordion,collapsible,hover-card,menubar/menubar-menu,navigation-menu/navigation-menu-item,popover,sidebar/sidebar-menu-item,tabs,tooltip}.svelte` — split into `const uid = $props.id();` then `const id = \`<prefix>-${uid}\`;`. Behaviour identical, but now passes Svelte's strict placement check.

---

## Same-day addition (2026-05-30) — `bosia feat drizzle` defaults to sqlite-file, not in-memory

> User report: AI agent ran `bosia feat drizzle` and ended up with `sqlite://:memory:`, losing data on restart. Three drifts: (a) `registry/features/drizzle/meta.json` `envVars.DATABASE_URL` was a multi-option comment string with `:memory:` as the last visible token; (b) `drizzle-index.ts` + `drizzle.config.ts` fallback when `DATABASE_URL` is unset was `sqlite://:memory:`; (c) `bosia-database-setup` skill claimed the default was `file:./data.db` but `resolveEngine` only accepts `sqlite://` URLs, so the documented default would have thrown.

- [x] 🟠 `registry/features/drizzle/meta.json` — single concrete `DATABASE_URL=sqlite://./data/app.db`, no inline comment options.
- [x] 🟠 `registry/features/drizzle/drizzle-index.ts` + `drizzle.config.ts` — runtime fallback now `sqlite://./data/app.db`, not `sqlite://:memory:`.
- [x] 🟠 `docs/content/skills/bosia-database-setup/SKILL.md` — default scheme updated to `sqlite://./data/app.db`; references to `src/features/drizzle/db.ts` corrected to `index.ts` (actual file shipped by the feature).

---

## Same-day addition (2026-05-30) — UI ids use `$props.id()` instead of `crypto.randomUUID` / `Math.random`

> Generated apps crashed with `TypeError: crypto.randomUUID is not a function` when served over plain http (LAN IP, preview subdomains) because `crypto.randomUUID` only exists in secure contexts. Six other components used `Math.random().toString(36)` which avoided the crash but produced different ids per SSR/CSR render — hydration mismatch risk and weaker uniqueness than the framework primitive. Svelte 5.20+ ships `$props.id()`, a deterministic per-component id helper — adopting it eliminates both classes of bug with one consistent pattern.

- [x] 🟠 `registry/components/ui/field/field.svelte`, `tooltip/tooltip.svelte`, `popover/popover.svelte`, `hover-card/hover-card.svelte`, `navigation-menu/navigation-menu-item.svelte`, `menubar/menubar-menu.svelte` — replace `crypto.randomUUID().slice(0, 8)` with `$props.id()`. `menubar-menu` now prefixes its id with `menubar-` for consistency with siblings.
- [x] 🟠 `registry/components/ui/tabs/tabs.svelte`, `sidebar/sidebar-menu-item.svelte`, `accordion/accordion.svelte`, `collapsible/collapsible.svelte` — replace `Math.random().toString(36).slice(2, 10)` base ids with `$props.id()`.
- [x] 🟠 `registry/components/ui/alert-dialog/alert-dialog.svelte`, `dialog/dialog.svelte` — collapse the two separate `Math.random()` calls into one `$props.id()` shared by `titleId` and `descriptionId`.
- [x] ⚪ Server-side `crypto.randomUUID` usage in `registry/features/file-upload/file.service.ts` and `file.{mysql,sqlite}.table.ts` left as-is — runs in Node where `crypto` is always available, and those ids persist to the DB rather than per-render.

---

## Same-day addition (2026-05-30) — brief intake: drop DB question + approval-button tool + `bosia-database-setup` skill

> Two pain points reported by users: (a) AI kept asking extra follow-up questions after the Quick Start batch (heading said "six" but the script listed 7 items, with no rule against follow-ups); (b) the database engine question was friction during a design-only intake — most first-time apps don't care, sqlite-file is the right default. Approval gate was also a plain-text "Setuju?" that required typing.

- [x] 🟠 `docs/content/skills/bosia-brief-intake/SKILL.md` — Quick Start now five questions (palette + aesthetic direction merged into Q5). Workflow step 5 is the **approval gate**: AI calls `brief_request_approval({ summary })`; host UI renders a **Setuju** button; AI must NOT `fs_write('BRIEF.md', ...)` until the user's next message confirms. New "infer, don't loop back" inference rule. Database question dropped from Quick Start, BRIEF.md template, references list, and P0 checklist. New anti-patterns: asking follow-ups after the batch; asking about the DB engine during intake; ending the recap with a plain-text "Setuju?".
- [x] 🟠 `docs/content/skills/bosia-brief-intake/references/quick-start-script.md` — rewritten as five-question script with the merged Q5 and an updated inference table. "After answers locked" now references the `brief_request_approval` tool call.
- [x] 🟠 `docs/content/skills/bosia-database-setup/SKILL.md` — new skill replacing `bosia-brief-database`. Triggers on explicit user intent ("pakai postgres", "ganti database", "buat tabel", etc.). Workflow A = engine swap (drizzle.config + .env.local + driver install + bun-native migrate); Workflow B = new table / column (per-feature `*.table.ts` + `db:generate` + `db:migrate`). R1 keeps sqlite-file as the silent default; R2 surfaces that cross-engine migration is data work, not `drizzle-kit migrate`.
- [x] 🟠 `docs/content/skills/bosia-brief-database/` — deleted; superseded by `bosia-database-setup`.
- [x] ⚪ `docs/content/skills/SKILL.md` catalog — count bumped 44 → 45; added a `bosia-database-setup` row to the "Conventions — framework ·" section.
- [x] ⚪ `docs/content/skills/bosia-drizzle-usage/SKILL.md` + `references/troubleshooting.md` — swapped every `bosia-brief-database` reference to `bosia-database-setup`.

---

## Same-day addition (2026-05-29) — fix in-page anchor link scroll

> Bosia's SPA router intercepted every `<a>` click and re-ran the full page load, then unconditionally `scrollTo(0, 0)` after settle. Hash-only links like `<a href="#features">` therefore never scrolled to their target — the browser default (`scrollIntoView` on id match) never fired because `e.preventDefault()` ran first. Cross-page links with a hash (`/foo#bar`) also lost their target scroll. Reported via docs site TOC links.

- [x] 🟠 `packages/bosia/src/core/client/router.svelte.ts` — short-circuit same-page hash navigation in the click handler: when `anchor.pathname + anchor.search` matches the current location and a hash is present, skip `navigate()` entirely; just `pushState` the new URL and `scrollIntoView` the target. Avoids tearing down/remounting the page for what should be a pure scroll.
- [x] 🟠 `packages/bosia/src/core/client/router.svelte.ts` — export `scrollToHash(hash)` helper: decodes the fragment, resolves `getElementById`, calls `scrollIntoView()`, returns whether it found a target. Used by both the click handler and `App.svelte`.
- [x] 🟠 `packages/bosia/src/core/client/App.svelte` — replace unconditional `window.scrollTo(0, 0)` after nav settle with `tick().then(() => scrollToHash(hash) || scrollTo(0,0))` in both the error-boundary path and the normal-nav path. `tick()` is required because `appState.pageData` was just assigned in the same effect — the heading element from `{@html}` content doesn't exist until Svelte flushes.

---

## Same-day addition (2026-05-28) — new skills `bosia-page-shell` + `bosia-query-defaults`

> AI agents kept (a) re-rendering navbar/footer inside every `+page.svelte` instead of declaring them once in `+layout.svelte`, (b) hand-rolling `<table>` blocks instead of using `ui/data-table`, (c) shipping repository `list` functions with no `limit`/`offset` and no `orderBy`. None of the existing skills explicitly said "navbar belongs in the layout" or "every list takes `{ limit, offset, orderBy }` and returns `{ rows, total }`" — so the guidance was easy to drift past. Docs-only changes; no registry/runtime work needed.

- [x] 🟠 `docs/content/skills/bosia-page-shell/SKILL.md` — new skill. R1 hard rule: chrome lives in `+layout.svelte`, never in `+page.svelte`. R2 layout-depth table for `(public)` vs `(private)`. R3 requires `(private)/+layout.server.ts` to produce `data.user` and pass it to `ui/navbar` so the avatar dropdown (Profile / Settings / Log out) is reachable. R5 forbids hand-rolled `<table>` — all lists go through `ui/data-table`. P0 checklist enforces it.
- [x] 🟠 `docs/content/skills/bosia-query-defaults/SKILL.md` — new skill. R1 fixes the repository signature to `list(db, { limit, offset, orderBy?, where? })` returning `{ rows, total }`. R2 locks defaults: `limit = 10`, `offset = 0`, `orderBy = desc(createdAt)`. R3 mandates `limit` clamp to ≤ 100 at the service boundary. R6 ensures `count()` shares the same `where` as the rows query so `data-table` totals don't lie. R7 bans unbounded `db.select().from(table)` in shipping code.
- [x] ⚪ `docs/content/skills/SKILL.md` — catalog updated from 42 → 44 skills; new rows added to "Conventions — design ✦" (`bosia-page-shell`) and "Conventions — framework ·" (`bosia-query-defaults`).

---

## Same-day addition (2026-05-28) — fix `feat` block install + non-interactive `add block`

> AI agent ran `file_upload_install` and got a silent 404 (block path `registry/components/files/upload-area/...` doesn't exist — it lives under `blocks/`). Then the retry hung on `@clack/prompts` because the MCP runner never closes stdin. Framework fixes only — no per-app patching.

- [x] 🟠 `packages/bosia/src/cli/feat.ts` — `FeatureMeta` gains `blocks?: string[]`. After component install, iterate `meta.blocks` and call `runAddBlock(name, [], options)` so block deps route to the block installer (was 404'ing through `addComponent` which hardcodes the `components` category).
- [x] 🟠 `packages/bosia/src/cli/block.ts` — `runAddBlock` accepts `InstallOptions`, gates the "Replace existing block?" prompt behind `!skipPrompts`, threads `options` into recursive `addComponent` calls, and honors `-y` / `--yes` in `flags`. Also routes `skipInstall` through to `mergePkgJson` instead of unconditional `bunAdd`.
- [x] ⚪ `packages/bosia/src/cli/index.ts` — `add block` dispatch now passes through `-y` (was filtering to `--` long flags only).
- [x] ⚪ `registry/features/file-upload/meta.json` — moved `files/upload-area` and `files/crop-image` from `components` to the new `blocks` field.
- [x] 🟡 `docs/content/skills/bosia-file-upload/SKILL.md` — R5 now shows the explicit `import UploadArea from "$lib/blocks/files/upload-area/block.svelte"` line and the full prop surface; workflow step 5 gains concrete `bun run db:generate && bun run db:migrate`; new R6 stop-rule forbids fallback to `<input type="file">` + raw `fetch("/api/files")` when install fails.

---

## Same-day addition (2026-05-28) — fix `file-upload` end-to-end (Bun.Image, image host, route placement)

> AI agent scaffolded `bosia feat file-upload` and hit three independent framework regressions: (1) `Bun.Image.open/decode` doesn't exist, so uploads crash; (2) `PUBLIC_BASE_URL` bakes the wrong host into stored URLs, breaking image rendering on `lvh.me` preview subdomains; (3) routing/dashboard/CRUD skills only softly suggest `(private)`, so agents drift into `(public)/admin/...`. Framework fixes only — user re-scaffolds.

- [x] 🔴 `registry/features/file-upload/file.service.ts` — rewrite Bun.Image pipeline. Drop `decodeImage` shim + `BunImageModule/Instance` interfaces. Use `new Bun.Image(bytes)`, read dims from `metadata()`, positional `resize(w, h, opts)`, `.webp({ quality: 85 }).bytes()`. Persist row width/height from resize target. (F1)
- [x] 🟠 `registry/features/file-upload/storage-local.ts` — `save()` returns relative `/uploads/${key}` (no `PUBLIC_BASE_URL` prefix). Browser resolves against the page's current origin → works for `lvh.me` preview, prod custom domains, and localhost without env tuning. (F2)
- [x] ⚪ `registry/features/file-upload/meta.json` — drop misleading `PUBLIC_BASE_URL=http://localhost:3000` default (now empty string). (F2)
- [x] 🟠 `docs/content/skills/bosia-routing/SKILL.md` — new R6 hard rule: authenticated UI MUST live under `(private)`. Anti-pattern block with `(public)/admin/produk/...` ❌ vs `(private)/admin/produk/...` ✅. Decision rule + P0 checklist entry. (F3a)
- [x] 🟠 `docs/content/skills/bosia-dashboard/SKILL.md` — STOP rule at top: files under `(private)/`; create `(private)/+layout.server.ts` if absent. (F3b)
- [x] 🟠 `docs/content/skills/bosia-crud-flow/SKILL.md` — STOP rule at top: resource routes under `(private)/<resource>/...`; admin CRUD never `(public)`. (F3c)
- [x] 🟡 `docs/content/skills/bosia-bun-runtime/SKILL.md` — new `Bun.Image` section documenting constructor, `metadata()`, positional `resize`, per-format encoders (`.webp({ quality: 0–100 })`), `.bytes()`. Anti-pattern callout for `Bun.Image.open/decode` and `0–1` quality. (F4)
- [x] ⚪ `docs/content/skills/bosia-file-upload/SKILL.md` — R2 cross-references the new `Bun.Image` section in `bosia-bun-runtime` for the API surface. (F5)

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
- [x] 🟡 Cookie `sameSite` accepts both casings (`lax`/`Lax`) — normalized to canonical header
- [x] 🟠 Protocol-aware `Secure` cookies — auto-downgrade over HTTP with warn; `TRUST_PROXY=true` honors `x-forwarded-proto`
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
- [x] 🟠 Dev watcher safety net — 5s mtime poll of `src/` complements `fs.watch` so atomic-write edits (temp + rename) that macOS drops still trigger rebuilds
- [x] 🟠 Dev crash backoff — replace the "stop after 3 crashes" silent-stop with exponential backoff (500ms → 5s) that never gives up, so a transient error or fixed source change brings the app back without manual restart

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
- [x] 🟠 Multi-engine `drizzle` feature — adapter, `drizzle.config.ts`, and seed-runner branch on `DATABASE_URL` scheme (postgres, mysql, sqlite file, sqlite in-memory) over Bun's built-in drivers (no per-engine npm dep)
- [x] 🟠 Bun-native drizzle migrate runner — `src/features/drizzle/migrate.ts` replaces `drizzle-kit migrate` for sqlite/postgres/mysql apps (drizzle-kit's sqlite migrate requires `better-sqlite3`/`@libsql/client`; bun-native runner uses `drizzle-orm/bun-sqlite/migrator` + `drizzle-orm/bun-sql/migrator`).
- [x] 🟠 `bosia-brief-database` skill + hook into `bosia-brief-intake` — captures DB engine + connection during brief intake, writes `## Database` block to BRIEF.md
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

- [x] 🟠 `beforeNavigate` / `afterNavigate` lifecycle hooks — exported from `bosia/client`; fired by SPA router around pushState/popstate navs and on full-page unload (`willUnload=true`); cancel support via `cancel()` on programmatic navs
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
- [x] 🟠 Concurrency / backpressure ceiling — Bun currently accepts unlimited concurrent connections (`server.ts:812` only sets `idleTimeout`/`maxRequestBodySize`). Under load spike or slow-loris, memory + FD exhaustion is possible before idleTimeout kicks in — the most likely OOM vector for single-replica container deploys. Add a soft cap (env-gated, e.g. `MAX_INFLIGHT`) that reuses the existing in-flight counter (`server.ts:633,696`) and returns 503 when exceeded. Until shipped, deployments must front Bosia with a reverse proxy that enforces connection limits. Source: 2026-05-23 pre-prod audit. Shipped in v0.5.13 (`server.ts:765-784, 638-646`) — `MAX_INFLIGHT` env var, default `Infinity` (off, no behavior change); `/_health` exempt; cap-check runs before all work so the 503 is cheap. Docs + `.env.example` files updated
- [x] 🟡 Response cache + brotli — `Bun.gzipSync()` runs on every HTML response >2 KB in prod (`html.ts:354-378`) with no precompressed cache; brotli not implemented. (a) Add an LRU response cache keyed by `(path, status, content-hash)` for compressed bodies on routes with no per-user data; (b) add brotli via `Bun.brotliCompressSync` gated on `Accept-Encoding: br`. Source: 2026-05-23 pre-prod audit. Shipped in v0.6.0 — skip-render response cache (`cache.ts`) keyed on URL + identity hash (cookies/headers from `CACHE_KEYS`), per-route opt-out via `export const cache = false`, server-side `invalidate(key)` / `invalidateAll(prefix)` from `bosia` mirroring the client API, brotli + gzip pre-compressed per entry, CSP disables the cache. Follow-ups deferred to v0.7+: TTL expiry, layout-level cascade, multi-replica pub/sub invalidation, stale-while-revalidate, key-based invalidation for `+server.ts` endpoints
- [x] 🟡 Static-asset fallthrough cost — every static hit calls `Bun.file().exists()` up to 4× across `/dist/client/`, `/public/`, `/dist/`, `/dist/static/` (`server.ts:299-335`). Build a manifest at boot so prod lookups become a Map check; doc nginx/Caddy offload for high-traffic deploys. Source: 2026-05-23 pre-prod audit. Shipped in v0.6.9 — `staticManifest.ts` walks `dist/client`, `./public`, and `OUT_DIR` root once at boot; prod path is a single `Map` lookup, no per-request stat. Dev keeps the fallthrough so dropped-in `public/` files are served without restart. Latent bug fixed: `?query` no longer 404s
- [ ] 🟡 Collapse SSR `render()` calls — root `App.svelte` + error pages are rendered in separate Svelte `render()` invocations (`renderer.ts:646,804,884,931`). Profile under representative load before changing — error pages have different layouts so collapsing isn't trivial. Source: 2026-05-23 pre-prod audit

### Server Reliability

- [x] 🟠 Process-level error handlers in prod — install `process.on("uncaughtException")` and `process.on("unhandledRejection")` outside the dev inspector path. Today only the dev inspector (`plugins/inspector/index.ts:121-138`) installs these; in prod an unhandled rejection from a background timer, plugin hook, or work outside the request lifecycle crashes the process with no log context. Handlers should emit a structured fatal line and `process.exit(1)` so the orchestrator restarts cleanly. Source: 2026-05-23 pre-prod audit. Shipped in v0.5.13 (`server.ts:912-927`) — gated on `!isDev` so the dev inspector keeps owning error display
- [ ] 🟡 Structured logging — replace emoji-prefixed `console.log`/`console.error` throughout `server.ts` with a minimal level-based logger that emits JSON in prod (pretty in dev) and includes a request ID. Today's mixed format is awkward for Loki/Vector/journald and prod errors only emit `.message` (no stack). Source: 2026-05-23 pre-prod audit
- [ ] ⚪ Tunable shutdown timers — `server.ts:906` hardcodes the 2 s force-exit window and 10 s drain. Expose via `SHUTDOWN_DRAIN_MS` / `SHUTDOWN_FORCE_MS` for deploys with long-running streaming responses. Source: 2026-05-23 pre-prod audit
- [ ] ⚪ Startup banner shows resolved hostname — `server.ts:880-882` logs `http://localhost:${PORT}` even though Bun binds `0.0.0.0` by default. Cosmetic only (container is reachable). Source: 2026-05-23 pre-prod audit

---

## v0.2.3 — CLI & Feature Installer

> Per-file install strategies so features can safely contribute to shared files.

### CLI / Feat

- [x] 🟠 `bosia feat` per-file strategies — `meta.json` `files: FileEntry[]` with `strategy` field: `write` (default), `skip-if-exists`, `append-line`, `append-block`, `merge-json`. Replaces all-or-nothing replace prompt for shared files like `src/features/drizzle/schemas.ts`
- [ ] 🟡 Document `meta.json` schema and strategies in `docs/` (CLI / `bosia feat` page)
- [ ] 🟡 `bosia feat <name> --dry-run` — preview file actions (write/skip/append/merge) without touching disk
- [ ] 🟡 Validation: error early when two installed features write to the same target with `write` strategy (force one to declare append-line/append-block)
- [ ] 🟠 `auth` feature scaffold — uses `append-block` to register hooks in `src/hooks.server.ts` and routes barrel
- [x] 🟡 `s3` / `storage` feature — bucket client + upload route using new strategies → shipped as `file-upload` in v0.6.4 (2026-05-26): `bun x bosia@latest feat [-y] file-upload [-d sqlite|postgres|mysql]` scaffolds Drizzle-backed metadata + local/S3 adapter + `/api/files` POST that pipes through `Bun.Image` compression (WebP @ 0.85, fit-inside 1920×1080). Install-time dialect selection via the new **per-feature options** mechanism — `-d` is declared in `file-upload`'s own `meta.json`, not hard-coded in the CLI
- [x] 🟡 Track installed features per project (`bosia.json` at root, committed) — enables `bosia feat list` and `bosia add list`. Schema: `{ version, features, components, blocks }` keyed by name; each entry records `installedAt`, `files`, `npmDeps`, deps, and per-feature `options`. Manifest written on every install (feat/add/add block); new projects start with no manifest, it's created lazily on first install. Existing apps are not backfilled — Phase 2 (uninstall + refcount) will follow.

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

## v0.5.10 — SvelteKit navigation parity ✅ (shipped 2026-05-20)

> Closes the gap between Bosia's client navigation API and SvelteKit's `$app/navigation`. Userland apps were reaching for `window.location.href` for programmatic nav because `goto()` wasn't exported — and that escape hatch had its own caveats (full reload, lost SPA state). Now exposes `goto`, `beforeNavigate`, `afterNavigate` from `bosia/client` with the same shape SvelteKit ships.

- [x] 🟠 `goto(url, opts?)` exported from `bosia/client`. Returns a Promise that resolves after the nav effect settles (loaders ran, components mounted). Honors `replaceState`, `invalidateAll`, `noScroll`; accepts `keepFocus` and `state` for forward compatibility but does not yet honor them. Routes through `router.navigate()` — no parallel code path
- [x] 🟠 `beforeNavigate(fn)` / `afterNavigate(fn)` lifecycle hooks. `nav.cancel()` blocks SPA navigations; popstate (browser back/forward) cancellation is a no-op since history has already advanced. Auto-unregister on component destroy via `onDestroy`
- [x] 🟠 Router exposes navigation `type` (`"link" | "goto" | "popstate" | "form" | "enter"`) and the `Navigation` object threading from `router.navigate()` into both lifecycle phases. Shared listener registry lives in `core/client/navListeners.ts` to break the ESM cycle between `navigation.ts` and `router.svelte.ts`
- [x] 🟠 `router.navigate(path, { replace, source })` supports `history.replaceState` (used by `goto({ replaceState: true })`) and threads the source through to the Navigation object
- [x] 🟡 `beforeunload` fires `beforeNavigate` with `willUnload: true` so listeners can observe (cancellation requires native `beforeunload` event — out of scope)
- [x] 🟡 Hydration safety net — wrapped `main()` in `core/client/hydrate.ts` in a `.catch()` so any future hydrator failure logs to console instead of silently leaving "Loading…" on screen
- [x] 🟠 404/error pages no longer ship a stuck `#__bs__` spinner that blocks clicking the "Go home" link. `buildHtml()` segments branch now gates spinner injection on empty `body` — non-streaming SSR responses (errors, form re-renders) skip it; streaming SSR and `ssr=false` paths still get it for the TTFB → first-paint gap
- [x] 🟡 Demo route `apps/demo/src/routes/(public)/nav-test/+page.svelte` exercises all four patterns plus the cancel/event-log flow
- [x] 🟡 New docs page `docs/content/docs/guides/navigation.md` covers the four patterns and the lifecycle hooks; added to the Guides sidebar in `docs/src/lib/docs/nav.ts`
- [x] 🟡 New `bosia-navigation` skill (under `docs/content/skills/`) so AI agents pick the right navigation pattern and use the lifecycle hooks correctly. Catalog index (`docs/content/skills/SKILL.md`) bumped 34 → 35; cross-references added in `bosia-routing` and `bosia-auth-flow`

### Same-day addition (2026-05-20) — Surface dev-server errors to the inspector overlay

> Inspector previously captured runtime errors only (Elysia handlers, client uncaughts, server `process.on` listeners). Dev-infrastructure errors — build failures after a file save, app-server crashes, `.env` reload failures, port conflicts — only reached the terminal, so the user (or an AI agent driving the editor) saw a stuck "App server is starting…" page or stale UI with no signal. These now flow through the same red badge UI as runtime errors, broadcast over the dev proxy's existing `/__bosia/sse` channel. When the proxy can't reach the app at all, browser HTML navigations get a fallback page that mounts the same overlay and replays buffered errors, then auto-reloads once the next build succeeds.

- [x] 🟠 `packages/bosia/src/core/dev.ts` captures build/app-crash/dev-uncaught errors into a bounded ring (50 entries, 30s TTL) with a 500ms dedup window — mirroring `inspector/index.ts`'s replay buffer shape. Build and app-server stderr piped + tee'd so terminal output is unchanged, error summary lands in the buffer. `process.on("uncaughtException" | "unhandledRejection")` on the dev parent process surfaces watcher-callback and `Bun.serve` failures too
- [x] 🟠 New `event: bosia-error` over `/__bosia/sse` (same wire shape as inspector's `ServerError`). SSE handler flushes recent buffered errors to newly-connecting clients so errors that fired before the EventSource opened (initial build failure, crash loop) are still visible. Overlay's IIFE adds a second `EventSource("/__bosia/sse")` listener so the same `pushError()` path handles dev errors without UI changes
- [x] 🟠 New `packages/bosia/src/core/dev-error-page.ts` renders the fallback HTML page returned by the dev proxy when `fetch(app)` throws on an HTML navigation. Embeds the inspector overlay script, pre-seeds buffered errors via a global `window.__BOSIA_PUSH_ERROR__`, and subscribes to `/__bosia/sse` for the `reload` event so the page swaps itself out once the next build succeeds. Non-HTML (XHR/fetch/assets) requests keep the original plaintext 503 to avoid corrupting API responses
- [x] 🟡 `.env` reload failures inside the dev watcher no longer crash the dev parent — caught, logged, and routed through the same buffer so the user sees the validation error in the badge instead of a dead process

### Deferred (logged for follow-up)

- [ ] 🟡 `pushState(url, state)` / `replaceState(url, state)` for shallow routing
- [ ] 🟡 `onNavigate(fn)` (runs between `beforeNavigate` and the actual nav)
- [ ] 🟡 `preloadCode(...routes)` (preloads route module without data)
- [ ] 🟡 `applyAction(result)` / `deserialize(result)` from `$app/forms`
- [ ] 🟡 `disableScrollHandling()` for fine-grained scroll control
- [ ] 🟠 Diagnose & fix `window.location.href` stall on static builds — needs a confirmed repro; safety-net try/catch is in place so the next occurrence surfaces a console error instead of staying on "Loading…"

---

## v0.6.0 — Server response cache (skip-render) ✅ (shipped 2026-05-24)

> Before v0.6, every HTML response re-ran `metadata()`, every layout `load()`, the page `load()`, `render()`, and `Bun.gzipSync()` — even when the result was byte-identical to the previous request. The new in-memory response cache short-circuits all of that and serves pre-compressed bytes (brotli or gzip) directly. Per-user safety comes from an identity hash of cookies/headers named in `CACHE_KEYS`, so logged-in users never see each other's HTML.

- [x] 🟠 New `packages/bosia/src/core/cache.ts` — tiny LRU + `tagIndex` + `pathIndex`, `computeCacheKey(url, req, cookies)`, `serveCached(entry, req)` with `Accept-Encoding: br | gzip | identity` negotiation, `buildCompressedVariants()` (brotli + gzip), tag/path-based eviction.
- [x] 🟠 Renderer integration (`renderer.ts`) — cache read before metadata/load/render, cache write after chunks are built, streaming preserved on miss. CSP-enabled deploys skip the cache (per-request nonce is incompatible with cached bytes).
- [x] 🟠 API endpoint integration (`server.ts`) — `+server.ts` GET handlers cached with the same key rules. v0.6 invalidates API entries by URL/prefix only (no `depends()` for API yet).
- [x] 🟠 Public API — `invalidate(key)` / `invalidateAll(prefix)` from `bosia` mirror the existing browser-side `invalidate()` semantics. Form actions call them after a write.
- [x] 🟡 Per-route opt-out — `export const cache = false;` in `+page.ts`, `+page.server.ts`, or `+server.ts`. Generated `$types.d.ts` exports a `CacheOption` type alias for IDE support.
- [x] 🟡 Env vars — `CACHE_KEYS` (default `session,sid,auth,token,jwt,Authorization`) controls identity-hash inputs; `CACHE_MAX_ENTRIES` (default `500`, `0` disables). Documented in `guides/environment-variables` (EN + ID) and the response-cache guide (EN + ID).
- [x] 🟡 Author guidance — new `bosia-response-cache` skill (`docs/content/skills/bosia-response-cache/SKILL.md`) walks AI agents through when to call `invalidate()` from server code, how to tag loaders with `depends()`, and when to opt a route out. Data-invalidation guides (EN + ID) gained a "Server-side `invalidate()` for the response cache" section.
- [x] 🟠 Dev proxy now forces inner app to `Accept-Encoding: identity` (`packages/bosia/src/core/dev.ts`). Previously the proxy forwarded the browser's `Accept-Encoding: gzip,br,…` to the inner app, the inner returned compressed bytes with `Content-Encoding: gzip`, and Bun's `fetch()` auto-decoded the body but left the `Content-Encoding` header on the `Response`. Header said gzip, body was plaintext — Safari threw `NSURLErrorDomain:-1015 cannot decode raw data` on every HTML navigation (curl/Chrome forgave the mismatch). Identity on the localhost dev wire is fine; the response-cache layer still serves precompressed bytes to real browsers in prod. Retry-on-startup behaviour preserved.
- [x] 🟠 `core/cache.ts` guards `process.env` reads — module is re-exported through the public `bosia` barrel (`invalidate` / `invalidateAll`), so it evaluates in the browser bundle whenever a user app imports anything from `bosia` client-side (e.g. `demo/src/lib/utils.ts` re-exports `cn`). Top-level `process.env.CACHE_KEYS` / `process.env.CACHE_MAX_ENTRIES` threw `ReferenceError: Can't find variable: process` on hydration in Safari. Now reads through a `typeof process !== "undefined" ? process.env : {}` shim and the startup `console.log` is gated on the same check.
- [x] 🟠 Server-only response-cache exports moved to `bosia/server` subpath — even with the `typeof process` shim, `core/cache.ts` was still evaluating client-side whenever a user imported anything from the shared `bosia` barrel, because `lib/index.ts` re-exported `invalidate` / `invalidateAll` from it. Added `./server` to package `exports`, created `packages/bosia/src/lib/server.ts` re-exporting them, removed them from the shared barrel. Updated guides (`docs/content/docs/{,id/}guides/{response-cache,data-invalidation}.md`) and the `bosia-response-cache` skill to `import { invalidate } from "bosia/server"`. Mirrors the existing `bosia/client` split. No live callers in demo/templates to update. The shim in `cache.ts` is kept as defense-in-depth.
- [x] 🟡 Inspector dev-error reporter type alignment — `core/devErrorReport.ts` declared `source?: "server" | "uncaught" | "rejection"` but `pushServerError` in `core/plugins/inspector/index.ts` accepted `"elysia" | "uncaught" | "rejection"`. `bun run check` (tsc) failed with TS2322 in `inspector/index.ts:150`. Renamed `"elysia"` → `"server"` in the inspector union and its two callsites (Elysia onError handler + global reporter default) so the framework-agnostic label matches the reporter's vocabulary; overlay just renders the string so no UI change.

### Deferred to v0.7+

- [ ] 🟡 Key-based invalidation for `+server.ts` endpoints — give API handlers a `depends()` argument or support `export const tags = [...]` so `invalidate("app:user")` evicts API responses too.
- [ ] 🟡 TTL-based expiry — author wants pure-invalidate today, but TTL is useful for "refresh every N seconds" pages.
- [ ] 🟡 Layout-level `cache = false` cascade — a layout opting out should make its child routes uncached too.
- [ ] 🟡 Multi-replica cache (pub/sub invalidation) — single-replica only in v0.6.
- [ ] 🟡 Soft-purge / stale-while-revalidate.
- [ ] 🟡 Custom key function — `export const cache = { key: (req) => string }`.

---

## v0.6.5 — Compile-time component-import audit ✅ (shipped 2026-05-27)

> A scaffolded app crashed on first SSR render with `undefined is not a function` because `+page.svelte` did `import * as Card from "$lib/components/ui/card/index.ts"` and used `<Card.Root>` — but `card/index.ts` exports `Card`/`CardContent`, not `Root`. `bosia build` succeeded silently: neither `svelte/compiler` nor the Bun bundler cross-checks template component identifiers against their imported source. The audit closes that gap.

- [x] 🟠 `packages/bosia/src/core/svelteAudit.ts` — walks the modern Svelte 5 AST fragment (`Component`, `SvelteComponent`), extracts top-level bindings from `<script>` / `<script module>` (named / default / namespace imports + locals), tracks shadowing scopes from `{#each ... as Name}`, `{#snippet name(params)}`, and `{@const Name = ...}`. For namespace imports (`import * as Card from "$lib/..."`), uses `Bun.Transpiler.scan()` to introspect the resolved source's exports; missing members report with the full export list + Levenshtein-1 "did you mean". Bare-package specifiers (`lucide-svelte`) and modules containing `export *` are treated as opaque to avoid false positives.
- [x] 🟠 `packages/bosia/src/core/svelteCompiler.ts` — switched `compile()` to `modernAst: true` (legacy `html` AST → modern `fragment`/`instance`/`module`), wired the audit into `onLoad`, and added module-scoped per-file dedupe (`Map<absPath, Promise>`) so the audit runs exactly once per file across the parallel `browser` + `bun` build targets.
- [x] 🟠 Promotes select `svelte/compiler` warnings to errors: `component_name_lowercase`, `bind_invalid_value`, `invalid_html_attribute` — silently-broken cases the user almost never wants to ship.
- [x] 🟡 `resolveImport.ts` + `sourceLoc.ts` — extracted from `plugin.ts` and `plugins/inspector/bun-plugin.ts` so the audit and the existing resolver share one alias / tsconfig-paths / relative-path implementation and one `lineColFromOffset` helper. `plugin.ts:onResolve($)` now delegates to `resolveImportPath()`.
- [x] 🟡 `BosiaConfig.strictImports` (boolean | `{ unbound, namespaceMember, warnings }`) — per-component opt-out. `BOSIA_STRICT_IMPORTS=0` env var downgrades to a `console.warn` at runtime without failing the build.
- [x] 🟡 `packages/bosia/test/svelte-audit.test.ts` — 8 fixtures cover the repro (missing namespace export), positive cases (correct member, named import, each-block shadowing, bare-package skip), and edge cases (unbound identifier, dotted on default import, env override).
- [x] 🟡 ConstTag siblings — `{@const Foo = ...}` now scopes its binding across the whole surrounding fragment (not just ConstTag's own children). Previously the docs `[...slug]/+page.svelte` false-flagged `<DemoComponent />` when bound via a sibling `{@const}`. Fragment pre-pass collects all `ConstTag` bindings before descending into children.

---

## v0.6.4 — Combined files demo, CORS-safe ✅ (shipped 2026-05-26)

> The crop block's docs demo was loading a remote Unsplash URL with `crossorigin="anonymous"`. The browser blocked it as a CORS failure and the cropper rendered blank. Replaced the two separate demos (one cropper, one uploader) with a single combined demo that mirrors the reference CMS UploadTab — pick a file via `UploadArea`, then click the crop button to overlay `CropImage` against the file's object URL. Object URLs are same-origin, so the `crossOrigin` attribute is no longer needed and the cropper just works.

- [x] 🟡 `docs/src/lib/components/demos/FilesUploadCropDemo.svelte` — single combined demo. `UploadArea` (`enableCrop`, `uploadUrl="/api/demo-upload"`) → on crop button, captures the `(file, done)` pair, opens `CropImage` against `URL.createObjectURL(file)`, wraps the returned Blob as a `File` and calls `done(file)`. Replaces the two earlier per-block demos.
- [x] 🟡 `docs/src/routes/api/demo-upload/+server.ts` — tiny `POST` returning `{ url, ok }` so the demo Upload button doesn't 500.
- [x] ⚪ Both `docs/content/docs/blocks/files/{crop-image,upload-area}.md` frontmatter `demo:` now points at `FilesUploadCropDemo`. `[...slug]/+page.svelte` imports the new demo only; deleted `FilesCropImageDemo.svelte` and `FilesUploadAreaDemo.svelte`.
- [x] 🟡 `registry/blocks/files/crop-image/block.svelte` — switched the 400px viewport from `h-[400px]` to `style="height: 400px;"`. The class itself works for end-users (their Tailwind scans their own `src/`), but in the docs preview the cropper area sometimes collapsed before/until the docs' Tailwind picked up the registry/blocks source on the next rebuild. Inline style is the safe cross-host fallback for fixed dimensions registry blocks rely on.
- [x] 🟡 `docs/src/app.css` — added `@source "../../registry/blocks/**/*.{svelte,ts,js}"` so utility classes declared inside registry blocks are emitted into `bosia-tw.css` from the docs build alongside `registry/components/ui`.
- [x] 🟠 `docs/src/lib/docs/content.ts` — `contentDir` and `demoFile` no longer resolve relative to `import.meta.dir`. In dev, the server bundle lives at `.bosia/dev/server/*.js` (three levels deep), in prod at `dist/server/*.js` (two levels deep); the old `../../content/docs` traversal silently missed the content dir in dev, making every catch-all docs page 404 via the `loadDoc → null → error(404)` path. Both paths now anchor on `process.cwd()` (same approach `[...slug]/+page.server.ts:12` already uses), making dev and prod resolution identical.

### Same-day addition (2026-05-26) — `file-upload` feature + CLI dialect flags

> The `files/upload-area` block has shipped since v0.6.3 but bosia had no server-side counterpart — every user had to write their own `POST /api/files`. Closes the gap with a full backend feature, and adds install-time DB dialect selection to `bun x bosia feat` so the same feature can ship Postgres / MySQL / SQLite Drizzle tables without a runtime selector.

- [x] 🟠 `registry/features/file-upload/` — full backend scaffold. `file.service.ts` validates MIME (image/jpeg|png|webp|heic|avif), decodes via `Bun.Image`, fit-inside resizes to 1920×1080 (no upscale), re-encodes WebP @ 0.85, persists `(id, key, url, mime, size, width, height, createdAt)` via Drizzle, returns the row. Three dialect-specific table files (`file.pg.table.ts`, `file.mysql.table.ts`, `file.sqlite.table.ts`) all target the same install path `src/features/file-upload/schemas/file.table.ts` — install-time dialect filter picks one. `storage/` adapter pattern: `LocalStorage` (`Bun.write` + `UPLOAD_DIR`/`PUBLIC_BASE_URL` env) and `S3Storage` (`Bun.s3.file().write/delete`). `src/routes/api/files/+server.ts` (`GET` list, `POST` upload) + `[id]/+server.ts` (`DELETE` cascades to storage) + `src/routes/uploads/[...path]/+server.ts` (path-traversal-guarded local static stream, `Cache-Control: immutable`).
- [x] 🟠 `packages/bosia/src/cli/feat.ts` — **per-feature options** system. Top-level only handles `-y` / `--yes` and `--local`; everything after the feature name flows to `resolveFeatureOptions()` which parses against the feature's own `meta.json` `options: FeatureOption[]` schema (each entry: `{ name, flag?, long?, prompt?, choices?, default?, required? }`). Unknown flags abort with a list of valid ones. Missing values prompt via `@clack/prompts.select` (when `choices`) or `.text`; with `-y`, fall back to `default`. `FileEntry.when?: Record<string, string>` filters which files install. Resolved option values thread through `InstallOptions.featureOptions` namespaced as `featureName.optionName` so dependency features can read them; the root feature also receives raw `featureArgs` for its own parse.
- [x] ⚪ `packages/bosia/src/cli/index.ts` — feat subcommand argv handler simplified: first non-flag token is the name, everything else (including pre-name `-y`) flows to `runFeat`. Help text updated to reflect that feature-specific flags follow the feature name.
- [x] ⚪ `packages/bosia/src/cli/registry.ts` — `InstallOptions` gained `featureOptions` (resolved values) and `featureArgs` (raw tokens for the root feature). No CLI-level dialect type — dialect is now `file-upload`-specific.
- [x] ⚪ `registry/index.json` — `features` array gains `file-upload`.
- [x] 🟡 `docs/content/docs/guides/file-upload.md` — install / env / wiring / S3 swap docs; cross-link added from `blocks/files/upload-area.md`. Nav entry under Guides.
- [x] ⚪ `docs/content/skills/bosia-file-upload/SKILL.md` — new skill teaching the AI when to install file-upload (avatar/profile picture/media library triggers), R1–R5 rules, workflow, and anti-patterns. Cross-references `bosia-env`, `bosia-drizzle-feature`, `bosia-elysia-routes`, `bosia-block-compose`.

---

## v0.6.3 — Skills API exposes references ✅ (shipped 2026-05-25)

> AI agents fetching `/api/skills/<name>.json` could see `SKILL.md` body but not the companion reference files (`references/checklist.md`, `references/design-principles.md`, …) that carry the actionable detail. They had to guess paths or scrape the docs site. The skill detail response now lists every reference with its fetch URL, and each reference has a dedicated JSON endpoint.

- [x] 🟡 `listSkillReferences(name)` in `docs/src/lib/skills/list.ts` — reads `<SKILLS_ROOT>/<name>/references/`, filters to `.md` files, validates slugs against `^[a-z0-9-]+$`, returns `{ file, path }[]` sorted by file. Silent `[]` on missing dir.
- [x] 🟡 `GET /api/skills/[name]` response gained `references: SkillReference[]` so agents discover the available reference files in one round-trip.
- [x] 🟡 New route `docs/src/routes/api/skills/[name]/references/[file]/+server.ts` — prerendered, `entries()` enumerates `(name, file)` pairs across all skills, `realpath` traversal guard mirrors the existing `[name]` route. Returns `{ name, file, path, content }` with `cache-control: public, max-age=60`. Raw markdown body — no frontmatter parsing on references.

### Same-day addition (2026-05-25) — Files blocks (crop + upload)

> Registry had no file-handling blocks. Ported two from a working CMS: an interactive image cropper and a drag-and-drop upload area. Both installable standalone — `upload-area` accepts an optional `onCropRequest` callback so callers wire `crop-image` in only when they want cropping. New `files/` category, two icons added (`crop`, `zoom-in`).

- [x] 🟡 `registry/blocks/files/crop-image/` — Svelte 5 cropper wrapping `svelte-easy-crop` (^5.0.0); aspect/shape presets, zoom slider, returns `Blob` via `onCropComplete`. Inlined canvas crop helper (no separate util file). Uses `ui/button`, `ui/label`, `ui/slider`, `ui/icon`, `ui/sonner`. Cropped output is resized to fit `maxWidth × maxHeight` (default 1920×1080, never upscales) and re-encoded at `quality` (default 0.85). New `format` prop with `"auto"` default — round crops and PNG sources go to WebP (with PNG fallback when WebP isn't encodable) so a JPEG → round crop no longer balloons from a forced PNG re-encode.
- [x] 🟡 `registry/blocks/files/upload-area/` — drag-drop + click-to-pick with preview, size validation, `XMLHttpRequest` progress, `Progress` bar. Props: `uploadUrl` (required), `accept`, `maxSizeMB`, `fieldName`, `extraFields`, `headers`, `enableCrop` + `onCropRequest`, `onUploaded`, `onError`. Expects JSON `{ url, ... }` response.
- [x] ⚪ `registry/components/ui/icon/icons.ts` — added `crop` and `zoom-in` paths (lucide-static).
- [x] ⚪ `registry/index.json` — `blocks` array gains `files/crop-image` and `files/upload-area`.
- [x] ⚪ Docs pages `docs/content/docs/blocks/files/crop-image.md` and `upload-area.md`; Files group added to `docs/src/lib/docs/nav.ts`; `FilesCropImageDemo` and `FilesUploadAreaDemo` registered in `[...slug]/+page.svelte`.
- [x] 🟡 `packages/bosia/src/core/build.ts` — added `conditions: ["svelte"]` to both client and server `Bun.build` calls so Svelte component libraries (like `svelte-easy-crop`) resolve to their `svelte` export entry. Initial attempt used a generic `onResolve` handler in the framework plugin that walked package.json for a `svelte` field; even when it returned `undefined` for non-Svelte packages, it broke shiki's chunked CommonJS interop at runtime (`b0 is not defined` / `bundle_full_exports is not defined` on the page-server bundle). The Bun-native `conditions` option avoids touching the resolver graph and fixes both issues at once.

### Same-day addition (2026-05-25) — Clean-architecture skill for generated apps

> Bosapi-generated apps (e.g. `data/users/.../warung-nasi/`) were putting `db.select(...)` directly in `+page.server.ts` loaders, importing tables out of `features/drizzle/tables/`, and skipping a service/repository layer entirely. The existing `bosia-drizzle-usage` skill's "Quick Start" example actually taught this anti-pattern. New skill `bosia-clean-architecture` defines the strict controller → service → repository split, prescribes the six-file feature folder (table, validator, dto, repository, service, index), and the existing drizzle skills now teach the same shape and cross-link to it.

- [x] 🟡 New `bosia-clean-architecture` skill (`docs/content/skills/bosia-clean-architecture/SKILL.md`) — eight rules (R1–R8) covering no `db` in routes, repository ownership, service-owned validation, derived valibot validators via `drizzle-valibot`, one entity per feature, cross-feature via service namespace, table home, barrel exports. Three workflows (scaffold, refactor, new-table decision). P0/P1 checklist gate.
- [x] 🟡 Three companion references — `feature-template.md` (copy-adapt for all six files + caller examples), `refactor-recipe.md` (grep → extract → swap-import using `warung-nasi`'s `+page.server.ts` as before/after), `shared-folder.md` (what belongs in `features/shared/` and what does not).
- [x] 🟡 `bosia-drizzle-feature` updated — folder diagram gained `*.repository.ts`, `*.validator.ts`, `*.dto.ts`; R2 split into repository + service with examples; workflow updated to 9 steps; new anti-patterns and P1 items for the repo/service split.
- [x] 🟡 `bosia-drizzle-usage` updated — Quick Start rewritten so loaders call `CatalogService.summary()` not `db.select(...)`; Workflow now writes the repository first, then service; new red flags for `db` in routes and `db.*` in services; P0 tightened to forbid `db` imports under `src/routes/**`.
- [x] 🟡 Catalog `docs/content/skills/SKILL.md` bumped 38 → 39 skills; `bosia-clean-architecture` added under framework conventions and into the discovery-order step 2.

---

## v0.5.13 — Inspector component call-site chain ✅ (shipped 2026-05-23)

> Alt-clicking a `<button>` rendered by a shared `Button.svelte` previously showed only `Button.svelte:5:1` — the definition site — which was misleading for the user and unusable for the "Send to AI" hand-off because the agent had no idea which page rendered the element. The overlay now shows the full call-site chain (e.g. `+page.svelte:42 → Button.svelte:5`) and ships the same chain inside the AI comment payload.

- [x] 🟠 Compile-time injection of `<!--bosia:o=path:line:col-->` / `<!--bosia:c-->` markers around `Component` / `SvelteComponent` / `SvelteSelf` AST nodes in `injectLocs` (`packages/bosia/src/core/plugins/inspector/bun-plugin.ts`). Comments survive Svelte compile because `preserveComments: dev` is already set, and run for both `browser` and `bun` targets so SSR HTML matches client hydration.
- [x] 🟠 Runtime `collectStack(el)` walks DOM ancestors + previous siblings with a depth counter that matches each `bosia:c` against its `bosia:o`, so sibling components on the same parent don't bleed into each other's stack. Returns outermost-first; wired into the hover tooltip, the AI form header, the AI comment payload (prepends `Component tree (outer → leaf): …\n\n`), and the runtime-error `lastInteraction` field (`packages/bosia/src/core/plugins/inspector/overlay.ts`).
- [x] 🟡 Tooltip widened with `max-width:90vw` + ellipsis so long chains don't overflow the viewport.
- [x] ⚪ `docs/content/docs/guides/inspector.md` updated to describe the chain feature and extend the prod-output grep to check for both markers.
- [x] 🟡 `bosia-inspector-edit` skill (`docs/content/skills/bosia-inspector-edit/SKILL.md`) updated for the new payload — parses the `Component tree (outer → leaf): …` prefix, defaults the target to the outermost call-site, requires a one-sentence justification when the agent picks the leaf instead. Catalog entry in `docs/content/skills/SKILL.md` updated.

### Same-day addition (2026-05-23) — Env + CORS skills for AI agents

> Bosapi-spawned preview apps (served via `a-<uuid>.lvh.me:9000`) were surfacing `403 Cross-origin request blocked: Origin "…lvh.me…" is not allowed` and the AI agent kept reaching for CORS env vars to "fix" it — but the message comes from the CSRF check (`packages/bosia/src/core/csrf.ts:51`), not CORS, so changing CORS env never helped. The actual fix is allow-listing the preview host(s) in `CSRF_ALLOWED_ORIGINS` in the child `.env` (verified against working app `toko-mainan-anak` which carries `CSRF_ALLOWED_ORIGINS=http://lvh.me:9000,http://a-<uuid>.lvh.me:9000`). Skills now teach the agent both the env-prefix system and the CSRF-vs-CORS triage explicitly.

- [x] 🟡 New `bosia-env` skill (`docs/content/skills/bosia-env/SKILL.md`) — four-tier prefix (`PUBLIC_STATIC_` / `PUBLIC_` / `STATIC_` / none), `$env` virtual module for user vars, `process.env` for framework-reserved vars (full table covering `PORT`, `BODY_SIZE_LIMIT`, `IDLE_TIMEOUT`, `MAX_INFLIGHT`, `CORS_*`, `CSRF_ALLOWED_ORIGINS`, `TRUST_PROXY`, `DISABLE_X_FRAME_OPTIONS`, `CSP_DIRECTIVES`, `BOSIA_OUT_DIR`). `.env.example` as the contract; `.env*` load order rules.
- [x] 🟡 New `bosia-cors` skill (`docs/content/skills/bosia-cors/SKILL.md`) — CORS env recipe (`CORS_ALLOWED_ORIGINS` + methods/headers/exposed/credentials/max-age), `Vary: Origin` invariant, and a triage table that distinguishes a real CORS failure (browser console "blocked by CORS policy", no response body in JS) from Bosia's CSRF rejection (`403` response body with `Cross-origin request blocked: Origin "…"`). Preview-proxy workflow lists the lvh.me preview origin(s) in `CSRF_ALLOWED_ORIGINS` (primary) with `TRUST_PROXY=true` documented as the alternative for proxies that need forwarded headers reflected.
- [x] 🟡 Catalog `docs/content/skills/SKILL.md` updated 35 → 37 skills; both entries added under framework conventions and into the discovery-order step 2; cross-references wired in both directions and to `bosia-security-review` / `bosia-elysia-routes`.

---

## v0.5.11 — `$types` resolution inside `.svelte` files

> `tsc --noEmit` resolves `./$types` from `.svelte` files via the `rootDirs: [".", ".bosia/types"]` trick, so `bun run check` and `bun run build` both type-check `params` / `PageProps` correctly. But `svelte-language-server` (used by Zed, VS Code w/ Svelte extension, etc.) runs `.svelte` script blocks through a preprocessor and doesn't honor `rootDirs` from inside that virtual TS document — the editor reports `Cannot find module './$types'` and `params` collapses to implicit `any`. SvelteKit avoids this by shipping a dedicated language-tools plugin (`@sveltejs/language-tools`) that **synthesizes** `$types` virtually at LSP time. Bosia needs the same.
>
> Acceptance: in a freshly scaffolded Bosia app, hovering `PageProps` in `+page.svelte` shows the generated type, autocomplete on `params.` lists only the route's dynamic segments, and no "module not found" diagnostic appears for `./$types`. Same behavior in Zed and VS Code.

- [ ] 🟠 Investigate options: (a) TypeScript Language Service plugin that hooks `moduleResolution` for `$types` specifiers from `.svelte` files; (b) fork/extend `svelte-language-server` config; (c) shim by re-exporting from a plain `.ts` barrel the LSP already sees. Pick the lowest-friction path.
- [ ] 🟠 Ship the plugin/shim from `packages/bosia` and wire it into the scaffolding templates' `tsconfig.json` (`compilerOptions.plugins` or `svelte.config.js`) so new apps work out of the box.
- [ ] 🟡 Verify in Zed and VS Code on `apps/demo/src/routes/(public)/blog/[slug]/+page.svelte`: hover shows `Params = { slug: string }`, autocomplete on `params.` lists `slug`, typing `params.foo` red-squiggles.
- [ ] 🟡 Document the editor setup step in `docs/content/docs/guides/routing.md` (or a new "Editor setup" guide) — what extension to install, what `tsconfig.json` looks like.
- [x] ⚪ Note the limitation + workaround in the meantime under `docs/content/docs/reference/sveltekit-differences.md`. (Updated 2026-05-24 to reflect shipped features: navigation API, plugin system, response caching)

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
- [x] 🟢 Six existing themes wired into sidebar nav + skill metadata (zinc, stone, claude, ocean, forest, rose) — v0.6.22 (2026-06-10)
- [x] 🟢 Four new themes added: sunset (warm orange), midnight (indigo dark-first), mono (brutalist), amber (cozy hospitality) — v0.6.22 (2026-06-10)
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
