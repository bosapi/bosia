---
title: Dropdown Menu
description: A context-managed dropdown menu with trigger, content, items, and separator.
demo: DropdownMenuDemo
---

```bash
bosia add dropdown-menu
```

A context-managed dropdown with trigger, content, items, and separator. Handles click-outside and Escape to close.

## Preview

## Props

### DropdownMenuContent

| Prop    | Type                                    | Default |
| ------- | --------------------------------------- | ------- |
| `align` | `"start"` \| `"end"` \| `"center"`     | `"end"` |
| `class` | `string`                                | `""`    |

## Sub-components

- `DropdownMenu` — root wrapper, manages open state
- `DropdownMenuTrigger` — button that toggles the menu
- `DropdownMenuContent` — the popup panel (`align`: `"start"` | `"end"` | `"center"`)
- `DropdownMenuItem` — individual menu action
- `DropdownMenuSeparator` — divider between items

## Usage

```svelte
<script lang="ts">
  import {
    DropdownMenu, DropdownMenuTrigger,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator
  } from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
</script>

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onclick={() => console.log("edit")}>
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onclick={() => console.log("copy")}>
      Copy
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onclick={() => console.log("delete")}>
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Alignment

```svelte
<!-- Align to the left -->
<DropdownMenuContent align="start">...</DropdownMenuContent>

<!-- Centered -->
<DropdownMenuContent align="center">...</DropdownMenuContent>
```

## Controlled Open State

```svelte
<script lang="ts">
  let open = $state(false);
</script>

<DropdownMenu bind:open>
  ...
</DropdownMenu>

<p>Menu is {open ? "open" : "closed"}</p>
```
