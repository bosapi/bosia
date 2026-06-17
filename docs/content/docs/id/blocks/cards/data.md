---
title: Card — Data & Dashboard
description: Kartu statistik, progres, grafik, dan saldo untuk dashboard dan analitik.
demo: CardsDataDemo
---

Kartu dashboard untuk angka dan tren. Masing-masing adalah blok mandiri yang digerakkan token —
warna brand dipetakan ke `--primary`, sehingga gayanya berganti otomatis saat Anda mengganti tema.
Coba pengalih tema di atas preview.

## Preview

## Install

Setiap kartu diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block cards/stat
bun x bosia@latest add block cards/progress
bun x bosia@latest add block cards/chart
bun x bosia@latest add block cards/balance
```

Masing-masing menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon. Sparkline,
ring, dan mini-bar adalah SVG/CSS sebaris yang memakai stroke token semantik — tanpa pustaka grafik.

## Usage

```svelte
<script lang="ts">
	import Stat from "$lib/blocks/cards/stat/block.svelte";
</script>

<Stat />
```

Semua teks dan data adalah konten contoh yang dikode keras — sunting `block.svelte` untuk merangkai
data Anda sendiri.
