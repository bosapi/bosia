---
name: bosia-inspector-edit
description: Surgical edits driven by `[Inspector] file:line — comment` overlay messages. Read the target file at the named line, scope edit to that node, use `fs_edit` not full rewrite.
triggers:
    - inspector
    - overlay comment
    - file:line edit
    - point edit
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

Bosia's dev overlay (`bosia/packages/bosia/src/core/plugins/inspector/index.ts`) emits messages of the shape:

```
[Inspector] src/routes/(public)/+page.svelte:42 — make this button red
```

- **File** — workspace-relative path.
- **Line** — 1-indexed, points at the opening tag of the element clicked.
- **Comment** — natural-language change request.

## Workflow

1. **Parse the message.** Extract `file`, `line`, `comment`.
2. **Read the file at that line.** Read a window — `line - 5` … `line + 30` — enough to see the element and immediate context.
3. **Identify the node.** Match opening tag at `line`. Walk to its closing tag (or self-close).
4. **Scope the edit.** Compute the smallest substring that contains the change.
5. **Apply via `fs_edit`** — never full rewrite. The user's surrounding code stays byte-identical.
6. **Run convention checks** — `bosia-svelte-runes`, `bosia-theme-tokens`. If the request asks for a raw color ("make it red"), translate to a semantic role (`text-destructive`, `bg-destructive`).

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

If the element at `line` doesn't match the comment ("make this button red" but `line` points at a `<div>`), scan ±5 lines for the nearest matching element. If still no match, ask the user to re-click.

### R4 — Multiple inspector messages in one turn

Apply each in order. Re-read the file before each edit (offsets may have shifted).

### R5 — Style-only changes go on the element, not in `<style>`

Tailwind classes on the element. Don't introduce scoped `<style>` blocks for one-off changes.

## Checklist gate

P0:

- [ ] Edit scoped to the named element (no nearby code touched).
- [ ] Used `fs_edit`, not full file rewrite.
- [ ] Translated raw colors → semantic tokens.
- [ ] Re-ran `bosia-design-review` against the edited element.

P1:

- [ ] No reformat / no incidental cleanup.
- [ ] If multiple inspector messages: file re-read between each.
