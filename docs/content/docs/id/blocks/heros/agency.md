---
title: Heros — Agency
description: Hero agensi gelap berani dengan aksen cahaya dan logo klien.
demo: HeroAgencyDemo
---

```bash
bun x bosia@latest add block heros/agency
```

Hero agensi gelap berani dengan aksen cahaya dan logo klien. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/agency
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Agency from "$lib/blocks/heros/agency/block.svelte";
</script>

<Agency />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/agency/block.svelte`
