---
title: Skeleton
description: Placeholder yang dipakai untuk menampilkan state loading.
demo: SkeletonDemo
---

```bash
bun x bosia@latest add skeleton
```

Elemen placeholder minimal yang dipakai untuk merangka bentuk konten selama data dimuat. Merender satu `<div>` dengan kelas dasar `animate-pulse rounded-md bg-accent` — ukuran dan bentuk dikontrol sepenuhnya melalui kelas utilitas Tailwind.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Semua atribut tambahan diteruskan ke `<div>` root.

## Penggunaan

```svelte
<script lang="ts">
	import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<Skeleton class="h-4 w-[250px]" />
```

## Contoh

Gabungkan beberapa skeleton untuk mendekati state loading mirip-card — avatar bundar di samping dua baris teks.

```svelte
<script lang="ts">
	import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<div class="flex items-center gap-4">
	<Skeleton class="size-12 rounded-full" />
	<div class="flex flex-col gap-2">
		<Skeleton class="h-4 w-[250px]" />
		<Skeleton class="h-4 w-[200px]" />
	</div>
</div>
```

Gunakan bentuk blok lebih besar untuk merangka area media.

```svelte
<Skeleton class="h-[125px] w-[250px] rounded-xl" />
```
