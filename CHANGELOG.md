# Changelog

All notable changes to Bosia are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.6] - 2026-05-13

### Added

- New optional `CSP_DIRECTIVES` env var turns on a strict, nonce-based Content Security Policy. Set it (example: `CSP_DIRECTIVES="default-src 'self'; script-src 'self' 'nonce-{nonce}'"`) and Bosia adds a matching `Content-Security-Policy` response header on every response — substituting `{nonce}` with a fresh per-request value — and stamps that nonce onto every `<script>` tag it emits so its own hydration scripts keep running. With `CSP_DIRECTIVES` unset (the default), neither the header nor the nonce attribute is emitted: no dead bytes, no surprise blocking of your inline scripts.
- New `event.locals.nonce` request-event field exposes the per-request nonce to user code (load functions, hooks). Forward it to a page via `load()` and use it as `<script nonce={data.nonce}>…</script>` on your own inline scripts so they stay valid under CSP.

### Changed

- The per-request cryptographic nonce is now only generated when CSP is opted in (via `CSP_DIRECTIVES` env). With CSP disabled (the default) the call to `crypto.getRandomValues()` is skipped, saving a tiny amount of work on every request.

### Fixed

- Server-side redirects now reject `javascript:`, `data:`, and `vbscript:` URLs even when the developer passes `{ allowExternal: true }` — those schemes are never legitimate redirect targets and could have been abused to inject script execution into a redirect chain.
- CSRF origin checks no longer trust `X-Forwarded-Host` / `X-Forwarded-Proto` by default. They are only honoured when the operator sets `TRUST_PROXY=true`, which prevents a directly-exposed server from being tricked into accepting an attacker-supplied origin via spoofed forwarded headers.
- Responses now always include `Vary: Origin` whenever CORS is configured, even when the request's origin isn't allowed. Stops CDNs and browser caches from accidentally serving a response with `Access-Control-Allow-Origin` for one site to a different site.
- Prerender `entries()` now fails the build when a dynamic-segment value contains `..` or `\`, or when a non-catch-all segment value contains `/`. Prevents a typo or malicious data source from writing prerendered HTML outside the intended output directory.
- CORS preflight (`OPTIONS`) now validates the requested method and headers against the configured allow-list. A request asking for a disallowed method or header is answered with a 403 (still carrying `Access-Control-Allow-Origin` and `Vary: Origin`) instead of being waved through with a permissive 204, so misconfigured clients fail loudly and the browser surfaces a clear "not allowed by CORS policy" message in devtools.
- Dev mode no longer 403s same-origin `POST` / form submissions when the inner app is gated behind the dev proxy. The proxy now forwards `X-Forwarded-Host` / `X-Forwarded-Proto` and sets `TRUST_PROXY=true` on the spawned app process automatically, so the CSRF origin check reconstructs the public `http://localhost:<DEV_PORT>` URL the browser is actually using.

---

## [0.4.5] - 2026-05-11

### Added

- Two new registry kinds: **Blocks** and **Themes**. Blocks are ready-made UI sections (cards, hero, pricing) with hardcoded copy and tuned typography you can install with a single command. Themes are token packs (colors, fonts, radii) that restyle every block and primitive at once.
- New CLI commands. `bun x bosia@latest add block cards/feature-editorial` drops a polished feature card into `src/lib/blocks/`, pulling in any primitive components it needs. `bun x bosia@latest add theme editorial` installs a warm cream + serif theme and wires the imports into `app.css`.
- First block ships: `cards/feature-editorial` — magazine-style card with a serif title, eyebrow numeral, and circular CTA. Designed to look great on the new editorial theme, but works on any theme.
- New `themes/neutral` and `themes/editorial` themes. Switching is one command — `app.css` is patched idempotently and Google Fonts are auto-imported when a theme needs them.
- Docs site has new **Blocks** and **Themes** sections with previews and install instructions.

---

## [0.4.4] - 2026-05-09

### Fixed

- Production builds for apps with many routes that share a common `app.css` (via the root layout) no longer fail with `Multiple files share the same output path` errors. The bundler now treats `app.css` as a JS no-op so Bun does not emit duplicate CSS chunks per route. Tailwind CLI still produces the real stylesheet at `public/bosia-tw.css` as before.

---

## [0.4.3] - 2026-05-09

### Changed

- Bosia now resolves each page route only once per request, instead of looking it up three or four times. Page loads, form submissions, and trailing-slash redirects are all slightly faster.
- Layout data merging is now linear in the number of layouts. Apps with deeply nested layouts will see a small speed-up on every page load.
- The list of public environment variables (those starting with `PUBLIC_`) is now built once when the server starts, instead of being recomputed on every response.

