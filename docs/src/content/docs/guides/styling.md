---
title: Styling
description: Built-in Tailwind CSS v4 with shadcn-inspired design tokens and dark mode.
---

## Tailwind CSS v4

Tailwind CSS v4 is built into Bosbun — no installation or configuration needed. It's compiled at build time by `@tailwindcss/cli`.

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

| Token          | Usage                          |
| -------------- | ------------------------------ |
| `background`   | Page background                |
| `foreground`   | Default text color             |
| `primary`      | Buttons, links, accents        |
| `secondary`    | Secondary actions              |
| `muted`        | Subtle backgrounds, disabled   |
| `accent`       | Hover states, highlights       |
| `destructive`  | Delete buttons, errors         |
| `card`         | Card backgrounds               |
| `border`       | Border colors                  |
| `input`        | Input borders                  |
| `ring`         | Focus rings                    |

Use them with Tailwind classes:

```svelte
<div class="bg-background text-foreground">
  <button class="bg-primary text-primary-foreground rounded-md px-4 py-2">
    Click me
  </button>
  <p class="text-muted-foreground">Subtle text</p>
</div>
```

## Dark Mode

Dark mode is activated by adding the `.dark` class to a parent element. All design tokens have dark-mode variants defined in `app.css`:

```css
.dark {
  --color-background: oklch(0.145 0 0);
  --color-foreground: oklch(0.985 0 0);
  /* ... dark variants */
}
```

Toggle it in your layout:

```svelte
<script>
  let dark = $state(false);
</script>

<div class={dark ? "dark" : ""}>
  <button onclick={() => dark = !dark}>Toggle theme</button>
  <slot />
</div>
```

## cn() Utility

The `cn()` function combines [clsx](https://github.com/lukeed/clsx) and [tailwind-merge](https://github.com/dcastil/tailwind-merge) to safely merge Tailwind classes:

```ts
import { cn } from "$lib/utils";
// or: import { cn } from "bosbun";

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
