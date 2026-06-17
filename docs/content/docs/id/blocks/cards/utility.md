---
title: Card — Utility & System
description: Kartu notifikasi, cuaca, acara, file, tugas, penyimpanan, kode, peta, integrasi, polling, stepper, dan chat.
demo: CardsUtilityDemo
---

Kategori terluas — kartu UI sistem dan produk. Warna status mengikuti konvensi shadcn
(`emerald` sukses, `amber` peringatan, `blue` info, `destructive` bahaya) sehingga terbaca benar di
mode terang dan gelap, sementara warna brand dipetakan ke `--primary` dan mengikuti tema yang aktif.

## Preview

## Install

Setiap kartu diinstal sendiri-sendiri:

```bash
bun x bosia@latest add block cards/notification
bun x bosia@latest add block cards/weather
bun x bosia@latest add block cards/event
bun x bosia@latest add block cards/file
bun x bosia@latest add block cards/task
bun x bosia@latest add block cards/storage
bun x bosia@latest add block cards/code
bun x bosia@latest add block cards/map
bun x bosia@latest add block cards/integration
bun x bosia@latest add block cards/poll
bun x bosia@latest add block cards/stepper
bun x bosia@latest add block cards/chat
```

Masing-masing menarik paket npm [`@lucide/svelte`](/components/ui/icon/) untuk ikon.

## Usage

```svelte
<script lang="ts">
	import Task from "$lib/blocks/cards/task/block.svelte";
</script>

<Task />
```

Daftar centang tugas, switch integrasi, dan pilihan polling hanyalah `$state` lokal kosmetik —
sambungkan ke data dan handler Anda sendiri.
