---
title: Halaman — Indeks Blog
description: Halaman indeks blog yang dirangkai dari blok — navbar, kartu daftar post dan footer.
demo: PagesBlogIndexDemo
---

Indeks blog lengkap: navbar minimal, tumpukan kartu post-list dan footer minimal. Setiap blok
sadar-tema — coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add page blog/index
```

Memasang `page.svelte` beserta setiap blok yang dirangkainya.

## Penggunaan

```svelte
<script lang="ts">
	import Blog from "$lib/pages/blog/index/page.svelte";
</script>

<Blog />
```

Tanpa props halaman menampilkan post contoh bawaan `blog/post-list`. Untuk konten asli, pasang
[feature `blog`](/guides/blog/) — loader untuk `/blog` mengembalikan `posts` persis dalam bentuk
yang diterima halaman:

```svelte
<script lang="ts">
	import Blog from "$lib/pages/blog/index/page.svelte";

	let { data } = $props();
</script>

<Blog posts={data.posts} />
```

Ubah blok satu per satu di `src/lib/blocks/` untuk mengganti teks, atau tukar navbar dan footer
dengan blok `navbars/*` / `footers/*` lain.

## Sumber

`src/lib/pages/blog/index/page.svelte`
