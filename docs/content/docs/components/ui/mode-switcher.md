---
title: Mode Switcher
description: A single button that cycles the theme through light, dark, and system, persisted in localStorage.
demo: ModeSwitcherDemo
---

```bash
bun x bosia@latest add mode-switcher
```

A ghost icon button that cycles the color theme through light → dark → system on each click. The choice is saved to `localStorage` under the `theme` key and re-applied on load, so it survives a page refresh. While in system mode it also follows live OS theme changes. The navbar uses this component internally.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Usage

```svelte
<script lang="ts">
	import { ModeSwitcher } from "$lib/components/ui/mode-switcher";
</script>

<ModeSwitcher />
```
