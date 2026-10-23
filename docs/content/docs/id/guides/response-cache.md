---
title: Response Cache
description: Lewati load() + render() + kompresi saat cache hit. Aman per-user lewat identity hash. Invalidasi dari server action dengan invalidate(key) / invalidateAll(prefix).
---

Sejak v0.6 Bosia menyimpan **response cache** di memori yang menyajikan HTML SSR, JSON yang diambil router klien saat navigasi (`/__bosia/data/…`), dan response GET `+server.ts` langsung dari byte terkompresi saat URL yang sama diminta lagi. Saat cache hit tidak ada `load()`, tidak ada `render()`, dan tidak ada kompresi — biasanya response di bawah satu milidetik.

Cache ini **aman untuk user yang login** karena key menyertakan hash dari cookie dan header yang namanya terdaftar di `CACHE_KEYS`. Dua user dengan session cookie berbeda mendapat entry cache berbeda.

## Alur request

1. Lookup `<normalized-path>?<sorted-query>|o=<origin>|i=<identity-hash>` di cache.
2. **Hit** → kirim varian terkompresi yang cocok (brotli, gzip, atau identity) berdasarkan `Accept-Encoding`. Selesai.
3. **Miss** → miss **pertama** pada sebuah kunci menjadi leader: menjalankan `metadata()`, `load()`, render, membangun HTML, lalu mengirimnya terkompresi. Pembuatan salinan gzip + brotli untuk cache berjalan setelah response terkirim.
4. **Miss bersamaan** pada kunci yang sama menunggu leader, lalu cek ulang cache — hit dilayani dari cache, jadi N miss simultan membangun halaman sekali, bukan N kali. Jika leader melewatkan penulisan (mis. mengeset cookie atau response tidak cacheable), tiap waiter membangun sendiri-sendiri.

Hash identitas di sini sama dengan yang dipakai [deduplikasi request](/id/guides/request-deduplication) — satu kontrak `CACHE_KEYS` mengisolasi pengguna di kedua mekanisme.

## Isolasi per-user

Cache key berbentuk:

```
<normalized-path>?<sorted-query>|o=<origin>|i=<identity-hash>
```

`origin` adalah `url.origin` request (protokol + host). Nilainya mengikuti header `Host` (dan `X-Forwarded-*` dengan `TRUST_PROXY=true`), jadi `Host` palsu tidak bisa meracuni salinan untuk pengunjung lain. Tiap alamat yang dilayani app (`app.com`, `www.app.com`, `http://` dan `https://`) punya salinan sendiri; redirect alias ke satu alamat agar salinan dipakai bersama.

`identity-hash` dibangun dari setiap cookie DAN header yang namanya muncul di `CACHE_KEYS`. Default sudah menutup nama session umum:

```
CACHE_KEYS=session,sid,auth,token,jwt,Authorization
```

Tambahkan nama custom kalau app Anda pakai cookie atau header lain untuk autentikasi. Nilai non-kosong apa pun ikut hash; dua request dengan kumpulan nilai sama berbagi entry, dua dengan nilai berbeda tidak.

Kalau konten per-user sebuah rute tidak dikunci oleh apa pun di `CACHE_KEYS`, matikan cache rute itu (lihat di bawah).

## Kelayakan

| Kondisi                                                                           | Hasil                    |
| --------------------------------------------------------------------------------- | ------------------------ |
| `export const cache = false` pada rute                                            | Lewati read + write      |
| Method request ≠ `GET`                                                            | Lewati read + write      |
| `CSP_DIRECTIVES` terset (CSP aktif)                                               | Lewati read + write      |
| `CACHE_MAX_ENTRIES=0`                                                             | Lewati read + write      |
| Status response ≠ 200                                                             | Lewati write             |
| Handler memanggil `cookies.set()`                                                 | Lewati write             |
| `?_invalidated=…` di query                                                        | Lewati read; tetap write |
| Request data dengan `_fresh=1`                                                    | Lewati read; tetap write |
| Request data dikirim sebagai `POST`                                               | Lewati read + write      |
| Loader atau handler mengatur `Cache-Control: no-store`, `no-cache` atau `private` | Lewati write             |
| `Vary` selain `Accept-Encoding` (mis. `Cookie`, `Origin`, `*`)                    | Lewati write             |
| Response `+server.ts` sudah punya `Content-Encoding`                              | Lewati write             |
| Body melebihi `CACHE_MAX_BODY_BYTES` atau seperempat `CACHE_MAX_BYTES`            | Lewati write             |

