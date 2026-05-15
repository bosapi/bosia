# Design principles — registry-first composition

## Lineage

- open-design `skills/frontend-design` — composition discipline, why shared primitives beat one-off components.
- open-design `skills/ui-skills` — pattern of curated registries (shadcn/ui style).

## Why a registry exists

A registry collapses three problems into one solved primitive:

1. **Visual drift** — five hand-rolled cards diverge by week three. One `ui/card` does not.
2. **A11y regressions** — focus rings, ARIA, keyboard nav are easy to forget. Registry items carry them.
3. **Theme support** — registry items use semantic tokens. Hand-rolled DOM rarely does.

## Blocks vs. components vs. features vs. themes

- **Components** (`ui/*`) — primitives. Buttons, cards, inputs. Small surface.
- **Blocks** (`blocks/*`) — pre-composed sections. Heros, feature grids, testimonials. Larger surface, opinionated layout.
- **Features** (`feat/*`) — runtime modules (e.g. `drizzle`) that wire up infra, not just markup.
- **Themes** (`theme/*`) — token sets (`neutral`, `editorial`).

The hierarchy is intentional: blocks compose components, themes color them, features power them.

## The composition discipline

When asked for a "landing page hero":

1. `list_registry()` → is there a `blocks/hero-*`?
2. If yes → `bosia add` it, customize copy + imagery.
3. If no → compose from `ui/typography`, `ui/button`, `ui/badge`, maybe `ui/card`.
4. Only after both are exhausted, write custom DOM — and that custom DOM should still feel like a candidate for a future block.

## Anti-patterns rationale

- **"I'll write my own card div"** loses the focus ring, the hover state, the token defaults. Two months in, the codebase has five card flavors and no single owner.
- **Inline pasting registry source** breaks dedupe and update paths. The next `bosia upgrade` doesn't touch the inlined copy.
- **Skipping `list_registry()`** is how the LLM ends up reinventing `ui/badge` for the third time.

## Further reading

- shadcn/ui registry docs — the canonical mental model.
- open-design `ui-skills/SKILL.md` — broader composition heuristics.
