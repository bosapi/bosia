---
title: Section Blog
description: Section blog — kartu daftar post, header post, pembungkus prosa dan baris post terkait.
demo: BlogSectionsDemo
---

Section blog untuk situs konten. Masing-masing adalah Svelte `<section>` mandiri selebar penuh
yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap tema. Coba
pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block blog/post-list
bun x bosia@latest add block blog/post-header
bun x bosia@latest add block blog/post-body
bun x bosia@latest add block blog/related
```

`post-body` menarik [`ui/typography`](/components/ui/typography/) untuk gaya prosanya.

## Blok-bloknya

- **`post-list`** — heading dan intro di atas tumpukan kartu post (tag, tanggal, judul, kutipan).
- **`post-header`** — tag, tanggal, judul, kutipan, byline penulis dengan waktu baca dan gambar sampul.
- **`post-body`** — artikel prosa 70ch; kirim string `html`, snippet children, atau biarkan prosa contohnya.
- **`related`** — baris "lanjut membaca" berisi hingga tiga kartu post ringkas.

## Penggunaan

```svelte
<script lang="ts">
	import PostList from "$lib/blocks/blog/post-list/block.svelte";
</script>

<PostList />
```

Setiap blok membawa post contoh sehingga langsung tampil. Untuk data asli, kirim props:
`post-list` dan `related` menerima `posts` (array `{ slug, title, excerpt, tag, date, datetime }`),
`post-header` menerima field post langsung, dan `post-body` menerima `html`. Tautan post menuju
`{base}/{slug}` — `base` default `/blog`. Pasang [feature `blog`](/guides/blog/) untuk tabel post
berbasis database dengan server loader yang menghasilkan bentuk data ini.

`post-body` merender `html` tanpa escape — hanya kirim konten tepercaya (database milikmu),
jangan pernah input pengguna.

## Sumber

`src/lib/blocks/blog/*/block.svelte`
