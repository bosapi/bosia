---
title: Icon
description: SVG icons powered by Lucide — zero dependencies, just copy-paste SVG paths.
demo: IconGrid
---

```bash
bosia add icon
```

50+ Lucide icons built-in, with zero npm dependencies. Icons are stored as raw SVG strings in `icons.ts` — add more by copying from [lucide.dev](https://lucide.dev/icons).

## Preview

## Props

| Prop   | Type       | Default |
| ------ | ---------- | ------- |
| `name` | `IconName` | —       |
| `size` | `number`   | `18`    |

## Usage

```svelte
<script lang="ts">
	import { Icon } from "$lib/components/ui/icon";
</script>

<Icon name="home" />
<Icon name="search" size={24} />
<Icon name="settings" size={16} />
```

## With Button

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Icon } from "$lib/components/ui/icon";
</script>

<Button variant="ghost" size="icon">
	<Icon name="menu" />
</Button>
```

## Adding Icons

Open `icons.ts` and add entries from [lucide.dev](https://lucide.dev/icons):

1. Find the icon on lucide.dev
2. View the SVG source
3. Copy everything inside `<svg>...</svg>`
4. Add it to the `icons` map

```ts
// icons.ts
export const icons = {
	// ... existing icons
	"my-icon": `<path d="M..." /><circle cx="12" cy="12" r="3"/>`,
};
```

## Available Icons

Click any icon to copy its name to clipboard.
