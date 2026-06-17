---
title: Blocks
description: Bagian UI tersusun (hero, harga, kartu) yang membawa desain bagus ke aplikasi Anda — satu perintah instal, tanpa prop untuk dirangkai.
---

## Apa itu blocks

Primitif (`Button`, `Card`, `Input`) adalah potongan toolkit tanpa gaya. Mereka memberi fleksibilitas tetapi tanpa opini. **Blocks** adalah lapisan yang hilang di atasnya — bagian tersusun dengan teks, tata letak, dan ritme tipografi yang dikode keras. Letakkan satu, lalu sunting teksnya langsung di tempat.

Blocks mengikuti filosofi shadcn: salin-tempel sumber, tanpa konfigurasi runtime, Anda memiliki filenya.

## Lapisan

```
Primitives  →  Blocks  →  Pages
(Button)       (FeatureCard)   (Landing)
```

## Install

```bash
bun x bosia@latest add block cards/feature
```

File mendarat di `src/lib/blocks/<category>/<name>/`. Dependensi primitif (Card, Button, dll.) terinstal otomatis.

## Page block tidak menyertakan navbar

Block tingkat halaman (heros, cards, sections) tidak membawa navbar situsnya sendiri — itu disengaja. Navbar, footer, dan sidebar berada di `+layout.svelte` Anda agar dirender sekali di setiap rute. Pasangkan page block dengan [navbar block](/docs/blocks/navbars/standard/) yang diletakkan di layout; menaruh hero di halaman dan navbar di layout memberi Anda tepat satu navbar, bukan dua.

## Theming

Blocks hanya mengonsumsi **token semantik** — `bg-card`, `text-foreground`, `font-display`. Ganti tema tanpa menyentuh block:

```bash
bun x bosia@latest add theme editorial
```

Lihat [Themes](/docs/themes/overview/).
