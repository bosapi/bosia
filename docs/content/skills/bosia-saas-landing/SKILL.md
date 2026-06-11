---
name: bosia-saas-landing
description: SaaS marketing landing — hero, feature grid, pricing tease, testimonials, integrations, CTA. Heavier than `bosia-landing`.
triggers:
  - saas landing
  - saas homepage
  - product marketing
od:
  mode: page-scaffold
  category: marketing
bosia:
  design: true
  requires:
    blocks: [cards/feature]
    themes: [editorial]
    components: [ui/button, ui/card, ui/badge, ui/separator, ui/avatar, ui/typography]
    feats: []
  targets:
    routes: ["src/routes/(public)/+page.svelte"]
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-saas-landing

## What it builds

A multi-section SaaS landing under `(public)/+page.svelte`:

1. **Hero** — headline + subhead + dual CTA + product visual.
2. **Logo row** — social proof (customer logos / count badge).
3. **Feature grid** — 4–6 features, each with icon, title, body.
4. **Deep feature** — one "headline feature" with a screenshot or animated visual.
5. **Pricing tease** — 3 tier cards (or "Free / Pro / Talk to us"). Detailed comparison on `/pricing`.
6. **Testimonials** — 2–3 quote cards with avatar + name + role.
7. **Integrations** — logo grid of supported integrations (if applicable).
8. **CTA band** — restated promise + primary action.
9. **Footer** — nav, social, legal.

## When to use

User asks for a "SaaS landing", a homepage for a paid product, or anything with pricing/testimonials baked in. For minimalist single-screen pitches → `bosia-landing`.

## Workflow

1. **Read `BRIEF.md § Aesthetic`.** Apply the locked `Direction` to hero, feature grid rhythm, and testimonial card style (e.g. luxury → hairline gold rule + restrained palette, maximalist → overlapping rotated cards, industrial → square corners + tabular numerics in pricing tease). Place the named `Memorable detail` on the hero. This skill does not re-pick the stance.
2. `bosia add theme editorial` then `bosia add ui/button ui/card ui/badge ui/separator ui/avatar ui/typography` then `bosia add block cards/feature`.
3. Optionally also add `ui/accordion` for FAQ if including.
4. Compose section by section. Don't shortcut on testimonials — fake-feeling ones hurt conversion.

## Rules

### Hero

- One headline, one promise. ≤9 words.
- Subhead expands with one concrete benefit. ≤24 words.
- Primary CTA + secondary CTA (different verbs).
- Visual: product screenshot or short loop. No stock photos.

### Feature grid

- 4–6 features. Six is the cap; more dilutes.
- Each: icon, verb-led title, one-sentence body.
- Use `blocks/cards/feature`.

### Testimonials

- Real names. Real companies. Real photos (or initials avatar).
- Quote ≤ 2 sentences. Specific result beats generic praise.
- "Cut our build time in half" > "Best tool ever".

### Pricing tease

- Three tiers, button to `/pricing` for full comparison.
- Mark recommended.

### CTA band

- Restate the promise. Single button. Same verb as hero primary.

## Bosia conventions

- `bosia-routing` — `(public)/+page.svelte`. No `+page.server.ts` unless server data.
- `bosia-block-compose` — feature cards from registry block.
- `bosia-theme-tokens`, `bosia-svelte-runes`.

## Checklist gate

P0:

- [ ] One `<h1>` (hero). Section headings as `<h2>`.
- [ ] Hero CTA above the fold.
- [ ] All sections use semantic tokens.
- [ ] Mobile-safe at 375px (sections stack, no horizontal scroll).
- [ ] Testimonials have real attribution.
- [ ] BRIEF.md § Aesthetic direction applied across hero + feature grid + pricing tease; memorable detail present on hero.
- [ ] `bosia-design-review` + `bosia-accessibility-review` pass.

P1:

- [ ] Visual or screenshot in hero.
- [ ] Logo row grayscale → color on hover.
- [ ] Section anchors (`#features`, `#pricing`, `#faq`) link from nav.
- [ ] Run `bosia-seo` Tier 1 + Tier 2; add Tier 3 schemas (`SoftwareApplication`, `FAQPage`) for sections present.

## References

- `references/design-principles.md`.
- `references/checklist.md`.
- `example.svelte`.
