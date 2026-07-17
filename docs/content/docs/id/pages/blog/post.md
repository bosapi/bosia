---
title: Halaman — Post Blog
description: Halaman post blog yang dirangkai dari blok — navbar, header post, isi prosa, baris terkait dan footer.
demo: PagesBlogPostDemo
---

Halaman post blog lengkap: navbar minimal, header post, isi prosa 70ch, baris post terkait dan
footer minimal. Setiap blok sadar-tema — coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add page blog/post
```

Memasang `page.svelte` beserta setiap blok yang dirangkainya.

## Penggunaan

```svelte
<script lang="ts">
	import Post from "$lib/pages/blog/post/page.svelte";
</script>

<Post />
```

Tanpa props halaman menampilkan post contoh bawaan blok-bloknya. Untuk konten asli, pasang
[feature `blog`](/guides/blog/) — loader untuk `/blog/[slug]` mengembalikan `post` dan `related`
persis dalam bentuk yang diterima halaman:

```svelte
<script lang="ts">
	import Post from "$lib/pages/blog/post/page.svelte";

	let { data } = $props();
</script>

<Post post={data.post} bodyHtml={data.post.body} related={data.related} />
```

`bodyHtml` dirender tanpa escape oleh `blog/post-body` — hanya kirim konten tepercaya (database
milikmu), jangan pernah input pengguna.

## Sumber

`src/lib/pages/blog/post/page.svelte`
