---
title: Toggle Group
description: Sekelompok button toggle di mana satu atau lebih bisa aktif.
demo: ToggleGroupDemo
---

```bash
bun x bosia@latest add toggle-group
```

Sekelompok button toggle untuk interaksi gaya-toolbar. Mendukung pilihan tunggal (seperti grup radio) atau banyak pilihan (seperti checkbox). Dibangun di atas `role="group"` dengan roving tabindex dan navigasi tombol panah.

## Preview

## Props ToggleGroup

| Prop       | Type                            | Default     |
| ---------- | ------------------------------- | ----------- |
| `type`     | `"single"` \| `"multiple"`      | `"single"`  |
| `value`    | `string` \| `string[]`          | `""` / `[]` |
| `variant`  | `"default"` \| `"outline"`      | `"default"` |
| `size`     | `"default"` \| `"sm"` \| `"lg"` | `"default"` |
| `disabled` | `boolean`                       | `false`     |
| `class`    | `string`                        | `""`        |

## Props ToggleGroupItem

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | —       |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

## Penggunaan — Pilihan Tunggal

```svelte
<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from "$lib/components/ui/toggle-group";
	let value = $state("bold");
</script>

<ToggleGroup type="single" bind:value aria-label="Text formatting">
	<ToggleGroupItem value="bold" aria-label="Bold"><b>B</b></ToggleGroupItem>
	<ToggleGroupItem value="italic" aria-label="Italic"><i>I</i></ToggleGroupItem>
	<ToggleGroupItem value="underline" aria-label="Underline"><u>U</u></ToggleGroupItem>
</ToggleGroup>
```

## Penggunaan — Banyak Pilihan

```svelte
<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from "$lib/components/ui/toggle-group";
	let value = $state(["bold", "italic"]);
</script>

<ToggleGroup type="multiple" bind:value aria-label="Text formatting">
	<ToggleGroupItem value="bold" aria-label="Bold"><b>B</b></ToggleGroupItem>
	<ToggleGroupItem value="italic" aria-label="Italic"><i>I</i></ToggleGroupItem>
	<ToggleGroupItem value="underline" aria-label="Underline"><u>U</u></ToggleGroupItem>
</ToggleGroup>
```

## Varian Outline

```svelte
<ToggleGroup type="single" variant="outline" aria-label="Alignment">
	<ToggleGroupItem value="left">Left</ToggleGroupItem>
	<ToggleGroupItem value="center">Center</ToggleGroupItem>
	<ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>
```

## Ukuran

```svelte
<ToggleGroup type="single" size="sm">...</ToggleGroup>
<ToggleGroup type="single">...</ToggleGroup>
<ToggleGroup type="single" size="lg">...</ToggleGroup>
```

## Nonaktif

```svelte
<ToggleGroup type="single" disabled>
	<ToggleGroupItem value="bold"><b>B</b></ToggleGroupItem>
	<ToggleGroupItem value="italic"><i>I</i></ToggleGroupItem>
</ToggleGroup>
```
