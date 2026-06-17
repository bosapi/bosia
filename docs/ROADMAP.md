# Bosia Docs — Roadmap

> Track what's done, what's next, and where we're headed for the **docs site +
> component registry** (`docs/`, `registry/`).
> Current version: **0.7.5**

> Routing: docs + registry work lives here and in `docs/CHANGELOG.md`.
> Framework (`packages/bosia`) work stays in [`../ROADMAP.md`](../ROADMAP.md).

> Severity: 🔴 Critical · 🟠 Major · 🟡 Minor · ⚪ Trivial

---

## In progress — Complete the Indonesian (`id/`) translation

> The docs ship a partial Bahasa Indonesia translation under
> `content/docs/id/` (20 pages: most guides + 4 reference + the top-level
> pages). **138 English pages still lack an `id/` counterpart**, so their
> hreflang alternates point nowhere and the language switcher dead-ends.
> This finishes full parity. Skills (`content/skills/*`) target AI agents,
> not human readers — out of scope.

**Per-page contract:** mirror the EN frontmatter (translate `title`/
`description` prose, keep keys); translate prose only — keep code blocks, CLI
commands, prop-table identifiers, and API names verbatim; preserve relative
links (the language switcher rewrites the `/id/` prefix).

Phased so each batch is reviewed before the next:

### Phase 1 — Prose docs (7 pages)

- [ ] 🟡 `guides/` — `file-upload`, `inspector`, `navigation`, `plugins`, `server-metadata`
- [ ] 🟡 `reference/` — `changelog`, `roadmap`

### Phase 2 — Components (62 pages)

- [ ] 🟡 `components/overview` + 61 `components/ui/*` pages

### Phase 3 — Blocks (37 pages)

- [ ] 🟡 `blocks/overview`, `blocks/auth`, `cards/*` ×6, `files/*` ×3, `heros/*` ×17, `navbars/*` ×3, `storefront/*` ×6

### Phase 4 — Themes (21 pages)

- [ ] 🟡 `themes/overview`, `themes/creating-themes` + 19 theme pages

### Phase 5 — Pages (11 pages)

- [ ] 🟡 `pages/overview`, `pages/auth/*` ×6, `pages/storefront/*` ×4

---

## Completed

> Docs + registry items migrated here from the framework roadmap
> (`../ROADMAP.md` → "Docs & Ecosystem"). These shipped in v0.0.1 – v0.1.26.

- [x] 🟠 Documentation site (Astro Starlight) — 14 pages
- [x] 🟡 Indonesian (Bahasa Indonesia) translation with Starlight i18n — initial pages (now being completed above)
- [x] 🟡 Deployment guides (Docker, Railway, Fly.io)
- [x] 🟡 Components documentation page with usage examples and prop tables
- [x] 🟡 Interactive component previews in docs — live Svelte demos (button, badge, input, separator, avatar, card, dropdown-menu)
- [x] 🟡 Nested registry structure for `todo` components — subfolder pattern matching `ui/`, with group install (`bun x bosia@latest add todo`) and individual install (`bun x bosia@latest add todo/todo-form`)
- [x] 🟡 Nested docs sidebar — UI and Todo as sub-groups under Components
- [x] 🟡 Docs SEO — OG tags, Twitter cards, canonical URLs, hreflang alternates on all pages
- [x] 🟡 `robots.txt` and `sitemap.xml` generation for docs site
