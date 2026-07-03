# Bosia — Roadmap

> Track what's done, what's next, and where we're headed.
> Current version: **0.8.4**

---

## docs 0.8.2 (2026-07-03) — Footers + marketing sections

> Registry had 19 navbars and 17 heros but zero footers and nothing for the middle of a landing page. Net-new design across four phases.

- [x] Phase A — `footers/*` (12 blocks): 6 standard + 6 themes, docs, demos, nav group.
- [ ] Phase B — 7 section families (16 blocks): pricing, testimonials, faq, cta, features, stats, logos.
- [ ] Phase C — `pages/landing/*` (2 pages): saas + simple.
- [ ] Phase D — skills (`bosia-footers`, `bosia-sections`) + landing/saas/pricing skill repoints + indexes.

---

## 0.8.4 (2026-07-03) — Cache security fixes (framework review S-findings)

> Review of the response-cache + static-serving layers found identity-hash collision + memory-DoS risks and 3 perf issues.
> Discovered during planning: `Bun.brotliCompressSync` doesn't exist — brotli variants were never built (fixed by P1).

- [x] 🔴 S1 — identity hash FNV-1a-32 → SHA-256 (64-bit hex); collision could serve user A's page to user B.
- [~] S2 — anonymous-identity write gate — CANCELED during planning. Replaced by: [x] loud runtime warning (dev+prod, once per name) when a cached response's loader read a cookie not in `CACHE_KEYS`, + docs callout in response-cache guide.
- [x] 🟠 S3 — `CACHE_MAX_BODY_BYTES` per-entry cap (default 2MB, `0` unlimited); guard in `cacheSet` + early-skip before compression.
- [x] 🟡 P1 — brotli via `node:zlib` quality 5 (also un-breaks brotli entirely).
- [x] 🟡 P2 — prerendered pages: boot-time manifest (`buildPrerenderManifest`) instead of per-request `exists()` probes.
- [x] 🟡 P3 — percent-encoded static paths 404 fixed (`decodeURIComponent` in `lookupStatic` + dev fallthrough).
- [x] 🟠 Identity-aware dedup — data-endpoint dedup key now includes the `CACHE_KEYS` identity hash (`computeCacheKey`), so per-user routes dedup safely. BREAKING: `(private)` no longer skips dedup; custom session cookies must be in `CACHE_KEYS`.
- [x] 🟠 Route `scope` deleted — zero runtime consumers after identity-aware dedup; `(private)` is an ordinary route group (scanner/types/ambient/codegen field removed).
- [x] 🟠 Miss coalescing — `coalesceMiss` gate in cache.ts wired into SSR + API paths; N concurrent misses on one key build once, waiters re-check after the leader's microtask write.
- [x] 🟡 `CookieJar.peek` — identity hashing no longer flips `accessed`/`readNames`, so it can't force `Cache-Control: private` (latent bug on all cached paths).

---

## docs 0.8.1 (2026-07-02) — Storefront e-commerce expansion (reviews, cart, wishlist, search, account)

> The storefront covered browse/buy but nothing around it. Five phases add the real-world pieces:
> PDP reviews, cart page + wishlist (first favs-API UI), search, account area, quick-view + mega-menu.

- [x] 🟠 Phase A — `blocks/storefront/reviews` (summary bars, list, working form) wired into `pages/storefront/product`; docs product family + demo.
- [x] 🟠 Phase B — `empty-state`, `cart-lines`, `wishlist-grid` blocks; `pages/storefront/{cart,wishlist}`; `order-summary` gains a `cta` label prop; docs family + 2 page docs + 3 demos.
- [x] 🟠 Phase C — `search-overlay` block + `pages/storefront/search` (header already had `onSearch`); layout family docs + search page docs + demo wiring.
- [x] 🟠 Phase D — `store/orders.ts` samples; `account-nav`, `order-list`, `order-detail`, `address-book`, `account-settings`; `pages/storefront/account` (client-side section switching); account family docs + page docs + 2 demos.
- [x] 🟡 Phase E — `quick-view` modal (+ `product-card` `onQuickView` eye button), `mega-menu` standalone panel; product/layout/catalog docs + demo wiring.

---

## docs 0.8.1 (2026-07-02) — Extract Mode Switcher component

> The dark/light/system toggle lived inline in the navbar and couldn't be reused. Extract it as a
> standalone `mode-switcher` component. Also fixes a bug: a stored theme was read into state on load
> but never applied, so the theme visually reset on refresh.

- [x] ⚪ `registry/components/ui/mode-switcher/` — new component (cycle button), apply theme on init.
- [x] ⚪ Navbar consumes `<ModeSwitcher />`; theme logic + Button import removed; dep → `ui/mode-switcher`.
- [x] ⚪ Register in `registry/index.json`; docs page + demo + overview + nav entries.
- [x] ⚪ `bosia-theme-tokens` skill — "Runtime light/dark switch" note so agents reach for `ui/mode-switcher`.

---

## 0.8.3 / docs 0.8.1 (2026-07-02) — `__BRAND__` placeholder + guard

> AI agents install navbar/storefront blocks but forget to rename the hardcoded brand ("Mercato",
> "Brand"), shipping someone else's name in the nav/header/footer. A real-looking word doesn't trip
> the "replace me" reflex. Fix: rename the literal to an unmistakable `__BRAND__` sentinel, fail
> `bosia sync` (→ `bun run check`) while any survive, and teach the block-compose skill to rename it.

- [x] 🟠 `registry/blocks/navbars/*/block.svelte` (19) + `storefront/{header,footer}` — brand text → `__BRAND__`.
- [x] 🟠 `packages/bosia/src/core/brandGuard.ts` + `cli/sync.ts` — scan `src/`, fail on leftover `__BRAND__`.
- [x] ⚪ `bosia-block-compose` skill — R8 + checklist gate for the placeholder.
- [x] ⚪ Version bump `bosia 0.8.3` + `docs 0.8.1` + both `CHANGELOG.md`.
- [x] ⚪ Docs landing redesign — shared `LandingPage.svelte` (EN/ID), code-forward hero, live registry showcase.
- [x] ⚪ Chart tooltip — draw with native SVG rect/text, not `<foreignObject>`; kills Chrome's ghost-box repaint bug.

---

## 0.8.2 (2026-07-01) — Host-managed dev mode

> A multi-tenant host (rukoku) edits app source then watches the dev server self-trigger a rebuild on
> every file event — and the watcher can compile a half-written file mid-edit, wedging the preview with
> a stale-manifest 500. Add an opt-in mode where the host is the single clock: it drives one build per
> turn via `/__bosia/rebuild` and reads the real `{ ok }` result. Default unset → normal `bosia dev`
> byte-for-byte unchanged.

- [x] 🟠 `packages/bosia/src/core/dev.ts` — `BOSIA_DEV_MANAGED=1` gate; skip the `fs.watch` + mtime-poll starts.
- [x] 🟠 `packages/bosia/src/core/dev.ts` — `buildAndRestart()` returns `Promise<boolean>` (real build result).
- [x] 🟠 `packages/bosia/src/core/dev.ts` — `POST /__bosia/rebuild` sibling of hold/resume, returns `{ ok }`.
- [x] ⚪ Version bump `0.8.2` + `CHANGELOG.md`.

---

## 0.8.0 (2026-06-30) — `+loading.svelte` route skeletons

> Navigating between pages leaves stale content on screen until the router atomically swaps in the
> new page+layouts (`App.svelte`). Move the per-app skeleton trick into the framework as a Next.js-style
> convention: a `+loading.svelte` in a route folder renders automatically during nav, nested inside the
> layouts shared with the current page. No app-side resolver, no `beforeNavigate` wiring.

- [x] 🟠 `packages/bosia/src/core/types.ts` — `PageRoute.loading: string | null`.
- [x] 🟠 `packages/bosia/src/core/scanner.ts` — detect sibling `+loading.svelte`; update conventions header.
- [x] 🟠 `packages/bosia/src/core/routeFile.ts` — emit `loading` import + `layoutPaths` identity keys in both `clientRoutes` generators.
- [x] 🟠 `packages/bosia/src/core/client/App.svelte` — load + render the skeleton on real path changes under the shared-layout prefix; reset on settle.
- [x] 🟠 `packages/bosia/src/core/server.ts` — fallback manifest synthesis includes `loading: null`.
- [x] ⚪ `test/scanner.test.ts` — detect-vs-null `+loading.svelte` case.
- [x] ⚪ Docs (en+id): `guides/routing` (Loading Skeletons), `guides/navigation` (cross-ref), `project-structure` table, `reference/sveltekit-differences` row.
- [x] ⚪ Skills: `bosia-routing` (R5b + checklist + source), `bosia-navigation` (R9 + source).
- [x] ⚪ Version bump `0.8.0` (framework + docs) + both `CHANGELOG.md`.
- [ ] ⚪ Follow-up: nearest-ancestor `+loading.svelte` inheritance (full Next.js segment semantics) — currently per-folder only.
- [x] ⚪ Follow-up: warm the `+loading.svelte` chunk on hover/viewport in `prefetch.ts` so the skeleton paints instantly on click.
- [ ] ⚪ Follow-up: cold-import lag for non-hover nav (touch/keyboard/programmatic) on first visit — skeleton shows after the chunk downloads; self-heals on 2nd visit. Fix only if noticeable: touchstart/focusin warm triggers, or idle warm-all.

## 0.7.8 (2026-06-27) — Inspector: drop the breadcrumb header

