---
title: Server Loaders
description: Muat data di server dengan load(), metadata(), dan pengaliran data parent().
---

Server loader berjalan pada setiap request untuk mengambil data bagi halaman dan layout.

## Loader Halaman

Ekspor fungsi `load` dari `+page.server.ts`:

```ts
import type { LoadEvent } from "bosia";

export async function load({ params, url, locals, cookies }: LoadEvent) {
	const post = await db.getPost(params.slug);
	return { post };
}
```

Objek yang dikembalikan menjadi prop `data` di `+page.svelte`:

```svelte
<script lang="ts">
	let { data } = $props();
</script>

<h1>{data.post.title}</h1><p>{data.post.content}</p>
```

## Loader Layout

`+layout.server.ts` bekerja dengan cara yang sama. Datanya menjadi prop `data` komponen **layout** itu, dan dapat dijangkau oleh **loader anak** melalui [`parent()`](#pengaliran-data-dengan-parent):

```ts
// src/routes/+layout.server.ts
import type { LoadEvent } from "bosia";

export async function load({ locals }: LoadEvent) {
	return {
		appName: "Bosia Demo",
		requestTime: locals.requestTime,
	};
}
```

> **Data layout tidak otomatis digabung ke prop `data` halaman.** Tidak seperti SvelteKit, Bosia memisahkan setiap hasil load: prop `data` pada `+page.svelte` hanya berisi hasil `load()` halaman itu sendiri. Membaca `data.appName` di halaman yang loadernya tidak mengembalikan `appName` menghasilkan `undefined`. Untuk memakai data layout induk di halaman, aliri secara eksplisit dengan `parent()` (di bawah).

## Pengaliran Data dengan parent()

Loader anak dapat mengakses data dari loader layout induknya:

```ts
// src/routes/blog/[slug]/+page.server.ts
import type { LoadEvent } from "bosia";

export async function load({ params, parent }: LoadEvent) {
	const parentData = await parent();
	const post = await db.getPost(params.slug);

	return {
		post,
		appName: parentData.appName, // from root layout loader
	};
}
```

Data mengalir dari atas ke bawah melalui **loader**: layout root → layout grup → layout halaman → halaman. Setiap loader melihat hasil induknya via `parent()`, tetapi tidak ada yang otomatis digabung ke prop `data` komponen — kembalikan ulang key yang Anda perlukan (seperti `appName` di atas) agar halaman bisa membacanya. Halaman tanpa `load()` tidak bisa memanggil `parent()`; tambahkan loader minimal yang mengembalikan `await parent()` untuk meneruskan data layout.

## Metadata

Ekspor fungsi `metadata` untuk mengatur judul halaman dan meta tag:

```ts
import type { MetadataEvent, LoadEvent } from "bosia";

export function metadata({ params }: MetadataEvent) {
	const post = getPost(params.slug);
	return {
		title: `${post.title} — My Blog`,
		description: `A blog post about ${params.slug}`,
		meta: [{ property: "og:title", content: post.title }],
		// Pass data to load() — avoids duplicate queries
		data: { post },
	};
}

export async function load({ params, parent, metadata }: LoadEvent) {
	const parentData = await parent();
	// Reuse data from metadata() — no duplicate DB query
	const post = metadata?.post ?? getPost(params.slug);
	return { post, appName: parentData.appName };
}
```

Properti `data` pada nilai kembalian `metadata()` diteruskan ke `load()` sebagai `event.metadata`. Ini memungkinkan Anda mengambil data sekali dan berbagi di antara kedua fungsi.

## Properti LoadEvent

| Properti   | Tipe                     | Deskripsi                                     |
| ---------- | ------------------------ | --------------------------------------------- |
| `url`      | `URL`                    | URL request                                   |
| `params`   | `Record<string, string>` | Parameter route dinamis                       |
| `locals`   | `Record<string, any>`    | Data yang disetel oleh middleware hooks       |
| `cookies`  | `Cookies`                | Membaca/menulis cookies                       |
| `fetch`    | `Function`               | Fetch yang sadar sesi (meneruskan cookies)    |
| `parent`   | `() => Promise<Record>`  | Data dari loader layout induk                 |
| `metadata` | `Record \| null`         | Data yang diteruskan dari fungsi `metadata()` |

## Penanganan Error

Lempar error dari loader untuk menampilkan halaman error:

```ts
import { error, redirect } from "bosia";

export async function load({ params }: LoadEvent) {
	const post = await db.getPost(params.slug);

	if (!post) {
		error(404, "Post not found");
	}

	if (post.isPrivate) {
		redirect(303, "/login");
	}

	return { post };
}
```

## Deduplikasi Request

Request identik yang bersamaan berbagi satu loader in-flight secara default. Route per-user (apa pun yang membaca cookie atau sesi) **wajib** opt out dengan menempatkannya di bawah folder grup `(private)`, atau Pengguna B akan menerima data Pengguna A.

Lihat [Deduplikasi Request](./request-deduplication) untuk model lengkap dan aturan keamanannya.

## Timeout

Loader memiliki timeout yang dapat dikonfigurasi untuk mencegah response yang tergantung:

| Variabel Env       | Default | Deskripsi                           |
| ------------------ | ------- | ----------------------------------- |
| `LOAD_TIMEOUT`     | —       | Timeout untuk `load()` dalam ms     |
| `METADATA_TIMEOUT` | —       | Timeout untuk `metadata()` dalam ms |