### Fixed

- Production builds with many Svelte components no longer fail with duplicate CSS output errors. Bosia now compiles Svelte files itself with inline style injection, avoiding the upstream bug.

### Removed

- An internal pre-handler that double-checked API routes on every request has been removed. It was redundant — every HTTP method already routes through the same handler.
- `bun-plugin-svelte` is no longer a dependency.

---

## [0.4.2] - 2026-05-07

### Fixed

- Newly created projects (`bun x bosia@latest create`) now ship with a working `.gitignore`. npm strips files named `.gitignore` from published packages, so the template was arriving without one — meaning `node_modules`, `dist`, `.bosia`, and your local `.env` were not ignored out of the box. The template now ships the file as `_gitignore` and the create command restores the proper dotfile name when scaffolding.
- `bun run check` now passes on a freshly created project. The generated Tailwind output (`public/bosia-tw.css`) was being picked up by Prettier and reported as a formatting issue. It is now ignored by both Prettier and Git as a build artifact.

### Added

- New `bun run check:templates` script (in the `bosia` package). It packs the package the same way `bun publish` would, extracts the tarball, and verifies every template still has the files we expect — no install, no scaffold. Prevents the kind of "template arrives broken" regression we just fixed from sneaking back in.

---

## [0.4.1] - 2026-05-06

### Added

- New first-party plugin `bosia/plugins/inspector`. While running `bun run dev`, hold the Option (Alt) key and any element on the page lights up showing where in your code it lives. Click an element and the right `.svelte` file opens in your editor at the exact line — no more hunting through folders. Optionally, point it at an AI endpoint and the click opens a small comment box so you can describe a fix and hand the location plus your note off to your coding agent. Production builds are completely untouched: no attributes baked in, no overlay script, no extra endpoint.

---

## [0.4.0] - 2026-05-05

### Added

- Plugin system. Drop a `bosia.config.ts` at the project root and pass plugins to extend Bosia at the HTTP layer (Elysia before/after), build pipeline (preBuild, postScan, bunPlugins, postBuild), and SSR render pipeline (head and bodyEnd fragments). Empty config or no config means zero overhead.
- New first-party plugin `bosia/plugins/server-timing`. Adds a `Server-Timing` header to every response so you can see how long the framework spent on each request in browser DevTools.
- `defineConfig` helper exported from `bosia` for type-safe `bosia.config.ts` files. New types: `BosiaPlugin`, `BosiaConfig`, `BuildContext`, `DevContext`, `RenderContext`.
- Demo app now ships an example `bosia.config.ts` wired with the server-timing plugin.
- New docs page: Plugins guide.

### Changed

- `server-timing` plugin's default metric name changed from `total` to `handler`. The previous label was misleading: streaming SSR responses flush headers before the body finishes, so the value never represented full end-to-end time — only the handler chain. The new name reflects what's actually measured. Pass `serverTiming({ metric: "..." })` to override.

### Fixed

- `bosia.config.ts` loader now writes its compiled output inside the project's `.bosia/` directory instead of `/tmp`, so bare-specifier imports like `bosia/plugins/server-timing` resolve correctly via the project's `node_modules`.

---

## [0.3.4] - 2026-05-04

### Added

- You can now drop a `+error.svelte` file into any route folder, not just the project root. When something goes wrong in that section of the site, the matching error page shows up wrapped in the same layouts as the page above it — so your header, sidebar, and other navigation stay visible while the broken bit is replaced. If a folder has no `+error.svelte`, the next one up the tree is used; if none exist, the root error page is used as before.
- Errors hit during in-app navigation no longer trigger a full page reload when a nearby `+error.svelte` can handle them — the surrounding layout stays mounted and only the broken page is swapped out.

### Fixed

- Pressing Ctrl+C to stop `bun run dev` no longer prints a misleading `error: script "dev" exited with code 130` line. The dev server now shuts down cleanly and exits with status 0, the same as `bun run start`.

---

## [0.3.3] - 2026-05-03

### Added

- Added a Testing guide in the docs that shows how to write and run tests in your app with `bun test`, including file naming, env variables, and what to test today.
- Error pages can now import `ErrorProps` and `PageError` from `./$types` instead of declaring the prop shape by hand — same pattern as `PageProps` for regular pages.

### Changed

