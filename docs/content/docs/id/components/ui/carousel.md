---
title: Carousel
description: Komponen carousel dengan navigasi slide, dukungan keyboard, dan snap scrolling.
demo: CarouselDemo
---

```bash
bun x bosia@latest add carousel
```

Carousel yang dibangun dengan CSS scroll-snap. Mendukung orientasi horizontal dan vertikal, navigasi keyboard, dan tombol prev/next. Tanpa dependensi eksternal.

## Preview

## Sub-komponen

| Komponen           | Deskripsi                                               |
| ------------------ | ------------------------------------------------------- |
| `Carousel`         | Root — menyediakan konteks, menangani navigasi keyboard |
| `CarouselContent`  | Viewport yang bisa di-scroll + kontainer flex           |
| `CarouselItem`     | Wrapper slide dengan snap alignment                     |
| `CarouselPrevious` | Tombol slide sebelumnya                                 |
| `CarouselNext`     | Tombol slide berikutnya                                 |

## Props

### Carousel

| Prop          | Type                         | Default        |
| ------------- | ---------------------------- | -------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `autoplay`    | `boolean \| number`          | `false`        |
| `class`       | `string`                     | `""`           |

### CarouselItem

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Semua sub-komponen menerima `class` dan menyebarkan `...restProps`.

## Penggunaan

```svelte
<script lang="ts">
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselPrevious,
		CarouselNext,
	} from "$lib/components/ui/carousel";
</script>

<Carousel>
	<CarouselContent>
		<CarouselItem>Slide 1</CarouselItem>
		<CarouselItem>Slide 2</CarouselItem>
		<CarouselItem>Slide 3</CarouselItem>
	</CarouselContent>
	<CarouselPrevious />
	<CarouselNext />
</Carousel>
```

## Vertikal

```svelte
<Carousel orientation="vertical" class="max-h-[300px]">
	<CarouselContent class="h-[300px]">
		<CarouselItem>Slide 1</CarouselItem>
		<CarouselItem>Slide 2</CarouselItem>
	</CarouselContent>
	<CarouselPrevious />
	<CarouselNext />
</Carousel>
```

## Slide Parsial

Tampilkan beberapa item per tampilan dengan menyesuaikan `basis`:

```svelte
<CarouselItem class="basis-1/3">...</CarouselItem>
```

## Autoplay

Berikan `autoplay` untuk memajukan slide otomatis. `true` memakai interval 4000ms, atau berikan angka untuk ms kustom. Berhenti sejenak saat hover dan fokus.

```svelte
<Carousel autoplay>...</Carousel>
<Carousel autoplay={2000}>...</Carousel>
```

## Keyboard

| Tombol                     | Aksi                                 |
| -------------------------- | ------------------------------------ |
| `ArrowLeft` / `ArrowRight` | Sebelumnya / Berikutnya (horizontal) |
| `ArrowUp` / `ArrowDown`    | Sebelumnya / Berikutnya (vertikal)   |
