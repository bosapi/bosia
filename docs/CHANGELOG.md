# Changelog

All notable changes to the Bosia docs site and component registry are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.8.31] - 2026-10-18

### Changed

- Response cache + dedup guides (EN + ID): the cache key now includes the site address.
- Response cache skill: each host caches separately; redirect aliases to one address.
- Server loaders guide (EN + ID): dedup is also split per site address.
- Response cache guide (EN + ID): step 1 spells out the full cache key.

## [0.8.30] - 2026-10-17

### Added

- WebSockets guide (EN + ID): auth, origin check, backpressure, close codes, subprotocols.
- Environment variables guide: the four new `WS_*` WebSocket settings.
- Routing skill: rule for `websocket` exports in `+server.ts`.

### Changed

- Navigation guide, navigation skill: `goto()` accepts relative URLs like `?page=2`.
- Navigation guide, skill: `goto()` rejects `javascript:` URLs; check `?next=` stays on your site.
- Security guide: `redirect()` reads URLs like a browser; broken URLs throw, `allowExternal` too.
- Security guide: a path starting with `//` is redirected to a single `/`.
- Navigation guide, skill: hover prefetch skips `rel="external"`; `file://` pages do full loads.
- Plugins guide: `onAfterHandle` does not run for a WebSocket upgrade.
- WebSockets guide: a hook error after `resolve()` closes the socket with 1011.
- Security, env guides, env skill: `TRUST_PROXY` also sets `event.url`, redirects and `Secure`.

## [0.8.29] - 2026-10-16

### Changed

- Security guide, routing skill: prerender fails when a URL matches another route ignoring case.

## [0.8.28] - 2026-10-15

### Changed

- Security guide: prerender fails when a page answers an error, a redirect or a file (any 2xx is ok).
- Security guide: prerender fails when another route serves a slug's URL.
- The Indonesian landing page `/id` is prerendered on purpose, no longer by a docs slug.
- Routing and Cloudflare skills: a prerendered page that errors or redirects fails the build.
- Docs skip a language's index page only when that language has its own landing page.
- Env vars guide and skill: `PRERENDER_TIMEOUT` is the only limit at build; the others are off.
- Env vars guide and skill: `PRERENDER_CONCURRENCY` counts requests; a page and its data are two.
- Env vars guide and skill: `PRERENDER_TIMEOUT` shows its default, 5000, in the Default column.

## [0.8.27] - 2026-10-14

### Changed

- Routing guide and skill: param names follow TypeScript variable rules.
- Routing and security guides, routing skill: `entries()` values allow only `A-Za-z0-9-_.~`.
- Security guide: `index`, `.html`/`.json` endings, device names and case-only twins fail the build.
- Security guide: dotfile values (`.env`) and two pages writing one file fail the build.
- Security guide: a static `src/routes/404` page may replace `404.html`; a slug `404` can't.
- Security guide: `entries()` values can't give framework URLs like `/_health` or `/dist/…`.
- Security guide: page `entries()` values can't end in a static-file type like `.png`.
- Security guide: `entries()` URLs can't start with `dist` or `__bosia`, in any case.

## [0.8.26] - 2026-10-13

### Changed

- Navigation guide and skill: refreshing data on the same page keeps the scroll position.
- Navigation guide and skill: `goto()` to the current page with `invalidateAll` reloads its data.
- Navigation guide: a form redirect reloads all data, even back to the same page.
- Navigation skill: a form redirect reloads all data; no manual `invalidateAll()` needed.
- Response cache skill: `invalidate()` raced by `goto()` no longer leaves stale data.
- Navigation guide: `goto()` to a page still loading waits for it to finish.
- Navigation guide: a loader redirect counts as its own `goto` navigation, even after Back.
- Navigation guide and skill: `await goto()` resumes after the scroll, so a `scrollTo()` sticks.
- Routing guide and skill: route priority is compared segment by segment; a fixed name wins first.
- Routing guide and skill: a catch-all can follow a param and must be the last part of a route.
- Routing guide and skill: brackets wrap a whole folder; `[id].json`, `[[x]]`, `[x?]`, `[x=y]` fail.
- Security guide: prerender rejects bad values; an `entries()` error or missing export fails.
- Routing guide and skill: which characters a param name may use; security guide notes `%2e%2e`.

## [0.8.25] - 2026-10-12

### Changed

- Deployment guide and Cloudflare skill: prerendering apps now get a `404.html` from the build.
- The docs build gets its 404 page from the framework instead of its own script.
- Deployment guide: the `404-page` setting is only for Cloudflare deploys without a worker.
- Deployment guide and Cloudflare skill: build fails if `404-page` is set and no 404 page is made.
- Deployment guide and Cloudflare skill: `404-page` makes a 404 page even with no prerendered page.
- Deployment guide and Cloudflare skill: Workers builds don't make a `404.html`.
- Metadata guide and SEO skill: error pages reached by a link get the status title too.