- The build now stops with a clear error if your `tsconfig.json` is malformed, pointing to the file and the parse problem — instead of continuing with broken `$lib` / `$registry` / `./$types` imports.

### Fixed

- Fixed a crash that could happen after submitting a form without JavaScript when the page tried to redirect or show an error — the browser now follows the redirect or sees the error page as expected.

---

## [0.3.2] - 2026-05-02

### Fixed

- Pressing Ctrl+C once now properly stops the server — you no longer need to press it twice to quit `bun run dev` or `bun run start`.
- The server now shows a proper error page if something goes wrong while loading a page, instead of displaying broken partial content.
- The build process now cleans itself up properly and avoids port conflicts when running multiple builds at the same time.
- Rapid file saves during development no longer cause the dev server to rebuild the same changes multiple times unnecessarily.

---

## [0.3.1] - 2026-05-01

### Added

- Pages that look the same for all visitors now share a single server request instead of making duplicate calls — faster responses with less server load. Pages with personal content (like dashboards or account pages) are kept separate per user by placing them in a `(private)` folder.

### Fixed

- 🔴 Fixed a security issue where one user could accidentally receive another user's data when multiple users visited the same page at the same time. Use `(private)` folders for any page that shows personal content.

### Removed

- Removed the previous approach of identifying users by their cookies for request sharing — replaced by the simpler and safer `(private)` folder system above.

### Fixed

- Fixed a crash when creating a new project — the app name now loads correctly when the server renders pages.
- Removing a variable from your `.env` file now takes effect immediately in the dev server — no manual restart needed after deleting a variable.

---

## [0.3.0] - 2026-04-30

### Added

- Added a `bosia test` command that runs your tests with the correct environment and settings automatically configured.
- Added `test`, `test:watch`, and `test:coverage` scripts so you can run tests from anywhere in the project.
- Added 90 automated tests covering the framework's internal utilities to help catch bugs early.
- Added 77 more automated tests for the build and code generation tools (167 tests total).

### Fixed

- Fixed a bug where the `trailingSlash` setting in your route files was being silently ignored.

### Changed

- Route parameters like `[slug]` now have proper TypeScript types — accessing a parameter that doesn't exist will show a type error instead of crashing at runtime.

### Added

- Added automatic code formatting with Prettier across the whole project and all new project templates.
- Added a `trailingSlash` option to control whether URLs end with a `/` — the server automatically redirects visitors to the correct URL format.

---

## [0.2.3] - 2026-04-29

### Added

- The `bosia feat` install command now handles shared files more carefully — it can add to existing files instead of replacing them, so installing a new feature no longer risks overwriting your customizations.
- Forms now submit in the background without a full page reload — the page updates smoothly while still working normally if JavaScript is disabled.
- Added an `ssr = false` option for pages that don't need server rendering — useful for pages with browser-only features like charts or auth-protected dashboards.

### Security

- The page language tag is now validated to prevent a security issue where an attacker could inject malicious code through the `lang` attribute.
- The `CORS_MAX_AGE` setting is now validated at startup — invalid values cause a clear error instead of silently breaking cross-origin request caching.

### Changed

- Compression now only kicks in for responses larger than 2KB instead of 1KB — small responses are faster without it.

### Fixed

- Fixed compression for content with non-English characters (Chinese, Japanese, emoji, etc.) — they were sometimes sent uncompressed when they shouldn't be.
- Fixed `.env` file parsing to correctly ignore inline comments — `KEY=value # note` now stores just `value` as expected.

---

## [0.2.2] - 2026-04-28

### Security

- Fixed a security issue where your users' session cookies were being sent to third-party APIs during server-side data loading. Cookies are now only forwarded to your own server by default — use `INTERNAL_HOSTS` to allowlist trusted internal services. **Behavior change:** existing `load()` calls to external APIs will need to pass credentials explicitly.

### Changed

- The link prefetch cache is now limited to 50 entries to prevent memory from growing without bound on pages with many links.
- Prefetched page data now expires after 30 seconds so visitors always see fresh content after being idle for a while.

### Fixed

- Fixed a bug where Cmd/Ctrl+click (open in new tab) and middle-click were being intercepted by the router instead of opening a new tab or window.

---

## [0.2.1] - 2026-04-26

### Changed

- Route matching is now faster — URL patterns are compiled once at startup instead of being re-parsed on every request.

---

## [0.2.0] - 2026-04-25

### Added

- Multiple simultaneous visitors requesting the same page data now share a single server call instead of each triggering a separate one — reduces server load during traffic spikes.

