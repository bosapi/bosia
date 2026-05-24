---
title: Invalidasi Data
description: Gunakan depends(), invalidate(), dan invalidateAll() untuk mengontrol kapan loader server dijalankan ulang saat navigasi sisi klien.
---

Secara default, Bosia menyimpan hasil setiap `load()` dari `+page.server.ts` dan `+layout.server.ts` di browser setelah pemanggilan pertama. Pada navigasi sisi klien berikutnya, sebuah loader hanya dijalankan ulang ketika sesuatu yang benar-benar dibacanya berubah — parameter rute, parameter pencarian, URL yang dilacak, atau kunci yang dideklarasikan loader melalui `depends()`. Layout yang secara konseptual tidak berubah (misal navbar yang hanya membaca `locals.user`) sepenuhnya melewatkan round-trip server.

Model ini identik dengan SvelteKit: opt-in, dapat diprediksi, dan eksplisit.

## Pelacakan dependensi otomatis

Loader secara otomatis bergantung pada:

- Setiap `params.X` yang dibaca
- Setiap `url.searchParams.get(X)` atau `.has(X)` yang dibaca
- Setiap `url.pathname`/`origin`/`href` yang dibaca
- Setiap `cookies.get(X)` yang dibaca
- Setiap URL yang dilewatkan ke `fetch()` yang di-inject

```ts
// +page.server.ts
import type { LoadEvent } from "bosia";

export async function load({ params, url, fetch }: LoadEvent) {
	const q = url.searchParams.get("q") ?? "";
	const res = await fetch(`/api/posts?q=${q}&slug=${params.slug}`);
	return { posts: await res.json() };
}
```

Loader ini akan dijalankan ulang ketika `params.slug` berubah, ketika `?q=` berubah, atau ketika sesuatu meng-invalidasi URL `/api/posts?q=...` secara eksplisit. Navigasi ke rute saudara dengan parameter sama akan menggunakan ulang hasil cache.

## `depends()`

Mendeklarasikan kunci dependensi kustom di dalam loader:

```ts
export async function load({ depends, locals }: LoadEvent) {
	depends("app:user");
	return { user: locals.user };
}
```

Panggil `invalidate("app:user")` dari mana saja di klien untuk memaksa loader ini berjalan ulang pada navigasi berikutnya.

## `invalidate()`

```ts
import { invalidate } from "bosia/client";

// Kunci kustom (cocok dengan `depends("app:user")`)
await invalidate("app:user");

// URL (cocok untuk loader yang fetch URL tersebut)
await invalidate("/api/posts");

// Predikat terhadap URL yang dilacak
await invalidate((url) => url.pathname.startsWith("/api/"));
```

Invalidasi menandai entri cache yang cocok sebagai kotor (dirty) dan menjalankan ulang hanya loader tersebut pada saat efek navigasi berikutnya menyala. Memanggil `invalidate()` di luar navigasi (misal setelah pesan WebSocket) akan memicu pengulangan untuk URL saat ini.

## `invalidateAll()`

```ts
import { invalidateAll } from "bosia/client";

await invalidateAll();
```

Menghapus seluruh entri cache. Semua loader dijalankan ulang pada navigasi berikutnya.

## Form actions

`use:enhance` meng-invalidasi **hanya loader page** secara default. Layout tetap di-cache. Jika sebuah mutasi juga perlu menjalankan ulang layout (misal memperbarui nama pengguna di navbar), panggil `invalidate()` dari submit handler:

```svelte
<script lang="ts">
	import { enhance } from "bosia/client";
	import { invalidate } from "bosia/client";
</script>

<form
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			await invalidate("app:user");
		};
	}}
>
	<!-- ... -->
</form>
```

## Catatan

- **`setHeaders`**: loader yang di-cache tidak menerapkan ulang response headers. Jika loader menetapkan `Cache-Control` atau `Set-Cookie` via `setHeaders`, pastikan itu tidak bergantung pada data yang dilewatkan loader.
- **`metadata()`**: `metadata()` di level page selalu berjalan di setiap navigasi. Cakupan cache hanya untuk loader.
- **Hard refresh**: cache hidup di memori browser dan terhapus saat reload penuh. Navigasi berikutnya akan berperilaku seperti pemuatan pertama.
- **Rute privat**: cache hidup per-browser, jadi rute `(private)` aman — tidak ada kebocoran antar pengguna. Server-side request dedup tetap dinonaktifkan untuk rute `(private)` seperti sebelumnya.

## `invalidate()` sisi server untuk response cache

`invalidate()` sisi browser membersihkan cache loader per-browser. Sejak v0.6 Bosia juga punya **response cache sisi server** yang melewatkan `load()` + `render()` + kompresi saat cache hit. Cache ini dihapus dengan API paralel yang diekspos dari entry utama:

```ts
import { invalidate, invalidateAll } from "bosia";

// Form action — re-render GET berikutnya untuk page mana pun yang depends("app:user")
export const actions = {
	default: async ({ request }) => {
		await updateUserName(request);
		invalidate("app:user");
	},
};
```

- `invalidate("app:user")` menghapus semua page yang loader-nya memanggil `depends("app:user")`.
- `invalidate("/api/posts")` menghapus semua page yang loader-nya fetch `/api/posts`, plus response API `/api/posts` yang di-cache.
- `invalidateAll("/products/")` menghapus semua entri yang path-nya diawali `/products/`.

Form action adalah titik invalidasi paling umum — setelah mutasi, panggil `invalidate()` supaya pembacaan berikutnya disajikan HTML segar. Fungsi ini sinkron (tidak perlu `await`).

Endpoint API (`+server.ts`) di v0.6 hanya bisa di-invalidasi berdasarkan URL/prefix. Invalidasi berbasis tag untuk handler API ada di roadmap.

Matikan response cache per-rute dengan `export const cache = false;` di `+page.ts`, `+page.server.ts`, atau `+server.ts`. Detail lengkap di [Response cache](/id/guides/response-cache).
