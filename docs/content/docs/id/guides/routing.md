---
title: Routing
description: Routing berbasis file dengan parameter dinamis, catch-all routes, route groups, dan layouts.
---

Bosia menggunakan **routing berbasis file**. File-file di dalam `src/routes/` dipetakan langsung ke URL.

## Route Statis

```
src/routes/+page.svelte          →  /
src/routes/about/+page.svelte    →  /about
src/routes/blog/+page.svelte     →  /blog
```

Setiap file `+page.svelte` menjadi halaman pada path direktorinya.

## Route Dinamis

Bungkus nama direktori dalam tanda kurung siku untuk membuat segmen dinamis:

```
src/routes/blog/[slug]/+page.svelte  →  /blog/hello-world
                                        /blog/my-post
                                        /blog/anything
```

Akses nilai yang cocok melalui `params`:

```ts
// +page.server.ts
export async function load({ params }: LoadEvent) {
	const post = await getPost(params.slug);
	return { post };
}
```

## Catch-All Routes

Gunakan `[...rest]` untuk mencocokkan beberapa segmen path:

```
src/routes/all/[...catchall]/+page.svelte  →  /all/a
                                               /all/a/b/c
                                               /all/anything/here
```

`params.catchall` berisi seluruh sub-path yang cocok (misalnya `"a/b/c"`).

## Route Groups

Direktori yang dibungkus dalam tanda kurung **tidak terlihat di URL** tetapi memungkinkan Anda berbagi layout:

```
src/routes/(public)/+layout.svelte    ← layout bersama
src/routes/(public)/+page.svelte      →  /
src/routes/(public)/about/+page.svelte →  /about

src/routes/(admin)/+layout.svelte     ← layout berbeda
src/routes/(admin)/dashboard/+page.svelte →  /dashboard
```

Grup `(public)` dan `(admin)` tidak pernah muncul di URL. Mereka hanya mengontrol `+layout.svelte` mana yang membungkus halaman di dalamnya.

## Prioritas Route

Ketika beberapa route bisa cocok dengan URL, Bosia menyelesaikannya secara berurutan:

1. **Pencocokan tepat** — route statis seperti `/about`
2. **Segmen dinamis** — route `[param]`
3. **Catch-all** — route `[...rest]`

## Layouts

`+layout.svelte` membungkus semua halaman dan child layout di dalam direktorinya:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import "../app.css";
	let { children, data } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
</nav>

<main>
	{@render children()}
</main>
```

Layout bersarang secara otomatis — layout root membungkus layout grup, yang membungkus layout halaman. Konten anak dirender di mana `{@render children()}` berada.

### Data Layout

Pasangkan layout dengan `+layout.server.ts` untuk memuat data:

```ts
// src/routes/+layout.server.ts
import type { LoadEvent } from "bosia";

export async function load({ locals }: LoadEvent) {
	return {
		appName: "My App",
		user: locals.user,
	};
}
```

Semua halaman dan layout anak dapat mengakses data ini melalui `parent()` di loader mereka sendiri.

## Halaman Error

Buat `+error.svelte` untuk menangani error yang dilempar oleh loader:

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
	let { error } = $props();
</script>

<h1>{error.status}</h1><p>{error.message}</p>
```

Halaman error menerima `HttpError` yang dilempar oleh `error()` di dalam loader. Tempatkan halaman error pada level route di mana Anda ingin menangkap error — halaman ini menangkap error dari semua route anak.

## Opsi Halaman

Atur perilaku rendering per halaman dengan mengekspor flag dari `+page.server.ts`:

```ts
// src/routes/dashboard/+page.server.ts
export const ssr = false; // lewati server render, kirim shell + hydrate di client
export const csr = false; // lewati hydration client, hanya HTML server-rendered
export const prerender = true; // build ke HTML statis saat `bosia build`
```

- `ssr = false` — server `load()` tetap berjalan dan hasilnya diinjeksi sebagai page data; client melakukan hydrate dan render. Cocok untuk halaman dengan dependensi khusus browser (`window`, chart, widget pihak ketiga) atau halaman auth-gated di mana SSR menambah latensi tanpa nilai SEO.
- `csr = false` — tidak ada JS untuk halaman ini. HTML statis saja.
- `prerender = true` — di-capture saat build. Untuk route dinamis, ekspor juga `entries()` yang mengembalikan nilai param yang akan di-prerender.

`ssr = false` bersama `csr = false` tidak akan merender apapun dan otomatis di-override ke `csr = true` (dengan peringatan di mode dev). `ssr = false` bersama `prerender = true` bertentangan; route akan dilewati saat prerender.
