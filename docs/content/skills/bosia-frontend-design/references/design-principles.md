# Design principles — frontend-design lineage

## Lineage

- open-design `skills/frontend-design` — the canonical "avoid AI slop, commit to a bold direction" discipline this skill descends from.
- open-design `skills/ui-skills` — composition + token discipline (already absorbed by `bosia-theme-tokens` and `bosia-block-compose`).
- `bosia-design-review` — the gate that enforces the stance after emit.

## Why a stance, not a recipe

`bosia-landing` and friends tell you **what sections to build**. They do not tell you **what the design should feel like**. Without a felt direction, every scaffold emits the same defaults:

- Inter / system sans, because they're safe.
- A soft purple gradient, because it's the AI default.
- Three feature cards evenly spaced, because grids feel "designed".
- Subtle hover states everywhere, because motion feels "polished".

The result is interchangeable. A user can't tell whether your product landing was made for fintech, a knitting community, or a B2B observability tool.

The stance is the antidote. One direction, executed precisely, beats five directions hedged together.

## What we draw from `frontend-design`

### Commit to an extreme

Bold maximalism and refined minimalism both work. Hedged middle-of-the-road does not. The skill asks the LLM to **pick one direction and execute it**, not to balance options.

### Typography is the first decision

Color trends. Layout trends. Typography is the longest-lasting carrier of voice. A distinctive type pairing does more work than a clever palette.

Avoid the defaults the LLM reaches for unprompted: `Inter`, `Roboto`, `Arial`, `system-ui`, and `Space Grotesk` (over-used as the "AI is trying to look designed" font).

### Dominant color, sharp accent

Even palettes read as charts. Strong designs are 80% one tone, 15% secondary, 5% sharp accent. The accent is committed — saffron, signal red, jade — not pastel-of-everything.

### One memorable detail

Five micro-interactions compete with each other and nothing reads as the hero moment. One well-orchestrated moment (a staggered headline reveal, a custom cursor, a grain overlay) is more memorable than scattered polish.

### Match implementation to vision

Maximalism needs elaborate code. Minimalism needs restraint and precision. The execution must serve the chosen direction, not undermine it with mismatched effort.

## Bosia-specific adaptations

The upstream `frontend-design` is framework-agnostic and shows React/Vue/Motion-library examples. Bosia is opinionated:

| Upstream                          | Bosia substitution                                                        |
| --------------------------------- | ------------------------------------------------------------------------- |
| "Use CSS variables"               | Use Bosia semantic tokens (`bosia-theme-tokens`)                          |
| "Use Motion library for React"    | Use `svelte/transition` + `svelte/motion` + CSS transitions               |
| "Hand-roll components"            | Registry first (`bosia-block-compose`) — hand-roll is the last resort     |
| "Apply distinctive font per file" | Wire fonts in `app.css` `@theme` block; never per-component `font-family` |
| "Pick any palette"                | Start from `theme/neutral` or `theme/editorial`; override `tokens.css`    |
| "React props"                     | Svelte 5 `$props()` (`bosia-svelte-runes`)                                |

## What the gate enforces

`bosia-design-review` will catch the correctness misses (semantic tokens, runes, async coverage). This skill adds:

- A **named direction** in BRIEF.md § Aesthetic.
- A **named memorable detail** present in the emit.
- Fonts wired centrally, not per-component.
- Accent override actually applied in `tokens.css`.

Without those, the emit is "technically correct, aesthetically generic". The skill exists to close that gap.

## Application to Bosia's own UI

Bosapi's login, project list, and editor surfaces also pass through this skill. The builder shipping the AI-default purple gradient while telling users to "commit to a stance" undermines the gate. Bosapi UI must carry its own named direction in its own BRIEF.md.
