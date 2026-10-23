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

Catch-all bisa ada setelah param: `[lang]/[...rest]` cocok dengan `/en/a/b`. Catch-all harus jadi bagian terakhir route — `docs/[...path]/edit` membuat build gagal.

Nama param mengikuti aturan nama variabel TypeScript, hanya ASCII: huruf, angka, `_` dan `$`, tidak diawali angka (`[slug]`, `[x123]`, `[user_id]`, `[_id]`, `[...path]`). Selain itu, seperti `[post-id]` atau `[file.name]`, membuat build gagal. Kurung harus membungkus satu segmen utuh: `[id].json`, `post-[slug]`, optional `[[lang]]` atau `[id?]`, dan matcher seperti `[id=integer]` tidak didukung dan membuat build gagal.

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

Karena grup tidak terlihat, dua file bisa berakhir di URL yang sama — misalnya `src/routes/+page.svelte` dan `src/routes/(public)/+page.svelte` sama-sama `/`. Begitu juga `blog/[id]` dan `(app)/blog/[slug]`. Seperti SvelteKit dan Next.js, Bosia menolaknya: `bun run build` gagal dan `bun run dev` menampilkan error yang menyebut kedua file. Hapus atau pindahkan salah satunya.

## Prioritas Route

Ketika beberapa route bisa cocok dengan URL, Bosia membandingkannya segmen demi segmen, dari kiri ke kanan. Pada segmen pertama yang berbeda, yang lebih spesifik menang:

1. **Statis** — nama tetap seperti `label`
2. **Dinamis** — `[param]`
3. **Catch-all** — `[...rest]`

Jadi `/label/[id]` menang atas `/[folder]/[thread]` untuk `/label/inbox`, dan `/blog/[...slug]` menang atas `/[lang]/about` untuk `/blog/about`.

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
	import type { ErrorProps } from "./$types";
	let { error }: ErrorProps = $props();
</script>

<h1>{error.status}</h1><p>{error.message}</p>
```

Halaman error menerima `HttpError` yang dilempar oleh `error()` di dalam loader. Tempatkan halaman error pada level route di mana Anda ingin menangkap error — halaman ini menangkap error dari semua route anak. Tipe `ErrorProps` dan `PageError` di-generate ke `./$types` — tidak perlu mendeklarasikan tipe prop secara manual.

Halaman error juga menerima `params` dari route yang gagal (`let { error, params }: ErrorProps = $props()`). Karena halaman error menangkap route anak juga, `params` milik anak (misalnya `params.slug` di bawah `/blog`) bertipe `string | undefined`, dan 404 mendapat `{}`.

## Kerangka Loading

Buat `+loading.svelte` di folder route untuk menampilkan kerangka (skeleton) saat berpindah **ke** halaman tersebut, alih-alih membiarkan halaman lama tetap tampil sampai kode dan data halaman baru selesai dimuat:

```svelte
<!-- src/routes/blog/+loading.svelte -->
<div class="skeleton">
	<div class="line"></div>
	<div class="line"></div>
</div>
```

Seperti `+error.svelte`, ini dirender **di dalam layout yang dibagi** antara halaman saat ini dan tujuan — jadi nav, header, dan tab di sekelilingnya tetap terpasang dan hanya area konten yang menampilkan kerangka. Layout yang _ditambahkan_ tujuan belum terpasang, sehingga `+loading.svelte` menggambar chrome itu sendiri (sama seperti `loading.tsx` di Next.js).

Aturan:

- Hanya muncul saat URL benar-benar berubah — bukan saat `invalidate()` atau rerun path yang sama.
- Tanpa `+loading.svelte` ⇒ perilaku tidak berubah (halaman lama tetap sampai pertukaran).
- **Menurun ke route anak**, yang terdekat menang — satu `+loading.svelte` di puncak sebuah section mencakup semua halaman di bawahnya. Tambahkan satu lagi lebih dalam untuk memberi subtree-nya kerangka sendiri.

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
- `prerender = true` — di-capture saat build. Untuk route dinamis, ekspor juga `entries()` yang mengembalikan nilai param yang akan di-prerender. Nilainya hanya boleh huruf ASCII, angka, `-`, `_`, `.` dan `~` (plus `/` di catch-all), seperti `50-off`; selain itu build gagal.

`ssr = false` bersama `csr = false` tidak akan merender apapun dan otomatis di-override ke `csr = true` (dengan peringatan di mode dev). `ssr = false` bersama `prerender = true` bertentangan; route akan dilewati saat prerender. Begitu juga halaman yang mengekspor `actions`: file statis tidak bisa menjalankan form action, jadi halaman tetap dirender langsung.

`bosia build` dan `bosia dev` membaca flag ini dengan meng-import setiap `+page.server.ts`, `+layout.server.ts` dan `+server.ts`, jadi penulisan apa pun berlaku (`export { p as prerender }`, `let`, konstanta bersama). Kode top-level di file itu ikut jalan saat build: kalau ada yang melempar error (misalnya konek ke database yang tidak terjangkau dari mesin build), `bosia build` gagal (`bosia dev` hanya memberi peringatan dan memakai flag terakhir file itu). Pindahkan kerja itu ke `load()` atau ke dalam fungsi. Di `bosia dev`, flag dibaca ulang saat file server route disimpan; setelah mengubah konstanta yang di-import dari `src/lib`, simpan file route-nya (atau restart dev).
