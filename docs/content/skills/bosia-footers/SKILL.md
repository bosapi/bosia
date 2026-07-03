---
name: bosia-footers
description: Catalog of 12 footer blocks (standard, themed). Install with `bosia add block footers/<name>`; self-contained `<footer>` sections that restyle across all themes via semantic tokens.
triggers:
  - footer
  - site footer
  - page footer
  - bottom bar
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

Bosia ships **12 footer blocks**. Each is a self-contained, full-width Svelte 5 `<footer>` section
built **only** from semantic tokens, so it restyles across every theme with no edits. Install
individually:

```bash
bosia add block footers/<name>
```

Files land at `src/lib/blocks/footers/<name>/block.svelte`. Some pull the
[`@lucide/svelte`](/components/ui/icon/) npm package for icons.

This is the **design catalog** of pre-built site footers — the bookend to [[bosia-navbars]] and the
closing section of [[bosia-landing]] / [[bosia-sections]]. A footer goes in `+layout.svelte` per
[[bosia-page-shell]], not per page.

## The golden rule — brand is `primary`, never `accent`

In Bosia, `--accent` is a **subtle hover background**, not the brand colour. The brand action
colour is **`primary`**. Every wordmark glyph, CTA, newsletter button and status dot maps to
`primary`. When you build or edit a footer:

- CTA / newsletter button / brand glyph / status dot → `bg-primary`, `text-primary`,
  `text-primary-foreground`.
- Soft brand tint (glow) → `bg-primary/20` with `blur-3xl`.
- Never paint a brand element with `accent` — it won't follow the theme.

## The `__BRAND__` placeholder — you MUST replace it

Every footer ships its wordmark as the literal `__BRAND__` sentinel (in the wordmark, the
`aria-label` and the © line). This is deliberate: `bosia sync` / `bun run check` **fails** while any
`__BRAND__` survives in `src/`, so a fresh scaffold can never ship someone else's brand. After
installing, swap `__BRAND__` for the real brand everywhere it appears.

Social links use **inline SVG glyphs** (X, GitHub, LinkedIn, etc.) — Lucide v1 no longer bundles
brand icons. Point them at your own profiles; edit or delete glyphs you don't need.

## Token rules (reference semantic tokens only — never hex)

| Surface / role         | Tailwind utility                                                      |
| ---------------------- | --------------------------------------------------------------------- |
| Light footer           | `bg-background` / `bg-card`, `border-t border-border`                 |
| Dark / inverted footer | `bg-foreground text-background/70` (links `text-background/70`)       |
| Foreground / muted     | `text-foreground` / `text-muted-foreground`                           |
| Brand                  | `bg-primary` / `text-primary` / `text-primary-foreground`             |
| Column heading         | `text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground` |
| Glass                  | `bg-card/60 backdrop-blur-xl border-border/50` on a `bg-muted` band   |
| Glow                   | `bg-primary/20 blur-3xl` behind a big CTA headline                    |
| Wordmark / mono meta   | `font-display`; `font-mono text-xs uppercase tracking-wide`           |

## Catalog

**Standard** (6) — `minimal` (single row: wordmark, inline links, ©), `columns` (brand column +
3 link columns + legal row), `newsletter` (email-capture band above link columns), `centered`
(centre-stacked glyph, tagline, link row, circular socials), `mega` (5 link columns + contact
column + language/currency selects), `split-brand` (oversized wordmark + CTA pair left, compact
links right).
**Themes** (6) — `dark` (inverted multi-column), `glass` (translucent blurred panel on a muted
band), `gradient` (dark band with a primary glow behind a big CTA), `brutalist` (primary band,
thick borders, boxed mono link cells, © stamp), `editorial` (oversized serif wordmark, hairline
rules, small-caps links), `terminal` (mono on foreground, `>`-prefixed links, blinking cursor).

Each group has its own page with live previews and install lines:
[Standard](/docs/blocks/footers/standard/), [Themes](/docs/blocks/footers/themes/) — browse them
under **Blocks → Footers** in the sidebar.

## Usage

```svelte
<script lang="ts">
	import Columns from "$lib/blocks/footers/columns/block.svelte";
</script>

<Columns />
```

Footers are full-width — drop one at the bottom of your layout. Links point at `##`; wire them to
your own routes. The `newsletter` / `mega` inputs are cosmetic — wire them to your own handlers.
Remember to replace every `__BRAND__` and edit the copy.

## Icons

Use `@lucide/svelte` (the scoped package, never `lucide-svelte`). Only `mega` uses lucide
(`MapPin`, `Mail`, `Phone`); social glyphs everywhere else are inline SVG. Import each icon directly
— never destructure-rename a Lucide icon in a registry block.