Skip tidak akan merusak response — sekadar jatuh ke jalur render normal.

Key cache adalah URL ditambah `CACHE_KEYS`, jadi tidak bisa menghormati `Vary` pada hal lain. Response yang mengatur `Vary: Cookie` (meski cookie itu ada di `CACHE_KEYS`) tidak di-cache; jangan pasang `Vary` dan andalkan `CACHE_KEYS`.

## Opt-out per rute

Tambahkan `export const cache = false;` di `+page.server.ts`, `<script module>` milik `+page.svelte`, atau `+server.ts`. Salah satu file halaman yang bilang `false` sudah cukup untuk mematikan cache. Di layout (`+layout.server.ts` atau `<script module>` milik `+layout.svelte`), cache mati untuk semua halaman di bawahnya:

```ts
import type { CacheOption } from "./$types";
export const cache: CacheOption = false;
```

Pakai ini untuk data live (ticker, counter per detik) atau halaman yang personalisasinya tidak ter-cover `CACHE_KEYS`.

Untuk memastikan berhasil, GET halamannya dua kali (bukan `curl -I`: HEAD tidak pernah mengisi cache) dan lihat header `x-bosia-cache`:

```sh
curl -s -o /dev/null http://localhost:3000/live; sleep 1
curl -s -o /dev/null -D - http://localhost:3000/live | grep -i x-bosia-cache
# tidak ada output → opt-out berhasil.  x-bosia-cache: HIT → masih di-cache.
```

Uji dengan cookie user yang sedang login (`-b "session=…"`): request anonim yang di-redirect atau dapat `Set-Cookie` tidak pernah di-cache, jadi terlihat opt-out padahal user yang login tetap dapat salinan cache. Pakai setelan production juga: dengan CSP aktif atau `CACHE_MAX_ENTRIES=0` tidak akan pernah ada HIT.

`cache` dibaca sebelum `load()` jalan dan dipakai bersama oleh semua request, jadi atur saat module dimuat, jangan di dalam `load()`. `setHeaders({ "cache-control": "no-store" })` hanya mencegah satu response disimpan; salinan cache tetap bisa disajikan. Apa pun yang beda per user harus masuk `CACHE_KEYS` atau `cache = false`.

## `invalidate()` sisi server

Setelah write, hapus entry cache yang cocok supaya bacaan berikutnya menyajikan HTML segar:

```ts
import { invalidate } from "bosia/server";

export const actions = {
	rename: async ({ request, locals }) => {
		await db.users.update(locals.user.id, { name: (await request.formData()).get("name") });
		invalidate("app:user");
	},
};
```

- `invalidate("app:user")` — hapus tiap page yang loader-nya panggil `depends("app:user")`.
- `invalidate("/api/posts")` — hapus tiap page yang loader atau `metadata()`-nya fetch `/api/posts`, plus response API `/api/posts` yang di-cache.
- `invalidateAll("/products/")` — hapus tiap entry yang path-nya diawali prefix.

Nama-namanya cocok dengan `invalidate()` sisi browser dari `bosia/client`. Versi server menerapkan konsep key yang sama untuk cache server baru.

## Tagging loader

`depends()` menandai cache loader klien DAN response cache server, jadi satu panggilan melayani dua lapisan:

```ts
export async function load({ depends, locals }) {
	depends("app:user");
	return { user: locals.user };
}
```

Saat form action menjalankan `invalidate("app:user")`, kedua cache menghapus entry dan GET berikutnya menjalankan ulang `load()`.

## Parameter tracking

