---
title: Hover Card
description: Panel konten mengambang yang dipicu hover untuk preview yang kaya.
demo: HoverCardDemo
---

```bash
bun x bosia@latest add hover-card
```

Panel mengambang yang dipicu hover untuk menampilkan preview yang kaya (kartu pengguna, preview tautan, dll.) saat pointer hover atau fokus pada trigger.

## Preview

## Props

### HoverCard

| Prop         | Type      | Default |
| ------------ | --------- | ------- |
| `open`       | `boolean` | `false` |
| `openDelay`  | `number`  | `700`   |
| `closeDelay` | `number`  | `300`   |
| `class`      | `string`  | `""`    |

### HoverCardTrigger

| Prop    | Type     | Default     |
| ------- | -------- | ----------- |
| `href`  | `string` | `undefined` |
| `class` | `string` | `""`        |

### HoverCardContent

| Prop         | Type                                           | Default    |
| ------------ | ---------------------------------------------- | ---------- |
| `side`       | `"top"` \| `"right"` \| `"bottom"` \| `"left"` | `"bottom"` |
| `align`      | `"start"` \| `"center"` \| `"end"`             | `"center"` |
| `sideOffset` | `number`                                       | `4`        |
| `class`      | `string`                                       | `""`       |

## Sub-komponen

- `HoverCard` — wrapper root, mengelola state open dan delay hover
- `HoverCardTrigger` — tautan/elemen yang membuka kartu saat hover atau fokus
- `HoverCardContent` — panel mengambang

## Penggunaan

```svelte
<script lang="ts">
	import { HoverCard, HoverCardTrigger, HoverCardContent } from "$lib/components/ui/hover-card";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
</script>

<HoverCard>
	<HoverCardTrigger href="https://svelte.dev">@sveltejs</HoverCardTrigger>
	<HoverCardContent class="w-80">
		<div class="flex justify-between gap-4">
			<Avatar src="https://github.com/sveltejs.png" alt="@sveltejs">
				<AvatarFallback>SV</AvatarFallback>
			</Avatar>
			<div class="space-y-1">
				<h4 class="text-sm font-semibold">@sveltejs</h4>
				<p class="text-sm">Cybernetically enhanced web apps.</p>
			</div>
		</div>
	</HoverCardContent>
</HoverCard>
```

## Pemosisian

Gunakan `side` dan `align` untuk menempatkan konten relatif terhadap trigger.

```svelte
<HoverCardContent side="top" align="start">...</HoverCardContent>
<HoverCardContent side="right">...</HoverCardContent>
<HoverCardContent side="bottom" align="end" sideOffset={8}>...</HoverCardContent>
```

## Delay Kustom

Sesuaikan seberapa cepat kartu muncul dan menghilang saat hover.

```svelte
<HoverCard openDelay={200} closeDelay={100}>
	<HoverCardTrigger href="/profile">Profile</HoverCardTrigger>
	<HoverCardContent>Quick preview</HoverCardContent>
</HoverCard>
```

## State Open Terkontrol

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<HoverCard bind:open>
	<HoverCardTrigger href="#">Hover me</HoverCardTrigger>
	<HoverCardContent>Content</HoverCardContent>
</HoverCard>

<p>Card is {open ? "open" : "closed"}</p>
```
