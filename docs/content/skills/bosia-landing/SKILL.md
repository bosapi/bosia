---
name: bosia-landing
description: Marketing landing — hero, features, social-proof, CTA, footer. Editorial theme by default. Single +page.svelte under (public).
triggers:
    - landing page
    - marketing page
    - homepage
od:
    mode: page-scaffold
    category: marketing
bosia:
    design: true
    requires:
        blocks: [cards/feature-editorial]
        themes: [editorial]
        components: [ui/button, ui/badge, ui/typography, ui/separator]
        feats: []
    targets:
        routes: ["src/routes/(public)/+page.svelte"]
    stack: [svelte-5-runes, tailwind-v4]
---

# bosia-landing

## What it builds

A single-page marketing landing at `src/routes/(public)/+page.svelte` with:

1. **Hero** — headline (h1), subhead, primary + secondary CTA.
2. **Features** — 3-card grid built from `blocks/cards/feature-editorial`.
3. **Social proof** — short logo row or testimonial quote.
4. **CTA band** — restated value prop + primary action.
5. **Footer** — minimal: brand, links, copyright.

Editorial typography. Semantic tokens only.

## When to use

User asks for a "landing page", "marketing page", or "homepage" for a new Bosia project. Single-screen brand pitch, no product UI.

Anti-trigger: SaaS-style pricing or feature matrix → `bosia-saas-landing`.

## Workflow

1. `list_registry()` → confirm `blocks/cards/feature-editorial`, `theme/editorial`, `ui/button`, `ui/badge`, `ui/typography`, `ui/separator`.
2. `bosia add theme/editorial blocks/cards/feature-editorial ui/button ui/badge ui/typography ui/separator`.
3. Create `src/routes/(public)/+page.svelte` (route group keeps it outside any auth shell).
4. Compose hero → features → social proof → CTA → footer.
5. Run `bosia-design-review` and `bosia-accessibility-review`.

## Bosia conventions

- `bosia-routing` — `(public)` group + `+page.svelte`. No `+page.server.ts` unless data is needed.
- `bosia-theme-tokens` — `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`.
- `bosia-svelte-runes` — `$props()` if the page is parameterized.
- `bosia-block-compose` — features come from the registry block.
- `bosia-empty-states` — N/A (no async data on a static landing).

## Copy guidance

- Headline: ≤9 words, one promise.
- Subhead: ≤24 words, expand the promise with one concrete benefit.
- Feature cards: 1 verb-led title + 1 sentence body. Don't write paragraphs.
- CTA: one verb ("Get started", "Start building"). Avoid "Learn more" as primary.

## Checklist gate

P0:

- [ ] One `<h1>`, one primary CTA above the fold.
- [ ] All sections use semantic tokens.
- [ ] Mobile-safe at 375px.
- [ ] Feature cards installed via `bosia add`, not pasted.
- [ ] `bosia-design-review` + `bosia-accessibility-review` pass.

P1:

- [ ] Hero image (if any) has descriptive `alt`.
- [ ] Logo row uses grayscale; on hover restores color.
- [ ] Footer is a real `<footer>` landmark.

## References

- `references/design-principles.md` — landing page UX lineage.
- `references/hero-patterns.md` — 3 hero patterns and when each fits.
- `references/checklist.md` — landing-specific review items.
- `example.svelte` — canonical implementation.
