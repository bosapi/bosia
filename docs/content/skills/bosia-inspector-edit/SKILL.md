---
name: bosia-inspector-edit
description: Surgical edits driven by Bosia Inspector payloads. Read the labeled `[Inspector]` context block (url / pageFile / component / text / tree) and default to the `pageFile` (page/layout) rather than the shared `component` leaf. Use `fs_edit`, never full rewrite.
triggers:
  - inspector
  - overlay comment
  - file:line edit
  - point edit
  - inspector context
  - pageFile
  - call-site chain
od:
  mode: composition
  category: framework
bosia:
  design: false
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: []
---

# bosia-inspector-edit

A precise, scoped edit to the one element the user clicked in the Inspector overlay. Edit THAT element, not surrounding code.

## The Inspector payload

The dev overlay hands off a JSON payload `{ file, line, col, comment }`:

- `file`/`line`/`col` — workspace-relative path to the LEAF element (the actual `<button>`/`<div>`), 1-indexed, opening tag.
- `comment` — a `[Inspector]` context block, then a `\n---\n` separator, then the user's request. Split on the first `\n---\n`: above = context, below = request. Context fields (each may be omitted — never assume present):
  - `url` — page URL clicked → which record is rendered (maps "the product name" to a specific entity).
  - `pageFile` — nearest `+page.svelte`/`+layout.svelte` in the render chain, `:line:col`. Where data originates and flows down as props. **Default edit target.**
  - `component` — leaf `data-bosia-loc` (the shared component the element lives in). Omitted when the element sits directly in the page.
  - `text` — the clicked element's own direct text (capped). Disambiguates which element.
  - `tree` — full user-code call-site chain outer→leaf, framework frames stripped.

## Choosing the target

The leaf `component` is usually a SHARED definition (`Button.svelte`, `product-options/block.svelte`) — editing it ripples to every caller. **Default = `pageFile`** (the page/layout, where the bound data lives). Edit the leaf `component` only when the request is clearly about the shared component itself.

- "this button/card", "change the product name", style-only one-off ("make it red/bigger"), behavior on one instance → `pageFile` (pass a prop, edit bound data, add a Tailwind class on the `<Component>` invocation, or wrap locally).
- "make ALL buttons…", "globally", "the component", "default size should be larger" → `component`.
- No `pageFile` / no context block → edit the JSON `file:line:col` (no ambiguity).
- Ambiguous request → reply with two concrete options before editing (R3, R7).

## Workflow

1. Parse payload; if `comment` starts with `[Inspector]`, split on first `\n---\n`.
2. Pick the target per above. With a context block present, default `pageFile`.
3. Read the target file around the target line (window `line-5`…`line+30`). For data-bound text, also check the page's `+page.server.ts`/loader where the value originates.
4. Match the opening tag at `line`; walk to its close.
5. Apply the smallest substring change via `fs_edit` — never a full rewrite; surrounding code stays byte-identical.
6. Run convention checks (bosia-svelte-runes, bosia-theme-tokens). Translate raw colors → semantic roles.

## Vague comment → concrete change

"make it red" → `text-destructive`/`bg-destructive`; "bigger" → bump size one step; "bold" → `font-semibold`; "add space" → bump padding/gap one step; "center" → `mx-auto`/`text-center`; "move to top" → reorder within parent (no absolute positioning). Ambiguous ("make it nicer") → offer two options.

## Rules

R1 — Respect conventions: semantic tokens (bosia-theme-tokens), Runes idioms (bosia-svelte-runes), no raw colors even when the user says "red".

R2 — Surround context is sacred: never reformat, reorder unrelated lines, or "fix while you're there".

R3 — When the line is wrong: if the element at the target line doesn't match the request, scan ±5 lines (the `text` field confirms the node). Still no match → fall back to the next `tree` entry toward the leaf. Neither resolves → ask the user to re-click.

R4 — Multiple inspector messages in one turn: apply in order, re-read the file before each (offsets shift).

R5 — Style-only changes: Tailwind classes on the element, not a scoped `<style>` block.

R6 — Don't edit shared components by default: prefer `pageFile` (prop/class/bound data/wrap). Edit the `component` leaf only when unambiguously about the component. If it lacks a `class`/`className` prop, do the local wrap first and flag prop-plumbing as follow-up rather than changing the public API.

R7 — Confirm before changing the leaf: if you edit the `component` leaf instead of `pageFile`, state that decision in one sentence up front ("Editing `Button.svelte` because the request says 'all buttons'").

## Checklist gate

P0:

- [ ] Parsed the `[Inspector]` block (split on `---`); picked `pageFile` for one-off requests.
- [ ] Edit scoped to the named element (no nearby code touched).
- [ ] Used `fs_edit`, not a rewrite.
- [ ] Raw colors → semantic tokens.
- [ ] Re-ran bosia-design-review against the edited element.

P1:

- [ ] No reformat / incidental cleanup.
- [ ] Multiple messages: file re-read between each.
- [ ] Leaf-targeted instead of call-site: one-sentence justification up front (R7).
