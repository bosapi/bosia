---
title: Heros — Course
description: Hero halaman kursus dengan statistik pendaftaran dan kartu pelajaran langsung.
demo: HeroCourseDemo
---

```bash
bun x bosia@latest add block heros/course
```

Hero halaman kursus dengan statistik pendaftaran dan kartu pelajaran langsung. Sebuah `<section>` mandiri selebar penuh yang dibangun hanya dari token semantik, sehingga gayanya berganti di seluruh 18 tema — warna brand dipetakan ke `--primary`.

## Preview

## Install

```bash
bun x bosia@latest add block heros/course
```

Menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Course from "$lib/blocks/heros/course/block.svelte";
</script>

<Course />
```

Letakkan di atas sebuah rute. Bagian interaktif apa pun (pemilih ukuran / warna / usia, input alamat atau email) hanyalah `$state` lokal kosmetik — sambungkan ke data Anda sendiri. Sunting `block.svelte` untuk mengganti teks dan gambar Unsplash.

## Source

`src/lib/blocks/heros/course/block.svelte`
