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

`+layout.server.ts` bekerja dengan cara yang sama tetapi datanya tersedia untuk **semua route anak**:

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

Data mengalir dari atas ke bawah: layout root → layout grup → layout halaman → halaman.

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

Ketika banyak klien mengakses route yang sama secara bersamaan, Bosia secara otomatis mendeduplikasi eksekusi loader. Alih-alih menjalankan `load()` sekali per request, request identik yang bersamaan berbagi satu promise yang sedang berjalan.

Contoh: 10 pengguna mengakses `/products` secara bersamaan menghasilkan **satu** pemanggilan `load()` — semua 10 menerima hasil yang sama.

### Cara kerja

- Kunci dedup dibangun dari **path route** + **query params yang diurutkan** + **identitas pengguna**
- Jika request yang cocok sudah sedang berjalan, request baru menunggu promise yang sama
- Setelah promise selesai (resolve atau reject), entri dihapus — tidak ada data basi, tidak ada TTL
- Setiap request tetap mendapatkan response HTTP sendiri dengan header dan cookies masing-masing

### Identitas pengguna

Dedup menggunakan header `Authorization` atau cookie `authorization` (case-insensitive) untuk membedakan pengguna:

- **Request anonim** (tanpa auth) berbagi kunci dedup yang sama — deduplikasi maksimal
- **Request terautentikasi** dikunci per pengguna — pengguna berbeda selalu menjalankan loader terpisah

:::caution
Jika aplikasi Anda menggunakan **nama cookie berbeda** untuk autentikasi (bukan `authorization`), dedup akan memperlakukan pengguna terautentikasi sebagai anonim dan berbagi hasil loader antar mereka. Gunakan header `Authorization` atau ubah nama cookie auth Anda menjadi `authorization`.
:::

### Cakupan

Dedup hanya berlaku untuk endpoint `/__bosia/data/` (pengambilan data navigasi sisi klien). Dedup **tidak** berlaku untuk:

- Render halaman SSR (pemuatan halaman awal)
- Request POST/PUT/DELETE
- Route API (`+server.ts`)

## Timeout

Loader memiliki timeout yang dapat dikonfigurasi untuk mencegah response yang tergantung:

| Variabel Env       | Default | Deskripsi                           |
| ------------------ | ------- | ----------------------------------- |
| `LOAD_TIMEOUT`     | —       | Timeout untuk `load()` dalam ms     |
| `METADATA_TIMEOUT` | —       | Timeout untuk `metadata()` dalam ms |