Link dari iklan, newsletter dan media sosial membawa parameter klik (`?utm_source=…`, `?fbclid=…`, `?gclid=…`) yang tidak pernah mengubah halaman. Tiap nilai akan jadi entry cache sendiri — render penuh per klik, dan halaman yang ramai terdorong keluar dari LRU — jadi halaman mencari request seperti itu dengan URL **tanpa** parameter tersebut: `/blog?utm_source=x&page=2` dilayani dari cache `/blog?page=2`. Loader tetap melihat URL lengkap.

- Daftarnya `CACHE_IGNORE_PARAMS` (default `utm_*,fbclid,gclid,gbraid,wbraid,dclid,msclkid,twclid,ttclid,li_fat_id,igshid,yclid,mc_cid,mc_eid,_ga,_gl`). `nama*` cocok sebagai prefix; mengisinya mengganti daftar; `none` mematikannya.
- Kalau halaman bersihnya belum ada di cache, request di-cache dengan URL lengkapnya sendiri, seperti sebelumnya. Request ini tidak pernah mengisi entry halaman bersih: komponen bisa merender `page.url` (link canonical, field `gclid` tersembunyi), jadi HTML-nya bisa berisi nilai milik pengunjung itu.
- Halaman yang `load()` atau `metadata()`-nya membaca salah satunya (`url.searchParams.get("utm_source")`) atau seluruh query (`url.search`, `url.href`, iterasi `url.searchParams`) tidak dilayani salinan bersih untuk request seperti itu — di-cache per URL lengkap, dengan nilai aslinya.
- Tidak terlacak: komponen, hook `handle`, atau fragmen `render` plugin yang memakai parameternya. Salinan bersih (dirender tanpa parameter) yang dilayani; set `CACHE_IGNORE_PARAMS=none`, atau baca parameternya di `load()`.
- Hanya halaman dan request data router klien. Route API tetap memakai URL lengkap.

## Endpoint API

Handler GET `+server.ts` di-cache dengan aturan key yang sama. Di v0.6 hanya bisa di-invalidasi berdasarkan URL atau prefix — belum ada mekanisme `depends()` untuk handler API:

```ts
invalidate("/api/posts"); // exact
invalidateAll("/api/"); // prefix
```

Invalidasi berbasis tag untuk endpoint API ada di roadmap.

## Env var

| Variabel              | Default                                    | Tujuan                                                                                                                             |
| --------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `CACHE_KEYS`          | `session,sid,auth,token,jwt,Authorization` | Nama cookie/header yang ikut menghitung identity hash.                                                                             |
| `CACHE_MAX_ENTRIES`   | `500`                                      | Kapasitas LRU. `0` mematikan cache sepenuhnya.                                                                                     |
| `CACHE_MAX_BYTES`     | `104857600` (100MB)                        | Memori semua entry (raw + gzip + brotli). `0` = jumlah entry saja.                                                                 |
| `CACHE_IGNORE_PARAMS` | `utm_*,fbclid,gclid,…`                     | Parameter query yang tidak masuk key cache halaman. Lihat [Parameter tracking](#parameter-tracking). `none` = mati.                |
| `CACHE_WAIT_TIMEOUT`  | `60000`                                    | Ms sebuah miss menunggu request lain yang sedang membangun entry yang sama sebelum membangun sendiri. `0` = tunggu sampai selesai. |

Semuanya dibaca sekali saat startup. Tiap entry menyimpan byte raw plus salinan gzip + brotli — biasanya beberapa KB.

## Verifikasi

- `curl -i https://localhost:9000/ | grep X-Bosia-Cache` — `HIT` di request kedua, kosong di pertama.
- `curl -H 'Accept-Encoding: br' -I` — `Content-Encoding: br` saat hit.
- `curl -H 'Cookie: session=alice' …` lalu `Cookie: session=bob` — keduanya miss (identity hash beda).

## Trade-off

- Memori tumbuh sampai `CACHE_MAX_BYTES` (default 100MB) atau `CACHE_MAX_ENTRIES` entry, mana yang lebih dulu. Atur sesuai container.
- Cache hidup in-process. Replika kedua punya cache sendiri; invalidasi pub/sub multi-replika ada di roadmap.
- Tidak ada expiry berbasis TTL — entry hidup sampai LRU eviction atau `invalidate()` eksplisit. Write yang dilakukan author memicu eviction.
