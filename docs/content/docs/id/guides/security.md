---
title: Security
description: Proteksi CSRF, CORS, header keamanan, keamanan cookie, dan lainnya.
---

Bosia menyertakan beberapa fitur keamanan yang diaktifkan secara bawaan.

## Proteksi CSRF

Semua request yang tidak aman (POST, PUT, PATCH, DELETE) divalidasi terhadap origin server. Ini menggunakan pendekatan yang sama seperti SvelteKit — memeriksa header `Origin` atau `Referer`.

- Method aman (GET, HEAD, OPTIONS) dikecualikan
- Request yang mengubah state tanpa `Origin`/`Referer` ditolak dengan kode 403
- Request lintas-origin dari origin yang tidak diharapkan diblokir

### Konfigurasi

Izinkan origin tambahan melalui variabel lingkungan `CSRF_ALLOWED_ORIGINS`:

```bash
CSRF_ALLOWED_ORIGINS=https://app.example.com, https://mobile.example.com
```

### Deployment di belakang reverse-proxy (`TRUST_PROXY`)

Secara bawaan Bosia **tidak** mempercayai header `X-Forwarded-Host` dan `X-Forwarded-Proto` saat menentukan apakah origin sebuah request cocok. Server yang langsung terekspos ke internet bisa membiarkan klien memalsukan origin yang diharapkan melalui header forwarded buatan penyerang, sehingga melewati pemeriksaan CSRF.

Saat Bosia berjalan di belakang reverse proxy atau load balancer (nginx, Caddy, Cloudflare, ALB, dsb.), host publik biasanya berbeda dengan header `Host` yang diterima proses Bun di dalamnya. Pada kasus itu, setel:

```bash
TRUST_PROXY=true
```

Aktifkan hanya jika **semua** kondisi berikut terpenuhi:

- Ada proxy/load balancer di depan Bosia.
- Proxy tersebut **menghapus** header `X-Forwarded-*` yang dikirim klien sebelum diteruskan (umumnya proxy melakukan ini secara default; pastikan punyamu juga).
- Proxy menambahkan `X-Forwarded-Host` / `X-Forwarded-Proto` sendiri yang mencerminkan origin publik.

**Jangan** menyetel `TRUST_PROXY=true` jika Bosia langsung terekspos ke internet tanpa proxy, atau jika kamu tidak bisa memastikan proxy membersihkan header forwarded yang masuk — hal itu akan membuka kembali celah pemalsuan yang ditutup oleh nilai default.

## CORS

CORS **dinonaktifkan secara bawaan**. Aktifkan dengan menyetel origin yang diizinkan:

```bash
CORS_ALLOWED_ORIGINS=https://app.example.com, https://admin.example.com
```

Pengaturan CORS tambahan:

```bash
CORS_ALLOWED_METHODS=GET, POST, PUT, DELETE
CORS_ALLOWED_HEADERS=Content-Type, Authorization
CORS_EXPOSED_HEADERS=X-Request-Id
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400
```

Request preflight `OPTIONS` ditangani secara otomatis saat CORS dikonfigurasi.

Saat CORS dikonfigurasi, setiap response menyertakan `Vary: Origin` — termasuk response untuk origin yang tidak ada di daftar izin. Ini mencegah cache bersama (CDN, cache HTTP browser) secara tidak sengaja menyajikan response berisi `Access-Control-Allow-Origin: A` untuk request dari origin `B` yang berbeda.

## Header Keamanan

Bosia menyetel header-header ini pada setiap response:

| Header                   | Nilai                             |
| ------------------------ | --------------------------------- |
| `X-Content-Type-Options` | `nosniff`                         |
| `X-Frame-Options`        | `SAMEORIGIN`                      |
| `Referrer-Policy`        | `strict-origin-when-cross-origin` |

## Keamanan Cookie

API cookie menyertakan beberapa proteksi:

- **Pencegahan injeksi header** — nilai yang mengandung `;`, `\r`, atau `\n` ditolak
- **Validasi SameSite** — hanya `Strict`, `Lax`, atau `None` yang diterima
- **Encoding otomatis** — nilai cookie dienkode secara aman dengan `encodeURIComponent`

Setel opsi cookie yang aman:

```ts
event.cookies.set("session", token, {
	path: "/",
	httpOnly: true, // not accessible via JavaScript
	secure: true, // HTTPS only
	sameSite: "Lax", // protects against CSRF
	maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

## Proteksi XSS

Data JSON yang disematkan dalam HTML yang dirender server diescap menggunakan serializer yang aman yang:

- Mengescap `<`, `>`, `&`, `'`, `"`, dan karakter Unicode yang dapat keluar dari tag script
- Menangani referensi sirkular dengan baik

## Batas Ukuran Body Request

Ukuran body request dibatasi secara bawaan untuk mencegah denial-of-service:

```bash
BODY_SIZE_LIMIT=512K    # default
BODY_SIZE_LIMIT=1M      # 1 megabyte
BODY_SIZE_LIMIT=10M     # 10 megabytes
BODY_SIZE_LIMIT=Infinity # no limit (not recommended)
```

Mendukung sufiks `K` (kilobyte), `M` (megabyte), dan `G` (gigabyte).

## Proteksi Path Traversal

Penayangan file statis dan halaman prerendered memvalidasi bahwa path file yang telah diselesaikan tetap berada dalam direktori yang diizinkan, mencegah serangan traversal `../`.

Pada waktu build, nilai `entries()` untuk prerender juga divalidasi: `..` dan `\` tidak pernah diizinkan di segmen mana pun, dan `/` hanya diizinkan pada segmen catch-all (`[...rest]`). Build yang mengembalikan nilai tidak aman akan gagal lebih awal dengan pesan error yang jelas, alih-alih diam-diam menulis HTML ke luar direktori output.

## Proteksi Open-Redirect

`redirect(status, location)` menolak URL eksternal secara bawaan. Setel `{ allowExternal: true }` untuk redirect eksternal yang sah (misalnya provider OAuth):

```ts
import { redirect } from "bosia";

redirect(303, "https://accounts.example.com/oauth", { allowExternal: true });
```

Meski `allowExternal: true`, skema berbahaya — `javascript:`, `data:`, `vbscript:` — **selalu** ditolak. Skema-skema itu tidak pernah menjadi tujuan redirect yang sah dan bisa disalahgunakan untuk menyuntikkan eksekusi script ke dalam rantai redirect.

## Penanganan Error di Produksi

Pada produksi (`NODE_ENV=production`), stack trace dihapus dari response error untuk mencegah kebocoran detail internal ke klien.
