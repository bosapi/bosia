---
title: Docks — Navigasi Bawah Mobile
description: Bilah navigasi bawah mobile — edge, floating, pill, dan bilah tab dengan FAB tengah.
demo: DocksDemo
---

Bilah navigasi bawah untuk permukaan mobile dan web responsif. Masing-masing adalah Svelte `<nav>`
mandiri yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap tema — tab
aktif dan FAB dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

Setiap dock diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block docks/edge
bun x bosia@latest add block docks/floating
bun x bosia@latest add block docks/pill
bun x bosia@latest add block docks/fab
```

Masing-masing menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Blok-bloknya

- **`edge`** — bilah tab selebar penuh rata bawah dengan label ikon, badge angka, dan indikator titik.
- **`floating`** — bilah yang sama di dalam kartu membulat yang terangkat dari tepi bawah.
- **`pill`** — kapsul ringkas di tengah, hanya ikon.
- **`fab`** — bilah tepi yang terbelah mengelilingi tombol aksi bundar di tengah.

## Usage

```svelte
<script lang="ts">
	import Dock from "$lib/blocks/docks/edge/block.svelte";
</script>

<Dock />
```

Letakkan dock di bagian bawah layout mobile Anda — padukan dengan
[shell layar mobile](/docs/blocks/navbars/app/) untuk kerangka aplikasi penuh. Tab aktif hanyalah
`$state` lokal kosmetik; sambungkan klik tombol ke router Anda sendiri dan jumlah badge ke data Anda
sendiri. Sunting daftar item di setiap `block.svelte` untuk mengganti tab, ikon, dan label.

## Source

`src/lib/blocks/docks/*/block.svelte`