## [0.8.24] - 2026-10-11

### Changed

- Loaders guide and routing skill: dev warns about a layout guard with loaders below; use hooks.
- Metadata guide and SEO skill: a page with no title gets the default on client navigation too.
- Metadata guide and SEO skill list more title cases client navigation can't handle.

### Fixed

- Links in the blocks, themes and guide pages now open the right page instead of a 404.
- Block skills link to the right docs pages.
- The sidebar "Index" link under Pages → Blog opens the page on bosia.dev.
- A page that doesn't exist now shows a 404 instead of the home page on bosia.dev.
- Shop feature navbar drops its "Products" link, which led to a page that doesn't exist.
- Guide links between pages keep working when the address ends with a slash.
- Indonesian pages link to the Indonesian version of other pages, not the English one.
- Theme tokens skill says nineteen themes ship, not twelve.
- Two Indonesian links to cookie and caching sections now land on the right section.
- Skill links use the full bosia.dev address, so they open from a local project too.
- The docs build no longer fails if the 404 page can't be made; it only warns.

## [0.8.23] - 2026-10-09

### Changed

- Loaders guide explains that loaders run in parallel and how `parent()` waits.
- Security guide notes page loaders start alongside layouts; guard in hooks.
- Routing skill: do independent work before `await parent()`.
- SEO skill: `<svelte:head>` tags are now in the page HTML; keep share meta in `metadata()`.
- Metadata and security guides: `<svelte:head>` scripts block first paint and need the CSP nonce.
- Security guide and SEO skill: escape `<` in JSON-LD, since `<svelte:head>` now runs as page HTML.
- Metadata guide: only head tags belong in `<svelte:head>`; a `<div>` there breaks hydration.
- SEO skill: a page's `<svelte:head>` updates on navigation; only a layout's stays mounted.
- Metadata guide and SEO skill: explain the "Bosia App" and error-page fallback titles.

### Fixed

- Components reformatted with Prettier 3.9.9, so they pass `check` in new projects.
- Auth sign-in and sign-up no longer pass `secure` to cookies; Bosia sets it over HTTPS.

## [0.8.22] - 2026-10-08

### Changed

- API routes guide: a `GET` export also answers HEAD, no `export const HEAD = GET` needed.

## [0.8.21] - 2026-10-07

### Changed

- Hooks guide says static files are served before hooks, and that hooks see route params.
- Security guide: protect signed-in pages in `hooks.server.ts` with `event.route.id`, not in a layout.
- Hooks guide, auth, page-shell and shop skills use the same `route.id` hook check.
- Metadata guide example no longer checks sign-in inside `metadata()`.
- Security and metadata guides: guarding in hooks is the rule, a layout can't stop `metadata()`.

### Added

- API reference lists `route` on `RequestEvent`, `LoadEvent` and `MetadataEvent`.
- Navigation guide explains the `page` object: `page.url` and `page.route.id`.

### Fixed

- `auth` feature adds its sign-in cookie to `CACHE_KEYS`, so cached pages stay per user.

## [0.8.20] - 2026-10-04

### Added

- Deployment guide explains how static files are kept in memory, and how to limit it.
- Environment variables guide lists the two new asset cache settings.
- Deployment guide explains ETag re-checks and the two compression levels.
- Environment variables guide lists `PRERENDER_CONCURRENCY`, `CSP_DIRECTIVES` and the `BOSIA_` prefix.
- Security guide explains how a layout login check protects the pages and form actions under it.
- Data invalidation guide says layout loaders still run when the browser reuses their data.

### Changed

- Response cache guide explains how page data is cached and how `invalidate()` gets past it.
- Response cache and page shell skills describe how cached page data shows up when you test a write.

## [0.8.19] - 2026-10-03

### Added

- Deployment guide explains how Bosia compresses pages, scripts and styles.

### Changed

- Response cache and Server-Timing docs match how pages are now sent.
- Navbar, footer and storefront previews in the docs now say "Brand" instead of `__BRAND__`.

## [0.8.18] - 2026-09-28

### Added

- Inspector guide explains the runtime errors badge.

### Removed

- Skills drop the old Bun 1.3 Postgres URL warning — plain `postgres://` URLs work on Bun 1.4.

---

## [0.8.17] - 2026-09-27

### Added

- Deployment guide explains how to run your app on Cloudflare Workers.
- New AI skill for building and deploying apps on Cloudflare Workers.

### Changed

