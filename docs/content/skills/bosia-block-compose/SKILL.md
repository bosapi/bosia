---
name: bosia-block-compose
description: Registry-first composition — call `list_registry()`, prefer blocks over hand-rolling. If no block fits, compose from `ui/*` primitives before writing custom DOM.
triggers:
  - new section
  - hero
  - feature grid
  - pricing card
  - data table
od:
  mode: convention
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

# bosia-block-compose

## What it builds

UI assembled from registry items first, hand-written DOM second. Visual consistency is a consequence of using shared primitives.

## When to use

Every UI emit. Before writing `<div class="…">`, ask: "is there a block or component for this?"

## Rules

### R1 — Call `list_registry()` first

Bosia ships a registry of blocks (composed sections), components (primitives), themes, and features. Always discover first:

```ts
// Pseudocode of what the LLM-side tool does
const reg = await list_registry();
// reg.blocks  → e.g. ['cards/feature']
// reg.components → ['ui/button', 'ui/card', …]
// reg.themes  → ['neutral', 'editorial']
// reg.feats   → ['drizzle', 'auth', 'shop']
```

### R2 — Prefer blocks over primitives

If a **block** (e.g. `blocks/cards/feature`) matches the section you're building → install it:

```bash
bosia add block cards/feature
```

Then compose. Don't reinvent.

### R3 — If no block fits, use `ui/*` primitives

Compose `ui/card`, `ui/button`, `ui/badge`, `ui/typography`, etc. Install the ones you need:

```bash
bosia add ui/card ui/button ui/badge
```

### R4 — Only write custom DOM when no primitive fits

And when you do: still use semantic tokens (`bosia-theme-tokens`) and snippet patterns (`bosia-svelte-runes`).

### R5 — Declare `bosia.requires` in skill frontmatter

When you write a page-scaffold or flow skill, list exact registry items in `bosia.requires.{blocks,themes,components,feats}`. This becomes the install manifest.

### R6 — `bosia add` is the install verb

Don't paste components inline. Install via the CLI so:

- the registry version is recorded,
- shared dependencies dedupe,
- updates flow through one command.

### R7 — Navbar chrome lives in the layout, not in page blocks

Non-navbar blocks (heros, cards, auth, storefront sections) must **not** contain a `<header>`/`<nav>`
site navbar. The navbar/footer/sidebar belong in `+layout.svelte` — one place, never per page (see
[[bosia-page-shell]] R1). Install a [[bosia-navbars]] block into the layout instead. A page block that
ships its own navbar plus a navbar block in the layout renders two stacked navbars that conflict.

## Workflow

1. Read user intent. Identify sections (hero, features, pricing, data table…).
2. `list_registry()` → find matching blocks first.
3. For each section without a block → identify `ui/*` primitives that compose it.
4. `bosia add <items…>` for everything new — **1–3 components per call**, multiple calls if you need more. Blocks install one at a time (`bosia_add_block`). Big batches stall the streaming response and surface as "Load failed" to the user.
5. Compose. Decorate with semantic tokens.
6. Skip the "I'll write my own card div" instinct.

## Anti-patterns

- `<div class="rounded-lg border p-6 …">` reimplementing `ui/card`.
- Hand-rolled `<button class="bg-primary …">` instead of `ui/button`.
- Copy-pasting block source into a route instead of `bosia add`.
- Skipping `list_registry()` because "I know what's there."

## Checklist gate

P0:

- [ ] `list_registry()` was called before writing UI.
- [ ] Every needed item is `bosia add`-installed (not pasted).
- [ ] Custom DOM exists only where no primitive matched.

P1:

- [ ] Skill frontmatter declares the exact `bosia.requires` set.
- [ ] No re-implementation of an installed primitive (e.g. a hand-rolled card next to `ui/card`).

## References

- `references/design-principles.md` — registry-first composition rationale, open-design lineage.
