---
title: Card — Auth & Marketing
description: Kartu login dan fitur untuk layar auth dan halaman marketing.
demo: CardsAuthDemo
---

Kartu auth dan marketing. Kartu fitur memakai `--primary` untuk ikon dan aksen tautannya, sehingga
mengikuti warna brand tema yang aktif.

## Preview

## Install

Setiap kartu diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block cards/login
bun x bosia@latest add block cards/feature
```

Masing-masing menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Feature from "$lib/blocks/cards/feature/block.svelte";
</script>

<Feature />
```

Input pada kartu login adalah markup contoh statis — sambungkan ke state form dan handler submit
Anda sendiri.
