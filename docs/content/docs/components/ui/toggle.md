---
title: Toggle
description: A two-state button that can be toggled on or off.
demo: ToggleDemo
---

```bash
bosia add toggle
```

A two-state button built on a native `<button>` with `aria-pressed`, used for toolbar actions like bold, italic, or view toggles. Distinct from Switch, which is a form control.

## Preview

## Props

| Prop       | Type                            | Default     |
| ---------- | ------------------------------- | ----------- |
| `pressed`  | `boolean`                       | `false`     |
| `variant`  | `"default"` \| `"outline"`      | `"default"` |
| `size`     | `"default"` \| `"sm"` \| `"lg"` | `"default"` |
| `disabled` | `boolean`                       | `false`     |
| `class`    | `string`                        | `""`        |

## Usage

```svelte
<script lang="ts">
	import { Toggle } from "$lib/components/ui/toggle";
	let bold = $state(false);
</script>

<Toggle bind:pressed={bold} aria-label="Toggle bold">
	<b>B</b>
</Toggle>
```

## Outline Variant

```svelte
<Toggle variant="outline" aria-label="Toggle italic">
	<i>I</i>
</Toggle>
```

## With Text

```svelte
<Toggle aria-label="Toggle italic">
	<i>I</i>
	Italic
</Toggle>
```

## Sizes

```svelte
<Toggle size="sm">S</Toggle>
<Toggle>M</Toggle>
<Toggle size="lg">L</Toggle>
```

## Disabled

```svelte
<Toggle disabled>B</Toggle>
```
