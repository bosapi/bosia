---
title: Popover
description: Panel konten mengambang dengan trigger, side, dan perataan yang bisa dikonfigurasi.
demo: PopoverDemo
---

```bash
bun x bosia@latest add popover
```

Panel mengambang yang terpaut ke trigger. Mendukung mode klik (default) dan hover. Tertutup saat klik-di-luar (mode klik) dan Escape.

## Preview

## Props

### Popover

| Prop         | Type                   | Default   |
| ------------ | ---------------------- | --------- |
| `open`       | `boolean`              | `false`   |
| `trigger`    | `"click"` \| `"hover"` | `"click"` |
| `closeDelay` | `number`               | `150`     |
| `class`      | `string`               | `""`      |

### PopoverContent

| Prop         | Type                                           | Default    |
| ------------ | ---------------------------------------------- | ---------- |
| `side`       | `"top"` \| `"right"` \| `"bottom"` \| `"left"` | `"bottom"` |
| `align`      | `"start"` \| `"center"` \| `"end"`             | `"center"` |
| `sideOffset` | `number`                                       | `4`        |
| `class`      | `string`                                       | `""`       |

## Sub-komponen

- `Popover` — wrapper root, mengelola state open
- `PopoverTrigger` — tombol yang membuka popover
- `PopoverContent` — panel mengambang

## Penggunaan

```svelte
<script lang="ts">
	import { Popover, PopoverTrigger, PopoverContent } from "$lib/components/ui/popover";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
</script>

<Popover>
	<PopoverTrigger>
		<Button variant="outline">Open popover</Button>
	</PopoverTrigger>
	<PopoverContent>
		<div class="grid gap-4">
			<div class="space-y-1">
				<h4 class="font-medium leading-none">Dimensions</h4>
				<p class="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
			</div>
			<div class="grid gap-2">
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="width">Width</Label>
					<Input id="width" value="100%" class="col-span-2 h-8" />
				</div>
			</div>
		</div>
	</PopoverContent>
</Popover>
```

## Pemosisian

Gunakan `side` dan `align` untuk menempatkan konten relatif terhadap trigger.

```svelte
<!-- Above, aligned to the start -->
<PopoverContent side="top" align="start">...</PopoverContent>

<!-- To the right, centered -->
<PopoverContent side="right">...</PopoverContent>

<!-- Below, aligned to the end with extra offset -->
<PopoverContent side="bottom" align="end" sideOffset={8}>...</PopoverContent>
```

## Trigger Hover

Setel `trigger="hover"` untuk membuka popover saat mouse masuk. Popover tetap terbuka selama kursor di atas trigger atau konten. Di perangkat sentuh, mode hover turun ke tap-to-toggle. Sesuaikan `closeDelay` (ms) untuk mengontrol delay sebelum menutup.

```svelte
<Popover trigger="hover" closeDelay={200}>
	<PopoverTrigger>
		<Button variant="outline">Hover me</Button>
	</PopoverTrigger>
	<PopoverContent>Tooltip-style content</PopoverContent>
</Popover>
```

## State Open Terkontrol

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Popover bind:open>
	<PopoverTrigger>
		<Button variant="outline">Toggle</Button>
	</PopoverTrigger>
	<PopoverContent>Content</PopoverContent>
</Popover>

<p>Popover is {open ? "open" : "closed"}</p>
```
