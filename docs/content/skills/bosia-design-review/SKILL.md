---
name: bosia-design-review
description: Pre-emit visual checklist — semantic tokens, Runes, empty/loading/error coverage, mobile-safe, typography hierarchy. Run before finalizing any UI.
triggers:
  - design review
  - ui review
  - before emit
  - visual check
od:
  mode: quality-gate
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

# bosia-design-review

## What it does

Audits a UI emit before it ships. Catches token leaks, missing async states, mobile breakage, broken typography hierarchy, and Runes lapses.

## When to use

After drafting any UI — route, component, or block — and before declaring the task done. Mandatory before emitting Bosapi's own views.

## Workflow

1. Open `references/checklist.md`.
2. Walk each P0 item against the emitted code. Fix any miss.
3. Walk P1. Note misses; fix if cheap.
4. Re-run after fixes.

## P0 checklist (must pass)

- [ ] **Semantic tokens only.** No raw color classes (`bosia-theme-tokens` grep).
- [ ] **Runes only.** No `export let`, no `$:`, no legacy stores (`bosia-svelte-runes`).
- [ ] **Registry-first.** Items installed via `bosia add`, not pasted (`bosia-block-compose`).
- [ ] **Async coverage.** Every async data branch has loading + empty + error states (`bosia-empty-states`).
- [ ] **Mobile safe.** Tested mentally at 375px — no horizontal scroll, touch targets ≥44px.
- [ ] **Typography hierarchy.** One `h1` per page; headings descend; body uses `ui/typography` or its classes.

## P1 checklist (should pass)

- [ ] Spacing rhythm — gaps/padding from Tailwind scale (`gap-2/4/6/8`), no arbitrary `px-[13px]`.
- [ ] Buttons have hover + active + focus states (free if you used `ui/button`).
- [ ] Forms use `ui/form` + `ui/field` + `ui/input`, not naked inputs.
- [ ] Long content scrolls within its container, not the page.
- [ ] Icons from `ui/icon` (consistent stroke + size).
- [ ] **Aesthetic stance honored.** Read `BRIEF.md § Aesthetic`. Verify: emit reflects the named `Direction`; the named `Memorable detail` is present on this surface (or already present on a sibling surface, if this view is secondary); display + body fonts inherited from `app.css @theme` (not silently swapped to `Inter`). This skill does NOT pick the stance — that's `bosia-frontend-design`'s job at intake; this check only confirms the emit didn't drift away from what was locked.

## References

- `references/checklist.md` — full P0/P1 list with rationale per item.
- `references/design-principles.md` — open-design lineage for each check.
- `bosia-frontend-design` — owns the stance picked at intake. This skill is its per-emit verifier.
