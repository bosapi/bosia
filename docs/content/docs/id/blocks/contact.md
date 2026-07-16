---
title: Section Kontak
description: Section kontak — layout split form di samping detail kontak dan form terpusat.
demo: ContactSectionsDemo
---

Section kontak untuk situs perusahaan atau produk. Masing-masing adalah Svelte `<section>` mandiri
selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap
tema. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block contact/split
bun x bosia@latest add block contact/simple
```

`split` menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikon detailnya.

## Blok-bloknya

- **`split`** — heading, blurb dan detail kontak (email, telepon, kantor) di samping form kartu.
- **`simple`** — heading terpusat di atas form nama / email / pesan yang ringkas.

## Penggunaan

```svelte
<script lang="ts">
	import Contact from "$lib/blocks/contact/split/block.svelte";
</script>

<Contact />
```

Kedua form mengirim `POST` JSON (`name`, `email`, `message`) ke `/api/contact` — ganti endpoint
lewat prop `action`. Pasang [feature `contact-form`](/guides/contact-form/) untuk mendapatkan
endpoint itu lengkap dengan validasi dan penyimpanan Drizzle; tanpa itu, arahkan `action` ke route
milikmu sendiri. Ubah teks dan detail kontak di masing-masing `block.svelte`.

## Sumber

`src/lib/blocks/contact/*/block.svelte`
