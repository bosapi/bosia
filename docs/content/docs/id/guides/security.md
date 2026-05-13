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

Pada **mode dev**, `bun run dev` menjalankan proxy di depan app server internal pada port berbeda. Dev proxy menyuntikkan `X-Forwarded-Host` / `X-Forwarded-Proto` dan menyetel `TRUST_PROXY=true` di proses app secara otomatis, sehingga submission form same-origin dan `POST` bekerja tanpa konfigurasi tambahan.

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

Request preflight `OPTIONS` ditangani secara otomatis saat CORS dikonfigurasi. Preflight juga memvalidasi method yang diminta (`Access-Control-Request-Method`) dan header (`Access-Control-Request-Headers`) terhadap `CORS_ALLOWED_METHODS` / `CORS_ALLOWED_HEADERS`. Preflight yang meminta method atau header di luar daftar izin dijawab dengan `403` (tetap membawa `Access-Control-Allow-Origin` dan `Vary: Origin`), sehingga klien yang salah konfigurasi memunculkan pesan "not allowed by CORS policy" yang jelas di devtools browser, bukan diloloskan dengan 204 yang permisif.

Saat CORS dikonfigurasi, setiap response menyertakan `Vary: Origin` — termasuk response untuk origin yang tidak ada di daftar izin. Ini mencegah cache bersama (CDN, cache HTTP browser) secara tidak sengaja menyajikan response berisi `Access-Control-Allow-Origin: A` untuk request dari origin `B` yang berbeda.

## Header Keamanan

Bosia menyetel header-header ini pada setiap response:

| Header                   | Nilai                             |
| ------------------------ | --------------------------------- |
| `X-Content-Type-Options` | `nosniff`                         |
| `X-Frame-Options`        | `SAMEORIGIN`                      |
| `Referrer-Policy`        | `strict-origin-when-cross-origin` |

## Content Security Policy (berbasis nonce)

Setiap request mendapatkan nonce kriptografis baru (entropi 128-bit, di-encode base64). Bosia menempelkannya pada setiap tag `<script>` yang ia emit — script hidrasi page-data, bootstrap tema, SSE reload mode dev, fragment head/body dari plugin yang dikirim lewat framework. Nilai yang sama diekspos di request event:

```ts
// Di +page.server.ts load() atau di hook:
event.locals.nonce; // → "kJ3p1f...":  unik per request
```

CSP sendiri **dimatikan secara bawaan** — menyalakannya tanpa direktif yang tepat akan merusak inline script milikmu dan widget pihak ketiga. Aktifkan dengan menyetel env `CSP_DIRECTIVES`. Placeholder literal `{nonce}` akan disubstitusi dengan nonce per-request pada setiap response:

```bash
CSP_DIRECTIVES="default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline'"
```

Framework lalu menambahkan header `Content-Security-Policy` yang cocok pada setiap response. Gunakan nonce pada inline script milikmu agar tetap jalan di bawah policy ini:

```svelte
<script nonce="{data.nonce}">
	console.log("hello");
</script>
```

Teruskan nonce ke page lewat fungsi `load()`:

```ts
// +page.server.ts
export async function load({ locals }) {
	return { nonce: locals.nonce };
}
```

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
