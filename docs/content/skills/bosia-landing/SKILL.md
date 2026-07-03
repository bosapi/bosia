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
    blocks: [features/grid, testimonials/spotlight, cta/banner, footers/minimal]
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
2. **Features** — install `blocks/features/grid`.
3. **Social proof** — install `blocks/logos/row` (logo cloud) or `blocks/testimonials/spotlight`.
4. **CTA band** — install `blocks/cta/banner`.
5. **Footer** — install `blocks/footers/minimal` (replace its `__BRAND__` placeholder).

Editorial typography. Semantic tokens only. Prefer installing these blocks (see [[bosia-sections]]
and [[bosia-footers]]) over hand-rolling the sections inline.

## When to use

User asks for a "landing page", "marketing page", or "homepage" for a new Bosia project. Single-screen brand pitch, no product UI.

Anti-trigger: SaaS-style pricing or feature matrix → `bosia-saas-landing`.

## Workflow

1. **Read `BRIEF.md § Aesthetic`.** Apply the locked `Direction` to hero composition (e.g. editorial → asymmetric grid + pull quote, brutalist → visible grid lines + hairline borders, brutally-minimal → oversized type + single accent). Place the named `Memorable detail` on the hero or in the footer — landing is the highest-leverage surface for it. Do NOT re-pick the stance here; that's `bosia-frontend-design` at intake.
2. `list_registry()` → confirm `blocks/features/grid`, `blocks/testimonials/spotlight`, `blocks/logos/row`, `blocks/cta/banner`, `blocks/footers/minimal`, `theme/editorial`, `ui/button`, `ui/badge`, `ui/typography`, `ui/separator`.
3. `bosia add theme editorial` then `bosia add ui/button ui/badge ui/typography ui/separator` then `bosia add block features/grid testimonials/spotlight cta/banner footers/minimal` (add `logos/row` if using a logo cloud).
4. Create `src/routes/(public)/+page.svelte` (route group keeps it outside any auth shell).
5. Compose hero → features → social proof → CTA → footer.
6. Run `bosia-design-review` and `bosia-accessibility-review` (both verify stance compliance).

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
- [ ] Sections installed via `bosia add block`, not pasted; footer `__BRAND__` replaced.
- [ ] BRIEF.md § Aesthetic direction visibly applied (hero composition matches direction); memorable detail present on hero or footer.
- [ ] `bosia-design-review` + `bosia-accessibility-review` pass.

P1:

- [ ] Hero image (if any) has descriptive `alt`.
- [ ] Logo row uses grayscale; on hover restores color.
- [ ] Footer is a real `<footer>` landmark.
- [ ] Run `bosia-seo` Tier 1 + Tier 2 (this is the public root — share previews + sitemap matter).

## References

- `references/design-principles.md` — landing page UX lineage.
- `references/hero-patterns.md` — 3 hero patterns and when each fits.
- `references/checklist.md` — landing-specific review items.
- `example.svelte` — canonical implementation.
