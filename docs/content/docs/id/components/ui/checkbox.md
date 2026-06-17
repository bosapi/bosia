---
title: Checkbox
description: Kontrol checkbox untuk menyalakan dan mematikan opsi.
demo: CheckboxDemo
---

```bash
bun x bosia@latest add checkbox
```

Checkbox yang dibangun di atas `<button>` native dengan `role="checkbox"`, mendukung state checked, unchecked, dan indeterminate.

## Preview

## Props

| Prop            | Type      | Default |
| --------------- | --------- | ------- |
| `checked`       | `boolean` | `false` |
| `indeterminate` | `boolean` | `false` |
| `disabled`      | `boolean` | `false` |
| `id`            | `string`  | —       |
| `name`          | `string`  | —       |
| `value`         | `string`  | —       |
| `class`         | `string`  | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import { Checkbox } from "$lib/components/ui/checkbox";
	let accepted = $state(false);
</script>

<Checkbox bind:checked={accepted} />
```

## Dengan Label

```svelte
<script lang="ts">
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Label } from "$lib/components/ui/label";
</script>

<div class="flex items-center gap-2">
	<Checkbox id="terms" />
	<Label for="terms">Accept terms and conditions</Label>
</div>
```

## Nonaktif

```svelte
<Checkbox disabled checked />
```

## Indeterminate

Gunakan prop `indeterminate` untuk menampilkan state campuran (mis. saat checkbox induk mewakili child yang terpilih sebagian).

```svelte
<Checkbox indeterminate />
```

## Penggunaan Form

Saat prop `name` diberikan, sebuah `<input type="checkbox">` tersembunyi dirender untuk pengiriman form native.

```svelte
<form method="POST">
	<Checkbox name="newsletter" value="yes" />
	<button type="submit">Subscribe</button>
</form>
```
