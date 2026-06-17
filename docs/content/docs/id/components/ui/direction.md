---
title: Direction
description: Komponen provider yang menyetel arah teks (LTR/RTL) via konteks.
demo: DirectionDemo
---

```bash
bun x bosia@latest add direction
```

Provider konteks yang menyetel `dir` pada elemen wrapper dan memunculkan arah saat ini ke komponen turunan via `useDirection()`. Berguna untuk aplikasi yang mendukung bahasa kanan-ke-kiri seperti Arab, Ibrani, dan Persia.

## Preview

## Props

| Prop        | Type               | Default |
| ----------- | ------------------ | ------- |
| `direction` | `"ltr"` \| `"rtl"` | `"ltr"` |

## Penggunaan

### Provider

Bungkus konten Anda dengan `DirectionProvider`:

```svelte
<script lang="ts">
	import { DirectionProvider } from "$lib/components/ui/direction";
</script>

<DirectionProvider direction="rtl">
	<p>This content flows right-to-left.</p>
</DirectionProvider>
```

### Membaca arah di komponen anak

Gunakan `useDirection()` untuk membaca arah saat ini dari konteks:

```svelte
<script lang="ts">
	import { useDirection } from "$lib/components/ui/direction";

	const dir = useDirection(); // "ltr" | "rtl"
</script>

<p>Current direction: {dir}</p>
```