- CLI and API reference cover the Workers build option and `event.platform`.
- Cloudflare Workers docs explain the startup warm-up and that Cloudflare handles compression.
- Routing guide notes that pages with form actions are never prerendered.
- Plugins guide lists the new server app methods and how to move a plugin off Elysia.
- Docs, site and templates no longer say Bosia is built on ElysiaJS.
- Workers guide suggests prerendering pages that never change, to save CPU and requests.
- Workers guide shows the smaller bundle size now that the Svelte compiler is left out.
- Getting started now says Bosia needs Bun 1.4 or newer.

## [0.8.16] - 2026-09-27

### Changed

- Routing guide and routing skill explain why two pages at one URL now fail the build.

## [0.8.15] - 2026-09-24

### Changed

- Getting Started now says Bosia works on Windows, natively or through WSL2.

## [0.8.14] - 2026-09-05

### Changed

- Route protection guide now shows the guard that actually blocks link clicks, with an upgrade note.
- Hooks skill documents `isDataRequest` and the route-protection pattern to copy.
- SEO skill: the page address now works during server rendering, so the old warning is gone.
- SEO checklist uses the same environment variable name as the rest of the skill.

## [0.8.13] - 2026-09-02

### Changed

- Metadata docs now list every head field sent during in-app navigation.
- SEO skill notes that og and canonical tags stay correct after clicking a link.
- New guidance: set a page title in `metadata()` or `<svelte:head>`, never both.

## [0.8.12] - 2026-08-22

### Added

- Metadata docs note that `metadata()` runs on form submits too, and can redirect or error.

## [0.8.11] - 2026-08-18

### Changed

- Deployment docs describe the start-up warning when a build and its server disagree on the sub-path.
- Navigation docs and skill show the dev warning for a `goto()` missing the sub-path.

## [0.8.10] - 2026-08-17

### Added

- Guide for running an app from a sub-path like `example.com/sso`, with a ready nginx block.
- Navigation docs now show the one call that needs the sub-path written in by hand.

### Changed

- Cookie examples stop hardcoding the path, so sessions stay scoped to their own app.
- SEO docs note that sitemap and canonical URLs need the sub-path added.

## [0.8.9] - 2026-08-07

### Changed

- Env docs explain that `.env*` files declare the variable names, values come per mode.

## [0.8.8] - 2026-07-30

### Added

- Docs for `BOSIA_REUSE_PORT` and why `bosia start` refuses a busy port.
- The icon rule now shows up in the skills index, so AI agents can find it.

### Changed

- Sidebar docs show icons the current way, with a real `@lucide/svelte` import.

### Fixed

- Guides and AI skills no longer ask to install the retired icon component.
- Registry counts in the README and on the homepage now match what ships.

### Removed

- The old `<Icon>` migration note — the wrapper has been gone since June.

## [0.8.7] - 2026-07-23

### Added

- Security + env-var guides: how to exempt webhook paths from CSRF with `CSRF_EXEMPT_PATHS`.

## [0.8.6] - 2026-07-17

### Added

- Mobile bottom-nav (dock) blocks: edge, floating, pill and a center-FAB tab bar.
- Contact and team section blocks: split/simple forms, member grid and founder spotlight.
- Company pages: ready-made About and Contact pages built from blocks.
- Contact form backend: submissions are checked and saved to your database automatically.
- Blog blocks and pages: post list, post header, article body and related-posts sections.
- Blog backend: posts live in your database, with three sample posts to start from.
- Search the docs with ⌘K — find any page or section by its heading, in English or Indonesian.
- Gallery blocks: an image grid that opens photos full-size, and a Pinterest-style masonry layout.
- Process blocks: a numbered how-it-works row and a company-story timeline.
- Error pages: ready-made 404, 500 and under-maintenance screens, each a single file.
- Newsletter blocks and backend: signup sections that save subscribers to your database safely.
- Cookie consent banner: visitors choose once and the choice is remembered on their device.
- SEO routes: sitemap, robots and RSS feed served from one small settings file.

### Fixed

- Indonesian docs: add the 12 missing block/page/component translations (no more broken `id` links).
- Block and page overviews now list every category — footers, sections, landing and company pages.

## [0.8.5] - 2026-07-10

### Added

- Server loaders guide now covers `setHeaders` for custom response headers, plus the `depends` row.

## [0.8.4] - 2026-07-05

### Added

- Navigation guide and skill now cover built-in scroll restore when pressing Back.

## [0.8.3] - 2026-07-04

### Changed

- Cache guide now warns that custom auth _headers_ aren't auto-detected — add them to CACHE_KEYS.

### Fixed

- Login and register now send you back to the page you came from instead of always the dashboard.