> The alt+click comment form showed the framework-stripped component chain (`Button.svelte → +page.svelte`)
> as a header above the textarea. Meaningless noise for non-technical end users (e.g. rukoku's). The AI
> still gets full file/tree context via `buildContext(el)` in the payload `comment`, so the visible header
> is pure clutter — remove it.

- [x] 🟠 `packages/bosia/src/core/plugins/inspector/overlay.ts` — `openForm()` no longer builds the `chain`/`header`; `form.innerHTML` starts at the `<textarea>`. `buildContext`/`submit` unchanged, AI payload unaffected.
- [x] ⚪ Version bump `0.7.8` (framework) + `CHANGELOG.md`.

## 0.7.7 (2026-06-23) — Per-response frame-guard opt-out

> The framework re-applies `X-Frame-Options: SAMEORIGIN` to every response after the user
> `handle` runs, so a proxy hub can't serve an embeddable preview even after stripping the
> upstream header. Add a per-response opt-out so the guard stays on the hub's own pages.

- [x] 🟠 `packages/bosia/src/core/hooks.ts` — export `NO_FRAME_GUARD_HEADER` (internal marker header).
- [x] 🟠 `packages/bosia/src/core/server.ts` — when a response carries the marker, strip it and skip only `X-Frame-Options` (other security headers stay).
- [x] ⚪ `packages/bosia/src/lib/index.ts` — re-export `NO_FRAME_GUARD_HEADER` from the public API.
- [x] ⚪ Version bump `0.7.7` (framework) + `CHANGELOG.md`.

## 0.7.5 (2026-06-21) — `store` template (Postgres + MinIO/S3)

> `shop` bakes SQLite + empty S3 vars. Add a sibling `store` template that defaults to Postgres
> (native `Bun.SQL` via `drizzle-orm/bun-sql`, no driver dep) and MinIO/S3 uploads — the
> production-shaped stack — so `create … --template store` needs no post-scaffold rewiring.

- [x] 🟠 `packages/bosia/templates/store/` — copy of `shop`; `template.json` all dialects `postgres`; `.env.example` Postgres URL + MinIO defaults; `instructions.txt` + `README.md` reworded; `data/` dropped (S3 uploads, no SQLite file).
- [x] 🟠 `packages/bosia/src/cli/create.ts` — register `store` in `TEMPLATE_DESCRIPTIONS`.
- [x] ⚪ Docs — `getting-started` template table + `reference/cli` `--template` line & bullets (en + id).
- [x] ⚪ `bosia-shop-template` skill — cover the `store` sibling (postgres default, no driver/`@aws-sdk` deps).
- [x] ⚪ Version bump `0.7.5` (framework) / `0.7.8` (docs).

## 0.7.4 (2026-06-16) — Navbar block family (18 `navbars/*` blocks + `bosia-navbars` skill)

> The registry shipped hero and auth families but no navigation bars. This ports the standalone
> Navbar Stock design system (18 specimens across standard, themed and app/interactive layouts)
> into a new `navbars/` block category, mirroring the heros port end-to-end. The hardcoded acid-lime
> accent collapses to **`primary`**; dark bars invert to `bg-foreground text-background`, glass uses
> `backdrop-blur-xl`. Theme-agnostic semantic tokens only, so each navbar restyles across all 19
> themes — no new theme added.

- [x] 🟠 18 navbar blocks under `registry/blocks/navbars/*` — standard ×6, themes ×6, app ×6; self-contained `<header>` sections, inline Tailwind on semantic tokens, inlined primitives. Registered in `index.json`.
- [x] ⚪ Docs — 3 grouped family pages (`blocks/navbars/{standard,themes,app}`) with stacked live previews (3 demos registered); nav gains a Blocks → Navbars group.
- [x] ⚪ New `bosia-navbars` design skill (catalog of all 18, golden rule, token map, icon list, `[[bosia-navigation]]`/`[[bosia-heros]]` cross-links) + skills-index row (count 51 → 52).
- [x] 🟠 Stripped the embedded site navbar from all 17 `heros/*` blocks — page-level blocks must not carry navbar chrome (clashed with layout `navbars/*`). Rule documented in `bosia-heros`/`bosia-block-compose` R7/`bosia-page-shell` R1.
- [x] 🟠 Added `navbars/overlay` (family now 19) — transparent absolute navbar with light text + outline CTA floating over a full-bleed hero photo. Registered; added to Themes docs + `NavbarsThemesDemo`; exception documented.
- [x] ⚪ `CHANGELOG.md` — appended under 0.7.4.

---

## 0.7.3 (2026-06-15) — Login/auth page family (new `auth/*` pages + 9 blocks + `bosia-login` skill)

> The registry shipped a storefront page family but no auth/login pages — only a single `cards/login`
> block. This ports the standalone Login Design System (12 themes, centered + split layouts, the full
> sign-in/up/forgot/magic-link/OTP/SSO screen set) into Bosia as a **visual-only** page family:
> 9 reusable `auth/*` blocks (semantic tokens, brand → `primary`, status → emerald/amber/destructive,
> social brand logos keep their official colours) and 6 pages composed from them. One card, two
> layouts (centered ↔ split) via a one-line `variant` swap, mirroring the storefront `purpose` pattern.
> Backend stays in `bosia-auth-flow` — pages note the pairing.

- [x] 🟠 9 blocks under `registry/blocks/auth/*` — `auth-shell` (centered ↔ split), `auth-card`, `brand`, `social-row`, `divider`, `auth-field`, `password-strength`, `otp-input`, `form-message`. Registered in `index.json`.
- [x] 🟠 6 pages under `registry/pages/auth/{login,register,forgot,magic-link,otp,sso}/` — composition only; each `meta.json` lists its `auth/*` block deps so the installer recurses; default `variant="centered"`, swappable to `split`.
- [x] ⚪ Docs — new `blocks/auth` page + 6 `pages/auth/*` pages (7 demos registered), Pages overview gains an auth section, nav gains Blocks → Auth and Pages → Auth groups.
- [x] ⚪ New `bosia-login` design skill (catalog of the 6 pages + 9 blocks, token map, voice, centered↔split swap, `[[bosia-auth-flow]]` pairing) + skills-index row (count 50 → 51).
- [x] ⚪ `CHANGELOG.md` — appended under 0.7.3.

---

## 0.7.3 (2026-06-15) — Prebuilt template artifacts for fast `bosia create`

> `bosia create --template shop` was slow: `installFeature` fetched 150+ files serially from GitHub raw. Fix: CI bakes the finished scaffold into a version-locked Release tarball; `create` downloads + extracts it. Registry path stays the fallback.

- [x] 🟠 `packages/bosia/templates/shop/template.json` — opt in with `"prebuilt": true` (only heavy templates need it; `default`/`demo` have no `template.json` and are already instant).
- [x] 🟠 `cli/create.ts` — when `prebuilt && !--local && !BOSIA_BUILDING_PREBUILT`, download `v<version>/<template>.tar.gz`, extract, substitute `{{PROJECT_NAME}}`, restore `.env`; falls back to registry on 404/offline.
- [x] 🟠 `scripts/build-prebuilt-templates.ts` (new) — iterate `templates/*`, skip unless `prebuilt`; scaffold with literal `{{PROJECT_NAME}}` + `--no-install` via local registry; `tar -czf dist/prebuilt/<t>.tar.gz`.
- [x] ⚪ `packages/bosia/package.json` — `build:templates` script; version `0.7.3`.
- [x] ⚪ `.github/workflows/publish.yml` — Bun setup + `bun run build:templates`; attach `dist/prebuilt/*.tar.gz` to the release.
- [x] ⚪ `.github/workflows/refresh-prebuilt.yml` (new) — registry/template changes without a version bump rebuild artifacts and `gh release upload --clobber` onto the existing release. Keeps the create fast path in sync.
- [x] ⚪ Docs — `reference/cli.md` documents the fast prebuilt download + registry fallback + `--no-install`.

---

## 0.7.2 (2026-06-14) — Brief intake: defer ALL installs to after approval

> Bug: during Quick-start intake the AI ran `bosia_add_theme`/`bosia_add_block` before `brief_request_approval`, so the Setuju button never appeared. Fix: intake is now capture-only; all installs move to a new step 9 after BRIEF.md is complete.

- [x] 🟠 `bosia-brief-intake/SKILL.md` — steps 3.3/3.4 now record theme/first-screen choices (no install); new step 9 "Install NOW" runs after status complete; step-5 approval gate hardened; R5 bans installs before complete.
- [x] 🟠 `bosia-brief-visual/SKILL.md` — reworded to "records, doesn't install"; "Workflow side effects" → "Deferred install — NOT during intake" (run by intake step 9); checklist splits recording from the add-theme checks.
- [x] 🟠 `bosia-brief-platform/SKILL.md` — same treatment: description reworded; "Workflow side effects" → "Deferred install — NOT during intake"; format-helper + block scaffolds run in intake step 9; checklist gate annotated.
- [x] 🟠 `bosia-brief-intake/SKILL.md` (+ `example-brief.md`) — `## Todo` seed now carries TWO items: "Redesign login & register" + new "Replace mock data with real DB integration". Step 6, BRIEF.md template, and example brief updated.

---

## 0.7.1 — Inspector: structured AI payload (labeled fields)

> The alt+click → "Send to AI" comment now carries labeled fields — `url`, `pageFile` (nearest `+page`/`+layout`), `component` leaf, capped `text`, framework-stripped `tree` — so the AI traces props back to the page, not the leaf.

- [x] 🟠 `inspector/overlay.ts` — `isFrameworkFrame`/`fileOf`/`userFrames`/`findPageFile`/`ownText`/`buildContext` helpers; `submit()` sends `buildContext(el) + "---" + comment`; form header shows the framework-stripped chain.
- [x] ⚪ Docs — `guides/inspector.md` `aiEndpoint` section rewritten with the labeled format + why `pageFile` matters.
- [x] ⚪ Skill — `bosia-inspector-edit/SKILL.md` rewritten to the new `[Inspector]` contract (split on `---`, default to `pageFile` over the `component` leaf, use `url`/`text` to disambiguate).

---

## 0.7.0 — Deprecated `page.params` fallback

> Re-adds a deprecated, working `params` getter on the `page` object (`bosia/client`) so legacy code reaching for `page.params` keeps working. Returns reactive `appState.routeParams`, dev-only warn-once, removed in 1.0.0. `$props()` stays taught.

- [x] 🟠 `page.svelte.ts` — add `get params()` returning `appState.routeParams`; `@deprecated` JSDoc + dev-only `console.warn` (warn-once, guarded by `NODE_ENV !== "production"` so it tree-shakes out of prod).
- [x] ⚪ Docs — `guides/routing.md` deprecated callout; `reference/roadmap.md` line updated; `reference/changelog.md` entry. Skills left as the correct `$props()` pattern.

### Shop template defaults to sqlite-file

> Flips the `shop` template from PostgreSQL to built-in SQLite (`sqlite://./data/app.db`) — zero-config, no DB server. Per-feature dialects already supported sqlite; this only changes template defaults plus an ENOENT fix for `data/`.

- [x] 🟠 `packages/bosia/templates/shop/template.json` — all five `featureOptions` dialects `postgres` → `sqlite`.
- [x] 🟠 `packages/bosia/templates/shop/.env.example` — `DATABASE_URL` → `sqlite://./data/app.db`; `instructions.txt` wording → SQLite.
- [x] 🟠 `registry/features/drizzle/drizzle-index.sqlite.ts` — `mkdirSync(dirname(path))` before opening the file (skip `:memory:`) so `db:migrate` against `./data/app.db` doesn't ENOENT.
- [x] ⚪ `_gitignore` ignores `data/*.db*`; ship `data/.gitkeep`. Docs/skills (`bosia-shop-template`) updated postgres-default → sqlite-file.

---

## 0.6.25 — Port the Mercato storefront (new `page` tier + 24 blocks + clay theme)

> Ports the Mercato React storefront. Adds a new `page` registry tier (page = group of blocks, no backend) via `bosia add page`. 24 `storefront/*` blocks compose 4 pages sharing one runes cart, mapped to existing themes + a new `clay` theme.

- [x] 🟠 New `page` registry tier + CLI — `cli/page.ts` (`runAddPage`), routed in `addRouter.ts` (+ `pages/...` alias); `pages` added to `Manifest` and `RegistryIndex`; `bosia add list` shows pages; dispatch tests.
- [x] 🟠 Harvested 24 sections under `registry/blocks/storefront/*` — `store` (runes cart/favs/drawer + catalogue), header/footer, home sections, product card/grid/drawer, listing + PDP + checkout blocks. Registered in `index.json`.
- [x] 🟠 Added the `clay` theme (`registry/themes/clay/`) — warm paper neutrals, terracotta primary, soft warm shadows, Newsreader/Hanken Grotesk/Geist Mono fonts; registered in `registry/index.json` (19 themes).
- [x] 🟠 Four pages under `registry/pages/storefront/{home,listing,product,checkout}/` — composition only, one shared `createCart()` wired through header/grids/drawer; each `meta.json` lists its block/ui deps so the installer recurses.
- [x] ⚪ Docs — new Pages section + 4 page pages, 6 grouped `blocks/storefront/*` pages, `themes/clay`; 10 demos; nav groups; new `bosia-storefront` skill; `$lib/blocks`/`$pages` aliases + `registry/pages` Tailwind `@source`.

---

## 0.6.24 — Port the Hero Stock hero system (17 blocks)

> Ports the Hero Stock React design system (17 full-bleed hero sections across 6 verticals) into a new `heros/` block category. Hardcoded accents collapse to `primary`; dark photo heroes invert. Semantic tokens only — no new theme.

- [x] 🟠 Ported 17 hero blocks under `registry/blocks/heros/*` (commerce ×7, education ×2, food ×2, fashion ×2, services ×2, saas ×2); inline Tailwind on semantic tokens, pickers as local `$state`, kept Unsplash images. Registered.
- [x] ⚪ Docs — 17 per-hero pages (each backed by its `meta.json` so `/api/blocks` lists each with its own install line); single-hero previews; new `bosia-heros` skill; nav grouped by vertical; skills-index row.

---

## 0.6.24 — Port the Cardstock card system (29 blocks + 6 themes)

> Replaces the single `cards/feature-editorial` block (now removed — it painted its numeral with `accent`, so it never followed the brand). The new cards map the brand colour to `primary` and use semantic tokens only, so they restyle across themes.

- [x] 🟠 Extended the theme contract on all 12 existing themes — added `--font-mono` and theme-scoped elevation (`--shadow-xs/sm/md/lg` wired through `--elevation-*` per `:root`/`.dark`; midnight gets a faint primary glow).
- [x] 🟠 Added 6 Cardstock themes — `paper`, `carbon` (brutalist hard-offset shadows), `bloom` (diffuse tint), `terminal` + `grape` (dark glow), `sage`; each with light + dark, registered in `registry/index.json` (18 themes) + docs pages + nav.
- [x] 🟠 Ported 29 card blocks under `registry/blocks/cards/*` (data, people, commerce, media, utility, auth); inline Tailwind on semantic tokens, status colours shadcn-style, sparkline/ring/mini-bars as inline SVG. Registered.
- [x] 🟠 Removed `registry/blocks/cards/feature-editorial/`; re-pointed tests, CLI help, docs demo/page, and the `bosia-landing`/`bosia-saas-landing`/`bosia-block-compose` skills to `cards/feature` (now takes `title`/`body`/`icon`/`cta` props).
- [x] ⚪ Docs — 6 per-category card pages with live demo galleries + per-card install lines; new `bosia-cards` skill cataloguing all 29.

---

## 0.6.24 — Remove the Todo template + feature ahead of rebuilding card blocks

> The `todo` starter template (and its `todo` feature/components) was the original CRUD demo. We're rebuilding the card blocks from scratch, so it's being pulled to clear the way. The `editorial` card block stays until replacements exist.

- [x] 🟠 Deleted `packages/bosia/templates/todo/`, `registry/features/todo/`, `registry/components/todo/`, and `docs/content/docs/components/todo/`.
- [x] 🟠 `registry/index.json` — dropped `todo` from `features` and the four `todo*` `components` entries.
- [x] 🟠 `packages/bosia/src/cli/{create,index,add,feat}.ts` — removed the `todo` template description/example and re-pointed the stale `todo` doc-comment examples at still-present features.
- [x] ⚪ Docs — removed the Todo template rows and component pages from `getting-started.md`, `components/overview.md`, `reference/cli.md`, `guides/inspector.md`, the `nav.ts` Todo group, and the `bosia-block-compose` example.

---

## 0.6.24 — Three-state theme switcher (Light / Dark / System)

> Theme switching was binary (light/dark) and the logic was duplicated across four slightly-different places.

- [x] 🟠 `core/html.ts` — extracted the inline FOUC bootstrap (duplicated 4×) into one `THEME_INIT_JS` constant; now resolves an explicit `system` value live against `prefers-color-scheme`, compatible with stored `dark`/`light`.
- [x] 🟠 `navbar.svelte` — replaced the buggy `isDark` boolean (never persisted, out of sync with FOUC) with a 3-state `light/dark/system` cycle that persists to `localStorage`, syncs the DOM, follows live OS changes. Sun/Moon/Monitor.
- [x] 🟠 `docs/src/lib/components/ThemeToggle.svelte` + `docs/src/routes/+layout.svelte` — mirror the same 3-state logic and system-aware FOUC script (Monitor inline SVG added).
- [x] ⚪ `docs/content/docs/guides/styling.md` + `docs/content/docs/components/ui/navbar.md` — document the three modes, storage values, and cycle pattern.
- [x] ⚪ Bumped `svelte` to `^5.56.3` in the 5 stale `package.json` files (docs, 4 templates); root, `packages/bosia`, and `apps/demo` were already current.

---

## 0.6.24 — `add theme` strips the template's default `:root`/`.dark` block

> A theme's `tokens.css` defines its own `:root`/`.dark`, but the template's `app.css` ships a default block earlier in the file. After `add theme` both coexisted at the same specificity and the template's won.

- [x] 🟠 `templates/{default,shop,demo}/src/app.css` — wrapped the default `:root`/`.dark` token block in `/* bosia-theme-vars */` sentinels so removal targets only the template defaults, never user `:root` rules. `@theme {}` stays above, untouched.
- [x] 🟠 `cli/theme.ts` — `runAddTheme` now calls `stripTemplateThemeVars(appCssPath)` after wiring the `@import`, removing the sentinel-bounded block (idempotent). The installed theme's `:root` becomes the only one, so its tokens win.

---

## 0.6.23 (2026-06-11) — Surface yesterday's shop-template bugs in skills + ban the `postgres` npm pkg

> 0.6.22 shipped the `shop` template and patched 5 install-blocking bugs. Three reflect cross-cutting gotchas future authors will hit again, and the shop `package.json` still carried a stale `postgres` dep.

- [x] 🟠 `core/dev.ts` — the proxy's "App server is starting…" 503 is now an HTML page carrying the `/__bosia/sse` reload client (was bare text/plain), so a live-reload racing into a rebuild auto-recovers instead of sticking.
- [x] 🟠 `core/dev.ts` — reload-hold control: `POST /__bosia/hold` suppresses the SSE reload broadcast, `POST /__bosia/resume` flushes one reload if any rebuild fired. `hold` doubles as a heartbeat (90s safety timer)
- [x] 🟠 `packages/bosia/templates/shop/package.json` — drop unused `"postgres": "^3.4.0"`; scaffold uses Bun-native `drizzle-orm/bun-sql` against `Bun.SQL`, no userland driver needed.
- [x] 🟠 `bosia-bun-runtime/SKILL.md` — new `## Postgres — Bun.SQL` section with the object-form snippet + Bun 1.3.x `FailedToOpenSocket` gotcha; banned-packages table gains `postgres`/`pg` rows pointing at `Bun.SQL`.
- [x] 🟠 `bosia-database-setup/SKILL.md` — reversed the misleading "`bun add postgres`" line into a "no install" directive cross-linking `[[bosia-bun-runtime]]`; R5 gains a one-liner about the URL-string gotcha.
- [x] 🟠 `bosia-drizzle-feature/SKILL.md` — new R11 ("Registry files use import paths from their target location") covering `meta.json#files[].target` depth, with the `auth` feature's 3-up import as the example; P0 gate added.
- [x] 🟠 `sidebar-menu-item.svelte` — `hasChildren = $derived(!!children && !href)` so leaf items with a `{#snippet icon()}` body don't render as collapsible parents (Svelte 5 fills `children` from whitespace around named snippets).
- [x] 🟠 `features/shop/admin-sidebar.svelte` — Orders is now a parent grouping `All orders`/`Pending`/`Refunds` under one `SidebarMenuItem`. Logo `<img>` tags gain `h-5 w-5` so the SVG renders at 20px instead of overflowing.
- [x] ⚪ `bosia-shop-template/SKILL.md` — new skill bundling eight rules for extending a shop scaffold: don't re-install features, edit sidebars in place, no `postgres`/`pg`/`@aws-sdk`, routes under `(private)/dashboard/`, services not `db.select`
- [x] 🟠 `core/server.ts` — API-route handlers now treat `throw redirect(...)`/`throw error(...)` like page actions (303 / typed JSON) instead of a generic 500; also supports `return redirect(...)`. Found via shop `POST /logout`.
- [x] 🟠 `templates/{default,shop,todo,demo}/src/app.css` — add `@custom-variant dark (&:where(.dark, .dark *));`. Tailwind v4 defaults `dark:` to `prefers-color-scheme`, so the navbar's `classList.toggle("dark")` was a no-op.
- [x] 🟠 `features/shop/admin-sidebar.svelte` — header rebuilt per `SidebarDemo`: theme-aware logo button doubling as a collapse toggle, brand row, working `<SidebarTrigger>`
- [x] 🟠 `registry/features/shop/meta.json` — add `"ui/breadcrumb"` to `components` so `bosia create … --template shop` actually scaffolds the breadcrumb files.
- [x] 🟠 `templates/shop/src/routes/(private)/+layout.svelte` — derive `segments` from `page.url.pathname`, render `<Breadcrumb>` above `{@render children()}`; last segment becomes `<BreadcrumbPage>`, earlier ones `<BreadcrumbLink>`.
- [x] 🟠 `packages/bosia/templates/shop/src/routes/(public)/+page.svelte` — add a `<svelte:head>` with `<title>Welcome to your shop</title>` + `<meta name="description">` so the home page has basic SEO instead of an empty `<head>`.
- [x] 🟠 `features/auth/login-page.svelte` + `register-page.svelte` — sibling `<meta name="description">` inside the existing `<svelte:head>` (login: "Sign in to your account."; register: "Create your account. First account becomes admin.").
- [ ] ⚪ CLI-internal bugs (block-deps 404 routing, `--local` flag drop, dialect default under `skipPrompts:true`) deliberately omitted — code-only fixes, no public API to document.
- [x] 🟠 `cli/block.ts` — session-level `installed` Set mirrors `add.ts:40`; `runAddBlock` early-returns when a block is already installed this session. Without it `files/upload-area` was re-written during shop scaffold (two pullers).
- [x] ⚪ `registry/features/shop/meta.json` — drop `ui/typography` (unused) and `ui/form` / `ui/input` / `ui/button` (already declared by `auth`; component installer dedupes via `add.ts:116` so removal is safe).

---

## 0.6.22 (2026-06-10) — `shop` template + `auth` / `rbac` / `shop` registry features

> Templates bottomed out at `todo` (one CRUD feature), but the most common "build me an app" prompt is a storefront.

- [x] 🟠 `registry/features/auth/` — multi-dialect `user`/`session` tables, `Bun.password.hash` argon2id.
- [x] 🟠 `registry/features/rbac/` — `permission` table with composite PK, `can(userId, resource, action, scope?)` with `*` wildcards, `resources.ts` registry, `auth-handle.ts` rewritten to attach `locals.can(...)`, seed grants `*` to the first user.
- [x] 🟠 `registry/features/shop/` — multi-dialect `product`/`order`/`order_item`/`cart_item` tables, `valibot` validators, repositories + services, `PublicNavbar` + `AdminSidebar`, `resources.append.ts` adds eight `shop.*` permissions.
- [x] 🟠 `templates/shop/` — thin glue: `template.json` declares `features: ["auth","rbac","file-upload","shop"]`
- [x] ⚪ `packages/bosia/src/cli/create.ts` — `TEMPLATE_DESCRIPTIONS` map gains `shop: "Online store starter with auth, RBAC, S3 uploads, products/orders/cart"`.
- [x] ⚪ `docs/content/docs/getting-started.md` — template table gains a `shop` row.

---

## 0.6.22 (2026-06-10) — Sidebar docs + skill (fix three AI mis-uses) + `DropdownMenu` floating mode

> AI agents hit three sidebar failures: (1) wrapping leaf `SidebarMenuItem`s in `DropdownMenu` swallowed the `href`; (2) skipping the user footer.

- [x] ⚪ `components/ui/sidebar.md` — new "Choosing the right item shape" table with a "never wrap in `DropdownMenu`" callout; new "User Footer" section.
- [x] ⚪ `bosia-sidebar/SKILL.md` — new skill. STOP block names the three failures. R1–R7 cover leaf/parent shape, no-foreign-trigger, `icon` snippet, `bind:collapsed`, user-footer, floating/side/align, `trigger="hover"`. P0 checklist gates.
- [x] 🟠 `dropdown-menu.svelte` — context exposes `triggerEl`/`setTriggerEl`. Trigger `bind:this` syncs via `untrack`
- [x] ⚪ `SidebarDemo.svelte` — leading "Dashboard" leaf with `LayoutDashboard` icon (R1); user footer rebuilt with `DropdownMenu` + `Avatar`, `justify-start` on the trigger (fixes chevron), `floating side="top" align="start"` on the content.

---

## 0.6.21 (2026-06-09) — Fix three AI-agent app-building failures (block install, EACCES, `page` export)

> AI agents hit three failures: (1) `bosia add blocks/cards/feature-editorial` 404'd (CLI only routed `block` singular); (2) `bosia add ui/typography` aborted on EACCES overwriting a foreign-uid file.

- [x] 🟠 `packages/bosia/src/cli/addRouter.ts` — new dispatcher; routes `blocks/<cat>/<name>` tokens to `runAddBlock`, splits mixed batches (components + blocks) into one `runAdd` call plus per-block calls.
- [x] 🟠 `packages/bosia/src/cli/index.ts` — `add` case calls `routeAdd` with injected runners; help text adds the alias.
- [x] 🟠 `packages/bosia/src/cli/registry.ts` — new `writeRegistryFile(dest, content)` helper does unlink + retry on EACCES/EPERM, then surfaces a chown hint if still failing.
- [x] 🟠 `packages/bosia/src/cli/add.ts` and `block.ts` — component/block file write loops route through the new helper.
- [x] 🟠 `core/client/page.svelte.ts` (new) — reactive `page` object backed by `$derived` over `router.currentRoute`; exposes `page.url`/`page.pathname`. No `params` getter — Bosia already plumbs `params` into `+page`/`+layout` via `$props()`.
- [x] 🟠 `packages/bosia/src/lib/client.ts` — re-export `page`.
- [x] 🟠 `docs/content/skills/bosia-block-compose/SKILL.md` — canonical `bosia add block cards/feature-editorial` example.
- [x] 🟠 `docs/content/skills/bosia-saas-landing/SKILL.md` and `bosia-landing/SKILL.md` — split single install line into per-category calls (theme / components / block).
- [x] 🟠 `docs/content/skills/bosia-svelte-runes/SKILL.md` R6.5 — illustrative "removed import" example switched from `page` to a deleted `cn` utility so the lesson no longer contradicts the now-real `page` export.
- [x] ⚪ `packages/bosia/test/registry.test.ts` — coverage for `routeAdd` dispatch (block, alias, mixed batch, multi-block, plain components), `readRegistryJSON` blocks-category path, `writeRegistryFile` happy-path/overwrite.
- [x] ⚪ `packages/bosia/test/page-store.test.ts` (new) — compile-and-wiring checks for the `page` module (compiles via `svelte/compiler`, output references `derived`, `bosia/client` re-exports `page`).

---

## 0.6.21 (2026-06-09) — `bosia-image-dialog` skill + block (multi-image picker)

> AI-generated apps seed `images.unsplash.com` placeholders but there was no UI primitive to swap them without clobbering. New `files/image-dialog` block composes `UploadArea` + an External URL tab + an existing-images gallery.

- [x] 🟠 `registry/blocks/files/image-dialog/` — `block.svelte` (Dialog + Tabs + selection state, embeds `UploadArea`, fetches `/api/files` once on mount) and `meta.json` (deps: button, dialog, input, label, sonner, tabs, upload-area).
- [x] 🟠 `registry/index.json` — add `files/image-dialog` to `blocks`.
- [x] ⚪ `docs/content/skills/bosia-image-dialog/SKILL.md` — workflow steering, P0/P1 checklist, anti-patterns (single-image flows, id-vs-url storage, merge-with-stale-state).
- [x] ⚪ `docs/content/skills/bosia-file-upload/SKILL.md` — cross-reference the new dialog for replace-existing / gallery flows.
- [x] ⚪ `docs/content/docs/blocks/files/image-dialog.md` + `docs/src/lib/components/demos/FilesImageDialogDemo.svelte` registered in `docs/src/routes/(docs)/[...slug]/+page.svelte`.
- [x] ⚪ `docs/src/lib/docs/nav.ts` — insert Image Dialog under Blocks → Files.

---

## 0.6.21 (2026-06-09) — Drawer component (mobile bottom-sheet)

> Drawer was the last unbuilt Priority-2 overlay. Mobile action sheets had no first-class component.

- [x] 🟠 `registry/components/ui/drawer/` — 8 svelte sub-components (`drawer`, content, trigger, close, header, title, description, footer) + `index.ts` + `meta.json`
- [x] 🟠 `registry/index.json` — add `ui/drawer`.
- [x] 🟠 `docs/content/docs/components/ui/drawer.md` — usage, props, sub-components, accessibility, Drawer-vs-Dialog guidance.
- [x] 🟠 `docs/src/lib/components/demos/DrawerDemo.svelte` + register in `docs/src/routes/(docs)/[...slug]/+page.svelte`.
- [x] 🟠 `docs/src/lib/docs/nav.ts` — insert Drawer entry under UI children.
- [x] ⚪ `docs/content/skills/bosia-drawer/SKILL.md` — workflow steering for AI agents (mobile-first contract, P0/P1 checklist).
- [x] ⚪ `backup/COMPONENT_PLAN.md` — flip Drawer to `[x]`.

---

## 0.6.19 (2026-06-08) — `.webmanifest` 404 + stale-build recovery

> Two unrelated prod bugs on komba (pure-SSR) after the 0.6.18 deploy. (1) `/site.webmanifest` 404'd.

- [x] 🟠 `packages/bosia/src/core/server/staticServer.ts` — add `.webmanifest` to the `isStaticPath` whitelist.
- [x] 🟠 `packages/bosia/src/core/build.ts:156-170` — hash the client entry filename (`naming.entry: "[name]-[hash].[ext]"`) so `staticManifest` serves it as `immutable` and per-build URL changes invalidate the browser cache automatically.
- [x] 🟠 `core/client/hydrate.ts` — add a production-only `unhandledrejection` handler that detects failed dynamic `import()` and triggers `location.replace(?_v=…)`. Loop-guard via `sessionStorage["bosia:reload-attempt"]` (10s window).
- [ ] ⚪ Follow-up: surface a stale-build event on the router (`onStaleChunk` hook?) so apps can show a soft toast instead of a hard reload — defer until the safety net proves insufficient.

---

## 0.6.18 (2026-06-07) — pure-SSR apps still lost `public/` in production containers

> Bug: komba (pure SSR, zero prerendered routes) on 0.6.17 — `/bosia-tw.css` 404'd because `generateStaticSite()` early-returned when `dist/prerendered/` didn't exist, so `public/` never mirrored to `dist/static/`. Fix: always mirror `public/`

- [x] 🟠 `packages/bosia/src/core/prerender.ts` — `generateStaticSite()` now copies `public/` unconditionally; SSG-specific copies (prerendered + client mirror) gated on `dist/prerendered/` existing.
- [x] 🟠 Test: build emits `dist/static/` with `public/` contents even when no prerendered routes exist.

---

## Same-day addition (2026-06-06) — replace custom `<Icon>` wrapper with `@lucide/svelte`

> The hand-curated `registry/components/ui/icon` (95 inline SVG paths) plus 28 components with hardcoded `<svg>` duplicated work per glyph. Decision: drop the wrapper, import each icon from `@lucide/svelte`

- [x] 🟠 `apps/demo/package.json`, `docs/package.json` — add `@lucide/svelte` dep.
- [x] 🟠 `registry/components/ui/icon/` — delete; remove `ui/icon` from `registry/index.json`.
- [x] 🟠 Migrate 17 registry components (accordion, select, checkbox, pagination, calendar, carousel, sidebar, breadcrumb, command, date-picker, input-otp, radio-group, resizable, nav-menu, combobox, navbar.
- [x] 🟠 Update 3 skill examples (`bosia-dashboard`, `bosia-mobile-screen`, `bosia-empty-states`) and the docs `SidebarDemo`.
- [x] 🟠 `components/ui/icon.md` rewritten as a `@lucide/svelte` guide with a deprecation callout; `overview.md`, `navbar.md`, `upload-area.md`, `crop-image.md` callouts updated; `IconGrid.svelte` deleted.
- [x] ⚪ New `docs/content/skills/bosia-icon/` skill steering AI agents toward `@lucide/svelte` (never `lucide-svelte`).

---

## Same-day addition (2026-06-06) — production runtime needed `src/app.html`

> Bug from komba Dockerfile: runner copies only `dist/`. Container boots → `renderer.ts` reads `src/app.html` from cwd → missing → throws.

Decision: emit parsed segments to `dist/app-html.json` during build; renderer reads dist first, falls back to `src/app.html` for dev/HMR. Zero app changes — `dist/` is already in every Docker COPY.

- [x] 🟠 `packages/bosia/src/core/appHtml.ts` — add `writeAppHtmlSegments(segments, outDir)` (serializes to `${outDir}/app-html.json`); `getAppHtmlSegments(cwd)` now tries persisted artifact first, falls back to `loadAppHtmlTemplate(cwd)`.
- [x] 🟠 `packages/bosia/src/core/build.ts` — after writing route-manifest, call `writeAppHtmlSegments(appHtml)` so production runtime has the segments inside `dist/`.

---

## 0.6.17 (2026-06-07) — production runtime also needed `src/hooks.server.ts`, `bosia.config.ts`, and `public/`

> Same komba Dockerfile incident. Once dist had `app-html.json`, the app booted but every auth request 303'd to `/login`: `server.ts` read `src/hooks.server.ts` from cwd with no fallback → `locals.user` undefined. Same for `bosia.config.ts`

Decision: extend the dist-first / src-fallback pattern (used for `app-html.json`) to hooks, config, and static assets. Build emits self-contained ESM artifacts under `dist/`

- [x] 🟠 `core/build.ts` — new `bundleRuntimeUserFiles(cwd)` step after the server bundle: externalize npm + bosia/elysia/bun/svelte, Bun.build `src/hooks.server.ts` → `dist/hooks.server.js` and `bosia.config.*` → `dist/bosia.config.js`
- [x] 🟠 `packages/bosia/src/core/server.ts` — hook loader checks `${OUT_DIR}/hooks.server.js` first, falls back to `src/hooks.server.ts`. Log line reports which path won.
- [x] 🟠 `packages/bosia/src/core/config.ts` — `loadBosiaConfig` checks `${OUT_DIR}/bosia.config.js` first, dynamic-imports it directly (skips Bun.build at server start); falls back to the existing compile-from-source path for dev.
- [x] 🟠 `packages/bosia/src/core/staticManifest.ts` — walk `${outDir}/static/` (mirror of `public/` written by build) so prod images can ship only `dist/`. `addOnce` keeps `public/` canonical when both exist (dev double-walk).

---

## Same-day addition (2026-06-04) — `parent()` returns `{}` on client-side JSON nav

> Bug from komba: `(await parent()).farmId` worked on SSR but returned `undefined` on client-side nav (14 routes)

Decision: make `parent()` see the real parent chain even when layer loaders are skipped. Two viable shapes — pick one:

- **A (server-side):** when handling `/__bosia/data/*.json`, accept a `parentSnapshots` payload in the POST body (the client already has cached data per skipped layer); merge into `parentData` before the page loader. Lowest churn.
- **B (client-side):** when a page loader is selected to re-run and any ancestor layout is skipped, re-run those layouts server-side too. Simpler invariant ("parent() always sees fresh data") but defeats the whole point of selective re-runs.

A is preferred. Plus a P0 doc/skill update so the workaround (`locals`-based farm/user scope) is the documented pattern even after the framework fix lands, since `locals` is also better for typed access.

- [x] 🟠 Client: emit `parentSnapshots: Record<depth, data>` for skipped layers. Done in `App.svelte` (nav) + `prefetch.ts` via a shared `buildParentSnapshots` helper — POST with `{ parentSnapshots }` only when non-empty, else keep the cacheable GET.
- [x] 🟠 `packages/bosia/src/core/server.ts` — `/__bosia/data` branch parses `parentSnapshots` from the POST body (guarded try/catch → undefined on GET/malformed) and forwards into `loadRouteData` via a new arg.
- [x] 🟠 `core/renderer.ts` — `loadRouteData` accepts `parentSnapshots`
- [x] ⚪ `bosia-routing/SKILL.md` — added a rule under R3: don't use `parent()` for scope identifiers (farmId/orgId/userId), read from `event.locals`; `parent()` is fine for view-layer data, `locals` is the source of truth for cross-loader scope.
- [ ] ⚪ Regression test under `apps/demo`: a layout server returning `{ orgId }`, a child `+page.server.ts` asserting `(await parent()).orgId`. Verify SSR AND a client-nav JSON fetch. (Not yet added — needs a client-nav harness.)

---

## Same-day addition (2026-05-30) — file-upload private-by-default + skill rule

> 0.6.11 made `/uploads/<key>.webp` reach `+server.ts`, but the default handler had no auth/ownership check and `file` had no `userId`

- [x] 🟠 `registry/features/file-upload/file.{sqlite,pg,mysql}.table.ts` — add `user_id` NOT NULL (text for sqlite/pg, varchar(36) for mysql).
- [x] 🟠 `registry/features/file-upload/file.repository.ts` — `getAllByUser(userId)`, `getByKey(key)`, `getOwned(id, userId)`, `remove(id, userId)` — ownership is part of every query.
- [x] 🟠 `registry/features/file-upload/file.service.ts` — `upload(file, userId)` stores userId; `getAll(userId)` filters; `getByKey(key)` exposes the row for the route's ownership check; `remove(id, userId)` rejects on ownership mismatch.
- [x] 🟠 `registry/features/file-upload/api-files-server.ts`, `api-files-id-server.ts`, `uploads-static-server.ts` — all gated on `locals.user`; uploads-static responds with `Content-Type: record.mime` + `Cache-Control: private, no-store`.
- [x] 🟠 `bosia-file-upload/SKILL.md` — new R5.5 "Files are private by default", anti-patterns (remove auth check, repoint to `public/uploads`, drop `user_id`), P0 gates on 401 + cross-user 404 curl, `[[bosia-auth-flow]]` declared a hard prereq.

---

## Same-day addition (2026-05-30) — API routes shadow static fallthrough

> Bug from fotoku: `/uploads/<uuid>.webp` 404'd even with a `+server.ts` at `/uploads/[...path]`. Root cause: the static-files block (matches by extension) ran before `resolveApiMatch`, so any static-extension URL short-circuited into static lookup.

- [x] 🟠 `packages/bosia/src/core/server.ts` — move the API-match block (`+server.ts` resolution + cache + error handling) above the static-files block and prerender block. No logic change inside the moved block.
- [x] ⚪ `apps/demo/src/routes/uploads/[...path]/+server.ts`, `apps/demo/uploads/sample.webp`, `apps/demo/src/routes/(public)/uploads-test/+page.svelte` — regression demo so `/uploads-test` renders an image served via the +server.ts handler.

---

## Same-day addition (2026-05-30) — fix `props_id_invalid_placement` in UI components

> Svelte 5 requires `$props.id()` to be the entire RHS of a top-level `const`. Nine UI components called it inside a template literal (`const baseId = \`tabs-${$props.id()}\`;`), which throws at init.

- [x] 🟠 `components/ui/{accordion,collapsible,hover-card,menubar-menu,nav-menu-item,popover,sidebar-menu-item,tabs,tooltip}.svelte`

---

## Same-day addition (2026-05-30) — `bosia feat drizzle` defaults to sqlite-file, not in-memory

> Bug: AI ran `bosia feat drizzle` and got `sqlite://:memory:`, losing data on restart. Three drifts: `meta.json` `DATABASE_URL` was a comment string with `:memory:` last; the runtime fallback was `:memory:`

- [x] 🟠 `registry/features/drizzle/meta.json` — single concrete `DATABASE_URL=sqlite://./data/app.db`, no inline comment options.
- [x] 🟠 `registry/features/drizzle/drizzle-index.ts` + `drizzle.config.ts` — runtime fallback now `sqlite://./data/app.db`, not `sqlite://:memory:`.
- [x] 🟠 `docs/content/skills/bosia-database-setup/SKILL.md` — default scheme updated to `sqlite://./data/app.db`; references to `src/features/drizzle/db.ts` corrected to `index.ts` (actual file shipped by the feature).

---

## Same-day addition (2026-05-30) — UI ids use `$props.id()` instead of `crypto.randomUUID` / `Math.random`

> Generated apps crashed with `crypto.randomUUID is not a function` over plain http (LAN IP, preview subdomains)

- [x] 🟠 `field`, `tooltip`, `popover`, `hover-card`, `nav-menu-item`, `menubar-menu` — replace `crypto.randomUUID().slice(0, 8)` with `$props.id()`. `menubar-menu` now prefixes its id with `menubar-` for consistency with siblings.
- [x] 🟠 `registry/components/ui/tabs/tabs.svelte`, `sidebar/sidebar-menu-item.svelte`, `accordion/accordion.svelte`, `collapsible/collapsible.svelte` — replace `Math.random().toString(36).slice(2, 10)` base ids with `$props.id()`.
- [x] 🟠 `registry/components/ui/alert-dialog/alert-dialog.svelte`, `dialog/dialog.svelte` — collapse the two separate `Math.random()` calls into one `$props.id()` shared by `titleId` and `descriptionId`.
- [x] ⚪ Server-side `crypto.randomUUID` in `features/file-upload/file.service.ts` and `file.{mysql,sqlite}.table.ts` left as-is — runs in Node where `crypto` is always available, and those ids persist to the DB rather than per-render.

---

## Same-day addition (2026-05-30) — brief intake: drop DB question + approval-button tool + `bosia-database-setup` skill

> Two pain points: (a) AI kept asking follow-up questions after the Quick Start batch (heading said "six", script listed 7, no rule against follow-ups)

- [x] 🟠 `bosia-brief-intake/SKILL.md` — Quick Start now five questions (palette + aesthetic merged into Q5). Step 5 is the approval gate via `brief_request_approval`
- [x] 🟠 `bosia-brief-intake/references/quick-start-script.md` — rewritten as a five-question script with the merged Q5 and an updated inference table. "After answers locked" now references the `brief_request_approval` tool call.
- [x] 🟠 `bosia-database-setup/SKILL.md` — new skill replacing `bosia-brief-database`. Triggers on user intent ("pakai postgres", "buat tabel"). Workflow A = engine swap; Workflow B = new table/column. R1 keeps sqlite-file the silent default.
- [x] 🟠 `docs/content/skills/bosia-brief-database/` — deleted; superseded by `bosia-database-setup`.
- [x] ⚪ `docs/content/skills/SKILL.md` catalog — count bumped 44 → 45; added a `bosia-database-setup` row to the "Conventions — framework ·" section.
- [x] ⚪ `docs/content/skills/bosia-drizzle-usage/SKILL.md` + `references/troubleshooting.md` — swapped every `bosia-brief-database` reference to `bosia-database-setup`.

---

## Same-day addition (2026-05-29) — fix in-page anchor link scroll

> Bosia's SPA router intercepted every `<a>` click, re-ran the full page load, then `scrollTo(0,0)`. Hash-only links like `<a href="#features">` never scrolled because `e.preventDefault()` killed the browser default.

- [x] 🟠 `core/client/router.svelte.ts` — short-circuit same-page hash nav in the click handler: when `anchor.pathname + anchor.search` matches the current location and a hash is present, skip `navigate()`
- [x] 🟠 `core/client/router.svelte.ts` — export `scrollToHash(hash)` helper: decodes the fragment, resolves `getElementById`, calls `scrollIntoView()`, returns whether it found a target. Used by both the click handler and `App.svelte`.
- [x] 🟠 `core/client/App.svelte` — replace unconditional `window.scrollTo(0,0)` after nav settle with `tick().then(() => scrollToHash(hash) || scrollTo(0,0))` in both paths.

---

## Same-day addition (2026-05-28) — new skills `bosia-page-shell` + `bosia-query-defaults`

> AI agents kept (a) re-rendering navbar/footer in every `+page.svelte` instead of `+layout.svelte`, (b) hand-rolling `<table>` instead of `ui/data-table`, (c) shipping repository `list` with no `limit`/`offset`/`orderBy`. No skill said otherwise.

- [x] 🟠 `bosia-page-shell/SKILL.md` — new skill. R1: chrome lives in `+layout.svelte`, never `+page.svelte`. R2 layout-depth table. R3 requires `(private)/+layout.server.ts` to produce `data.user`. R5 forbids hand-rolled `<table>`
- [x] 🟠 `bosia-query-defaults/SKILL.md` — new skill. R1 fixes the repo signature to `list(db, { limit, offset, orderBy?, where? })` returning `{ rows, total }`. R2 defaults limit/offset/orderBy. R3 clamps limit ≤100.
- [x] ⚪ `docs/content/skills/SKILL.md` — catalog updated from 42 → 44 skills; new rows added to "Conventions — design ✦" (`bosia-page-shell`) and "Conventions — framework ·" (`bosia-query-defaults`).

---

## Same-day addition (2026-05-28) — fix `feat` block install + non-interactive `add block`

> AI agent ran `file_upload_install` and got a silent 404 (the block path lives under `blocks/`, not `components/`). The retry hung on `@clack/prompts` because the MCP runner never closes stdin. Framework fixes only — no per-app patching.

- [x] 🟠 `cli/feat.ts` — `FeatureMeta` gains `blocks?: string[]`. After component install, iterate `meta.blocks` and call `runAddBlock` so block deps route to the block installer (was 404'ing through `addComponent`
- [x] 🟠 `cli/block.ts` — `runAddBlock` accepts `InstallOptions`, gates the "Replace existing block?" prompt behind `!skipPrompts`, threads `options` into recursive `addComponent` calls, honors `-y`
- [x] ⚪ `packages/bosia/src/cli/index.ts` — `add block` dispatch now passes through `-y` (was filtering to `--` long flags only).
- [x] ⚪ `registry/features/file-upload/meta.json` — moved `files/upload-area` and `files/crop-image` from `components` to the new `blocks` field.
- [x] 🟡 `bosia-file-upload/SKILL.md` — R5 now shows the explicit `import UploadArea from "$lib/blocks/files/upload-area/block.svelte"` and full props; workflow step 5 gains `db:generate && db:migrate`

---

## Same-day addition (2026-05-28) — fix `file-upload` end-to-end (Bun.Image, image host, route placement)

> AI agent scaffolded `bosia feat file-upload` and hit three regressions: (1) `Bun.Image.open/decode` doesn't exist, uploads crash; (2) `PUBLIC_BASE_URL` bakes the wrong host into stored URLs.

- [x] 🔴 `features/file-upload/file.service.ts` — rewrite the Bun.Image pipeline. Drop the `decodeImage` shim. Use `new Bun.Image(bytes)`, read dims from `metadata()`, positional `resize(w, h, opts)`, `.webp({ quality: 85 }).bytes()`
- [x] 🟠 `features/file-upload/storage-local.ts` — `save()` returns relative `/uploads/${key}` (no `PUBLIC_BASE_URL` prefix). The browser resolves against the page origin → works for `lvh.me` preview, prod domains, and localhost without env tuning.
- [x] ⚪ `registry/features/file-upload/meta.json` — drop misleading `PUBLIC_BASE_URL=http://localhost:3000` default (now empty string). (F2)
- [x] 🟠 `bosia-routing/SKILL.md` — new R6 hard rule: authenticated UI MUST live under `(private)`. Anti-pattern block `(public)/admin/...` ❌ vs `(private)/admin/...` ✅. Decision rule + P0 checklist entry. (F3a)
- [x] 🟠 `docs/content/skills/bosia-dashboard/SKILL.md` — STOP rule at top: files under `(private)/`; create `(private)/+layout.server.ts` if absent. (F3b)
- [x] 🟠 `docs/content/skills/bosia-crud-flow/SKILL.md` — STOP rule at top: resource routes under `(private)/<resource>/...`; admin CRUD never `(public)`. (F3c)
- [x] 🟡 `bosia-bun-runtime/SKILL.md` — new `Bun.Image` section: constructor, `metadata()`, positional `resize`, per-format encoders (`.webp({ quality: 0–100 })`), `.bytes()`. Anti-pattern callout for `Bun.Image.open/decode`. (F4)
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
- [x] 🟡 Single-^C stop — CLI wrappers survive SIGINT and wait for the child (no more orphaned server); dev skips the drain for instant exit; second ^C force-quits (130)
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
- [x] 🟠 Bun-native drizzle migrate runner — `src/features/drizzle/migrate.ts` replaces `drizzle-kit migrate` for sqlite/postgres/mysql apps (drizzle-kit's sqlite migrate needs `better-sqlite3`
- [x] 🟠 `bosia-brief-database` skill + hook into `bosia-brief-intake` — captures DB engine + connection during brief intake, writes `## Database` block to BRIEF.md
- [x] 🟠 `todo` feature — `bosia feat todo` scaffolds todo schema, repository, service, routes, components, and seed data
- [x] 🟡 `todo` component — `bun x bosia@latest add todo` installs todo-form, todo-item, todo-list components
- [x] 🟡 Registry as single source of truth — `bosia create --template todo` installs features from registry via `template.json` instead of duplicating files

### Hooks & Middleware

- [x] 🟠 `hooks.server.ts` with `Handle` interface
- [x] 🟡 `sequence()` helper for composing middleware
- [x] 🟠 `RequestEvent` — `request`, `params`, `url`, `cookies`, `locals`

### Docs & Ecosystem

> Docs site + component registry roadmap moved to [`docs/ROADMAP.md`](docs/ROADMAP.md).
> Only framework-level (`packages/bosia`) items remain below.

- [x] 🟠 GitHub Actions for auto-publishing to npm and deploying docs
- [x] 🟡 Dev server auto-restart on crash
- [x] 🟠 SEO infrastructure — `Metadata` type supports `lang` and `link` fields; dynamic `<html lang>`; `<link>` tag rendering in streaming SSR

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
- [x] 🟠 `renderPageWithFormData` loader error handling — catch `HttpError`/`Redirect` thrown from `loadRouteData()` after a successful form action; let them surface as proper redirect/error responses instead of crashing the request.
- [x] 🟡 Prerender process cleanup — proper signal handling, verified termination (`await child.exited` after `kill()`), use random port instead of hardcoded 13572
- [x] 🟡 Fix `buildAndRestart` recursive tail call — replace recursion with `while` loop to prevent stack growth under rapid file changes

### Client

- [x] 🟡 Bound prefetch cache size — `prefetchCache` grows unbounded between navigations; add LRU eviction (max ~50 entries)
- [x] 🟡 Prefetch cache TTL — stale prefetch data served after long idle; discard entries older than 30s on `consumePrefetch()`
- [x] 🟠 Router click handler must respect modifier/middle clicks.

### Build

- [x] 🟡 Fail build on tsconfig.json corruption — don't silently continue with degraded config
- [x] 🟡 `compress()` threshold uses character count not byte count — `body.length` on a UTF-8 string under-counts multi-byte content; switch to `Buffer.byteLength` or `TextEncoder().encode(...).length` before threshold check
- [x] 🟡 `.env` parser inline-comment stripping — `KEY="value" # note` currently keeps ` # note` as part of the value; strip trailing comment after the closing quote
- [x] ⚪ Tune gzip compression threshold — raised to 2KB (`GZIP_MIN_BYTES = 2048`); small responses fit in single TCP packet, gzip overhead outweighs savings below this size

### DX

- [x] 🟠 **Audit #7** — Dev proxy must forward `X-Forwarded-Host`/`X-Forwarded-Proto` to the inner app — without them the CSRF check derives the wrong `expectedOrigin`, 403'ing same-origin POST/form actions in dev. DX-only, prod unaffected.
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

- [x] 🟠 Request deduplication — share the in-flight loader promise for concurrent identical GET requests instead of running twice. Reworked in 0.3.1 around a folder convention: dedup ON by default keyed on URL only.
- [x] 🔴 Dedup key cross-user data leak — replaced cookie-fingerprint identity with a folder convention. Routes under `(private)` skip dedup and run per-request.
- [ ] 🟡 Trie-based route matcher — replace linear O(n) route scan with radix trie for O(k) matching (k = URL segments). Matters when route count exceeds ~100
- [x] 🟡 Compiled route regex — pre-compile route patterns to `RegExp` at startup instead of parsing on every match
- [x] 🟠 Concurrency / backpressure ceiling — Bun accepted unlimited connections, the likely OOM vector under slow-loris. Add an env-gated soft cap (`MAX_INFLIGHT`) reusing the in-flight counter, return 503 when exceeded. Shipped v0.5.13.
- [x] 🟡 Response cache + brotli — `Bun.gzipSync()` ran on every HTML >2KB with no precompressed cache; no brotli. Add an LRU cache + brotli. Shipped v0.6.0 — skip-render cache keyed on URL + identity hash, per-route opt-out, brotli+gzip per entry.
- [x] 🟡 Static-asset fallthrough cost — every static hit called `Bun.file().exists()` up to 4×. Build a boot manifest so prod lookups are a Map check. Shipped v0.6.9 — `staticManifest.ts` walks the dirs once at boot.
- [ ] 🟡 Collapse SSR `render()` calls — root `App.svelte` + error pages render in separate Svelte `render()` invocations. Profile under representative load first.

### Server Reliability

- [x] 🟠 Process-level error handlers in prod — install `process.on("uncaughtException"/"unhandledRejection")` outside the dev inspector path.
- [ ] 🟡 Structured logging — replace emoji-prefixed `console.log`/`error` in `server.ts` with a level-based logger that emits JSON in prod (pretty in dev) with a request ID.
- [ ] ⚪ Tunable shutdown timers — `server.ts:906` hardcodes the 2 s force-exit window and 10 s drain. Expose via `SHUTDOWN_DRAIN_MS` / `SHUTDOWN_FORCE_MS` for deploys with long-running streaming responses. Source: 2026-05-23 pre-prod audit
- [ ] ⚪ Startup banner shows resolved hostname — `server.ts:880-882` logs `http://localhost:${PORT}` even though Bun binds `0.0.0.0` by default. Cosmetic only (container is reachable). Source: 2026-05-23 pre-prod audit

---

## v0.2.3 — CLI & Feature Installer

> Per-file install strategies so features can safely contribute to shared files.

### CLI / Feat

- [x] 🟠 `bosia feat` per-file strategies — `meta.json` `files: FileEntry[]` with a `strategy` field: `write` (default), `skip-if-exists`, `append-line`, `append-block`, `merge-json`. Replaces the all-or-nothing replace prompt for shared files.
- [ ] 🟡 Document `meta.json` schema and strategies in `docs/` (CLI / `bosia feat` page)
- [ ] 🟡 `bosia feat <name> --dry-run` — preview file actions (write/skip/append/merge) without touching disk
- [ ] 🟡 Validation: error early when two installed features write to the same target with `write` strategy (force one to declare append-line/append-block)
- [ ] 🟠 `auth` feature scaffold — uses `append-block` to register hooks in `src/hooks.server.ts` and routes barrel
- [x] 🟡 `s3`/`storage` feature → shipped as `file-upload` in v0.6.4: `bun x bosia feat [-y] file-upload [-d sqlite|postgres|mysql]` scaffolds Drizzle metadata + local/S3 adapter + `/api/files` POST (WebP @0.85, fit 1920×1080)
- [x] 🟡 Track installed features per project (`bosia.json` at root, committed) — enables `bosia feat list`/`add list`. Schema `{ version, features, components, blocks }` keyed by name.

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

- [x] 🟡 Add `bosia.config.ts` to `templates/{default,demo,todo}/` enabling `inspector({ editor: "code" })`. `copyDir` copies it as-is; no substitutions needed. Production-safe (plugin self-disables under `NODE_ENV=production`).
- [x] ⚪ Note preconfigured state in `docs/content/docs/guides/inspector.md` so existing-project users still find the manual setup steps

---

## v0.5.5 — Dev/Build dist collision ✅ (shipped 2026-05-18)

> Dev and build no longer share `./dist`. Dev writes to `.bosia/dev/`; standalone `bun run build` keeps writing to `./dist/`.

- [x] 🟠 Decouple URL namespace (`/dist/client/...`) from on-disk location via `OUT_DIR` in `paths.ts` (reads `BOSIA_OUT_DIR`, default `./dist`)
- [x] 🟠 `dev.ts` hardcodes `.bosia/dev` and passes `BOSIA_OUT_DIR` to spawned build + app-server children; never reads the env itself
- [x] 🟠 `build.ts`, `prerender.ts`, `html.ts`, `server.ts`, `cli/start.ts` all read from `OUT_DIR` instead of hardcoded `./dist` literals
- [x] 🟡 Verification path: `BOSIA_OUT_DIR=.bosia/verify bun run build` produces full artifacts without touching `./dist`. Catches what `tsc --noEmit` + `svelte-check` miss (route scan, prerender child, server-entry compile). Verified at `apps/demo`.

---

## v0.5.6 — Build/dev `.bosia/` cleanup collision ✅ (shipped 2026-05-18)

> Follow-up to v0.5.5. `OUT_DIR` was split, but `build.ts` still blanket-wiped `./.bosia` at startup — clobbering a concurrently-running `bosia dev` whose compiled server lives at `.bosia/dev/`. Cleanup is now scoped.

- [x] 🔴 `build.ts` cleanup is scoped to `OUT_DIR` plus only the codegen files this build owns (`routes.ts`, `routes.client.ts`, `env.server.ts`, `env.client.ts`, `types`). No more blanket `.bosia/` rmSync.

---

## v0.5.7 — `params` as a top-level page/layout prop ✅ (shipped 2026-05-19)

> Match SvelteKit: `+page.svelte`/`+layout.svelte` receive `params` as a sibling prop of `data`, not nested under `data.params`. Network protocol (data endpoint payload, SSR injection) is unchanged — `params` is stripped at the component boundary.

- [x] 🟠 `App.svelte` passes `params` as a separate prop on pages and layouts; SSR branch strips merged `params` off `pageData` via local helper
- [x] 🟠 `hydrate.ts` seeds `appState.pageData` without the merged `params` key (still seeds `appState.routeParams` from same payload)
- [x] 🟠 `routeTypes.ts` codegen: `PageData` / `LayoutData` no longer intersect `{ params: Params }`; `PageProps` / `LayoutProps` declare `params: Params` as a sibling of `data`
- [x] 🟡 Update demo + template `blog/[slug]/+page.svelte` and docs (`README.md`, `docs/content/docs/guides/routing.md`) to consume `params` as a top-level prop
- [x] 🟡 Standardize `default` and `todo` starter templates on the `(public)/` route group convention used by `demo`, so scaffolded projects are ready to add authenticated areas (e.g. `(app)/`, `(admin)/`) without restructuring later

### Same-day addition (2026-05-19) — Inspector runtime error capture

> Inspector now captures live client + server runtime errors in a passive badge inside the running app. "Send to AI" per row reuses the alt-click → `aiEndpoint` handoff. Live-only (no buffer/replay), dev-only (prod unaffected).

- [x] 🟠 Server capture: Elysia `.onError()` + `uncaughtException`/`unhandledRejection` listeners installed lazily inside `backend.before()`. `uncaughtException` rethrows so crash-recovery still triggers. 500ms dedup prevents render-loop floods.
- [x] 🟠 SSE broadcaster at `/__bosia/errors` — module-scoped controller Set, `event: bosia-error` data frames, 25s `:ping` keepalive, abort-driven cleanup. No replay buffer (live-only contract)
- [x] 🟠 Reorder the Elysia onError chain in `server.ts`: the base 500 responder now registers AFTER the `plugin.backend.before` loop so plugin handlers fire first.
- [x] 🟠 Client capture in `overlay.ts`: `window.error` + `unhandledrejection` listeners + EventSource subscription to `/__bosia/errors`. Unified list, stable ids, UI dedup
- [x] 🟠 Floating badge UI bottom-right (`● N errors`) → click → expandable panel with per-row stack details, Dismiss, and AI-only "Send to AI" button. Badge hidden when list empty
- [x] 🟠 Sourcemap resolution dev-only — `build.ts` emits `sourcemap: "linked"` in dev (`"none"` in prod). New `inspector/sourcemap.ts` lazy-resolves compiled frames → source via `@jridgewell/trace-mapping`, only for the clicked error.
- [x] 🟡 Last-interaction context: track the most recent `data-bosia-loc` the user clicked/keyed and append `Last user interaction: <file>:<line>:<col>` to the payload.
- [x] 🟡 `errorsEnabled?: boolean` (default `true`) config flag on `InspectorOptions` — opt out of the whole feature without removing the plugin
- [x] 🟡 AI-only action button — overlay still surfaces the badge for visibility without `aiEndpoint`, but the "Send to AI" button only renders when configured. Standalone bosia apps in editor-mode see display-only errors

---

## v0.5.8 — `bind:*` shadow crash fix ✅ (shipped 2026-05-19)

> Dev pages using `<input bind:value={state}>` crashed with `RangeError: Maximum call stack size exceeded` on first render. Svelte's dev output wraps the binding in a named `function get()`; Bun rewrites `$.get` to a named import `get`

- [x] 🔴 Post-process Svelte compile output in `inspector/bun-plugin.ts` and `svelteCompiler.ts` to rename the inner `get`/`set` to `$$g`/`$$s` (length-preserving so source-map columns stay accurate). Dev-only — prod uses anonymous arrows.
- [x] 🔴 Inject Inspector-extracted component CSS via a runtime `<style>` element instead of a `loader: "css"` virtual module.

---

## v0.5.9 — `src/app.html` template ✅ (shipped 2026-05-20)

> SvelteKit-style document shell. Users create `src/app.html` with `%bosia.head%`/`%bosia.body%` placeholders to control HTML chrome (lang, data attributes, favicon, analytics)

- [x] 🟠 `packages/bosia/src/core/appHtml.ts` — parse, validate, cache template with invalidation for HMR
- [x] 🟠 Placeholders: `%bosia.head%`, `%bosia.body%` (required); `%bosia.lang%`, `%bosia.nonce%`, `%bosia.assets%`, `%bosia.env.PUBLIC_*%` (optional)
- [x] 🟠 Update `html.ts` builders (`buildHtml`, `buildHtmlShellOpen`, `buildMetadataChunk`, `buildHtmlTail`) to accept optional segments and slot user chrome
- [x] 🟠 Update `renderer.ts` to load template once per process and thread through 6 call sites
- [x] 🟠 Validation at build time in `build.ts` — fail fast if required placeholders missing
- [x] 🟡 Scaffold `src/app.html` in templates (`default`, `todo`) and demo with `%bosia.lang%` and `data-theme` attributes
- [x] 🟡 Favicon detection: if user's `headOpen` contains `rel="icon"`, skip framework default favicon injection
- [x] 🟡 Unit tests: template loading, validation, parsing, caching, interpolation, segment structure
- [x] 🟡 New skill `bosia-app-css` documenting `src/app.css` order + the Tailwind v4 / LightningCSS rule: font `@import url(...)` must come before `@import "tailwindcss"` or it's silently dropped. Catalog 33 → 34.
- [x] 🟡 New CLI command `bosia add font "<Family>" "<url>"` (`cli/font.ts`, reuses `mergeFontImports()`). Prepends `@import url(...)` to `src/app.css` with a `/* bosia-font: <Family> */` marker so it survives LightningCSS ordering. Idempotent.

---

## v0.5.10 — SvelteKit navigation parity ✅ (shipped 2026-05-20)

> Closes the gap between Bosia's client nav API and SvelteKit's `$app/navigation`. Apps reached for `window.location.href` because `goto()` wasn't exported (full reload, lost state)

- [x] 🟠 `goto(url, opts?)` exported from `bosia/client`. Returns a Promise resolving after the nav settles. Honors `replaceState`, `invalidateAll`, `noScroll`
- [x] 🟠 `beforeNavigate(fn)`/`afterNavigate(fn)` lifecycle hooks. `nav.cancel()` blocks SPA navigations; popstate cancellation is a no-op since history already advanced. Auto-unregister on destroy via `onDestroy`.
- [x] 🟠 Router exposes navigation `type` (`"link"|"goto"|"popstate"|"form"|"enter"`) and the `Navigation` object threading into both lifecycle phases.
- [x] 🟠 `router.navigate(path, { replace, source })` supports `history.replaceState` (used by `goto({ replaceState: true })`) and threads the source through to the Navigation object
- [x] 🟡 `beforeunload` fires `beforeNavigate` with `willUnload: true` so listeners can observe (cancellation requires native `beforeunload` event — out of scope)
- [x] 🟡 Hydration safety net — wrapped `main()` in `core/client/hydrate.ts` in a `.catch()` so any future hydrator failure logs to console instead of silently leaving "Loading…" on screen
- [x] 🟠 404/error pages no longer ship a stuck `#__bs__` spinner blocking the "Go home" link. `buildHtml()` now gates spinner injection on empty `body` — non-streaming SSR skips it; streaming SSR and `ssr=false` still get it for the TTFB gap.
- [x] 🟡 Demo route `apps/demo/src/routes/(public)/nav-test/+page.svelte` exercises all four patterns plus the cancel/event-log flow
- [x] 🟡 New docs page `docs/content/docs/guides/navigation.md` covers the four patterns and the lifecycle hooks; added to the Guides sidebar in `docs/src/lib/docs/nav.ts`
- [x] 🟡 New `bosia-navigation` skill so AI agents pick the right navigation pattern and use the lifecycle hooks correctly. Catalog index bumped 34 → 35; cross-references added in `bosia-routing` and `bosia-auth-flow`.

### Same-day addition (2026-05-20) — Surface dev-server errors to the inspector overlay

> Inspector captured runtime errors only. Dev-infra errors — build failures, app crashes, `.env` reload failures, port conflicts.

- [x] 🟠 `core/dev.ts` captures build/app-crash/dev-uncaught errors into a bounded ring (50 entries, 30s TTL) with a 500ms dedup. Build + app-server stderr piped + tee'd so terminal output is unchanged.
- [x] 🟠 New `event: bosia-error` over `/__bosia/sse` (same wire shape as inspector's `ServerError`). The SSE handler flushes recent buffered errors to new clients so pre-connect errors stay visible.
- [x] 🟠 New `core/dev-error-page.ts` renders the fallback HTML the dev proxy returns when `fetch(app)` throws on an HTML nav. Embeds the overlay, pre-seeds buffered errors, subscribes to `/__bosia/sse` `reload` to swap itself out.
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

> Before v0.6, every HTML response re-ran `metadata()`, layout `load()`, page `load()`, `render()`, and `Bun.gzipSync()` even when byte-identical. The new in-memory cache short-circuits all of it.

- [x] 🟠 New `core/cache.ts` — tiny LRU + `tagIndex` + `pathIndex`, `computeCacheKey(url, req, cookies)`, `serveCached(entry, req)` with `Accept-Encoding: br|gzip|identity` negotiation, `buildCompressedVariants()` (brotli + gzip), tag/path eviction.
- [x] 🟠 Renderer integration (`renderer.ts`) — cache read before metadata/load/render, cache write after chunks are built, streaming preserved on miss. CSP-enabled deploys skip the cache (per-request nonce is incompatible with cached bytes).
- [x] 🟠 API endpoint integration (`server.ts`) — `+server.ts` GET handlers cached with the same key rules. v0.6 invalidates API entries by URL/prefix only (no `depends()` for API yet).
- [x] 🟠 Public API — `invalidate(key)` / `invalidateAll(prefix)` from `bosia` mirror the existing browser-side `invalidate()` semantics. Form actions call them after a write.
- [x] 🟡 Per-route opt-out — `export const cache = false;` in `+page.ts`, `+page.server.ts`, or `+server.ts`. Generated `$types.d.ts` exports a `CacheOption` type alias for IDE support.
- [x] 🟡 Env vars — `CACHE_KEYS` (default `session,sid,auth,token,jwt,Authorization`) controls identity-hash inputs; `CACHE_MAX_ENTRIES` (default 500, 0 disables). Documented in `guides/environment-variables` and the response-cache guide (EN+ID).
- [x] 🟡 Author guidance — new `bosia-response-cache` skill walks agents through when to call `invalidate()` from server code, how to tag loaders with `depends()`, and when to opt a route out.
- [x] 🟠 Dev proxy now forces the inner app to `Accept-Encoding: identity`. Previously it forwarded `gzip,br`, the inner returned compressed bytes, Bun's `fetch()` auto-decoded but left `Content-Encoding: gzip`
- [x] 🟠 `core/cache.ts` guards `process.env` reads — re-exported through the public `bosia` barrel, it evaluated in the browser bundle and threw `ReferenceError: process` on hydration in Safari.
- [x] 🟠 Server-only response-cache exports moved to `bosia/server` — `core/cache.ts` still evaluated client-side via the shared barrel. Added `./server` to `exports`, created `lib/server.ts`, removed them from the shared barrel.
- [x] 🟡 Inspector dev-error reporter type alignment — `devErrorReport.ts` declared `source?: "server"|...` but `pushServerError` accepted `"elysia"|...`, failing `bun run check` (TS2322)

### Deferred to v0.7+

- [ ] 🟡 Key-based invalidation for `+server.ts` endpoints — give API handlers a `depends()` argument or support `export const tags = [...]` so `invalidate("app:user")` evicts API responses too.
- [ ] 🟡 TTL-based expiry — author wants pure-invalidate today, but TTL is useful for "refresh every N seconds" pages.
- [ ] 🟡 Layout-level `cache = false` cascade — a layout opting out should make its child routes uncached too.
- [ ] 🟡 Multi-replica cache (pub/sub invalidation) — single-replica only in v0.6.
- [ ] 🟡 Soft-purge / stale-while-revalidate.
- [ ] 🟡 Custom key function — `export const cache = { key: (req) => string }`.

---

## v0.6.5 — Compile-time component-import audit ✅ (shipped 2026-05-27)

> A scaffolded app crashed on first SSR render with `undefined is not a function`: `import * as Card` + `<Card.Root>`, but `index.ts` exports `Card`/`CardContent`, not `Root`. `bosia build` succeeded silently.

- [x] 🟠 `core/svelteAudit.ts` — walks the modern Svelte 5 AST, extracts top-level bindings from `<script>`, tracks shadowing from `{#each}`/`{#snippet}`/`{@const}`. For namespace imports, `Bun.Transpiler.scan()` introspects the source's exports.
- [x] 🟠 `core/svelteCompiler.ts` — switched `compile()` to `modernAst: true`, wired the audit into `onLoad`, added module-scoped per-file dedupe (`Map<absPath, Promise>`) so it runs once across the parallel `browser`+`bun` targets.
- [x] 🟠 Promotes select `svelte/compiler` warnings to errors: `component_name_lowercase`, `bind_invalid_value`, `invalid_html_attribute` — silently-broken cases the user almost never wants to ship.
- [x] 🟡 `resolveImport.ts` + `sourceLoc.ts` — extracted from `plugin.ts` and `inspector/bun-plugin.ts` so the audit and the resolver share one alias/tsconfig-paths/relative-path implementation and one `lineColFromOffset` helper.
- [x] 🟡 `BosiaConfig.strictImports` (boolean | `{ unbound, namespaceMember, warnings }`) — per-component opt-out. `BOSIA_STRICT_IMPORTS=0` env var downgrades to a `console.warn` at runtime without failing the build.
- [x] 🟡 `test/svelte-audit.test.ts` — 8 fixtures cover the repro (missing namespace export), positives (correct member, named import, each-block shadowing, bare-package skip), and edges (unbound identifier, dotted on default import, env override).
- [x] 🟡 ConstTag siblings — `{@const Foo = ...}` now scopes its binding across the whole surrounding fragment, not just its own children. Previously a sibling-bound `<DemoComponent />` false-flagged.

---

## v0.6.4 — Combined files demo, CORS-safe ✅ (shipped 2026-05-26)

> The crop block's docs demo loaded a remote Unsplash URL with `crossorigin="anonymous"`; the browser blocked it as CORS and the cropper rendered blank. Replaced the two demos with one: pick a file via `UploadArea`

- [x] 🟡 `demos/FilesUploadCropDemo.svelte` — single combined demo. `UploadArea` (`enableCrop`) → on crop, captures the `(file, done)` pair, opens `CropImage` against `URL.createObjectURL(file)`, wraps the Blob as a `File`, calls `done(file)`
- [x] 🟡 `docs/src/routes/api/demo-upload/+server.ts` — tiny `POST` returning `{ url, ok }` so the demo Upload button doesn't 500.
- [x] ⚪ Both `blocks/files/{crop-image,upload-area}.md` frontmatter `demo:` now points at `FilesUploadCropDemo`. `[...slug]/+page.svelte` imports only the new demo; deleted `FilesCropImageDemo.svelte` and `FilesUploadAreaDemo.svelte`.
- [x] 🟡 `blocks/files/crop-image/block.svelte` — switched the 400px viewport from `h-[400px]` to `style="height: 400px;"`. The class works for end-users.
- [x] 🟡 `docs/src/app.css` — added `@source "../../registry/blocks/**/*.{svelte,ts,js}"` so utility classes declared inside registry blocks are emitted into `bosia-tw.css` from the docs build alongside `registry/components/ui`.
- [x] 🟡 `docs/src/lib/docs/content.ts` — `contentDir`/`demoFile` no longer resolve relative to `import.meta.dir` (dev bundle 3 levels deep, prod 2), which missed the content dir in dev → every catch-all docs page 404'd.

### Same-day addition (2026-05-26) — `file-upload` feature + CLI dialect flags

> The `files/upload-area` block shipped since v0.6.3 but bosia had no server-side counterpart.

- [x] 🟠 `registry/features/file-upload/` — full backend. `file.service.ts` validates MIME, decodes via `Bun.Image`, fit-resizes to 1920×1080, re-encodes WebP @0.85, persists via Drizzle. Three dialect table files target one install path.
- [x] 🟠 `cli/feat.ts` — per-feature options system. Top-level handles only `-y`/`--local`; everything after the feature name flows to `resolveFeatureOptions()`, parsed against the feature's own `meta.json` `options` schema. Unknown flags abort.
- [x] ⚪ `cli/index.ts` — feat subcommand argv handler simplified: first non-flag token is the name, everything else (including pre-name `-y`) flows to `runFeat`. Help text updated so feature-specific flags follow the feature name.
- [x] ⚪ `packages/bosia/src/cli/registry.ts` — `InstallOptions` gained `featureOptions` (resolved values) and `featureArgs` (raw tokens for the root feature). No CLI-level dialect type — dialect is now `file-upload`-specific.
- [x] ⚪ `registry/index.json` — `features` array gains `file-upload`.
- [x] 🟡 `docs/content/docs/guides/file-upload.md` — install / env / wiring / S3 swap docs; cross-link added from `blocks/files/upload-area.md`. Nav entry under Guides.
- [x] ⚪ `bosia-file-upload/SKILL.md` — new skill teaching when to install file-upload (avatar/profile/media-library triggers), R1–R5, workflow, anti-patterns.

---

## v0.6.3 — Skills API exposes references ✅ (shipped 2026-05-25)

> AI agents fetching `/api/skills/<name>.json` saw the `SKILL.md` body but not the companion reference files that carry the actionable detail, so they guessed paths or scraped the site.

- [x] 🟡 `listSkillReferences(name)` in `docs/src/lib/skills/list.ts` — reads `<SKILLS_ROOT>/<name>/references/`, filters to `.md`, validates slugs against `^[a-z0-9-]+$`, returns `{ file, path }[]` sorted by file. Silent `[]` on missing dir.
- [x] 🟡 `GET /api/skills/[name]` response gained `references: SkillReference[]` so agents discover the available reference files in one round-trip.
- [x] 🟡 New route `api/skills/[name]/references/[file]/+server.ts` — prerendered, `entries()` enumerates `(name, file)` pairs, `realpath` traversal guard mirrors the `[name]` route. Returns `{ name, file, path, content }` with `max-age=60`

### Same-day addition (2026-05-25) — Files blocks (crop + upload)

> Registry had no file-handling blocks. Ported two from a working CMS: an image cropper and a drag-and-drop upload area. Both installable standalone.

- [x] 🟡 `registry/blocks/files/crop-image/` — Svelte 5 cropper wrapping `svelte-easy-crop`
- [x] 🟡 `blocks/files/upload-area/` — drag-drop + click-to-pick with preview, size validation, `XMLHttpRequest` progress, `Progress` bar. Props: `uploadUrl` (required), `accept`, `maxSizeMB`, `fieldName`, `extraFields`, `headers`, `enableCrop`
- [x] ⚪ `registry/components/ui/icon/icons.ts` — added `crop` and `zoom-in` paths (lucide-static).
- [x] ⚪ `registry/index.json` — `blocks` array gains `files/crop-image` and `files/upload-area`.
- [x] ⚪ Docs pages `docs/content/docs/blocks/files/crop-image.md` and `upload-area.md`; Files group added to `docs/src/lib/docs/nav.ts`; `FilesCropImageDemo` and `FilesUploadAreaDemo` registered in `[...slug]/+page.svelte`.
- [x] 🟡 `core/build.ts` — added `conditions: ["svelte"]` to both `Bun.build` calls so Svelte libs (like `svelte-easy-crop`) resolve to their `svelte` export. An earlier generic `onResolve` handler broke shiki's chunked CJS interop.

### Same-day addition (2026-05-25) — Clean-architecture skill for generated apps

> Bosapi-generated apps put `db.select(...)` directly in `+page.server.ts` loaders and skipped a service/repository layer.

- [x] 🟡 New `bosia-clean-architecture` skill — eight rules (R1–R8): no `db` in routes, repository ownership, service-owned validation, derived valibot validators, one entity per feature, cross-feature via service namespace, table home.
- [x] 🟡 Three companion references — `feature-template.md` (copy-adapt for all six files + callers), `refactor-recipe.md` (grep → extract → swap-import using `warung-nasi`), `shared-folder.md` (what belongs in `features/shared/` and what doesn't).
- [x] 🟡 `bosia-drizzle-feature` updated — folder diagram gained `*.repository.ts`/`*.validator.ts`/`*.dto.ts`; R2 split into repository + service with examples; workflow now 9 steps; new anti-patterns and P1 items for the split.
- [x] 🟡 `bosia-drizzle-usage` updated — Quick Start rewritten so loaders call `CatalogService.summary()` not `db.select(...)`; workflow writes the repository first, then service; new red flags for `db` in routes.
- [x] 🟡 Catalog `docs/content/skills/SKILL.md` bumped 38 → 39 skills; `bosia-clean-architecture` added under framework conventions and into the discovery-order step 2.

---

## v0.5.13 — Inspector component call-site chain ✅ (shipped 2026-05-23)

> Alt-clicking a `<button>` rendered by a shared `Button.svelte` showed only `Button.svelte:5:1`

- [x] 🟠 Compile-time injection of `<!--bosia:o=...-->` / `<!--bosia:c-->` markers around `Component`/`SvelteComponent`/`SvelteSelf` nodes in `injectLocs`
- [x] 🟠 Runtime `collectStack(el)` walks DOM ancestors + previous siblings with a depth counter matching each `bosia:c` to its `bosia:o`, so siblings don't bleed. Returns outermost-first.
- [x] 🟡 Tooltip widened with `max-width:90vw` + ellipsis so long chains don't overflow the viewport.
- [x] ⚪ `docs/content/docs/guides/inspector.md` updated to describe the chain feature and extend the prod-output grep to check for both markers.
- [x] 🟡 `bosia-inspector-edit` skill updated for the new payload — parses the `Component tree (outer → leaf): …` prefix, defaults the target to the outermost call-site, requires a one-sentence justification when the agent picks the leaf instead.

### Same-day addition (2026-05-23) — Env + CORS skills for AI agents

> Bosapi preview apps (`a-<uuid>.lvh.me`) surfaced `403 Cross-origin request blocked` and the AI kept reaching for CORS env vars.

- [x] 🟡 New `bosia-env` skill — four-tier prefix (`PUBLIC_STATIC_`/`PUBLIC_`/`STATIC_`/none), `$env` virtual module for user vars, `process.env` for framework-reserved vars.
- [x] 🟡 New `bosia-cors` skill — CORS env recipe (`CORS_ALLOWED_ORIGINS` + methods/headers/credentials/max-age), the `Vary: Origin` invariant, and a triage table distinguishing a real CORS failure from Bosia's CSRF rejection.
- [x] 🟡 Catalog `SKILL.md` updated 35 → 37 skills; both entries added under framework conventions and into discovery-order step 2; cross-references wired both ways and to `bosia-security-review`/`bosia-elysia-routes`.

---

## v0.5.11 — `$types` resolution inside `.svelte` files

> `tsc --noEmit` resolves `./$types` from `.svelte` via the `rootDirs` trick, so `check`/`build` type-check correctly. But `svelte-language-server` doesn't honor `rootDirs` in its virtual TS document.
>
> Acceptance: in a freshly scaffolded app, hovering `PageProps` in `+page.svelte` shows the generated type, autocomplete on `params.` lists only the route's dynamic segments, and no "module not found" appears for `./$types`. Same in Zed and VS Code.

- [ ] 🟠 Investigate options: (a) a TS Language Service plugin hooking `moduleResolution` for `$types` from `.svelte` files; (b) fork/extend `svelte-language-server` config.
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

- [x] 🔴 Fix `bosia dev` build crash `Multiple files share the same output path` on apps with multiple style-less `+page.svelte` routes.

### Same-day addition (2026-05-17)

- [x] 🟡 `bosia-frontend-design` — new design skill forcing an aesthetic stance (direction/typography/dominant colour + sharp accent/one memorable detail) before any UI emit, avoiding the AI-default look.
- [x] 🟡 `bosia-frontend-design` wired into `bosia-brief-intake` as step 4, so every BRIEF.md ends with a populated `## Aesthetic` section. Quick-start opener bumped 5 → 6 questions.
- [x] 🟡 Stance consumption wired downstream — `bosia-design-review` gains a P1 check that each emit honors § Aesthetic without re-picking. Six page scaffolds (landing, saas-landing, blog, pricing, mobile-screen.
- [x] 🟡 `bosia-brief-intake` ships two reference files: `references/quick-start-script.md` (6-question opener with palette → direction inference) and `references/example-brief.md` (Dombaku-style filled BRIEF.md). Frontmatter `targets.files` updated.

---

## v0.5.3 — API prerender ✅ (shipped 2026-05-16)

> Same prerender ergonomics for `+server.ts` routes as pages already had. Drop the docs-only static-API post-build pipeline.

- [x] 🟠 Framework: `+server.ts` honors `export const prerender = true` — `detectPrerenderRoutes` scans `manifest.apis`, dynamic routes call `entries()`, `prerenderApiOutPath()` writes one `.json` per route. Fetched body written verbatim.
- [x] 🟡 Dev runtime alias: API routes with `prerender = true` are also served at `<path>.json`, matching the URL static hosts will serve in prod. Non-prerender routes get no alias (`packages/bosia/src/core/server.ts`)
- [x] 🟡 Unit tests for `prerenderApiOutPath` and `substituteParams` rest-segment cases (`packages/bosia/test/prerender-api.test.ts`)
- [x] 🟡 Docs API routes migrated: `/api/skills`, `/api/skills/[name]`, `/api/components`, `/api/components/[...path]`, `/api/blocks`, `/api/blocks/[...path]` all opt into framework prerender.
- [x] 🟡 Removed `generateSkillsApi()` + `generateRegistryApi()` from `docs/scripts/post-build.ts` — post-build returns to sitemap-only

### Hotfix (same-day, 2026-05-16)

- [x] 🔴 Fix dev `.json` alias resolution: catch-all sibling routes were absorbing the `.json` suffix into their rest-segment param, causing 4xx in dev.
- [x] 🔴 Fix `/api/skills/<name>` JSON shape: was emitting raw `SKILL.md` markdown into a `.json` file. Handler now returns `Response.json({ name, content })` with frontmatter stripped via `gray-matter`, matching the v0.5.2 post-build shape
- [x] 🟡 New `packages/bosia/test/apiResolver.test.ts` — 10 cases covering flat-route alias, catch-all precedence, `[name]` precedence, non-prerender fall-through, and `module()` throw → fallback
- [x] 🟡 New `docs/test/api-prerender.test.ts` — post-build sanity over `dist/static/api/**/*.json`: every artifact parses; list endpoints expose their array.
- [x] 🟡 Renamed registry detail field `mdFile` → `content` in `/api/components/<path>` and `/api/blocks/<path>` responses to match `/api/skills/<name>` shape (`docs/src/lib/registry/list.ts`)
- [x] 🔴 Fix production-build docs crash on every page with code blocks (`createHighlighter` not a function). Lazy `await import("shiki")` made Bun's splitter call into the parent before its exports initialized.
- [x] 🟡 Normalize `path` on `/api/skills`, `/api/components`, `/api/blocks` index + detail responses to the full detail URL (e.g. `/api/components/ui/button.json`)

---

## v0.5.2 — CLI ergonomics & registry API ✅ (shipped 2026-05-15)

> Multi-component install and AI-discovery parity with skills.

- [x] 🟠 `bosia add` accepts multiple component names in one call; new `-y`/`--yes` flag auto-confirms overwrite prompt for CI use
- [x] 🟡 Static `/api/components.json` + `/api/components/{path}.json` and `/api/blocks.json` + `/api/blocks/{path}.json` emitted by `docs/scripts/post-build.ts` (superseded in v0.5.3 by the framework prerender)

---

## v0.4.4 — Build CSS collision hotfix ✅ (shipped 2026-05-09)

> Republish of 0.4.3 with a missed regression in the Svelte build path fixed.

- [x] 🔴 Restore `app.css` → JS no-op resolve in `core/plugin.ts`. Without it, every dynamic-imported route chunk reaching `app.css` produces an identical CSS sidecar → Bun fails with "Multiple files share the same output path"
- [x] 🟡 Regression test `packages/bosia/test/svelte-build.test.ts` — 12 dummy routes + shared app.css; fails without the no-op, passes with it

---

## v0.4.3 — Request pipeline perf ✅ (shipped 2026-05-09)

> Cut redundant work from the per-request hot path.

### Done

- [x] 🟠 Resolve page route once per request and thread through `renderSSRStream` / `renderPageWithFormData` / form-action handler
- [x] 🟡 Cache `getPublicDynamicEnv()` at module scope
- [x] 🟠 Linear `parent()` data merging in layout loaders — O(d²) → O(d) with per-layer snapshot
- [x] 🟡 Drop redundant `onBeforeHandle` apiRoutes scan; non-GET catch-alls already cover every method
- [x] 🟠 Inline Svelte compile, drop `bun-plugin-svelte` — own `.svelte`/`.svelte.[tj]s` `onLoad` with `css: "injected"` (browser) / `css: "external"` (server)

### Open

- [ ] 🟠 **Truly progressive SSR streaming** — `renderSSRStream` is blocking before first byte (load → render → enqueue). The real blocker is a parallel-aware loader runner that flushes chunks as each loader resolves.
- [x] 🟡 **Reduce `safeJsonStringify` cost on large loader payloads** — done in v0.5.0 by moving page/layout/form data to `<script type="application/json">` islands read via `JSON.parse(...textContent)`

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
