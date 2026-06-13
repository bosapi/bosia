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

## What it builds

A precise, scoped edit to the DOM/Svelte element identified by an Inspector overlay click. The user pointed at one element and asked for one change; we edit _that_ element, not surrounding code.

## The Inspector contract

Bosia's dev overlay (`bosia/packages/bosia/src/core/plugins/inspector/index.ts`) hands off via `aiEndpoint` with a JSON payload:

```json
{
	"file": "src/lib/blocks/storefront/product-options/block.svelte",
	"line": 37,
	"col": 2,
	"comment": "[Inspector]\nurl:       http://localhost:5173/katalog/kemeja-batik\npageFile:  src/routes/(public)/katalog/[slug]/+page.svelte:69:6\ncomponent: src/lib/blocks/storefront/product-options/block.svelte:37:2\ntext:      \"Kemeja Batik Premium\"\ntree:      src/routes/(public)/katalog/[slug]/+page.svelte:69:6 → src/lib/blocks/storefront/product-options/block.svelte:37:2\n---\nchange the product name"
}
```

- **`file` / `line` / `col`** — workspace-relative path to the **leaf element** (the actual `<button>` / `<div>` / etc.). 1-indexed line, points at the opening tag.
- **`comment`** — a labeled `[Inspector]` context block, then a `---` separator line, then the user's natural-language request. Parse it by splitting on the first `\n---\n`: everything above is context, everything below is the request. The context block carries these labeled fields (each may be omitted — never assume a field is present):
  - **`url`** — the page URL clicked (`location.href`). Tells you _which record_ is rendered (e.g. the `kemeja-batik` slug), so "change the product name" maps to a specific entity, not a guess.
  - **`pageFile`** — the nearest `+page.svelte` / `+layout.svelte` in the render chain, with `:line:col`. This is where the data usually originates (the page or its `+page.server.ts`) and flows _down_ into components as props. **This is the default edit target.**
  - **`component`** — the leaf `data-bosia-loc` (the shared component the element lives in). Omitted when the element sits directly in the page (then `pageFile` == leaf).
  - **`text`** — the clicked element's own direct text, collapsed and capped (omitted when it has none). Use it to disambiguate which element on the page.
  - **`tree`** — the full user-code call-site chain, outer→leaf, framework frames stripped. Omitted when only one frame remains.

### Choosing the right target file

`pageFile` and `component` matter because the leaf `component` is usually a **shared definition** (e.g. `product-options/block.svelte`, `Button.svelte`), and editing it ripples to every caller. The page that rendered it — and where the bound data lives — is almost always what the user meant.

**Default target = `pageFile`** (the page or layout). Because data originates in the page and flows down as props, "change the product name" almost always means edit the page (or its loader), not the leaf component that merely renders the prop. Edit the leaf `component` only when the request is clearly about the shared component itself.

| Signal in the request                                                       | Target                                                                |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| "this button", "this card", "this here", "change the product name"          | **`pageFile`** — pass a prop, edit the bound data, or wrap locally    |
| "make all buttons …", "globally", "the component"                           | **`component`** (shared leaf definition)                              |
| Style-only one-off ("make it red", "bigger")                                | **`pageFile`** — add a Tailwind class on the `<Component>` invocation |
| Behavioral change applied to one instance                                   | **`pageFile`** — bind a prop / wrap the call                          |
| Behavioral change to the component itself ("default size should be larger") | **`component`**                                                       |
| No `pageFile` / no context block present                                    | Edit the file in the JSON `file` field — there is no ambiguity        |

If neither signal is present and the request is ambiguous, **reply with two concrete options** before editing (see R3, R6).

## Workflow

