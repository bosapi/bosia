---
title: Blog
description: Backend blog — tabel post Drizzle dengan server loader untuk /blog dan /blog/[slug], plus seed contoh.
---

Feature `blog` memberi kamu backend untuk [blok blog](/docs/blocks/blog) dan
[halaman blog](/pages/blog/index): tabel `posts`, repository dan service, server loader untuk
`/blog` dan `/blog/[slug]`, serta seed berisi tiga post contoh.

## Install

```bash
bun x bosia@latest feat blog                  # menanyakan dialect DB
bun x bosia@latest feat -y blog               # otomatis: default sqlite
bun x bosia@latest feat blog -d postgres      # eksplisit
```

CLI memasang feature `drizzle` pada pemakaian pertama. Setelah install:

```bash
bun run db:generate
bun run db:migrate
bun run db:seed        # opsional — tiga post contoh, dilewati jika sudah ada post
```

## Yang kamu dapat

| Path                                       | Fungsi                                                  |
| ------------------------------------------ | ------------------------------------------------------- |
| `src/features/blog/schemas/posts.table.ts` | Tabel Drizzle (sesuai dialect-mu)                       |
| `src/features/blog/post.repository.ts`     | Query DB (published, by slug, terkait)                  |
| `src/features/blog/blog.service.ts`        | Memetakan baris ke bentuk siap-blok                     |
| `src/routes/blog/+page.server.ts`          | Loader: `{ posts }`                                     |
| `src/routes/blog/[slug]/+page.server.ts`   | Loader: `{ post, related }`, 404 untuk slug tak dikenal |
| `src/features/drizzle/seeds/003_blog.ts`   | Seed post contoh                                        |

## Rangkai halamannya

```bash
bun x bosia@latest add page blog/index
bun x bosia@latest add page blog/post
```

Lalu buat view route di sebelah loader yang terpasang:

```svelte
<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
	import Blog from "$lib/pages/blog/index/page.svelte";

	let { data } = $props();
</script>

<Blog posts={data.posts} />
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
	import Post from "$lib/pages/blog/post/page.svelte";

	let { data } = $props();
</script>

<Post post={data.post} bodyHtml={data.post.body} related={data.related} />
```

## Tabel posts

`slug` (unik), `title`, `excerpt`, `body`, `cover`, `tag` dan `published_at`. Post dengan
`published_at = NULL` adalah draf — loader dan daftar hanya mengembalikan post yang terbit.

`body` disimpan sebagai HTML dan dirender tanpa escape oleh `blog/post-body` — hanya isi dengan
konten tepercaya, jangan pernah input pengguna.

Tidak ada UI menulis: masukkan post lewat seed, skrip, atau halaman admin buatanmu di atas
`PostRepository`.
