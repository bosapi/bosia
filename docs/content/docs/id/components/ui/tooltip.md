---
title: Tooltip
description: Popup yang menampilkan informasi terkait sebuah elemen saat hover atau fokus.
demo: TooltipDemo
---

```bash
bun x bosia@latest add tooltip
```

Tooltip yang dikelola konteks dengan trigger dan konten. Tampil saat hover atau fokus setelah delay yang bisa dikonfigurasi, menyembunyi saat pergi, blur, atau Escape.

## Preview

## Props

### Tooltip

| Prop            | Type      | Default |
| --------------- | --------- | ------- |
| `open`          | `boolean` | `false` |
| `delayDuration` | `number`  | `700`   |
| `class`         | `string`  | `""`    |

`open` bindable dengan `bind:open`.

### TooltipContent

| Prop         | Type                                           | Default    |
| ------------ | ---------------------------------------------- | ---------- |
| `side`       | `"top"` \| `"right"` \| `"bottom"` \| `"left"` | `"top"`    |
| `align`      | `"start"` \| `"center"` \| `"end"`             | `"center"` |
| `sideOffset` | `number`                                       | `4`        |
| `class`      | `string`                                       | `""`       |

## Sub-komponen

- `Tooltip` — wrapper root, mengelola state open dan timer delay
- `TooltipTrigger` — button yang menampilkan/menyembunyikan tooltip saat hover dan fokus
- `TooltipContent` — panel popup dengan pemosisian side

## Penggunaan

```svelte
<script lang="ts">
	import { Tooltip, TooltipTrigger, TooltipContent } from "$lib/components/ui/tooltip";
	import { Button } from "$lib/components/ui/button";
</script>

<Tooltip>
	<TooltipTrigger>
		<Button variant="outline">Hover me</Button>
	</TooltipTrigger>
	<TooltipContent>Add to library</TooltipContent>
</Tooltip>
```

## Sisi

```svelte
<TooltipContent side="top">Top</TooltipContent>
<TooltipContent side="right">Right</TooltipContent>
<TooltipContent side="bottom">Bottom</TooltipContent>
<TooltipContent side="left">Left</TooltipContent>
```

## Durasi Delay

```svelte
<!-- Show instantly -->
<Tooltip delayDuration={0}>
	<TooltipTrigger>...</TooltipTrigger>
	<TooltipContent>No delay</TooltipContent>
</Tooltip>

<!-- Longer delay -->
<Tooltip delayDuration={1500}>
	<TooltipTrigger>...</TooltipTrigger>
	<TooltipContent>Shows after 1.5s</TooltipContent>
</Tooltip>
```

## State Open Terkontrol

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Tooltip bind:open>
	<TooltipTrigger>...</TooltipTrigger>
	<TooltipContent>Controlled</TooltipContent>
</Tooltip>

<p>Tooltip is {open ? "visible" : "hidden"}</p>
```

## Aksesibilitas

- `TooltipContent` dirender dengan `role="tooltip"` dan `id` unik
- `TooltipTrigger` menyetel `aria-describedby` yang menunjuk ke konten saat terbuka
- Tombol Escape menutup tooltip yang terbuka
- Tooltip merespons `mouseenter`/`mouseleave` dan `focus`/`blur`, sehingga pengguna keyboard juga melihatnya
