---
name: bosia-sections
description: Catalog of 24 marketing section blocks across 11 families (pricing, testimonials, faq, cta, features, stats, logos, contact, team, gallery, process). Install with `bosia add block <family>/<name>`; self-contained `<section>` blocks that restyle across all themes via semantic tokens.
triggers:
  - pricing section
  - testimonials
  - faq section
  - cta section
  - features section
  - stats section
  - logo cloud
  - marketing section
  - contact section
  - contact form
  - team section
  - meet the team
  - image gallery
  - masonry gallery
  - how it works
  - process section
  - timeline section
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

Bosia ships **24 marketing section blocks** across **11 families** — the middle of a landing page,
between the [[bosia-navbars]] navbar/[[bosia-heros]] hero and the [[bosia-footers]] footer. Each is
a self-contained, full-width Svelte 5 `<section>` built **only** from semantic tokens, so it
restyles across every theme with no edits. Install individually:

```bash
bosia add block <family>/<name>
```

Files land at `src/lib/blocks/<family>/<name>/block.svelte`. Most pull the
[`@lucide/svelte`](/components/ui/icon/) npm package for icons.

Prefer composing these over hand-rolling sections inline. For a whole page already stitched
together, install a landing page instead: `bosia add page landing/saas` or `bosia add page
landing/simple` (see [[bosia-landing]] / [[bosia-saas-landing]]).

## The golden rule — brand is `primary`, never `accent`

The brand action colour is **`primary`** — every CTA, badge, icon square, check and delta chip maps
to it. `--accent` is a subtle hover background, not the brand. Soft brand tint → `bg-primary/10`
with `text-primary`. Status uses emerald/amber, never brand. Section blocks carry **no** wordmark,
so there is **no `__BRAND__`** here (that sentinel is footers/navbars only); `logos/*` uses
fictional styled-text names, never real trademarks.

## Shared shape

Every section is a `<section>` with an inner `mx-auto max-w-6xl px-6 py-16 sm:py-24` container, an
optional kicker (`text-xs font-semibold uppercase tracking-[0.14em] text-primary`) over a
`font-display` heading. Content lives in hardcoded arrays at the top of each `block.svelte` — edit
those to match your product.

## Catalog

| Family         | Blocks                            | What each is                                                                  |
| -------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| `pricing`      | `columns`, `comparison`, `simple` | 3-tier cards / plan-comparison table / one plan with monthly-yearly toggle    |
| `testimonials` | `grid`, `spotlight`               | quote-card grid with stars & avatars / one oversized pull-quote               |
| `faq`          | `accordion`, `grid`               | sticky heading + native `<details>` list / static two-column Q&A              |
| `cta`          | `banner`, `panel`                 | full-width `primary` band / rounded dark email-capture panel with a glow      |
| `features`     | `grid`, `split`, `bento`          | 3×2 icon tiles / alternating copy+visual rows / 1 large + 4 small bento tiles |
| `stats`        | `band`, `cards`                   | slim muted number band / four stat cards with delta chips                     |
| `logos`        | `row`, `grid`                     | trusted-by wordmark row / bordered cell grid of wordmarks                     |
| `contact`      | `split`, `simple`                 | form beside contact details / centered form — both POST to `/api/contact`     |
| `team`         | `grid`, `spotlight`               | member-card grid / one oversized founder card with quote and bio              |
| `gallery`      | `grid`, `masonry`                 | square thumbnails with a `ui/dialog` lightbox / CSS-columns masonry, no JS    |
| `process`      | `steps`, `timeline`               | numbered horizontal how-it-works row / vertical milestone timeline            |

Each family has its own page with live previews and install lines under **Blocks → Sections** in the
sidebar: [Pricing](/docs/blocks/pricing/), [Testimonials](/docs/blocks/testimonials/),
[FAQ](/docs/blocks/faq/), [CTA](/docs/blocks/cta/), [Features](/docs/blocks/features/),
[Stats](/docs/blocks/stats/), [Logos](/docs/blocks/logos/), [Contact](/docs/blocks/contact/),
[Team](/docs/blocks/team/), [Gallery](/docs/blocks/gallery/), [Process](/docs/blocks/process/).

The `contact` forms post JSON to `/api/contact`; install the `contact-form` feature
(`bosia feat contact-form`) for the validated, Drizzle-backed endpoint, or point the block's
`action` prop at your own route.

## Canonical section order

When composing a landing page, stack sections in this order (drop any you don't need):

```
navbar → hero → logos → features → stats → pricing → testimonials → faq → cta → footer
```

Lead with proof (`logos`), then value (`features` / `stats`), then the ask (`pricing`), then
reassurance (`testimonials` / `faq`), then the close (`cta`). `faq/accordion` needs no JavaScript —
it's built on the native `<details>` element.

## Usage

```svelte
<script lang="ts">
	import Features from "$lib/blocks/features/grid/block.svelte";
	import Pricing from "$lib/blocks/pricing/columns/block.svelte";
</script>

<Features />
<Pricing />
```

## Icons

Use `@lucide/svelte` (the scoped package, never `lucide-svelte`). Import each icon directly by its
exact name — never destructure-rename a Lucide icon in a registry block; for a dynamic icon in an
`{#each}`, reference it by member access (`item.icon`), not a renamed destructure.