### Changed

- Builds are now 500–1000ms faster by running the client and server bundles at the same time.
- Tailwind CSS now compiles alongside the rest of the build, saving another 500–800ms.
- Fixed a potential crash when many middleware handlers are used — they now run in a loop instead of deeply nested calls.

---

## [0.1.26] - 2026-04-24

### Added

- Added a `Direction` component for setting text direction (left-to-right or right-to-left) for the content inside it.
- Added a `Kbd` component for displaying keyboard shortcuts with a keycap visual style.
- Added a `ScrollArea` component — a scrollable container with a custom styled scrollbar.
- Added a `Resizable` component — panels that users can drag to resize.
- Added a `Menubar` component — a horizontal menu bar with dropdown menus, similar to the File/Edit/View bar in desktop apps.
- Added a `ContextMenu` component — a right-click menu that appears at the cursor position.

### Changed

- The `Kbd` component can now trigger actual keyboard shortcuts when the displayed keys are pressed.

---

## [0.1.25] - 2026-04-23

### Added

- Added an `AspectRatio` component for displaying content (like images or videos) within a fixed ratio, such as 16:9.
- Added a `RangeCalendar` component for selecting a start and end date range.

### Fixed

- Fixed component previews in the docs — they now appear in the right place next to the `## Preview` heading instead of floating above the content.
- Restored missing previews for 5 components (sidebar, navbar, chart, data-table, icon).
- Fixed floating UI elements (popovers, dropdowns, date pickers, etc.) being cut off inside component previews.

---

## [0.1.24] - 2026-04-22

### Added

- The `Popover` component can now open on hover in addition to click — useful for tooltips and preview cards.
- Added a configurable delay before a hover-triggered popover closes, so it doesn't disappear the moment you move your mouse.
- Popovers can now be opened and closed programmatically from other parts of the page.
- Sidebar menu items in collapsed mode can now open a sub-menu on hover instead of requiring a click.

---

## [0.1.23] - 2026-04-21

### Added

- Added 12 pre-styled text components (`TypographyH1`–`TypographyH4`, `TypographyP`, `TypographyBlockquote`, and more) for consistent heading, paragraph, and text styling.
- Added 6 new icons: `terminal`, `book`, `package`, `hash`, `map`, and `circle`.
- Added a standalone `SidebarTrigger` button for collapsing and expanding the sidebar — place it anywhere in your layout.
- Components inside the sidebar can now read the collapsed state and toggle the sidebar programmatically.
- When the sidebar is collapsed to icon-only mode, clicking a parent menu item now shows a popover with its child links.

### Changed

- Updated the sidebar demo to a more polished design with a company header, expandable menus, and a user avatar footer.

### Fixed

- Fixed the sidebar so text labels, group headers, and chevrons are all properly hidden when collapsed to icon-only mode.
- Moved the sidebar toggle button outside the sidebar so it no longer overlaps the icons.
- Fixed text overflowing outside the sidebar boundary during the collapse and expand animation.
- Fixed icon alignment in collapsed sidebar — icons are now properly centered.
- Fixed orphaned sub-menu lists appearing when the sidebar is collapsed.

## [0.1.22] - 2026-04-20

### Added

- Added an `Empty` component for displaying a placeholder when there is no content to show — useful for empty lists, search results, and similar states.
- Added a `Carousel` component for sliding through a series of items, with optional autoplay, keyboard navigation, and previous/next buttons.

## [0.1.21] - 2026-04-19

### Added

- Added a `Form` component that manages validation state — connect it to any validation library (Zod, Valibot, etc.) and field errors appear automatically without extra wiring.

## [0.1.20] - 2026-04-18

### Added

- Added an `Item` component — a flexible layout block for displaying content with an icon, title, description, and action buttons.
- Added a `Collapsible` component for showing and hiding content with a toggle button.
- Added a `DatePicker` component combining a calendar popup with a text input for selecting dates.

## [0.1.19] - 2026-04-17

### Added

- Added styled `Table` components (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, and more) for displaying data in a table layout.
- Added a full `Calendar` component with month/year navigation, keyboard support, and configurable date constraints.

### Changed

- Updated the `DataTable` component to use the new `Table` components internally — no change to its API or behavior.

### Removed

- Removed the `clsx` package as an external dependency — the same functionality is now built into the `cn()` utility.

## [0.1.18] - 2026-04-16

### Added

- Added a `NativeSelect` component — a styled version of the browser's built-in dropdown that works great on mobile and in forms.
- Added an `InputOTP` component for one-time password entry — supports copy-paste, SMS autofill, and displays individual character slots.

