---
title: Route SEO
description: Route /sitemap.xml, /robots.txt, dan /rss.xml siap pakai, dilayani dari satu file konfigurasi kecil.
---

Feature `seo` memasang tiga route untuk crawler — `/sitemap.xml`, `/robots.txt`, dan `/rss.xml` —
semuanya diberi data dari satu file konfigurasi yang kamu isi. Tanpa database, tanpa layanan
eksternal.

## Install

```bash
bun x bosia@latest feat seo
```

## Yang kamu dapat

| Path                                | Fungsi                                               |
| ----------------------------------- | ---------------------------------------------------- |
| `src/features/seo/config.ts`        | Satu objek konfigurasi: base URL, path, entri feed   |
| `src/routes/sitemap.xml/+server.ts` | Sitemap dibangun dari `publicPaths`                  |
| `src/routes/robots.txt/+server.ts`  | Mengizinkan path publik, memblokir `privatePrefixes` |
| `src/routes/rss.xml/+server.ts`     | Feed RSS 2.0 dibangun dari `rssItems`                |

## Konfigurasi

Edit `src/features/seo/config.ts`:

```ts
export const SEO = {
	baseUrl: process.env.PUBLIC_BASE_URL || "",
	title: "My Site",
	description: "What this site is about.",
	publicPaths: ["/", "/blog", "/contact"],
	privatePrefixes: ["/api", "/dashboard"],
	rssItems: [],
};
```

Set `PUBLIC_BASE_URL` (mis. `https://example.com`) di `.env` agar crawler mendapat origin
kanonismu; saat kosong, route memakai origin request. Di luar production
(`NODE_ENV !== "production"`), `robots.txt` melarang semuanya sehingga staging tidak pernah
terindeks.

## Mengisi feed RSS

`rssItems` adalah daftar statis `{ title, link, description?, pubDate? }`. Jika kamu memasang
[feature `blog`](/guides/blog/), petakan post-mu ke dalamnya di `config.ts` — atau ganti daftarnya
dengan panggilan `PostRepository` di `src/routes/rss.xml/+server.ts`.

## Meta tag itu terpisah

Route ini hanya mengurus keperluan crawler. `<title>`, deskripsi, Open Graph, dan Twitter card
per halaman berasal dari `metadata()` di file `+page.server.ts`-mu — lihat
[panduan server metadata](/guides/server-metadata/).
