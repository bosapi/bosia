# Design principles — review lineage

## Lineage

- open-design `skills/frontend-design` — the canonical UI-discipline checklist this skill descends from.
- open-design `skills/ui-skills` — composition + token discipline.
- open-design `skills/design-review` — gate-style review pattern.

## Why a pre-emit gate

Most UI defects are cheap to fix at emit time and expensive to fix once shipped:

- A missing focus ring → one class. Discovered after launch → audit + rework across N components.
- A blank-screen-on-error → 30 lines. Discovered by a user → outage perception, support ticket.

The review is not a polish pass. It is a correctness pass for the _visual contract_.

## What we draw from each upstream

### `frontend-design`

- Production UI is **typographic-first**: hierarchy before color, color before motion.
- One `h1` per page; descend without skipping.
- Body length capped (~70ch) for scannability.
- Spacing from a scale, not arbitrary pixels.

### `ui-skills`

- Semantic tokens as the only color vocabulary.
- Registry-first composition: blocks → components → custom DOM, in that order.
- Theme swap is a file change, not a refactor.

### `design-review` (gate pattern)

- P0 items are non-negotiable.
- P1 items are negotiable but logged.
- Each item carries a rationale so the reviewer can judge edge cases.

## Application to Bosia's own UI

This gate is mandatory before emitting Bosapi's login, register, project list, and editor routes. The builder is itself a product surface; a builder that violates its own gates loses the right to enforce them on user projects.
