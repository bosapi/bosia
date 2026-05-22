---
name: bosia-inspector-edit
description: Surgical edits driven by Bosia Inspector payloads. Parse the `Component tree (outer → leaf)` chain when present and default to the outermost call-site (page/layout) rather than the shared component definition. Use `fs_edit`, never full rewrite.
triggers:
    - inspector
    - overlay comment
    - file:line edit
    - point edit
    - component tree
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
	"file": "registry/components/ui/button/Button.svelte",
	"line": 5,
	"col": 1,
	"comment": "Component tree (outer → leaf): src/routes/(public)/+page.svelte:42:5 → registry/components/ui/button/Button.svelte:5:1\n\nmake this button red"
}
```

- **`file` / `line` / `col`** — workspace-relative path to the **leaf element** (the actual `<button>` / `<div>` / etc.). 1-indexed line, points at the opening tag.
- **`comment`** — when the clicked element was rendered inside one or more `<Component>` invocations, the comment is **prefixed** with a `Component tree (outer → leaf): A:line:col → B:line:col → … → leaf:line:col\n\n` line. The user's natural-language request follows. If the element was not nested inside any component, the prefix is omitted.

### Choosing the right target file

The chain matters because the leaf is usually a **shared component definition** (e.g. `Button.svelte`), and editing it ripples to every caller. The page where `<Button>` was invoked is almost always what the user meant.

**Default target = outermost entry in the chain** (the page or layout). Edit `Button.svelte` only when the request is clearly about the shared component itself.

| Signal in the comment                                                       | Target                                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| "this button", "this card", "this here"                                     | **Outermost call-site** (page/layout) — pass a prop or wrap locally            |
| "make all buttons …", "globally", "the component"                           | **Leaf** (shared component definition)                                         |
| Style-only one-off ("make it red", "bigger")                                | **Outermost call-site** — add a Tailwind class on the `<Component>` invocation |
| Behavioral change applied to one instance                                   | **Outermost call-site** — bind a prop / wrap the call                          |
| Behavioral change to the component itself ("default size should be larger") | **Leaf**                                                                       |
| No chain present (no `Component tree` prefix)                               | Edit the file in the JSON `file` field — there is no ambiguity                 |

If neither signal is present and the request is ambiguous, **reply with two concrete options** before editing (see R3, R6).

## Workflow

1. **Parse the payload.** Extract `file`, `line`, `col`, `comment`. If the comment starts with `Component tree (outer → leaf): `, split off the prefix line and parse the chain into `[outer, …, leaf]`.
2. **Pick the target.** If a chain is present, default to the **outermost entry** (page/layout). Re-route to a different chain entry only when the request explicitly demands it (see the table above). When no chain is present, target is the JSON `file:line:col`.
3. **Read the target file at the target line.** Window — `line - 5` … `line + 30` — enough to see the element and immediate context. If the target came from the chain, the line refers to the `<Component>` invocation in the parent file, not the JSON `file`.
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

If the element at the **target line** doesn't match the comment ("make this button red" but the line points at a `<div>`), scan ±5 lines for the nearest matching element. If still no match, fall back to the **next entry in the chain** (one step toward the leaf) and try again. If neither resolves, ask the user to re-click.

### R4 — Multiple inspector messages in one turn

Apply each in order. Re-read the file before each edit (offsets may have shifted).

### R5 — Style-only changes go on the element, not in `<style>`

Tailwind classes on the element. Don't introduce scoped `<style>` blocks for one-off changes.

### R6 — Don't edit shared components by default

When the chain is present, the **leaf** is almost always a shared component (`Button.svelte`, `Card.svelte`, a registry primitive). Editing it changes every caller across the app.

- Prefer the **outermost call-site** (top of chain) — pass a Tailwind class, set a prop, wrap the invocation. The change stays local to the page the user was looking at.
- Edit the leaf only when the request is unambiguously about the component itself ("make all buttons rounder", "the default size should be larger", "fix the component's hover state").
- If the component doesn't accept a `class` / `className` prop and the request would require adding one, do the local edit first via a wrapping element with the Tailwind class; flag the prop-plumbing as a follow-up rather than silently changing the component's public API.

### R7 — Confirm before changing the leaf

If you decide to edit the leaf (shared component) instead of the call-site, **state that decision in one sentence** at the top of your response before the patch ("Editing `Button.svelte` because the request says 'all buttons'"). The user can interrupt if they meant a one-off.

## Checklist gate

P0:

- [ ] Parsed the `Component tree` prefix when present; picked the call-site (not the leaf) for one-off requests.
- [ ] Edit scoped to the named element (no nearby code touched).
- [ ] Used `fs_edit`, not full file rewrite.
- [ ] Translated raw colors → semantic tokens.
- [ ] Re-ran `bosia-design-review` against the edited element.

P1:

- [ ] No reformat / no incidental cleanup.
- [ ] If multiple inspector messages: file re-read between each.
- [ ] If leaf-targeted instead of call-site: one-sentence justification stated up front (R7).
