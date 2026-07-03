---
title: Deduplikasi Request
description: Gabungkan request identik yang bersamaan menjadi satu loader in-flight untuk memangkas pemanggilan DB dan API berlebih — sadar identitas, sehingga route per-user aman di-dedup.
---

Ketika N request bersamaan mengakses URL yang sama **dari identitas yang sama**, Bosia menjalankan loader **sekali** dan membagikan hasilnya ke semua waiter. Response yang sudah selesai tidak di-cache — begitu promise resolve, request berikutnya menjalankan `load()` segar.

```
3 request bersamaan ke /blog/post-1 (identitas sama)
┌─────────────┐
│ request 1 ──┐
│ request 2 ──┼──► load() jalan sekali ──► hasil dibagi ke semua 3
│ request 3 ──┘
└─────────────┘
```

Ini **aktif secara default** untuk setiap route. Kunci dedup adalah URL (pathname + query string yang diurutkan) **ditambah hash identitas yang sama dengan yang dipakai [response cache](./response-cache)**: hash dari setiap cookie dan header yang namanya ada di `CACHE_KEYS`. Dua pengguna dengan session cookie berbeda tidak pernah berbagi hasil loader; dua pengguna anonim (tanpa nilai `CACHE_KEYS`) berbagi.

:::warning[Breaking change di 0.8.4]
Grup route `(private)` **tidak lagi mematikan deduplikasi** — dedup kini sadar identitas di mana pun, dan konsep `scope` route sudah dihapus. `(private)` berperilaku seperti folder `(group)` lainnya: tidak muncul di URL, berguna untuk berbagi layout auth.

Jika aplikasi Anda autentikasi dengan **nama cookie atau header kustom**, tambahkan ke `CACHE_KEYS` (lihat di bawah) — itu kini satu-satunya kontrak yang menjaga isolasi route per-user, untuk response cache maupun dedup.
:::

## Isolasi per-user via `CACHE_KEYS`

Hash identitas dibangun dari setiap cookie DAN header yang namanya ada di `CACHE_KEYS`. Default-nya mencakup nama-nama sesi umum:

```
CACHE_KEYS=session,sid,auth,token,jwt,Authorization
```

- Pengguna dengan nilai yang **berbeda** untuk salah satunya mendapat kunci dedup berbeda — loader mereka jalan independen dan tidak mungkin saling melihat data.
- Request **tanpa** nilai `CACHE_KEYS` (trafik anonim) berbagi satu bucket identitas — persis yang diinginkan untuk halaman publik saat beban tinggi.

Jika session cookie Anda bernama kustom (mis. `my_app_sess`), daftarkan:

```
CACHE_KEYS=session,sid,auth,token,jwt,Authorization,my_app_sess
```

Bosia memberi peringatan saat runtime — di dev **dan** prod — setiap kali loader dari response yang di-dedup atau di-cache membaca cookie yang tidak ada di `CACHE_KEYS` (`🚨 SECURITY WARNING` yang menyebut nama cookie-nya, sekali per nama). Jika muncul, tambahkan cookie itu ke `CACHE_KEYS` atau opt-out route dari cache.

## Contoh

```
✅ Di-dedup per pengguna

routes/dashboard/+page.server.ts
   load() baca cookies.get("session") — tiap nilai session dapat loader run
   sendiri; request bersamaan dari session yang SAMA berbagi satu run
```

```
✅ Di-dedup global

routes/blog/[slug]/+page.server.ts
   load() baca dari CMS — request anonim berbagi satu loader run
```

```
❌ Tidak aman — cookie sesi kustom belum didaftarkan

CACHE_KEYS masih default, aplikasi autentikasi dengan "my_app_sess"
   Semua pengguna ter-hash ke identitas sama — tambahkan my_app_sess ke CACHE_KEYS
```

## Batasan

- **Dedup hanya untuk concurrent.** Setelah promise selesai, entri dihapus dari in-flight map. Request berikutnya menjalankan loader lagi. Ini bukan TTL cache.
- **Loader sebaiknya deterministik berdasarkan URL + identitas.** Jika output loader bergantung pada `Date.now()`, randomness, atau state eksternal yang berubah di tengah jendela, setiap waiter melihat snapshot yang sama dari siapa pun yang memicu pemanggilan.
- **Cookie yang di-set di dalam loader yang di-dedup** hanya mengalir ke request yang memicunya. Waiter lain menerima body response tapi tidak header `Set-Cookie`.
- Heuristik auto `Cache-Control` (`private, no-cache` saat cookie diakses) tetap berlaku di dalam blok dedup — jika loader yang mendasari membaca cookies, response setiap waiter ditandai private.
