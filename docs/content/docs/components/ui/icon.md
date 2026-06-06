---
title: Icons
description: Use @lucide/svelte for icons — tree-shakeable Svelte components from the Lucide catalog.
---

> **Use `@lucide/svelte` — do not install `lucide-svelte`.** The unscoped `lucide-svelte` package is deprecated. Always reach for the scoped `@lucide/svelte` package.

Bosia does not ship a custom `<Icon>` component. Pull icons directly from [`@lucide/svelte`](https://lucide.dev/icons) — each icon is its own tree-shakeable Svelte component, so only the icons you import end up in your bundle.

## Install

```bash
bun add @lucide/svelte
```

## Usage

Import the icons you need by their PascalCase name:

```svelte
<script lang="ts">
	import { ChevronLeft, Search, Settings } from "@lucide/svelte";
</script>

<ChevronLeft size={18} class="text-muted-foreground" />
<Search size={20} />
<Settings size={16} class="opacity-70" />
```

## Common props

| Prop          | Type               | Default          | Notes                                          |
| ------------- | ------------------ | ---------------- | ---------------------------------------------- |
| `size`        | `number \| string` | `24`             | Width/height in px (or any valid CSS length).  |
| `color`       | `string`           | `"currentColor"` | Stroke color.                                  |
| `strokeWidth` | `number \| string` | `2`              | SVG stroke width.                              |
| `class`       | `string`           | —                | Tailwind classes; supports color + size utils. |

You can also pass any standard SVG attribute (`aria-hidden`, `role`, `focusable`, etc.).

## With Button

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Menu } from "@lucide/svelte";
</script>

<Button variant="ghost" size="icon" aria-label="Open menu">
	<Menu size={18} />
</Button>
```

## Dynamic icons

When the icon name comes from data, build a small lookup map of components — never look up by string at runtime:

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
	{@const Icon = icons[item.icon]}
	<Icon class="size-4" />
	{item.label}
{/each}
```

## Browse the catalog

All available icons (and their names) are at [lucide.dev/icons](https://lucide.dev/icons). The site name is in kebab-case (e.g. `chevron-left`); the Svelte component is PascalCase (`ChevronLeft`).

## Migrating from the old `<Icon>` wrapper

The custom `<Icon name="...">` component has been removed. Replace each usage with a direct lucide import.

Before:

```svelte
<Icon name="chevron-left" size={18} class="text-muted" />
```

After:

```svelte
<script lang="ts">
	import { ChevronLeft } from "@lucide/svelte";
</script>

<ChevronLeft size={18} class="text-muted" />
```

Bosia registry components that needed icons (e.g. `navbar`, `select`, `accordion`) now declare `@lucide/svelte` in their own `npmDeps` and import what they need directly.
