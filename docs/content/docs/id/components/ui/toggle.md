---
title: Toggle
description: Button dua-state yang bisa dinyalakan atau dimatikan.
demo: ToggleDemo
---

```bash
bun x bosia@latest add toggle
```

Button dua-state yang dibangun di atas `<button>` native dengan `aria-pressed`, dipakai untuk aksi toolbar seperti bold, italic, atau toggle tampilan. Berbeda dari Switch, yang merupakan kontrol form.

## Preview

## Props

| Prop       | Type                            | Default     |
| ---------- | ------------------------------- | ----------- |
| `pressed`  | `boolean`                       | `false`     |
| `variant`  | `"default"` \| `"outline"`      | `"default"` |
| `size`     | `"default"` \| `"sm"` \| `"lg"` | `"default"` |
| `disabled` | `boolean`                       | `false`     |
| `class`    | `string`                        | `""`        |

## Penggunaan

```svelte
<script lang="ts">
	import { Toggle } from "$lib/components/ui/toggle";
	let bold = $state(false);
</script>

<Toggle bind:pressed={bold} aria-label="Toggle bold">
	<b>B</b>
</Toggle>
```

## Varian Outline

```svelte
<Toggle variant="outline" aria-label="Toggle italic">
	<i>I</i>
</Toggle>
```

## Dengan Teks

```svelte
<Toggle aria-label="Toggle italic">
	<i>I</i>
	Italic
</Toggle>
```

## Ukuran

```svelte
<Toggle size="sm">S</Toggle>
<Toggle>M</Toggle>
<Toggle size="lg">L</Toggle>
```

## Nonaktif

```svelte
<Toggle disabled>B</Toggle>
```
