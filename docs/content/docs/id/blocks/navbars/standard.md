---
title: Navbars — Standard
description: Tata letak navbar terang klasik — terpusat, terbagi, dipimpin pencarian, minimal, dan dua-tingkat.
demo: NavbarsStandardDemo
---

Bilah navigasi atas sehari-hari. Masing-masing adalah Svelte `<header>` mandiri selebar penuh yang
dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap tema — warna brand
dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

Setiap navbar diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block navbars/classic
bun x bosia@latest add block navbars/split
bun x bosia@latest add block navbars/centered
bun x bosia@latest add block navbars/search
bun x bosia@latest add block navbars/minimal
bun x bosia@latest add block navbars/two-tier
```

Beberapa menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`classic`** — logo kiri, tautan terpusat, login plus CTA primary di kanan.
- **`split`** — logo kiri, tautan dan satu CTA solid dikelompokkan di kanan.
- **`centered`** — logo terpusat dengan grup tautan simetris mengapit wordmark.
- **`search`** — logo, tautan, field pencarian, lonceng notifikasi, dan avatar.
- **`minimal`** — ruang kosong lega, satu aksi primary, dan toggle menu.
- **`two-tier`** — strip utilitas mono di atas baris wordmark utama.

## Usage

```svelte
<script lang="ts">
	import Classic from "$lib/blocks/navbars/classic/block.svelte";
</script>

<Classic />
```

Navbar adalah header selebar penuh — letakkan satu di atas sebuah rute. Tautan mengarah ke `/`;
sambungkan ke rute dan handler Anda sendiri. Sunting `block.svelte` untuk mengganti wordmark dan teks.

## Source

`src/lib/blocks/navbars/*/block.svelte`