## [0.1.17] - 2026-04-14

### Added

- Added a `ButtonGroup` component for joining multiple buttons into a single connected row or column.

## [0.1.16] - 2026-04-12

### Added

- Added an `InputGroup` component for building inputs with attached prefix/suffix text, icons, or buttons (for example, a URL field with an `https://` prefix).
- Added a `Combobox` component — a searchable dropdown that filters options as you type.
- Added a `Command` component — a filterable command palette for searching and selecting items using the keyboard.

## [0.1.15] - 2026-04-11

### Added

- Added an `Accordion` component for showing and hiding sections of content — supports single or multiple sections open at once.
- Added a `Pagination` component for navigating between pages of content.
- Added a `Breadcrumb` component for showing where the current page sits in the site's hierarchy.
- Added a `NavigationMenu` component — a horizontal nav bar with hover-triggered dropdown panels.

## [0.1.14] - 2026-04-10

### Added

- Added a `Tabs` component for switching between different views using a tab bar.
- Added a `HoverCard` component — a floating panel that appears when you hover over a link.
- Added a `Popover` component — a floating panel that opens when you click a trigger.
- Added a `Progress` component — a visual bar showing how much of a task is complete.
- Added an `Alert` component for displaying important messages, with a `destructive` variant for errors.
- Added an `AlertDialog` component — a modal that requires the user to confirm or cancel before continuing.
- Added a `Sonner` toast notification system — shows brief success, error, info, or warning messages that disappear automatically after a few seconds.
- Added a `Tooltip` component — a small label that appears when you hover over an element.
- Added a `Spinner` component — an animated loading indicator.
- Added a `Skeleton` component — an animated placeholder shown while content is loading.

## [0.1.13] - 2026-04-09

### Added

- Added a `Toggle` component — a button that stays pressed until clicked again, useful for toolbar actions like bold or italic.
- Added a `Textarea` component — a multi-line text input that grows automatically as you type.
- Added a `Switch` component — an on/off toggle for settings and preferences.
- Added a `Field` component that automatically wires up labels, helper text, and error messages to form inputs for better accessibility.
- Added a `ToggleGroup` component — a set of toggles where one or many can be active at once.
- Added a `Slider` component for selecting a number (or range) by dragging a handle.

## [0.1.12] - 2026-04-08

### Added

- Added a `Select` component — a styled dropdown for picking one option from a list.
- Added a `RadioGroup` component — a set of radio buttons for selecting one option from a group.
- Added a `Label` component — an accessible label for form inputs.
- Added a `Dialog` component — a modal window that overlays the page and keeps focus trapped until dismissed.
- Added a `Checkbox` component — a styled checkbox that supports checked, unchecked, and indeterminate states.

## [0.1.11] - 2026-04-07

### Changed

- The `--template drizzle` option is now `--template todo` — the name now reflects what the template actually builds (a todo app).

## [0.1.10] - 2026-04-06

### Changed

- The todo registry components are now organized into subfolders, matching the same structure as UI components.
- `bun x bosia@latest add todo` installs all todo sub-components at once; use `bun x bosia@latest add todo/todo-form` to install individual pieces.
- Moved component documentation into dedicated subfolders and added todo component docs.
- The docs sidebar now shows UI and Todo components as separate sub-groups under Components.

## [0.1.9] - 2026-04-05

### Added

- The server now automatically sets the right cache headers — pages that read user cookies are marked private, while public pages can be cached by CDNs.
- Added a dedicated documentation page for the `metadata()` function, covering Open Graph tags, social sharing, and more.
- Added SEO improvements — each page can now have its own language tag and canonical/hreflang link tags in the HTML head.
- Added Open Graph, Twitter card, and canonical URL tags to all documentation pages.
- Added a `robots.txt` file to the docs site.
- Added automatic `sitemap.xml` generation at build time, with language alternates for English and Indonesian pages.

## [0.1.8] - 2026-04-04

### Changed

- The `--template drizzle` scaffold now installs features from the registry instead of duplicating files — keeping templates and the registry in sync automatically.
- Feature and component install functions now support a non-interactive mode for use in scripts and automated tooling.
- The Drizzle database connection now shows a clear warning instead of crashing when `DATABASE_URL` is not set.

## [0.1.7] - 2026-04-04

### Added

- Cookies are now created with secure defaults (`httpOnly`, `secure`, `SameSite: Lax`) automatically — you no longer need to specify these on every `cookies.set()` call.

