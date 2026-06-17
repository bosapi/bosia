---
title: Card — Media
description: Kartu artikel, musik, video, dan galeri untuk UI kaya media.
demo: CardsMediaDemo
---

Kartu media untuk artikel, audio, video, dan galeri foto. Gambar adalah foto Unsplash kecil, dimuat
secara lazy dan diperkecil untuk menjaga bandwidth tetap rendah — ganti setiap `src` dengan konten
Anda sendiri.

## Preview

## Install

Setiap kartu diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block cards/article
bun x bosia@latest add block cards/music
bun x bosia@latest add block cards/video
bun x bosia@latest add block cards/gallery
```

Masing-masing menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Music from "$lib/blocks/cards/music/block.svelte";
</script>

<Music />
```

Putar/jeda pada kartu musik hanyalah `$state` lokal kosmetik — sambungkan ke elemen audio Anda
sendiri.
