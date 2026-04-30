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

## Penanganan Error di Produksi

Pada produksi (`NODE_ENV=production`), stack trace dihapus dari response error untuk mencegah kebocoran detail internal ke klien.
