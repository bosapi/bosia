---
title: Accordion
description: Sekumpulan heading interaktif yang ditumpuk vertikal, masing-masing membuka satu bagian konten.
demo: AccordionDemo
---

```bash
bun x bosia@latest add accordion
```

Komponen majemuk untuk mengecilkan bagian konten. Dibangun di atas trigger `aria-expanded` yang tersambung ke panel `role="region"`, dengan navigasi tombol panah roving dan dukungan mode buka-tunggal atau buka-banyak.

## Preview

## Props Accordion

| Prop          | Type                     | Default    |
| ------------- | ------------------------ | ---------- |
| `type`        | `"single" \| "multiple"` | `"single"` |
| `value`       | `string \| string[]`     | `""`/`[]`  |
| `collapsible` | `boolean`                | `false`    |
| `disabled`    | `boolean`                | `false`    |
| `class`       | `string`                 | `""`       |

`value` bersifat `$bindable()`. Dalam mode `single` ia berupa `string`; dalam mode `multiple` ia berupa `string[]`. `collapsible` hanya berlaku saat `type="single"` — saat true, mengklik item yang terbuka akan menutupnya.

## Props AccordionItem

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | —       |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

## Props AccordionTrigger

| Prop    | Type                         | Default |
| ------- | ---------------------------- | ------- |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     |
| `class` | `string`                     | `""`    |

`level` menetapkan elemen heading semantik (`<h1>`–`<h6>`) yang membungkus tombol trigger, sesuai pola accordion WAI-ARIA.

## Props AccordionContent

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent,
	} from "$lib/components/ui/accordion";

	let value = $state("item-1");
</script>

<Accordion type="single" collapsible bind:value>
	<AccordionItem value="item-1">
		<AccordionTrigger>Is it accessible?</AccordionTrigger>
		<AccordionContent>Yes. It ships with full keyboard navigation.</AccordionContent>
	</AccordionItem>
	<AccordionItem value="item-2">
		<AccordionTrigger>Is it styled?</AccordionTrigger>
		<AccordionContent>Yes. It matches the rest of the registry.</AccordionContent>
	</AccordionItem>
</Accordion>
```

## Banyak Terbuka

```svelte
<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent,
	} from "$lib/components/ui/accordion";

	let value = $state<string[]>(["a"]);
</script>

<Accordion type="multiple" bind:value>
	<AccordionItem value="a">
		<AccordionTrigger>Section A</AccordionTrigger>
		<AccordionContent>A content.</AccordionContent>
	</AccordionItem>
	<AccordionItem value="b">
		<AccordionTrigger>Section B</AccordionTrigger>
		<AccordionContent>B content.</AccordionContent>
	</AccordionItem>
</Accordion>
```

## Item Nonaktif

```svelte
<Accordion type="single" collapsible>
	<AccordionItem value="a">
		<AccordionTrigger>Enabled</AccordionTrigger>
		<AccordionContent>Open me.</AccordionContent>
	</AccordionItem>
	<AccordionItem value="b" disabled>
		<AccordionTrigger>Disabled</AccordionTrigger>
		<AccordionContent>Never shown.</AccordionContent>
	</AccordionItem>
</Accordion>
```

## Navigasi Keyboard

| Tombol          | Aksi                               |
| --------------- | ---------------------------------- |
| `ArrowDown`     | Pindah fokus ke trigger berikutnya |
| `ArrowUp`       | Pindah fokus ke trigger sebelumnya |
| `Home`          | Pindah fokus ke trigger pertama    |
| `End`           | Pindah fokus ke trigger terakhir   |
| `Space`/`Enter` | Toggle item yang difokuskan        |
