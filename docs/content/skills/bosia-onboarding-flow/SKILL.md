---
name: bosia-onboarding-flow
description: Multi-step onboarding — welcome → value prop → sign-in/up → profile setup. Progress indicator. Skip-where-safe.
triggers:
    - onboarding
    - first-run
    - wizard
    - getting started
od:
    mode: flow
    category: ux
bosia:
    design: true
    requires:
        blocks: []
        themes: [editorial]
        components: [ui/progress, ui/button, ui/form, ui/field, ui/input, ui/card, ui/badge]
        feats: []
    targets:
        routes:
            - "src/routes/(public)/welcome/+page.svelte"
            - "src/routes/(public)/welcome/+layout.svelte"
            - "src/routes/(public)/welcome/value/+page.svelte"
            - "src/routes/(public)/welcome/signin/+page.svelte"
            - "src/routes/(public)/welcome/profile/+page.svelte"
            - "src/routes/(public)/welcome/profile/+page.server.ts"
    stack: [svelte-5-runes, tailwind-v4]
---

# bosia-onboarding-flow

## What it builds

A linear 4-step flow under `/welcome`:

1. **Welcome / splash** — name, one-line promise, "Get started".
2. **Value prop** — 2–3 cards illustrating what the user gets.
3. **Sign-in / sign-up** — reuses `bosia-auth-flow` forms inline.
4. **Profile setup** — name, optional avatar, optional team — saves and redirects to `/dashboard`.

Shared `+layout.svelte` carries the progress indicator + back button.

## Workflow

1. `bosia add theme/editorial ui/progress ui/button ui/form ui/field ui/input ui/card ui/badge`.
2. Build `welcome/+layout.svelte` — sticky top progress bar, optional skip.
3. Build each step's `+page.svelte`. Steps are full screens, single primary action.
4. Final step (profile): `+page.server.ts` action saves and redirects.
5. Run `bosia-design-review`, `bosia-accessibility-review`.

## Rules

### R1 — One decision per step

A step is one question or one input set. Avoid kitchen-sink "tell us about yourself" pages.

### R2 — Progress visibility

`ui/progress` at the top of every step. "Step 2 of 4". Visible at all times.

### R3 — Reversible navigation

Back button works. Browser back works. No "you'll lose progress" warnings unless data is unsaved on the current step.

### R4 — Skip-where-safe

If a step is genuinely optional (avatar, team invite), show a clear "Skip for now" secondary action. If it's not optional, don't pretend.

### R5 — Mobile-first

Steps render full-screen on mobile. Primary action in the bottom action bar.

### R6 — Save partial state on advance

Each step's data persists as the user advances. Closing the tab on step 3 returns them to step 3, not step 1.

### R7 — Final step redirects, not "Done"

The reward of onboarding is the product. Last step submits → redirect to `/dashboard`.

## Bosia conventions

- `bosia-routing` — `(public)` group; each step `+page.svelte`.
- `bosia-svelte-runes` — `$state` for form values; if cross-step, `lib/stores/onboarding.svelte.ts`.
- `bosia-theme-tokens` — editorial theme; generous whitespace.
- `bosia-rbac-permission` — onboarding may run pre-auth; downstream pages enforce.

## Checklist gate

P0:

- [ ] Progress visible on every step.
- [ ] Back navigation works (button + browser).
- [ ] Optional steps clearly labeled "Skip for now".
- [ ] Final step redirects to product surface, not a "complete" screen.
- [ ] Mobile-safe at 375px; primary action in thumb zone.
- [ ] Partial state persists across step navigation.

P1:

- [ ] Step entry animations respect `prefers-reduced-motion`.
- [ ] Step-jump (clicking earlier progress item) revisits without losing later state.
- [ ] Analytics events fire per step (start, advance, skip, complete).

## References

- `references/design-principles.md` — onboarding UX rationale.
- `references/checklist.md`.
