---
name: bosia-cards
description: Catalog of the 29 card blocks (dashboards, people, commerce, media, system, auth). Install with `bosia add block cards/<name>`; restyle for free across all 18 themes via semantic tokens.
triggers:
  - card
  - stat card
  - profile card
  - pricing card
  - dashboard card
  - testimonial
  - notification card
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

Bosia ships **29 card blocks** ported from the Cardstock design system. Each is a
self-contained Svelte 5 component built **only** from semantic tokens, so it restyles
across all 18 themes with no edits. Install individually:

```bash
bosia add block cards/<name>
```

Files land at `src/lib/blocks/cards/<name>/block.svelte`. Each pulls the
[`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## The golden rule — brand is `primary`, never `accent`

In Bosia, `--accent` is a **subtle hover background**, not the brand colour. The brand
action colour is **`primary`**. When you build or edit a card:

- Brand fills / CTAs / numerals / rings → `bg-primary`, `text-primary`,
  `text-primary-foreground`, `ring-primary`.
- Soft brand tint → `bg-primary/10` with `text-primary`.
- Never paint a brand element with `accent` — it won't follow the theme.

## Token rules (reference semantic tokens only — never hex)

| Surface / role             | Tailwind utility                                                         |
| -------------------------- | ------------------------------------------------------------------------ |
| Page / card / sunken       | `bg-background` / `bg-card` / `bg-muted`                                 |
| Secondary surface          | `bg-secondary`                                                           |
| Foreground / muted / faint | `text-foreground` / `text-muted-foreground` / `text-muted-foreground/70` |
| Brand                      | `bg-primary` / `text-primary` / `text-primary-foreground`                |
| Border / strong border     | `border-border` / `border-input`                                         |
| Radius                     | `rounded-sm/md/lg/xl` (theme-driven)                                     |
| Elevation                  | `shadow-sm/md/lg` (theme-scoped)                                         |
| Mono numerics / code       | `font-mono`; display headings `font-display`                             |

## Status colours — shadcn convention (not theme tokens)

Bosia themes have no success/warning/info tokens. Use fixed palette utilities with dark
variants so they read in both modes:

- success → `text-emerald-600 dark:text-emerald-400`, soft `bg-emerald-500/10`
- warning → `text-amber-600 dark:text-amber-400`, soft `bg-amber-500/10`
- info → `text-blue-600 dark:text-blue-400`, soft `bg-blue-500/10`
- danger → `text-destructive`, soft `bg-destructive/10` (the one status that _is_ a token)

## Catalog

**Data & dashboard** — `stat` (KPI + sparkline), `progress` (ring + bars), `chart`
(metric + mini bars), `balance` (wallet + masked card).
**People** — `profile` (cover, follow toggle), `contact` (presence + actions),
`testimonial` (serif quote + stars).
**Commerce** — `product` (price, like, add-to-bag), `pricing` (`featured` prop),
`order` (delivery stepper), `review` (verified + helpful).
**Media** — `article`, `music` (play/pause), `video`, `gallery` (2×2 + overflow).
**Utility & system** — `notification`, `weather`, `event`, `file`, `task` (checklist),
`storage` (ring + breakdown), `code` (copy button), `map`, `integration` (switch),
`poll` (animated bars), `stepper`, `chat`.
**Auth & marketing** — `login`, `feature` (props: `title`, `body`, `icon`, `cta`).

Sample galleries: [Cards — Commerce](/docs/blocks/cards/commerce/) and
[Cards — Auth & Marketing](/docs/blocks/cards/auth/); the four other category pages cover the rest.

## Usage

```svelte
<script lang="ts">
	import Stat from "$lib/blocks/cards/stat/block.svelte";
	import Feature from "$lib/blocks/cards/feature/block.svelte";
	import { Zap } from "@lucide/svelte";
</script>

<Stat />
<Feature title="Fast by default" body="SSR + islands, no config." icon={Zap} />
```

Toggles (follow / like / play / checkbox / switch / poll) are cosmetic local `$state` —
wire them to your own data and handlers. Most cards hold sample copy; edit `block.svelte`.

## Icons

Use `@lucide/svelte`. Three gotchas from lucide v1: `Home` is now `House`,
`MoreHorizontal` is `Ellipsis`, and the **GitHub brand icon was removed** — the `login`
and `integration` cards inline a GitHub mark as raw SVG. Default stroke is fine; brand
glyphs use `currentColor`.
