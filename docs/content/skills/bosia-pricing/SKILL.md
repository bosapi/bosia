---
name: bosia-pricing
description: Pricing tiers + comparison table + FAQ. Recommended plan highlighted. Monthly/annual toggle.
triggers:
  - pricing page
  - pricing tiers
  - compare plans
  - subscription tiers
od:
  mode: page-scaffold
  category: marketing
bosia:
  design: true
  requires:
    blocks: [pricing/columns, pricing/comparison, faq/accordion]
    themes: [editorial]
    components: [ui/badge, ui/button, ui/separator]
    feats: []
  targets:
    routes: ["src/routes/pricing/+page.svelte"]
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-pricing

## What it builds

A single `+page.svelte` at `/pricing`, composed from registry blocks (see [[bosia-sections]]):

1. **Tiers** — `pricing/columns` (3 plan cards, recommended plan marked). Or `pricing/simple` for a
   single-plan page with a built-in monthly/yearly toggle.
2. **Comparison table** — `pricing/comparison` (feature matrix across tiers).
3. **FAQ** — `faq/accordion` (native `<details>`, no JS) of common purchase questions.

Install with `bosia add block pricing/columns pricing/comparison faq/accordion`. Section blocks
carry no wordmark, so there's no `__BRAND__` to replace here.

## Workflow

1. **Read `BRIEF.md § Aesthetic`.** Apply the locked `Direction` to tier-card style and comparison-table density (e.g. luxury → restrained palette + hairline rule on recommended card, brutalist → square corners + bordered cells, industrial → tabular numerics + minimal chrome). The recommended-tier accent must reuse `--accent` from `app.css`, not a fresh hex. Place the named `Memorable detail` somewhere visible — often on the recommended tier (e.g. an art-deco sunburst ornament, a gold-foil hover state).
2. `bosia add theme/editorial ui/badge ui/button ui/separator` then `bosia add block pricing/columns pricing/comparison faq/accordion`.
3. Create `src/routes/pricing/+page.svelte`.
4. Compose: `pricing/columns` → `pricing/comparison` → `faq/accordion`.
5. Run design + a11y review.

## Rules

### Tier card hierarchy

- All cards share visual weight; the recommended card is one tier "louder" — `border-primary` or a `Badge`-tagged "Recommended".
- Price big. Period (`/mo`) small.
- Feature list under price: 4–6 lines. More belongs in the comparison table.
- One CTA per card. Same verb across cards.

### Comparison table

- First column: feature name + optional tooltip.
- Remaining columns: tiers, ✓/✗ or values.
- Sticky header on scroll.
- Mobile: cards above; comparison may collapse to per-tier accordions or scroll horizontally.

### FAQ

- 5–8 questions, max.
- Common: refunds, plan changes, seat counting, taxes, contract length.
- Answers ≤ 3 sentences.

### Billing toggle

- Default to monthly (lower number = lower anxiety).
- Annual savings shown as a `Badge` ("Save 20%") next to the toggle.

## Checklist gate

P0:

- [ ] Recommended tier visually marked, not just labeled.
- [ ] One CTA per tier, identical verb.
- [ ] Comparison table renders without horizontal scroll on desktop.
- [ ] Mobile (375px): tier cards stack, table either collapses or scrolls inside its container.
- [ ] FAQ uses `faq/accordion` (native `<details>`), keyboard navigable.
- [ ] BRIEF.md § Aesthetic direction applied to tier cards + table density; recommended-tier accent uses `--accent` (no fresh hex); memorable detail present.

P1:

- [ ] Monthly/annual toggle persists in URL or query.
- [ ] Currency selector if multi-region.
- [ ] Schema.org `Product`/`Offer` JSON-LD for SEO.
- [ ] Sticky table header.

## References

- `references/design-principles.md` — pricing-page conversion patterns.
- `references/checklist.md`.
- `example.svelte` — three-tier layout.
