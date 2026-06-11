---
title: Styling
description: Built-in Tailwind CSS v4 with shadcn-inspired design tokens and dark mode.
---

## Tailwind CSS v4

Tailwind CSS v4 is built into Bosia — no installation or configuration needed. It's compiled at build time by `@tailwindcss/cli`.

Your global styles live in `src/app.css`:

```css
@import "tailwindcss";

@theme {
	--color-background: oklch(1 0 0);
	--color-foreground: oklch(0.145 0 0);
	--color-primary: oklch(0.205 0.064 286.3);
	--color-primary-foreground: oklch(0.985 0 0);
	/* ... more tokens */
}
```

## Design Tokens

The default template includes **shadcn-inspired semantic tokens** for a consistent design system:

| Token         | Usage                        |
| ------------- | ---------------------------- |
| `background`  | Page background              |
| `foreground`  | Default text color           |
| `primary`     | Buttons, links, accents      |
| `secondary`   | Secondary actions            |
| `muted`       | Subtle backgrounds, disabled |
| `accent`      | Hover states, highlights     |
| `destructive` | Delete buttons, errors       |
| `card`        | Card backgrounds             |
| `border`      | Border colors                |
| `input`       | Input borders                |
| `ring`        | Focus rings                  |

Use them with Tailwind classes:

```svelte
<div class="bg-background text-foreground">
	<button class="bg-primary text-primary-foreground rounded-md px-4 py-2"> Click me </button>
	<p class="text-muted-foreground">Subtle text</p>
</div>
```

## Dark Mode

Dark mode is activated by adding the `.dark` class to `<html>`. All design tokens have dark-mode variants defined in `app.css`:

```css
.dark {
	--color-background: oklch(0.145 0 0);
	--color-foreground: oklch(0.985 0 0);
	/* ... dark variants */
}
```

### Three modes: Light, Dark, System

The theme is stored in `localStorage` under the `theme` key with one of three values:

| Value      | Behavior                                      |
| ---------- | --------------------------------------------- |
| `"light"`  | Always light                                  |
| `"dark"`   | Always dark                                   |
| `"system"` | Follows the OS `prefers-color-scheme` setting |

A **missing key is treated as `system`**, so apps follow the OS preference by default. Bosia injects a small inline bootstrap script before paint that reads this value and sets `.dark` accordingly, so there is no flash of the wrong theme (FOUC).

The effective theme is dark when:

```js
mode === "dark" ||
	((mode === "system" || mode == null) && matchMedia("(prefers-color-scheme: dark)").matches);
```

### Cycle toggle

A toggle button cycles through the three modes (Light → Dark → System) and persists the choice. While in `system` mode it also reacts to live OS theme changes:

```svelte
<script lang="ts">
	type ThemeMode = "light" | "dark" | "system";
	const ORDER: ThemeMode[] = ["light", "dark", "system"];
	let mode = $state<ThemeMode>("system");

	function applyTheme(m: ThemeMode) {
		const dark =
			m === "dark" || (m === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
		document.documentElement.classList.toggle("dark", dark);
	}

	// restore the saved choice once
	$effect(() => {
		const stored = localStorage.getItem("theme") as ThemeMode | null;
		if (stored) mode = stored;
	});

	// follow live OS changes while in system mode
	$effect(() => {
		if (mode !== "system") return;
		const mq = matchMedia("(prefers-color-scheme: dark)");
		const handler = () => applyTheme("system");
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	});

	function cycleTheme() {
		mode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
		localStorage.setItem("theme", mode);
		applyTheme(mode);
	}
</script>

<button onclick={cycleTheme}>Theme: {mode}</button>
```

The bundled `navbar` component ships this toggle ready to use.

## cn() Utility

The `cn()` function uses built-in class merging and [tailwind-merge](https://github.com/dcastil/tailwind-merge) to safely merge Tailwind classes:

```ts
import { cn } from "$lib/utils";
// or: import { cn } from "bosia";

cn("px-4 py-2", "px-6");
// → "py-2 px-6" (px-4 removed, px-6 wins)

cn("text-red-500", isActive && "text-blue-500", className);
// → conditionally applies classes, merges conflicts
```

This is especially useful when building reusable components that accept a `class` prop:

```svelte
<script lang="ts">
	import { cn } from "$lib/utils";
	let { class: className, ...props } = $props();
</script>

<button class={cn("bg-primary text-white rounded px-4 py-2", className)} {...props}>
	<slot />
</button>
```
