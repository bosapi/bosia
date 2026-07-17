---
title: Section Newsletter
description: Section newsletter — formulir daftar terpusat dan kartu split, keduanya mem-POST ke /api/newsletter.
demo: NewsletterSectionsDemo
---

Section pendaftaran email untuk situs mana pun yang punya audiens. Masing-masing adalah Svelte
`<section>` mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya
berganti di setiap tema. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block newsletter/centered
bun x bosia@latest add block newsletter/split
```

## Blok-bloknya

- **`centered`** — kicker, heading, dan teks di atas formulir email + tombol subscribe.
- **`split`** — heading dan teks di samping formulir, dibungkus kartu dengan catatan bebas spam.

## Penggunaan

```svelte
<script lang="ts">
	import Newsletter from "$lib/blocks/newsletter/centered/block.svelte";
</script>

<Newsletter />
```

Kedua blok mem-POST `{ email }` sebagai JSON ke `/api/newsletter` — pasang
[feature `newsletter`](/guides/newsletter/) untuk endpoint tervalidasi yang aman dari duplikat,
atau arahkan prop `action` ke route-mu sendiri. Teks bisa diganti lewat `kicker`, `heading`,
`copy` (dan `note` pada `split`).

## Sumber

`src/lib/blocks/newsletter/*/block.svelte`
