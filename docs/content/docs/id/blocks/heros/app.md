---
title: Heros — App
description: Hero aplikasi SaaS dengan daftar fitur dan mockup ponsel.
demo: HeroAppDemo
---

```bash
bun x bosia@latest add block heros/app
```

Hero aplikasi SaaS dengan daftar fitur dan mockup ponsel. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/app
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import App from "$lib/blocks/heros/app/block.svelte";
</script>

<App />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/app/block.svelte`
