---
title: Input
description: Komponen input teks bergaya.
demo: InputDemo
---

```bash
bun x bosia@latest add input
```

Input teks bergaya dengan value yang bindable.

## Preview

## Props

| Prop          | Type      | Default  |
| ------------- | --------- | -------- |
| `type`        | `string`  | `"text"` |
| `value`       | `string`  | `""`     |
| `placeholder` | `string`  | `""`     |
| `disabled`    | `boolean` | `false`  |
| `id`          | `string`  | —        |
| `name`        | `string`  | —        |

## Penggunaan

```svelte
<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	let search = $state("");
</script>

<Input bind:value={search} placeholder="Search..." />
```

## Dengan Label

```svelte
<label for="email" class="text-sm font-medium">Email</label>
<Input id="email" type="email" placeholder="you@example.com" />
```
