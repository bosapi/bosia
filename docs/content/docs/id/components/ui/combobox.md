---
title: Combobox
description: Select yang bisa dicari, dibangun di atas Popover + Command.
demo: ComboboxDemo
---

```bash
bun x bosia@latest add combobox
```

Wrapper praktis yang mengomposisikan `Popover` + `Command` menjadi satu select yang bisa dicari. Tanpa logika dropdown atau filter baru — ia memakai ulang primitif yang ada dan memunculkan API `items` sederhana dengan `bind:value`.

## Preview

## Props

| Prop                | Type                                                                          | Default               |
| ------------------- | ----------------------------------------------------------------------------- | --------------------- |
| `items`             | `{ value: string; label: string; keywords?: string[]; disabled?: boolean }[]` | `[]`                  |
| `value`             | `string \| undefined` (bindable)                                              | `undefined`           |
| `placeholder`       | `string`                                                                      | `"Select item..."`    |
| `searchPlaceholder` | `string`                                                                      | `"Search..."`         |
| `emptyText`         | `string`                                                                      | `"No results found."` |
| `disabled`          | `boolean`                                                                     | `false`               |
| `class`             | `string`                                                                      | `""` (tombol trigger) |
| `contentClass`      | `string`                                                                      | `""` (konten popover) |

`keywords` memperluas kecocokan pencarian untuk sebuah item; item `disabled` tidak bisa dipilih.

## Penggunaan

```svelte
<script lang="ts">
	import { Combobox } from "$lib/components/ui/combobox";

	const frameworks = [
		{ value: "next", label: "Next.js", keywords: ["react"] },
		{ value: "sveltekit", label: "SvelteKit", keywords: ["svelte"] },
		{ value: "nuxt", label: "Nuxt", keywords: ["vue"] },
		{ value: "remix", label: "Remix", keywords: ["react"] },
		{ value: "astro", label: "Astro" },
		{ value: "bosia", label: "Bosia", keywords: ["svelte", "bun"] },
	];

	let value = $state<string | undefined>(undefined);
</script>

<Combobox
	items={frameworks}
	bind:value
	placeholder="Select framework..."
	searchPlaceholder="Search framework..."
	emptyText="No framework found."
	class="w-[220px]"
	contentClass="w-[220px] p-0"
/>
```

## Perilaku

- Klik trigger untuk membuka popover; klik di luar atau tekan `Escape` untuk menutup.
- Ketik untuk memfilter item — kecocokan dijalankan terhadap `value` dan `keywords` opsional tiap item.
- Memilih item yang sedang terpilih akan mematikannya (menyetel `value` ke `undefined`).
- Ikon centang menandai item yang terpilih dalam list.

## Komposisi

`Combobox` adalah wrapper tipis. Secara internal ia merender:

```svelte
<Popover>
	<PopoverTrigger>...</PopoverTrigger>
	<PopoverContent>
		<Command>
			<CommandInput />
			<CommandList>
				<CommandEmpty />
				<CommandGroup>
					<CommandItem />
					...
				</CommandGroup>
			</CommandList>
		</Command>
	</PopoverContent>
</Popover>
```

Jika Anda butuh grup, heading, separator, atau petunjuk shortcut kustom, turun langsung ke `Popover` + `Command` alih-alih memakai `Combobox`.
