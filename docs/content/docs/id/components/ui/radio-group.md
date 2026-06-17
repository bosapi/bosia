---
title: Radio Group
description: Sekumpulan tombol radio untuk input pilihan tunggal.
demo: RadioGroupDemo
---

```bash
bun x bosia@latest add radio-group
```

Grup radio majemuk yang dibangun di atas elemen `<button role="radio">` dengan navigasi tombol panah, roving tabindex, dan input tersembunyi untuk pengiriman form.

## Preview

## Props RadioGroup

| Prop       | Type      | Default                |
| ---------- | --------- | ---------------------- |
| `value`    | `string`  | `undefined` (bindable) |
| `name`     | `string`  | —                      |
| `disabled` | `boolean` | `false`                |
| `required` | `boolean` | `false`                |
| `class`    | `string`  | `""`                   |

## Props RadioGroupItem

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | wajib   |
| `id`       | `string`  | —       |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
	let selected = $state("option-1");
</script>

<RadioGroup bind:value={selected}>
	<RadioGroupItem value="option-1" />
	<RadioGroupItem value="option-2" />
	<RadioGroupItem value="option-3" />
</RadioGroup>
```

## Dengan Label

```svelte
<script lang="ts">
	import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
	import { Label } from "$lib/components/ui/label";
</script>

<RadioGroup value="comfortable">
	<div class="flex items-center gap-2">
		<RadioGroupItem value="compact" id="compact" />
		<Label for="compact">Compact</Label>
	</div>
	<div class="flex items-center gap-2">
		<RadioGroupItem value="comfortable" id="comfortable" />
		<Label for="comfortable">Comfortable</Label>
	</div>
</RadioGroup>
```

## Nonaktif

Nonaktifkan seluruh grup atau item individual.

```svelte
<!-- Disable all items -->
<RadioGroup disabled value="a">
	<RadioGroupItem value="a" />
	<RadioGroupItem value="b" />
</RadioGroup>

<!-- Disable one item -->
<RadioGroup value="a">
	<RadioGroupItem value="a" />
	<RadioGroupItem value="b" disabled />
</RadioGroup>
```

## Penggunaan Form

Saat prop `name` diberikan pada grup, tiap item merender `<input type="radio">` tersembunyi untuk pengiriman form native.

```svelte
<form method="POST">
	<RadioGroup name="plan" value="pro">
		<RadioGroupItem value="free" />
		<RadioGroupItem value="pro" />
		<RadioGroupItem value="enterprise" />
	</RadioGroup>
	<button type="submit">Continue</button>
</form>
```

## Navigasi Keyboard

| Tombol                     | Aksi                                      |
| -------------------------- | ----------------------------------------- |
| `ArrowDown` / `ArrowRight` | Pindah fokus ke item berikutnya dan pilih |
| `ArrowUp` / `ArrowLeft`    | Pindah fokus ke item sebelumnya dan pilih |
| `Space`                    | Pilih item yang difokuskan                |
| `Tab`                      | Pindahkan fokus masuk/keluar grup radio   |