### Changed

- The todo feature code is now split into cleaner layers — data access, business logic, and route handlers each live in their own file.

## [0.1.6] - 2026-04-03

### Fixed

- Fixed cookie name handling to follow the HTTP standard — cookies with special characters now work correctly with other servers and libraries.
- Invalid variable names in `.env` files (like `MY-VAR` or `123BAD`) now show a clear error with the filename and line number instead of silently producing broken code.
- Double-quoted values in `.env` files now support escape sequences like `\n` (newline), `\t` (tab), and `\\`.

## [0.1.5] - 2026-04-01

### Added

- The server now waits for active requests to finish before stopping — visitors in the middle of a request get up to 10 seconds to complete, and new visitors during shutdown receive a friendly "service unavailable" response.

### Fixed

- Rapid file saves no longer trigger multiple overlapping builds — only one build runs at a time, with another queued if files change during the current build.

## [0.1.4] - 2026-03-30

### Added

- The `redirect()` function now blocks redirects to external websites by default, protecting against open redirect attacks. Pass `{ allowExternal: true }` to allow external redirects intentionally.

### Fixed

- Navigating to a new page now scrolls back to the top, as expected.
- Using the browser's back and forward buttons no longer forces a scroll to the top.
- Fixed a bug where stylesheets and scripts were being duplicated in the page `<head>` after server-side rendering.

## [0.1.3] - 2026-03-29

### Added

- Fixed `bosia add` so top-level components like `todo` install to the right path instead of being incorrectly prefixed with `ui/`.
- `bosia feat` now automatically installs required dependencies — for example, `bosia feat todo` also installs `drizzle` if it isn't already present.
- `bosia feat` now asks before replacing files you've already customized.
- Added a `--template drizzle` starter with PostgreSQL, Drizzle ORM, a full CRUD todo demo, and seed data.
- Added `bosia feat drizzle` to scaffold a database connection, schema, migrations, and seed runner.
- Added `bosia feat todo` to scaffold todo routes, form actions, API, components, and seed data (requires the `drizzle` feature).
- Added `bun x bosia@latest add todo` to install the todo UI components.
- The component registry now also supports features — `registry/index.json` has a new `features` array.

## [0.1.2] - 2026-03-28

### Added

- Rebuilt the documentation site using Bosia itself — replacing the previous Astro + Starlight setup.
- The docs site now parses Markdown with syntax highlighting powered by Shiki.
- Documentation content lives in `docs/content/docs/` as Markdown files and is cached for fast loads.
- The docs site now has a sidebar, navbar, dark mode toggle, and table of contents.
- The docs site now supports English and Indonesian (via the `/id/` URL prefix) with a language switcher.
- Documentation pages for UI components now show live, interactive demos.
- Added a landing page with a hero section, feature highlights, and a quick-start code block.
- Dynamic routes can now be prerendered at build time by exporting an `entries()` function that lists the URL parameters to generate.
- Added `generateStaticSite()` for exporting the site as fully static HTML files for hosting on GitHub Pages, Netlify, etc.
- Added a GitHub Actions workflow to automatically deploy the docs to GitHub Pages.

### Changed

- The internal data endpoint URL format changed from `?path=...` to a path-based URL — required for static hosting to work.
- Prerendered pages now also include data files for client-side navigation — the site works fully statically without a running server.
- Removed duplicated URL-building code by extracting a shared `dataUrl()` helper.
- Removed duplicated version lookup code by extracting a shared `getVersion()` utility.
- Removed duplicated URL localization logic in the docs sidebar by using a shared `localizeUrl()` helper.
- Documentation pages now use the Markdown frontmatter `title` for the browser tab title.
- The `bosia add` command now fetches components directly from GitHub instead of the docs site API.

### Removed

- Removed the registry API routes from the docs app — components are now served directly from GitHub.

### Fixed

- Fixed mobile rendering by adding a viewport meta tag to the root layout.
- Fixed silent errors in the syntax highlighter — errors now log the language name that caused the issue.

## [0.1.1] - 2026-03-27

### Added

- Added a component registry with 12 ready-to-use UI components: avatar, badge, button, card, chart, data-table, dropdown-menu, icon, input, navbar, separator, and sidebar.
- Added live, interactive demos on 7 component documentation pages.
- Added a `--local` flag to `bosia add` for installing components from your local registry during development.
- `bosia add` now automatically creates the `cn()` utility file if it doesn't exist yet.
- Components can now be installed to custom paths — `bosia add shop/cart` installs to `src/lib/components/shop/cart/`; names without a path go to `ui/` by default.
- `bosia add` now asks whether to replace or skip a component that already exists in your project.
- Added documentation pages for all 12 components.

