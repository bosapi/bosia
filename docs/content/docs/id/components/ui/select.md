---
title: Select
description: Komponen select dropdown untuk pemilihan satu nilai.
demo: SelectDemo
---

```bash
bun x bosia@latest add select
```

Komponen select majemuk yang dibangun di atas `role="combobox"` / `role="listbox"` dengan navigasi keyboard, grup, label, separator, dan input tersembunyi untuk pengiriman form.

## Preview

## Props Select

| Prop       | Type      | Default                |
| ---------- | --------- | ---------------------- |
| `value`    | `string`  | `undefined` (bindable) |
| `name`     | `string`  | —                      |
| `disabled` | `boolean` | `false`                |
| `required` | `boolean` | `false`                |
| `class`    | `string`  | `""`                   |

## Props SelectTrigger

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Props SelectValue

| Prop          | Type     | Default              |
| ------------- | -------- | -------------------- |
| `placeholder` | `string` | `"Select an option"` |
| `class`       | `string` | `""`                 |

## Props SelectContent

| Prop    | Type                               | Default   |
| ------- | ---------------------------------- | --------- |
| `align` | `"start"` \| `"end"` \| `"center"` | `"start"` |
| `class` | `string`                           | `""`      |

## Props SelectItem

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | wajib   |
| `label`    | `string`  | —       |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import {
		Select,
		SelectTrigger,
		SelectValue,
		SelectContent,
		SelectItem,
	} from "$lib/components/ui/select";

	let value = $state("apple");
</script>

<Select bind:value>
	<SelectTrigger class="w-[200px]">
		<SelectValue placeholder="Pick a fruit" />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value="apple" label="Apple" />
		<SelectItem value="banana" label="Banana" />
		<SelectItem value="mango" label="Mango" />
	</SelectContent>
</Select>
```

## Grup & Label

Gunakan `SelectGroup` dan `SelectLabel` untuk menata item ke dalam bagian.

```svelte
<SelectContent>
	<SelectGroup>
		<SelectLabel>Fruits</SelectLabel>
		<SelectItem value="apple" label="Apple" />
		<SelectItem value="banana" label="Banana" />
	</SelectGroup>
	<SelectSeparator />
	<SelectGroup>
		<SelectLabel>Vegetables</SelectLabel>
		<SelectItem value="carrot" label="Carrot" />
	</SelectGroup>
</SelectContent>
```

## Nonaktif

Nonaktifkan seluruh select atau item individual.

```svelte
<!-- Disable the whole select -->
<Select disabled value="apple">
	<SelectTrigger class="w-[200px]">
		<SelectValue />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value="apple" label="Apple" />
	</SelectContent>
</Select>

<!-- Disable one item -->
<SelectContent>
	<SelectItem value="apple" label="Apple" />
	<SelectItem value="banana" label="Banana" disabled />
</SelectContent>
```

## Penggunaan Form

Saat prop `name` diberikan, sebuah `<input>` tersembunyi dirender untuk pengiriman form native.

```svelte
<form method="POST">
	<Select name="fruit" value="apple">
		<SelectTrigger class="w-[200px]">
			<SelectValue />
		</SelectTrigger>
		<SelectContent>
			<SelectItem value="apple" label="Apple" />
			<SelectItem value="banana" label="Banana" />
		</SelectContent>
	</Select>
	<button type="submit">Submit</button>
</form>
```

## Navigasi Keyboard

| Tombol                  | Aksi                       |
| ----------------------- | -------------------------- |
| `ArrowDown` / `ArrowUp` | Pindahkan fokus antar item |
| `Enter` / `Space`       | Pilih item yang difokuskan |
| `Escape`                | Tutup dropdown             |
