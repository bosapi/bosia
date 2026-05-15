---
name: bosia-accessibility-review
description: A11y quality gate — labels, focus rings, keyboard nav, contrast ≥4.5:1, ARIA only when native HTML insufficient.
triggers:
    - accessibility review
    - a11y check
    - keyboard nav
    - screen reader
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

# bosia-accessibility-review

## What it does

Catches the a11y defects that ship most often: unlabeled inputs, missing focus styles, dialog focus traps, keyboard-only navigation, contrast failures, ARIA misuse.

## When to use

Alongside `bosia-design-review`, before any UI emit. Especially for forms, dialogs, menus, custom interactive widgets.

## Workflow

1. Walk `references/checklist.md` P0 items.
2. Tab through the page mentally — can you reach every interactive element? Is focus visible at every step? Does Escape close dialogs/menus?
3. Check labels — every form control has one.
4. Verify contrast pairs (semantic tokens already meet 4.5:1 if used correctly).
5. Run P1.

## P0 — must pass

- [ ] **Every form control has a visible label.** `<label for="…">` or `aria-labelledby`. Placeholder is not a label.
- [ ] **Focus is visible at all times.** Use `ring-ring` semantic token (already on `ui/button`, `ui/input`, etc.). No `outline-none` without a replacement.
- [ ] **Tab order is logical.** No positive `tabindex`. Reading order matches visual order.
- [ ] **Escape closes overlays.** Dialogs, popovers, menus, sheets — Escape dismisses. `ui/dialog` does this automatically.
- [ ] **Interactive elements are real elements.** Buttons are `<button>`, links are `<a href>`, inputs are `<input>`. No `<div onclick>` as a button.
- [ ] **Contrast ≥ 4.5:1.** Guaranteed when using `text-foreground` on `bg-background`, `text-card-foreground` on `bg-card`, etc. (semantic-token pairings).
- [ ] **Images have `alt`.** Decorative → `alt=""`. Informative → describes content. Never omit.

## P1 — should pass

- [ ] Page has a `<main>` landmark.
- [ ] Skip-to-content link for keyboard users on long pages.
- [ ] Error messages associated with their input via `aria-describedby`.
- [ ] Live regions (`aria-live="polite"`) for async status (toast, form save).
- [ ] Heading structure has no skips (h1 → h2, never h1 → h3).
- [ ] Color is not the only signal — error inputs also carry text + icon, not just a red border.
- [ ] Reduced motion respected — animation gated by `prefers-reduced-motion`.

## ARIA discipline

Use ARIA only when native HTML cannot do the job.

- `<button>` already announces as a button — no `role="button"` needed.
- `<nav>` already announces — no `role="navigation"` needed.
- `aria-label` only when the visible text is missing or insufficient (e.g. icon-only button).
- Never duplicate semantic info: `<button aria-label="Save">Save</button>` is wrong (duplicate); use one or the other.

## References

- `references/checklist.md` — full audit list.
- `references/design-principles.md` — WCAG + open-design lineage.