## [0.1.0] - 2026-03-26

### Changed

- Renamed the framework from `bosbun` to `bosia` — all package names, CLI commands, virtual modules, and internal references updated.
- The template picker in `bosia create` now uses arrow keys to navigate instead of requiring you to type the template name.

## [0.0.8] - 2026-03-26

### Changed

- The environment variable import path changed from `bosbun:env` to `$env`, matching the SvelteKit convention.

### Added

- The dev server now automatically restarts the app if it crashes — stops retrying after 3 rapid crashes within 5 seconds to avoid a crash loop.
- Added a documentation site with 14 pages covering all major framework features.
- Added automated deployment of the docs to GitHub Pages on every push to `main`.
- Added full Indonesian (Bahasa Indonesia) translations for all 15 documentation pages.

### Removed

- Removed the unused `renderSSR` function — it was fully replaced by `renderSSRStream`.
- Removed the unused `buildHtmlShell` function and its cache from `html.ts`.
- Removed a leftover import of `buildHtmlShell` in `renderer.ts`.
- Made `STATIC_EXTS`, `DEFAULT_CSRF_CONFIG`, and `matchPattern` internal — they were never part of the public API.

### Changed

- Removed duplicate comma-separated environment variable parsing by using a shared `splitCsvEnv` helper.

### Fixed

- Fixed PUT, PATCH, and DELETE requests — they now go through the same middleware pipeline as GET and POST (CSRF, CORS, security headers, cookies, and hooks).
- Fixed a timer memory leak that could occur when requests finished before their timeout.
- Removed a duplicate static file server — all static files now go through a single consistent handler.
- Fixed a caching bug where old HTML shells were being reused after a dev server rebuild.
- Fixed client-side navigation for URLs with query strings or hash fragments — features like pagination now work without falling back to full page reloads.

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

- Renamed the framework from `bunia` to `bosbun` — all package names, CLI commands, and internal references updated.

## [0.0.5] - 2026-03-24

### Added

- Added link prefetching — hovering over a link starts loading that page in the background before you click it. Links that scroll into view also prefetch automatically. Data is cached for 5 seconds.

## [0.0.4] - 2026-03-23

### Added

- Added timeouts for data loading — `load()` automatically cancels after 5 seconds and `metadata()` after 3 seconds by default. Set `LOAD_TIMEOUT` or `METADATA_TIMEOUT` to change these values.
- Added a build timeout for static prerendering to prevent builds from hanging indefinitely on slow routes.

### Fixed

- Fixed a security issue where system environment variables starting with `PUBLIC_` were being leaked to the browser — only variables declared in `.env` files are now exposed to the client.
- Fixed error handling during streaming page rendering — errors now return the correct HTTP status code and a properly structured error page instead of broken partial HTML.
- Fixed a crash in JSON serialization when data contains circular references.
- Added protection against path traversal attacks on all static file serving.
- Fixed a crash when parsing cookies with invalid percent-encoding — falls back to the raw value.
- Fixed cookie `set()` to reject invalid `domain` and `path` values that could be used for header injection.

### Changed

- Routes are now sorted and matched more efficiently — exact routes take priority over dynamic ones, and matching is faster with early exit.

## [0.0.3] - 2026-03-21

### Added

- Added a `metadata()` function for server-side page metadata — page titles and meta tags are included in the initial HTML before the main content finishes loading, making pages SEO-friendly and fast for search crawlers.
- Added form actions (SvelteKit-style) — handle form submissions on the server using `actions` in `+page.server.ts`, with support for validation errors and named actions.

## [0.0.2] - 2026-03-20

### Added

- Added `.env` file support — environment variables are loaded automatically with prefix-based access control (`PUBLIC_*` for the browser, `STATIC_*` for build time, and unprefixed variables for server-only use).
- Added graceful shutdown — the server waits for in-progress requests to finish before exiting, with a 10-second safety net.
- Added a configurable request body size limit (default 512KB) — oversized requests are rejected with a 413 error before reaching your handlers.
- Added CSRF protection — form submissions and API mutations are validated against the Origin and Referer headers. Blocked requests return a 403 error.
- Added CORS support — configure which external origins can access your server using the `CORS_ALLOWED_ORIGINS` environment variable.
- In production, error responses now only show the error message instead of the full stack trace, to avoid leaking internal details.

