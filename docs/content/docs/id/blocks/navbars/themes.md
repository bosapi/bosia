---
title: Navbars — Themes
description: Varian navbar bergaya — gelap, kaca, brutalist, pill mengambang, gradien, brand bar, dan overlay transparan.
demo: NavbarsThemesDemo
---

Navbar dengan perlakuan visual yang lebih kuat. Masing-masing adalah Svelte `<header>` mandiri
selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap tema —
warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

Setiap navbar diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block navbars/dark
bun x bosia@latest add block navbars/glass
bun x bosia@latest add block navbars/brutalist
bun x bosia@latest add block navbars/pill
bun x bosia@latest add block navbars/gradient
bun x bosia@latest add block navbars/lime
bun x bosia@latest add block navbars/overlay
```

Beberapa menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`dark`** — bilah solid pada warna foreground dengan teks dan tautan terbalik.
- **`glass`** — bilah buram tembus pandang dengan field pencarian dan CTA primary.
- **`brutalist`** — brand bar primary dengan border tebal, huruf kapital mono, dan bayangan keras.
- **`pill`** — kapsul membulat terpusat yang mengambang di atas konten.
- **`gradient`** — bilah gradien gelap dengan kilau primary lembut dan pill beta.
- **`lime`** — brand bar primary full-colour yang berani dengan CTA solid kontras.
- **`overlay`** — bilah transparan dengan teks terang dan CTA outline, dibuat untuk mengambang di atas gambar hero.

## Usage

```svelte
<script lang="ts">
	import Glass from "$lib/blocks/navbars/glass/block.svelte";
</script>

<Glass />
```

Aksi brand selalu `primary` — aksen lime aslinya runtuh ke warna brand tema Anda, sehingga bilah
mengikuti tema mana pun yang aktif. Sunting `block.svelte` untuk mengganti wordmark dan teks.

`overlay` adalah pengecualian dari aturan tingkat-layout: ia `position: absolute`, sehingga alih-alih
berada di atas konten Anda, ia **mengambang di atas bagian pertama**. Render sebagai anak pertama dari
`<section>` hero `relative` (hero foto di [Blocks → Heros](/docs/blocks/heros/restaurant/) dibuat
tepat untuk ini), bukan di `+layout.svelte`. Teks terangnya disetel untuk foto gelap atau scrim:

```svelte
<section class="relative …">
	<img class="absolute inset-0 …" … />
	<div class="absolute inset-0 bg-foreground/50"></div>
	<Overlay />
	<!-- hero content -->
</section>
```

## Source

`src/lib/blocks/navbars/*/block.svelte`
