---
title: Card — People
description: Kartu profil, kontak, dan testimoni untuk UI orang dan sosial.
demo: CardsPeopleDemo
---

Kartu untuk orang — profil, kontak, dan testimoni. Warna brand dipetakan ke `--primary`, sehingga
avatar, tombol ikuti, dan aksen mengikuti tema yang aktif.

## Preview

## Install

Setiap kartu diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block cards/profile
bun x bosia@latest add block cards/contact
bun x bosia@latest add block cards/testimonial
```

Masing-masing menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Profile from "$lib/blocks/cards/profile/block.svelte";
</script>

<Profile />
```

Toggle ikuti pada kartu profil hanyalah `$state` lokal kosmetik — ganti dengan handler Anda sendiri.
