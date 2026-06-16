---
name: bosia-navbars
description: Catalog of 19 navbar blocks (standard, themed, app/interactive). Install with `bosia add block navbars/<name>`; self-contained `<header>` sections that restyle across all 19 themes via semantic tokens.
triggers:
  - navbar
  - nav bar
  - header
  - top nav
  - app bar
  - menu bar
od:
  mode: convention
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, tailwind-v4]
---

Bosia ships **19 navbar blocks** ported from the Navbar Stock design system. Each is a
self-contained, full-width Svelte 5 `<header>`/`<nav>` section built **only** from semantic tokens,
so it restyles across all 19 themes with no edits. Install individually:

```bash
bosia add block navbars/<name>
```

Files land at `src/lib/blocks/navbars/<name>/block.svelte`. Most pull the
[`@lucide/svelte`](/components/ui/icon/) npm package for icons.

This is the **design catalog** of pre-built marketing/app top bars. For wiring client-side
navigation (active link state, route transitions, the framework's own nav primitives) see
[[bosia-navigation]]. Pairs naturally with [[bosia-heros]] — a navbar above a hero section.

## The golden rule — brand is `primary`, never `accent`

In Bosia, `--accent` is a **subtle hover background**, not the brand colour. The brand action
colour is **`primary`**. The original design painted every CTA, active underline and brand dot with
a hardcoded acid lime — all of that collapses to `primary`. When you build or edit a navbar:

- CTAs / active link underline / brand glyph / notification badge → `bg-primary`,
  `text-primary`, `text-primary-foreground`.
- Soft brand tint (beta pill) → `bg-primary/15` with `text-primary`.
- Never paint a brand element with `accent` — it won't follow the theme.

## Token rules (reference semantic tokens only — never hex)

| Surface / role          | Tailwind utility                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Bar / card              | `bg-card text-card-foreground` (or `bg-background`)                                          |
| Dark / inverted bar     | `bg-foreground text-background` (links `text-background/60`)                                 |
| Foreground / muted      | `text-foreground` / `text-muted-foreground`                                                  |
| Brand                   | `bg-primary` / `text-primary` / `text-primary-foreground`                                    |
| Brand bar (full colour) | `bg-primary text-primary-foreground` (glyph inverts to `bg-primary-foreground text-primary`) |
| Border / strong border  | `border-border` / `border-input`                                                             |
| Hover surface           | `hover:bg-accent` / `hover:bg-muted`                                                         |
| Glass                   | `bg-background/60 backdrop-blur-xl border-border/50`                                         |
| Overlay (over a hero)   | `absolute inset-x-0 top-0 z-20` transparent, `text-background` links `text-background/70`    |
| Radius                  | `rounded-md/lg/full` (theme-driven)                                                          |
| Wordmark / mono meta    | `font-display`; `font-mono text-xs uppercase tracking-wide`                                  |

The brand lettermark is the heros pattern: a small
`grid place-items-center rounded-lg bg-primary text-primary-foreground` "B" beside a `font-display`
wordmark — no image asset.

## Catalog

**Standard** (6) — `classic` (centered links + login/CTA), `split` (links + one solid CTA),
`centered` (logo flanked by symmetric links), `search` (links + search field + bell + avatar),
`minimal` (whitespace + one action + menu), `two-tier` (mono utility strip above the main row).
**Themes** (7) — `dark` (inverted bar), `glass` (translucent blur), `brutalist` (primary bar,
thick borders, mono caps, hard shadow), `pill` (floating capsule), `gradient` (dark gradient +
primary glow + beta pill), `lime` (full-colour primary brand bar), `overlay` (transparent bar with
light text + outline CTA, `position: absolute` to float over a hero image).
**App & Interactive** (6) — `dashboard` (breadcrumb + search + badged icons + avatar),
`ecommerce` (categories + search + wishlist/account/cart), `docs` (version pill + search + light/dark
toggle + repo), `mega-menu` (catalog opens a 3-column panel), `announcement` (dismissible promo
strip + nav), `mobile` (hamburger toggles a full overlay menu).

Each group has its own page with live previews and install lines:
[Standard](/docs/blocks/navbars/standard/), [Themes](/docs/blocks/navbars/themes/),
[App & Interactive](/docs/blocks/navbars/app/) — browse them under **Blocks → Navbars** in the
sidebar.

## Usage

```svelte
<script lang="ts">
	import Classic from "$lib/blocks/navbars/classic/block.svelte";
</script>

<Classic />
```

Navbars are full-width headers — drop one at the top of a route. Links point at `/`; wire them to
your own routes. The interactive toggles (`docs` theme switch, `mega-menu`, `announcement` dismiss,
`mobile` menu) are cosmetic local `$state` — wire them to your own handlers. Edit `block.svelte` to
swap the wordmark and copy.

**`overlay` is the exception** to the layout-level placement rule: it is `position: absolute`, so it
floats over the first section instead of stacking above it. Render it as the first child of a
`relative` hero `<section>` (the photo heroes in [[bosia-heros]] are built for this), **not** in
`+layout.svelte`. Its light text is tuned for a dark photo/scrim. Every other navbar goes in the
layout per [[bosia-page-shell]] R1.

## Icons

Use `@lucide/svelte` (the scoped package, never `lucide-svelte`). Navbars use `Search`, `Bell`,
`ChevronDown`, `ChevronRight`, `ArrowUpRight`, `ArrowRight`, `Menu`, `X`, `Plus`, `Settings`,
`ShoppingBag`, `Heart`, `User`, `Sun`, `Moon`, `GitBranch`, `Sparkles`, `LayoutPanelTop`,
`PanelTop`, `Sidebar`, `SquareMenu`, `Square`, `TrendingUp`, `Sparkle`, `Bookmark`, `Gift`. Import
each icon directly — never destructure-rename a Lucide icon in a registry block; for a dynamic icon
alias with a plain `{@const Icon = item.icon}`.
