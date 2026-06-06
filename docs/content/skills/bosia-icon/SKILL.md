---
name: bosia-icon
description: Use `@lucide/svelte` for icons. Never install `lucide-svelte` (deprecated). Import each icon as a Svelte component — tree-shakes per import.
triggers:
    - icon
    - icons
    - lucide
    - svg icon
    - icon component
    - add icon
od:
    mode: composition
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

# bosia-icon

## What it builds

Any UI that needs an icon — a button glyph, a list-row chevron, an empty-state illustration. Use [`@lucide/svelte`](https://lucide.dev/icons) directly. Bosia does **not** ship a custom `<Icon>` wrapper anymore.

## The one rule

**Always use `@lucide/svelte`. Never install or import `lucide-svelte`.**

The unscoped `lucide-svelte` package is **deprecated**. The scoped `@lucide/svelte` is the supported package and is what every Bosia registry component declares in its `npmDeps`.

```bash
bun add @lucide/svelte
```

Then import each icon by its PascalCase name:

```svelte
<script lang="ts">
	import { ChevronLeft, Search, User } from "@lucide/svelte";
</script>

<ChevronLeft size={18} class="text-muted-foreground" />
<Search size={20} />
<User size={16} />
```

Each import is a tree-shakeable Svelte component. Only what you import ends up in your bundle.

## Common props

| Prop          | Default          | Notes                                             |
| ------------- | ---------------- | ------------------------------------------------- |
| `size`        | `24`             | px or any CSS length                              |
| `color`       | `"currentColor"` | inherits text color by default — usually leave it |
| `strokeWidth` | `2`              | tweak for chunkier/lighter icons                  |
| `class`       | —                | Tailwind classes (size + color utilities work)    |

Any standard SVG attribute is forwarded: `aria-hidden`, `aria-label`, `role`, `focusable`, etc.

## Patterns

### In a Button

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Menu } from "@lucide/svelte";
</script>

<Button variant="ghost" size="icon" aria-label="Open menu">
	<Menu size={18} />
</Button>
```

### Dynamic icon by string key

When the icon name comes from data (nav config, kpi direction, etc.), build a lookup map of components — never resolve by string at runtime.

```svelte
<script lang="ts">
	import { Home, Users, Settings } from "@lucide/svelte";
	import type { Component } from "svelte";

	const icons: Record<string, Component> = {
		home: Home,
		users: Users,
		settings: Settings,
	};

	let { nav }: { nav: Array<{ label: string; icon: string }> } = $props();
</script>

{#each nav as item}
	{@const Icon = icons[item.icon] ?? Home}
	<Icon class="size-4" />
	{item.label}
{/each}
```

### Sizing via Tailwind

Prefer `class="size-4"` (or `size-5`, `size-6`) over passing `size={N}` when you want it to track the design tokens.

## Naming

- The lucide.dev catalog lists icons in kebab-case (e.g. `chevron-left`, `more-horizontal`).
- The Svelte component is PascalCase (`ChevronLeft`, `MoreHorizontal`).
- Browse the full set at [lucide.dev/icons](https://lucide.dev/icons).

## Anti-patterns

- ❌ `import { ChevronLeft } from "lucide-svelte"` — wrong package, deprecated.
- ❌ Adding `@lucide/svelte` to `packages/bosia` deps — framework deps stay minimal; the consuming app or registry component declares it.
- ❌ Re-introducing a custom `<Icon name="..."` wrapper — adds friction without removing any duplication.
- ❌ Inlining `<svg viewBox="...">...</svg>` for a glyph that exists in lucide — duplicates work and drifts from the design system.

## Example

See `example.svelte` for a small composition with three lucide icons in real contexts (button, list row, status pill).
