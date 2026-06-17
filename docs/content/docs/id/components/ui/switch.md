---
title: Switch
description: Kontrol toggle switch untuk state on/off.
demo: SwitchDemo
---

```bash
bun x bosia@latest add switch
```

Toggle switch yang dibangun di atas `<button>` native dengan `role="switch"`, menampilkan track berbentuk pil dengan thumb yang meluncur.

## Preview

## Props

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `checked`  | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `id`       | `string`  | —       |
| `name`     | `string`  | —       |
| `value`    | `string`  | —       |
| `class`    | `string`  | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import { Switch } from "$lib/components/ui/switch";
	let enabled = $state(false);
</script>

<Switch bind:checked={enabled} />
```

## Dengan Label

```svelte
<script lang="ts">
	import { Switch } from "$lib/components/ui/switch";
	import { Label } from "$lib/components/ui/label";
</script>

<div class="flex items-center gap-2">
	<Switch id="airplane" />
	<Label for="airplane">Airplane Mode</Label>
</div>
```

## Nonaktif

```svelte
<Switch disabled checked />
```

## Penggunaan Form

Saat prop `name` diberikan, sebuah `<input type="checkbox">` tersembunyi dirender untuk pengiriman form native.

```svelte
<form method="POST">
	<Switch name="notifications" value="yes" />
	<button type="submit">Save</button>
</form>
```