### Removed

- Removed duplicate type definitions from the project template — use `import type { LoadEvent } from 'bosbun'` instead.

### Fixed

- Fixed an XSS vulnerability — special characters in server-injected JSON data are now properly escaped.
- Fixed a server-side request forgery risk on the internal data endpoint by validating the `path` parameter.

## [0.0.1] - 2026-03-19

### Added

#### Core Framework

- **SSR + Svelte 5 Runes** — Pages are rendered on the server with full support for Svelte 5's new reactive syntax (`$props`, `$state`, etc.)
- **File-based routing** — Routes are created automatically by adding files to `src/routes/` (`+page.svelte`, `+page.server.ts`, `+layout.svelte`, `+layout.server.ts`, `+server.ts`)
- **Dynamic routes** — Support for `[param]` URL segments with typed parameters
- **Catch-all routes** — Support for `[...catchall]` segments to match any URL
- **Route groups** — `(group)` folder syntax to share layouts without adding URL segments
- **API routes** — `+server.ts` files for building REST endpoints (GET, POST, etc.)
- **Error pages** — `+error.svelte` for custom error handling with HTTP status codes

#### Data Loading

- **`load()` function** — Fetch data for a page with a plain `export async function load({ params, cookies })` — no wrapper required
- **`$types` codegen** — TypeScript types for page data are generated automatically per route so you get autocomplete and type checking out of the box
    - `PageData`, `PageProps` for pages
    - `LayoutData`, `LayoutProps` for layouts
    - `import type { PageData } from './$types'` just works via `tsconfig.json` path mapping

#### Server

- **ElysiaJS server** — Runs on port 3001 in development and 3000 in production
- **Gzip compression** — Responses are compressed automatically
- **Static file caching** — Assets are served with proper cache headers
- **`/_health` endpoint** — Returns `{ status: "ok", timestamp }` for health checks
- **Cookie support** — Read and write cookies easily via the `cookies` object on `RequestEvent` and `LoadEvent`
    - `cookies.get(name)` / `cookies.set(name, value, options)` / `cookies.delete(name)`
    - `Set-Cookie` headers are applied automatically in the response

#### Client

- **Client-side hydration** — The server-rendered page is made interactive in the browser without a full reload
- **Client-side router** — Navigating between pages happens instantly without a full page reload
- **Navigation progress bar** — A visual loading bar shows during page transitions
- **HMR** — Changes in development are reflected in the browser instantly
- **CSR opt-out** — Disable client-side rendering per page with `export const csr = false`

#### Build

- **Bun build pipeline** — Fast builds powered by Bun with a Svelte plugin
- **Client bundle** — Output to `dist/client/`
- **Server bundle** — Output to `dist/server/index.js`
- **Manifest** — `dist/manifest.json` maps routes to their assets
- **Static prerendering** — Opt in to generating static HTML files at build time with `export const prerender = true`
- **Tailwind CSS v4** — Built-in Tailwind CSS support via `@tailwindcss/cli`
- **`$lib` alias** — `$lib/*` maps to `src/lib/*` for clean imports
- **`bosbun:routes` virtual module** — A route registry is generated automatically at build time

#### CLI

- **`bosbun dev`** — Start the dev server with file watching and hot reload
- **`bosbun build`** — Build for production
- **`bosbun start`** — Start the production server from `dist/server/index.js`
- **`bosbun create`** — Create a new project from the default template

#### Hooks

- **`hooks.server.ts`** — Middleware interface with a `sequence()` helper for chaining handlers
- **`RequestEvent`** — Access `request`, `params`, `url`, `cookies`, and `locals` in middleware
- **`LoadEvent`** — Access `params`, `url`, `cookies`, and `locals` in data loaders

#### Developer Experience

- **Default project template** — A starter template for `bosbun create`
- **Dockerfile** — A multi-stage Docker build for the demo app
- **TypeScript** — Full type coverage with `tsconfig.json` patched automatically on first build
- **README** — Documentation for the monorepo, framework, demo app, and template

## [0.0.0] - 2026-03-19

### Added

- Initial framework scaffolding: `matcher.ts`, `scanner.ts`, `types.ts`
- Core SSR server (`server.ts`) and client router (`App.svelte`, `router.svelte.ts`)
- Client-side hydration with HMR support (`hydrate.ts`)
- Dev server with proxy and file watcher (`dev.ts`)
- CLI entry point with `dev`, `build`, `start`, `create` commands
- Demo application (`apps/demo/`)
