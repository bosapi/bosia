---
title: Button Group
description: Kontainer yang secara visual mengelompokkan beberapa button menjadi satu unit yang tersambung.
demo: ButtonGroupDemo
---

```bash
bun x bosia@latest add button-group
```

Button Group menggabungkan button yang berdampingan menjadi satu unit visual dengan meniadakan border mereka dan membulatkan hanya sudut terluar. Gunakan untuk toolbar, segmented control, atau set aksi terkait apa pun.

## Preview

## Props

| Prop          | Type                         | Default        |
| ------------- | ---------------------------- | -------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `class`       | `string`                     | `""`           |

## Penggunaan

```svelte
<script lang="ts">
	import { ButtonGroup } from "$lib/components/ui/button-group";
	import { Button } from "$lib/components/ui/button";
</script>

<ButtonGroup aria-label="Actions">
	<Button variant="outline">Save</Button>
	<Button variant="outline">Edit</Button>
	<Button variant="outline">Delete</Button>
</ButtonGroup>
```

## Vertikal

Tumpuk button secara vertikal memakai `orientation="vertical"`.

```svelte
<ButtonGroup orientation="vertical" aria-label="Navigation">
	<Button variant="outline">Profile</Button>
	<Button variant="outline">Settings</Button>
	<Button variant="outline">Logout</Button>
</ButtonGroup>
```

## Button Ikon

Berfungsi dengan button berukuran ikon untuk toolbar yang ringkas.

```svelte
<ButtonGroup aria-label="Text alignment">
	<Button variant="outline" size="icon" aria-label="Align left">
		<AlignLeftIcon class="size-4" />
	</Button>
	<Button variant="outline" size="icon" aria-label="Align center">
		<AlignCenterIcon class="size-4" />
	</Button>
	<Button variant="outline" size="icon" aria-label="Align right">
		<AlignRightIcon class="size-4" />
	</Button>
</ButtonGroup>
```

## Aksesibilitas

Selalu sediakan `aria-label` pada `ButtonGroup` untuk menjelaskan tujuan grup kepada screen reader. Komponen merender dengan `role="group"` secara otomatis.
