---
title: Empty
description: Komponen empty state dengan slot ikon, judul, deskripsi, dan aksi.
demo: EmptyDemo
---

```bash
bun x bosia@latest add empty
```

Komponen majemuk untuk empty state. Sub-komponen komposabel: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, dan `EmptyContent`.

## Preview

## Props

### Empty

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### EmptyMedia

| Prop      | Type                    | Default     |
| --------- | ----------------------- | ----------- |
| `variant` | `"default"` \| `"icon"` | `"default"` |
| `class`   | `string`                | `""`        |

Semua sub-komponen lain (`EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`) menerima `class` dan bersifat opsional.

## Penggunaan

```svelte
<script lang="ts">
	import {
		Empty,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		EmptyDescription,
		EmptyContent,
	} from "$lib/components/ui/empty";
	import { Button } from "$lib/components/ui/button";
</script>

<Empty>
	<EmptyHeader>
		<EmptyMedia variant="icon">
			<svg><!-- your icon --></svg>
		</EmptyMedia>
		<EmptyTitle>No items yet</EmptyTitle>
		<EmptyDescription>Get started by creating your first item.</EmptyDescription>
	</EmptyHeader>
	<EmptyContent>
		<Button>Create item</Button>
	</EmptyContent>
</Empty>
```

## Minimal

Semua sub-komponen bersifat opsional:

```svelte
<Empty>
	<EmptyHeader>
		<EmptyTitle>Nothing here</EmptyTitle>
	</EmptyHeader>
</Empty>
```

## Dengan Tautan

Deskripsi mendukung tautan bergaya:

```svelte
<EmptyDescription>
	No results found. Try <a href="/search">searching</a> for something else.
</EmptyDescription>
```
