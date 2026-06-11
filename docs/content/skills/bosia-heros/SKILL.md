---
name: bosia-heros
description: Catalog of the 17 hero-section blocks (commerce, education, food, fashion, services, saas). Install with `bosia add block heros/<name>`; full-bleed sections that restyle across all 18 themes via semantic tokens.
triggers:
  - hero
  - landing
  - hero section
  - landing hero
  - splash
  - above the fold
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

Bosia ships **17 hero-section blocks** ported from the Hero Stock design system. Each is a
self-contained, full-width Svelte 5 `<section>` built **only** from semantic tokens, so it
restyles across all 18 themes with no edits. Install individually:

```bash
bosia add block heros/<name>
```

Files land at `src/lib/blocks/heros/<name>/block.svelte`. Each pulls the
[`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## The golden rule — brand is `primary`, never `accent`

In Bosia, `--accent` is a **subtle hover background**, not the brand colour. The brand action
colour is **`primary`**. The original design painted each vertical with a hardcoded accent
(flare / cobalt / grape / gold / blush) and emphasized one headline word — all of that collapses
to `primary`. When you build or edit a hero:

- Emphasized headline word / fills / CTAs / glow → `text-primary`, `bg-primary`,
  `text-primary-foreground`.
- Soft brand tint → `bg-primary/10` with `text-primary`.
- Never paint a brand element with `accent` — it won't follow the theme.

## Token rules (reference semantic tokens only — never hex)

| Surface / role             | Tailwind utility                                                         |
| -------------------------- | ------------------------------------------------------------------------ |
| Page / card                | `bg-background` / `bg-card text-card-foreground`                         |
| Dark / ink section         | `bg-foreground text-background` (with `text-background/80` body)         |
| Foreground / muted / faint | `text-foreground` / `text-muted-foreground` / `text-muted-foreground/70` |
| Brand                      | `bg-primary` / `text-primary` / `text-primary-foreground`                |
| Border / strong border     | `border-border` / `border-input`                                         |
| Radius                     | `rounded-lg/xl/2xl` (theme-driven)                                       |
| Elevation                  | `shadow-md/lg/xl` (theme-scoped)                                         |
| Mono kicker / meta         | `font-mono text-xs uppercase tracking-wide`; headings `font-display`     |

**Dark photo heroes** invert to `bg-foreground text-background` and lay an absolute image under a
gradient scrim — `bg-gradient-to-r from-foreground/90 …` — so the copy stays legible in every
theme. Status colours (amber stars, emerald positive) follow the shadcn convention, e.g.
`fill-amber-500 text-amber-500`, `text-emerald-600 dark:text-emerald-400`.

## Catalog

**Commerce** (7) — `shop-split` (split product + shipping badge), `sale` (full-bleed countdown),
`bags` (dark spec callouts), `bookstore` (fanned covers + staff pick), `toys` (age filter + tile
grid), `home-goods` (lifestyle photo + product card), `apparel` (color/size pickers).
**Education** (2) — `course` (stats + live-lesson card), `campus` (centered admissions photo).
**Food** (2) — `restaurant` (full-bleed reservation), `delivery` (address search + dishes).
**Fashion** (2) — `lookbook` (editorial photo), `new-drop` (product + size selector).
**Services** (2) — `agency` (dark glow + logos), `consulting` (bullets + stat cards).
**SaaS** (2) — `app` (feature list + phone mock), `product` (email capture + browser mock).

Each hero has its own page with a live preview and install line, e.g.
[Heros — Shop Split](/docs/blocks/heros/shop-split/); browse the rest under **Blocks → Heros** in
the sidebar.

## Usage

```svelte
<script lang="ts">
	import ShopSplit from "$lib/blocks/heros/shop-split/block.svelte";
</script>

<ShopSplit />
```

Heroes are full-width sections — drop one at the top of a route. Interactive bits (size / color /
age pickers, address + email inputs) are cosmetic local `$state`; wire them to your own data and
handlers. Each hero holds sample copy and Unsplash images; edit `block.svelte` to make it yours.

## Icons

Use `@lucide/svelte` (the scoped package, never `lucide-svelte`). Heroes use `Search`,
`ShoppingBag`, `ArrowRight`, `ArrowUpRight`, `Play`, `Check`, `Star`, `Heart`, `Calendar`,
`MapPin`, `Phone`, `Truck`, `Sparkles`.
