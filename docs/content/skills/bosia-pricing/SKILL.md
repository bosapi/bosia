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
        blocks: []
        themes: [editorial]
        components: [ui/card, ui/table, ui/badge, ui/accordion, ui/button, ui/separator, ui/switch]
        feats: []
    targets:
        routes: ["src/routes/pricing/+page.svelte"]
    stack: [svelte-5-runes, tailwind-v4]
---

# bosia-pricing

## What it builds

A single `+page.svelte` at `/pricing` with three sections:

1. **Tiers** — 3 plan cards (Free / Pro / Team). Recommended plan visually marked.
2. **Comparison table** — feature matrix across tiers.
3. **FAQ** — accordion of common purchase questions.

Optional billing toggle (monthly / annual with discount).

## Workflow

1. `bosia add theme/editorial ui/card ui/table ui/badge ui/accordion ui/button ui/separator ui/switch`.
2. Create `src/routes/pricing/+page.svelte`.
3. Compose: tier row → comparison table → FAQ.
4. Run design + a11y review.

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
- [ ] FAQ uses `ui/accordion`, keyboard navigable.

P1:

- [ ] Monthly/annual toggle persists in URL or query.
- [ ] Currency selector if multi-region.
- [ ] Schema.org `Product`/`Offer` JSON-LD for SEO.
- [ ] Sticky table header.

## References

- `references/design-principles.md` — pricing-page conversion patterns.
- `references/checklist.md`.
- `example.svelte` — three-tier layout.