1. **Parse the payload.** Extract `file`, `line`, `col`, `comment`. If the comment starts with `[Inspector]`, split on the first `\n---\n`: parse the labeled fields above (`url`, `pageFile`, `component`, `text`, `tree`) and take the user's request from below.
2. **Pick the target.** If `pageFile` is present, default to it (page/layout) — that's where the bound data lives. Re-route to the `component` leaf only when the request explicitly demands it (see the table above). When no context block is present, target is the JSON `file:line:col`.
3. **Read the target file at the target line.** Window — `line - 5` … `line + 30` — enough to see the element and immediate context. If the target is `pageFile`, use its `:line:col` (the `<Component>` invocation or element in the page), not the JSON `file`. For data-bound text changes, also check the page's `+page.server.ts` / loader where the value originates.
4. **Identify the node.** Match opening tag at `line`. Walk to its closing tag (or self-close).
5. **Scope the edit.** Compute the smallest substring that contains the change.
6. **Apply via `fs_edit`** — never full rewrite. The user's surrounding code stays byte-identical.
7. **Run convention checks** — `bosia-svelte-runes`, `bosia-theme-tokens`. If the request asks for a raw color ("make it red"), translate to a semantic role (`text-destructive`, `bg-destructive`).

## Translation: vague comment → concrete change

| Comment          | Translated change                                                         |
| ---------------- | ------------------------------------------------------------------------- |
| "make it red"    | `text-destructive` or `bg-destructive` (destructive role)                 |
| "make it bigger" | bump size class one step (`size-md` → `size-lg`, `text-base` → `text-lg`) |
| "make it bold"   | `font-semibold` (or `font-bold` if already semibold)                      |
| "add some space" | bump padding/gap one step (`p-4` → `p-6`)                                 |
| "center it"      | `mx-auto` + `text-center` as appropriate                                  |
| "move to top"    | reorder within parent, do not introduce absolute positioning              |

If the comment is ambiguous (e.g. "make this nicer"), respond with two concrete options rather than guessing.

## Rules

### R1 — Edit must respect Bosia conventions

- Use semantic tokens (`bosia-theme-tokens`).
- Use Runes idioms (`bosia-svelte-runes`).
- Don't introduce raw colors even when the user says "red".

### R2 — Surround context is sacred

Never reformat the file, never reorder unrelated lines, never "fix while you're there." Inspector edits are surgical.

### R3 — When the line is wrong

If the element at the **target line** doesn't match the request ("make this button red" but the line points at a `<div>`), scan ±5 lines for the nearest matching element — the `text` field helps confirm you're on the right node. If still no match, fall back to the **next entry in `tree`** (one step toward the leaf, e.g. the `component`) and try again. If neither resolves, ask the user to re-click.

### R4 — Multiple inspector messages in one turn

Apply each in order. Re-read the file before each edit (offsets may have shifted).

### R5 — Style-only changes go on the element, not in `<style>`

Tailwind classes on the element. Don't introduce scoped `<style>` blocks for one-off changes.

### R6 — Don't edit shared components by default

The **`component`** leaf is almost always a shared component (`Button.svelte`, `Card.svelte`, a registry primitive). Editing it changes every caller across the app.

- Prefer **`pageFile`** — pass a Tailwind class, set a prop, edit the bound data, wrap the invocation. The change stays local to the page the user was looking at.
- Edit the `component` leaf only when the request is unambiguously about the component itself ("make all buttons rounder", "the default size should be larger", "fix the component's hover state").
- If the component doesn't accept a `class` / `className` prop and the request would require adding one, do the local edit first via a wrapping element with the Tailwind class; flag the prop-plumbing as a follow-up rather than silently changing the component's public API.

### R7 — Confirm before changing the leaf

If you decide to edit the `component` leaf (shared component) instead of `pageFile`, **state that decision in one sentence** at the top of your response before the patch ("Editing `Button.svelte` because the request says 'all buttons'"). The user can interrupt if they meant a one-off.

## Checklist gate

P0:

- [ ] Parsed the `[Inspector]` context block (split on `---`) when present; picked `pageFile` (not the `component` leaf) for one-off requests.
- [ ] Edit scoped to the named element (no nearby code touched).
- [ ] Used `fs_edit`, not full file rewrite.
- [ ] Translated raw colors → semantic tokens.
- [ ] Re-ran `bosia-design-review` against the edited element.

P1:

- [ ] No reformat / no incidental cleanup.
- [ ] If multiple inspector messages: file re-read between each.
- [ ] If leaf-targeted instead of call-site: one-sentence justification stated up front (R7).
