---
title: Server Metadata
description: Atur judul halaman, meta tag, Open Graph, dan atribut lang dengan fungsi metadata().
---

Fungsi `metadata()` memungkinkan Anda mendefinisikan tag SEO dan head untuk tiap halaman, berjalan di server sebelum `load()`.

## Penggunaan Dasar

Ekspor sebuah fungsi `metadata` dari `+page.server.ts`:

```ts
import type { MetadataEvent } from "bosia";

export function metadata({ params }: MetadataEvent) {
	return {
		title: "About — My App",
		description: "Learn more about our app.",
	};
}
```

Ini merender sebuah tag `<title>` dan tag `<meta name="description">` di `<head>` halaman.

## Open Graph & Tag Sosial

Gunakan array `meta` untuk menambahkan Open Graph, Twitter Card, atau meta tag kustom apa pun:

```ts
export function metadata({ params }: MetadataEvent) {
	return {
		title: "Blog Post",
		description: "A great blog post.",
		meta: [
			{ property: "og:title", content: "Blog Post" },
			{ property: "og:description", content: "A great blog post." },
			{ property: "og:type", content: "article" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	};
}
```

Tag dengan `property` dirender sebagai `<meta property="...">`, tag dengan `name` dirender sebagai `<meta name="...">`.

## Tag Bahasa & Link

Atur atribut `<html lang>` dan tambahkan tag `<link>` untuk URL kanonik, alternatif hreflang, dan lainnya:

```ts
export function metadata() {
	return {
		title: "Mon Blog",
		lang: "fr",
		link: [
			{ rel: "canonical", href: "https://example.com/blog" },
			{ rel: "alternate", href: "https://example.com/en/blog", hreflang: "en" },
			{ rel: "alternate", href: "https://example.com/fr/blog", hreflang: "fr" },
		],
	};
}
```

## Mengoper Data ke load()

Properti `data` memungkinkan Anda berbagi data yang sudah di-fetch dengan `load()`, menghindari query ganda:

```ts
import type { MetadataEvent, LoadEvent } from "bosia";

export function metadata({ params }: MetadataEvent) {
	const post = await db.getPost(params.slug);
	return {
		title: `${post.title} — Blog`,
		description: post.excerpt,
		meta: [{ property: "og:title", content: post.title }],
		// Pass to load() — avoids a second DB query
		data: { post },
	};
}

export async function load({ params, metadata }: LoadEvent) {
	// Reuse data from metadata(), fall back to fresh query
	const post = metadata?.post ?? (await db.getPost(params.slug));
	return { post };
}
```

Objek `data` dari `metadata()` menjadi `event.metadata` di `load()`. Jika tidak ada fungsi `metadata()`, `event.metadata` bernilai `null`.

## Properti MetadataEvent

| Properti  | Tipe                     | Deskripsi                                                                                                                                    |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `params`  | `Record<string, string>` | Parameter route dinamis                                                                                                                      |
| `url`     | `URL`                    | URL request                                                                                                                                  |
| `locals`  | `Record<string, any>`    | Data yang diset oleh middleware hooks                                                                                                        |
| `cookies` | `Cookies`                | Baca/tulis cookie                                                                                                                            |
| `fetch`   | `Function`               | Helper fetch (cookie hanya diteruskan ke same-origin — lihat [Server Loaders → Cookie Forwarding](/guides/server-loaders#cookie-forwarding)) |

## Tipe Return Metadata

| Properti      | Tipe                                                           | Deskripsi                                             |
| ------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| `title`       | `string`                                                       | Tag `<title>` halaman                                 |
| `description` | `string`                                                       | Tag `<meta name="description">`                       |
| `meta`        | `Array<{ name?: string; property?: string; content: string }>` | Meta tag kustom                                       |
| `lang`        | `string`                                                       | Atribut `<html lang>`                                 |
| `link`        | `Array<{ rel: string; href: string; hreflang?: string }>`      | Tag `<link>` (kanonik, hreflang, dll.)                |
| `data`        | `Record<string, any>`                                          | Data yang dioper ke `load()` sebagai `event.metadata` |

Semua properti opsional.

## Navigasi Sisi-Klien

Selama navigasi sisi-klien, Bosia mengirim `title` dan `description` dari `metadata()` dalam respons data. Router klien otomatis memperbarui judul dokumen dan meta tag description tanpa reload halaman penuh.

## Timeout

Fungsi `metadata()` punya timeout yang bisa dikonfigurasi melalui variabel environment `METADATA_TIMEOUT` (dalam milidetik). Jika `metadata()` terlalu lama, ia timeout dengan anggun dan halaman dirender tanpa metadata.

## Interaksi dengan Caching

Jika `metadata()` memanggil `cookies.get()` atau `cookies.getAll()`, respons data otomatis ditandai dengan `Cache-Control: private, no-cache`. Lihat [Server Loaders](/guides/server-loaders#caching) untuk detailnya.
