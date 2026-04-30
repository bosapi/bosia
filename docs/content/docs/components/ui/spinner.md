---
title: Spinner
description: An animated loading indicator.
demo: SpinnerDemo
---

```bash
bosia add spinner
```

A simple animated loading indicator. Renders an SVG with `role="status"` and `aria-label="Loading"` by default. Size and color are controlled entirely through Tailwind utility classes.

## Preview

## Props

| Prop         | Type     | Default     |
| ------------ | -------- | ----------- |
| `class`      | `string` | `""`        |
| `aria-label` | `string` | `"Loading"` |
| `role`       | `string` | `"status"`  |

All additional attributes are forwarded to the root `<svg>`.

## Usage

```svelte
<script lang="ts">
	import { Spinner } from "$lib/components/ui/spinner";
</script>

<Spinner />
```

## Sizing

Control the size with Tailwind `size-*` utilities.

```svelte
<Spinner class="size-4" />
<Spinner class="size-6" />
<Spinner class="size-8" />
```

## Color

Control the color with Tailwind `text-*` utilities. The SVG uses `stroke="currentColor"`.

```svelte
<Spinner class="text-primary" />
<Spinner class="text-destructive" />
<Spinner class="text-muted-foreground" />
```

## Loading Button

Combine with a disabled `Button` to show a loading state.

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Spinner } from "$lib/components/ui/spinner";
</script>

<Button disabled class="gap-2">
	<Spinner aria-hidden="true" />
	Loading...
</Button>
```

## Accessibility

- Default `role="status"` announces the element as a live region for assistive tech.
- Default `aria-label="Loading"` provides an accessible name; override for more specific context (e.g. `aria-label="Saving changes"`).
- When the spinner sits alongside visible loading text (e.g. inside a button), mark it decorative with `aria-hidden="true"` to prevent screen readers from announcing "Loading" twice.
