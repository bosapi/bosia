---
title: Response Cache
description: Lewati load() + render() + kompresi saat cache hit. Aman per-user lewat identity hash. Invalidasi dari server action dengan invalidate(key) / invalidateAll(prefix).
---

Sejak v0.6 Bosia menyimpan **response cache** di memori yang menyajikan HTML SSR dan response GET `+server.ts` langsung dari byte terkompresi saat URL yang sama diminta lagi. Saat cache hit tidak ada `load()`, tidak ada `render()`, dan tidak ada kompresi — biasanya response di bawah satu milidetik.

Cache ini **aman untuk user yang login** karena key menyertakan hash dari cookie dan header yang namanya terdaftar di `CACHE_KEYS`. Dua user dengan session cookie berbeda mendapat entry cache berbeda.

## Alur request

1. Lookup `<dedup-key>|i=<identity-hash>` di cache.
2. **Hit** → kirim varian terkompresi yang cocok (brotli, gzip, atau identity) berdasarkan `Accept-Encoding`. Selesai.
3. **Miss** → miss **pertama** pada sebuah kunci menjadi leader: menjalankan `metadata()`, `load()`, render, membangun chunk HTML, lalu stream response. Kompresi + tulis cache jalan di microtask setelah response keluar.
4. **Miss bersamaan** pada kunci yang sama menunggu leader, lalu cek ulang cache — hit dilayani dari cache, jadi N miss simultan membangun halaman sekali, bukan N kali. Jika leader melewatkan penulisan (mis. mengeset cookie atau response tidak cacheable), tiap waiter membangun sendiri-sendiri.

Hash identitas di sini sama dengan yang dipakai [deduplikasi request](./request-deduplication) — satu kontrak `CACHE_KEYS` mengisolasi pengguna di kedua mekanisme.

## Isolasi per-user

Cache key berbentuk:

```
<normalized-path>?<sorted-query>|i=<identity-hash>
```

`identity-hash` dibangun dari setiap cookie DAN header yang namanya muncul di `CACHE_KEYS`. Default sudah menutup nama session umum:

```
CACHE_KEYS=session,sid,auth,token,jwt,Authorization
```

Tambahkan nama custom kalau app Anda pakai cookie atau header lain untuk autentikasi. Nilai non-kosong apa pun ikut hash; dua request dengan kumpulan nilai sama berbagi entry, dua dengan nilai berbeda tidak.

Kalau konten per-user sebuah rute tidak dikunci oleh apa pun di `CACHE_KEYS`, matikan cache rute itu (lihat di bawah).

## Kelayakan

| Kondisi                                | Hasil                    |
| -------------------------------------- | ------------------------ |
| `export const cache = false` pada rute | Lewati read + write      |
| Method request ≠ `GET`                 | Lewati read + write      |
| `CSP_DIRECTIVES` terset (CSP aktif)    | Lewati read + write      |
| `CACHE_MAX_ENTRIES=0`                  | Lewati read + write      |
| Status response ≠ 200                  | Lewati write             |
| Handler memanggil `cookies.set()`      | Lewati write             |
| `?_invalidated=…` di query             | Lewati read; tetap write |

Skip tidak akan merusak response — sekadar jatuh ke jalur render normal.

## Opt-out per rute

Tambahkan `export const cache = false;` di file `+page.ts`, `+page.server.ts`, atau `+server.ts`:

```ts
import type { CacheOption } from "./$types";
export const cache: CacheOption = false;
```

Pakai ini untuk data live (ticker, counter per detik) atau halaman yang personalisasinya tidak ter-cover `CACHE_KEYS`.

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
- `invalidate("/api/posts")` — hapus tiap page yang loader-nya fetch `/api/posts`, plus response API `/api/posts` yang di-cache.
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

## Endpoint API

Handler GET `+server.ts` di-cache dengan aturan key yang sama. Di v0.6 hanya bisa di-invalidasi berdasarkan URL atau prefix — belum ada mekanisme `depends()` untuk handler API:

```ts
invalidate("/api/posts"); // exact
invalidateAll("/api/"); // prefix
```

Invalidasi berbasis tag untuk endpoint API ada di roadmap.

## Env var

| Variabel            | Default                                    | Tujuan                                                 |
| ------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `CACHE_KEYS`        | `session,sid,auth,token,jwt,Authorization` | Nama cookie/header yang ikut menghitung identity hash. |
| `CACHE_MAX_ENTRIES` | `500`                                      | Kapasitas LRU. `0` mematikan cache sepenuhnya.         |

Keduanya dibaca sekali saat startup. Tiap entry menyimpan byte raw plus salinan gzip + brotli — biasanya beberapa KB.

## Verifikasi

- `curl -i https://localhost:9000/ | grep X-Bosia-Cache` — `HIT` di request kedua, kosong di pertama.
- `curl -H 'Accept-Encoding: br' -I` — `Content-Encoding: br` saat hit.
- `curl -H 'Cookie: session=alice' …` lalu `Cookie: session=bob` — keduanya miss (identity hash beda).

## Trade-off

- Memori tumbuh sebesar `CACHE_MAX_ENTRIES × (raw + gzip + brotli)`. Atur cap sesuai container.
- Cache hidup in-process. Replika kedua punya cache sendiri; invalidasi pub/sub multi-replika ada di roadmap.
- Tidak ada expiry berbasis TTL — entry hidup sampai LRU eviction atau `invalidate()` eksplisit. Write yang dilakukan author memicu eviction.