## [0.8.2] - 2026-07-03

### Added

- Twelve new footer blocks: six standard layouts and six styled themes, all theme-aware.
- Sixteen new marketing section blocks: pricing, testimonials, FAQ, CTA, features, stats, logos.
- Two composed landing pages: a full SaaS landing and a lean simple landing.
- New footers and sections skills; landing, SaaS-landing and pricing skills now install blocks.

### Changed

- Cache guide now warns loudly: register your custom session cookie or personalised pages leak.
- Dedup guide rewritten: `(private)` opt-out is gone; CACHE_KEYS now keeps users apart everywhere.
- Cache guide now explains that simultaneous misses build a page once instead of many times.

## [0.8.1] - 2026-07-02

### Added

- New Mode Switcher component: a button that cycles the light, dark, and system themes.
- New Reviews block: star breakdown, review list, and a write-a-review form for product pages.
- New Cart page: edit quantities, remove items, apply a promo code, and see the order total.
- New Wishlist page: products you've hearted, with a one-tap move to your bag.
- New Empty State block: a friendly message with a button for empty carts, wishlists and searches.
- New Search overlay: type to find products instantly, with keyboard navigation and popular picks.
- New Search page: results you can sort, and a friendly no-results state with a clear-search button.
- New Account page: your orders with live tracking, saved addresses, and profile settings.
- Five account blocks: sidebar nav, order history, order tracking detail, address book, settings.
- New Quick View: peek at a product and add it to your bag without leaving the grid.
- New Mega Menu block: a configurable full-width menu with a featured product spotlight.

### Fixed

- Chart tooltips no longer leave ghost boxes behind when moving between points.
- Theme choice now sticks after a page refresh instead of resetting to system.

### Changed

- The product page now shows customer reviews below the product details.
- The order summary button label can now be changed (the cart page says "Checkout").
- Navbar & storefront blocks now show a clear `__BRAND__` placeholder to rename, not a fake name.
- Landing page redesigned with a live code preview, component showcase, and cleaner look.
- Overview pages now list every component, block, and theme we've added, not just a handful.
- READMEs now advertise the UI registry: 60 components, 100+ blocks, 10 pages, 19 themes.

## [0.8.0] - 2026-06-30

### Added

- Docs and routing/navigation skills now cover `+loading.svelte` skeletons shown during navigation.

### Fixed

- Registry components now pass type, accessibility, and formatting checks with zero warnings.

## [0.7.9] - 2026-06-22

### Added

- Docs now spell out that layout data is not auto-merged into a page's `data` — thread it with `parent()`.

## [0.7.8] - 2026-06-21

### Added

- Docs and shop-template skill now cover the new `store` template (Postgres + MinIO/S3).
- Deployment guide: a "Sandboxed / Multi-Tenant Hosting" note listing the native build-tool addons (`@tailwindcss/oxide`, `lightningcss`, `@parcel/watcher`) hosts must allowlist (EN + ID).

### Changed

- `file-upload` S3 driver now serves files through the app's `/uploads` route (same as local) instead of returning a direct bucket URL — keeps the per-user ownership check and works with a private/loopback `S3_ENDPOINT`.

## [0.7.7] - 2026-06-20

### Added

- New `/llms.txt` lists all skills, blocks, components and themes so AI agents can discover them.

### Fixed

- SEO skill rewritten: per-page tags now come from `metadata()` so link previews actually show up.

---

## [0.7.6] - 2026-06-19

### Changed

- CRUD skill now tells AI to refresh the cache after saving, so lists never show stale data.

---

## [0.7.5] - 2026-06-17

### Added

- Indonesian translations for the File Upload, Inspector, Navigation, Plugins, and Server Metadata guides.
- Indonesian translations for all 62 component pages (overview + every UI component).
- Indonesian translations for all 37 block pages (cards, files, heros, navbars, storefront).
- Indonesian translations for all 21 theme pages (overview, creating themes, and every theme).
- Indonesian translations for all 11 page templates (auth and storefront), completing full parity.

### Fixed

- Pages without an Indonesian translation no longer point search engines to a missing page.
- Indonesian Changelog and Roadmap pages now show the English content instead of being empty.

---

## [0.7.4] - 2026-06-16

### Added

- This changelog now tracks docs site and component registry changes, separate from the framework.
- New navbar block family: 18 ready-made navigation bars across standard, themed and app layouts.
- New transparent overlay navbar that floats over a hero image, for full-bleed photo heroes.

### Fixed

- Hero blocks no longer include their own navbar, so it won't clash with the layout navbar.
- Hide the unusable menu button on the homepage.
- Sidebar sections now collapse, opening to your current page.
