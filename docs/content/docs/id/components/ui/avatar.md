---
title: Avatar
description: Komponen avatar dengan slot gambar dan fallback.
demo: AvatarDemo
---

```bash
bun x bosia@latest add avatar
```

Avatar dengan dukungan gambar dan fallback. Menampilkan konten fallback saat gambar gagal dimuat.

## Preview

## Props

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `src`   | `string` | —       |
| `alt`   | `string` | `""`    |
| `class` | `string` | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
</script>

<!-- With image -->
<Avatar src="/favicon.svg" alt="John Doe">
	<AvatarFallback>JD</AvatarFallback>
</Avatar>

<!-- Fallback only -->
<Avatar>
	<AvatarFallback>AB</AvatarFallback>
</Avatar>
```

## Ukuran Kustom

```svelte
<Avatar src="/favicon.svg" alt="User" class="h-16 w-16">
	<AvatarFallback>U</AvatarFallback>
</Avatar>
```
