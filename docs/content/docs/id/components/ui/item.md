---
title: Item
description: Kontainer flex serbaguna untuk menampilkan konten dengan media, judul, deskripsi, dan aksi.
demo: ItemDemo
---

```bash
bun x bosia@latest add item
```

Komponen layout majemuk dengan sub-komponen komposabel: `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemHeader`, `ItemFooter`, `ItemGroup`, dan `ItemSeparator`.

## Preview

## Props

### Item

| Prop      | Type                                | Default     |
| --------- | ----------------------------------- | ----------- |
| `variant` | `"default" \| "outline" \| "muted"` | `"default"` |
| `size`    | `"default" \| "sm"`                 | `"default"` |
| `class`   | `string`                            | `""`        |

### ItemMedia

| Prop      | Type                             | Default     |
| --------- | -------------------------------- | ----------- |
| `variant` | `"default" \| "icon" \| "image"` | `"default"` |
| `class`   | `string`                         | `""`        |

Semua sub-komponen lain hanya menerima `class` dan `...restProps`.

## Penggunaan

```svelte
<script lang="ts">
	import {
		Item,
		ItemMedia,
		ItemContent,
		ItemTitle,
		ItemDescription,
		ItemActions,
	} from "$lib/components/ui/item";
	import { Button } from "$lib/components/ui/button";
</script>

<Item>
	<ItemMedia variant="icon">
		<!-- icon or avatar -->
	</ItemMedia>
	<ItemContent>
		<ItemTitle>Title</ItemTitle>
		<ItemDescription>Description text</ItemDescription>
	</ItemContent>
	<ItemActions>
		<Button variant="outline" size="sm">Action</Button>
	</ItemActions>
</Item>
```

## Varian

### Outline

```svelte
<Item variant="outline">
	<ItemContent>
		<ItemTitle>Outlined item</ItemTitle>
	</ItemContent>
</Item>
```

### Muted

```svelte
<Item variant="muted">
	<ItemContent>
		<ItemTitle>Muted item</ItemTitle>
	</ItemContent>
</Item>
```

## Item Group

Gunakan `ItemGroup` dan `ItemSeparator` untuk membuat list:

```svelte
<ItemGroup>
	<Item>
		<ItemContent>
			<ItemTitle>First item</ItemTitle>
		</ItemContent>
	</Item>
	<ItemSeparator />
	<Item>
		<ItemContent>
			<ItemTitle>Second item</ItemTitle>
		</ItemContent>
	</Item>
</ItemGroup>
```

## Rendering Polimorfik

Gunakan snippet `child` untuk merender sebagai elemen berbeda (mis. `<a>`):

```svelte
<Item>
	{#snippet child({ class: cls, props })}
		<a href="/page" class={cls} {...props}>
			<ItemContent>
				<ItemTitle>Link item</ItemTitle>
			</ItemContent>
		</a>
	{/snippet}
</Item>
```
