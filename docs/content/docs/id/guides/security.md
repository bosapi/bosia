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

### Mengecualikan path webhook (`CSRF_EXEMPT_PATHS`)

Webhook server-ke-server (Stripe, Xendit, GitHub, …) melakukan POST dari server lain, sehingga tidak membawa header `Origin` atau `Referer` dan akan ditolak oleh pemeriksaan origin. Daftarkan path-nya di `CSRF_EXEMPT_PATHS` agar diloloskan:

```bash
CSRF_EXEMPT_PATHS=/webhook/xendit, /webhook/stripe
```

Pencocokan bersifat persis atau pada batas path: `/webhook` mencakup `/webhook` dan semua di bawah `/webhook/…`, tetapi bukan kemiripan seperti `/webhooky`. Gunakan path spesifik (`/webhook/xendit`) untuk membuka satu rute saja, atau prefix (`/webhook`) untuk membuka satu grup.

**Path yang dikecualikan melewati CSRF sepenuhnya — rute tersebut WAJIB mengautentikasi pemanggilnya sendiri.** Verifikasi token atau signature webhook dari penyedia (mis. membandingkan header `x-callback-token` dengan sebuah secret) sebelum memproses request. CSRF bukan pengganti pemeriksaan itu; CSRF memang tidak pernah melindungi panggilan server-ke-server.

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

Saat aktif, Bosia membangun ulang URL request dari header itu, jadi `event.url`, redirect absolut, cek origin CSRF dan WebSocket, serta flag cookie `Secure` memakai origin publik. Nilai berantai (`https, http`) memakai entri pertama; `ws`/`wss` (Traefik saat upgrade) dibaca sebagai `http`/`https`. Host yang rusak atau scheme yang tidak dikenal diabaikan.

**Jangan** menyetel `TRUST_PROXY=true` jika Bosia langsung terekspos ke internet tanpa proxy, atau jika kamu tidak bisa memastikan proxy membersihkan header forwarded yang masuk — hal itu akan membuka kembali celah pemalsuan yang ditutup oleh nilai default.

Pada **mode dev**, `bun run dev` menjalankan proxy di depan app server internal pada port berbeda. Dev proxy menyuntikkan `X-Forwarded-Host` / `X-Forwarded-Proto` dan menyetel `TRUST_PROXY=true` di proses app secara otomatis, sehingga submission form same-origin dan `POST` bekerja tanpa konfigurasi tambahan.

### Host yang diizinkan (`ALLOWED_HOSTS`)

Secara default Bosia menjawab header `Host` apa pun (atau `X-Forwarded-Host` dengan `TRUST_PROXY=true`). Page cache menyimpan salinan terpisah per host, jadi klien yang mengirim host acak bisa mendorong halaman asli keluar dari cache. Di production, daftarkan host yang dilayani app:

```bash
ALLOWED_HOSTS=app.com,www.app.com
```

Isinya hostname dipisah koma, atau `host:port` untuk port non-default. Host tanpa port hanya mengizinkan port default (80/443), karena tiap port punya salinan cache sendiri: app yang diakses langsung lewat `:3000` perlu `app.com:3000`. Pencocokan persis (tanpa wildcard); huruf besar/kecil tidak berpengaruh. `ALLOWED_HOSTS=*` berarti semua host, sama dengan tidak di-set. Request ke `app.com.` (titik di akhir) ditolak. Halaman dan route `+server.ts` di host lain mendapat `400 Invalid Host` (warning dicatat paling banyak sekali per menit). Route yang ditambahkan plugin di `backend.before` berjalan sebelum pengecekan ini. `/_health` selalu dijawab, jadi load balancer tetap bisa cek lewat IP.

Entri yang bukan host polos (`https://app.com`, `app.com/`, `*.app.com`) diabaikan dengan warning; jika tidak ada entri yang valid, server menolak start. `bun run dev` dan langkah prerender saat build mengabaikan `ALLOWED_HOSTS`. `bosia start` tidak: untuk mencoba build production di `localhost`, tambahkan `localhost:3000` ke daftar atau kosongkan.

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

### Mematikan `X-Frame-Options`

Setel `DISABLE_X_FRAME_OPTIONS=true` untuk menghilangkan header `X-Frame-Options`. Ditujukan untuk aplikasi yang memang sengaja disematkan sebagai iframe oleh origin lain — hub preview/proxy, alat desain, sandbox runner. Header keamanan lain tetap aktif.

```bash
DISABLE_X_FRAME_OPTIONS=true
```

Jika kamu mengontrol embedder dan butuh aturan framing yang lebih ketat, lebih baik gunakan `frame-ancestors` lewat `CSP_DIRECTIVES` daripada menghapus `X-Frame-Options`.

## Content Security Policy (berbasis nonce)

CSP **dimatikan secara bawaan** — menyalakannya tanpa direktif yang tepat akan merusak inline script milikmu dan widget pihak ketiga. Aktifkan dengan menyetel env `CSP_DIRECTIVES`. Placeholder literal `{nonce}` akan disubstitusi dengan nonce per-request baru (entropi 128-bit, base64) pada setiap response:

```bash
CSP_DIRECTIVES="default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline'"
```

Setelah `CSP_DIRECTIVES` diset, dua hal terjadi pada setiap response:

1. Header `Content-Security-Policy` yang cocok ditambahkan.
2. Tag `<script>` milik framework — hidrasi page-data, bootstrap tema, SSE reload mode dev, fragment head/body dari plugin yang dikirim lewat framework — distempel `nonce="…"` agar policy tidak memblokirnya.

Tanpa `CSP_DIRECTIVES`, framework tidak mengirim header maupun atribut nonce (atribut saja hanya membuang byte — browser hanya membandingkan nonce ketika ada header policy yang menyuruhnya).

Nonce yang sama selalu diekspos di request event sehingga kode pengguna bisa memakainya di policy apa pun:

```ts
// Di +page.server.ts load() atau di hook:
event.locals.nonce; // → "kJ3p1f...":  unik per request
```

Gunakan nonce pada inline script milikmu agar tetap jalan di bawah policy ini:

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

Ini termasuk inline script di `<svelte:head>`: script itu dikirim di HTML server dan jalan saat muat pertama, jadi tanpa nonce policy akan memblokirnya.

Escape `<` saat memasukkan data ke dalam script lewat `{@html}`, misalnya JSON-LD. Kalau tidak, nilai yang berisi `</script>` menutup blok lebih awal dan sisanya jalan sebagai script sungguhan:

```ts
const ld = JSON.stringify(data).replace(/</g, "\\u003c");
```

## Keamanan Cookie

API cookie menyertakan beberapa proteksi:

- **Pencegahan injeksi header** — nilai yang mengandung `;`, `\r`, atau `\n` ditolak
- **Validasi SameSite** — hanya `Strict`, `Lax`, atau `None` yang diterima
- **Encoding otomatis** — nilai cookie dienkode secara aman dengan `encodeURIComponent`

Setel opsi cookie yang aman:

```ts
event.cookies.set("session", token, {
	httpOnly: true, // not accessible via JavaScript
	secure: true, // HTTPS only
	sameSite: "Lax", // protects against CSRF
	maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

`Path` bawaannya mengikuti mount — `/` pada umumnya, atau `BASE_PATH` saat aplikasi [dipasang di sub-path](/id/reference/deployment/#memasang-di-sub-path). Pelingkupan itulah yang menjaga sesi tidak bocor ke aplikasi tetangga di origin yang sama, jadi jangan menuliskan `path: "/"` untuk membatalkannya. `cookies.delete()` tanpa `path` mengikuti bawaan yang sama.

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

## Penjaga Rute di Hook

Lindungi halaman yang butuh login di `src/hooks.server.ts`, berdasarkan id route:

```ts
// src/hooks.server.ts
import { redirect, type Handle } from "bosia";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = await getUser(event.cookies.get("session"));
	if (event.route.id?.startsWith("/(private)") && !event.locals.user) {
		throw redirect(303, "/login");
	}
	return resolve(event);
};
```

`event.route.id` adalah folder route di bawah `src/routes`, grup tetap disertakan: halaman di
`src/routes/(private)/dashboard/[id]/+page.svelte` punya id `/(private)/dashboard/[id]`. Halaman
baru di bawah `(private)` otomatis terlindungi tanpa mengubah hook. Periksa id-nya, bukan
`event.url.pathname`: grup tidak muncul di URL.

`handle` berjalan sebelum semua hal lain pada request: `metadata()`, setiap loader, form action,
dan handler API. Pengunjung yang ditolak tidak menjalankan kode halaman sama sekali. Pengecekan
yang sama mencakup muat halaman penuh, navigasi sisi klien, POST form action, dan rute API
(`/api/(admin)/users`).

**Aturannya: jaga di hook.** Jangan jadikan `+layout.server.ts` sebagai penjaga. `metadata()` mulai
bersamaan dengan loader layout, jadi redirect dari layout tetap memindahkan pengunjung, tetapi
`metadata()` halaman sudah terlanjur berjalan untuk mereka. Begitu juga `load()` halaman, sampai `await parent()` pertamanya: semua loader mulai bersamaan. Pengecekan yang bergantung pada datanya ("apakah user ini pemilik post
ini?") tempatnya di loader atau action yang membaca data tersebut.

`parent()` selalu mengembalikan data yang dihasilkan di server. Browser tidak bisa menyuplainya.

## Proteksi Path Traversal

Penayangan file statis dan halaman prerendered memvalidasi bahwa path file yang telah diselesaikan tetap berada dalam direktori yang diizinkan, mencegah serangan traversal `../`.

Pada waktu build, nilai `entries()` untuk prerender juga divalidasi: tiap bagian hanya boleh memakai huruf ASCII, angka, `-`, `_`, `.` dan `~` (`/` hanya di dalam catch-all `[...rest]`), dan bagian kosong atau yang diawali/diakhiri `.` (`.`, `..`, `v1.`, `.env`) ditolak: Windows membuang titik di akhir dan static host menyembunyikan dotfile. Nilai yang menghasilkan URL yang dijawab server sendiri menggagalkan build, karena file yang disimpan akan berisi balasan server, bukan halamannya: `/_health`, dan untuk halaman, akhiran file statis seperti `.png`, `.css` atau `.txt`. URL juga tidak boleh diawali `dist` atau `__bosia`, huruf besar maupun kecil (`DIST/x` juga): itu folder milik framework, dan di macOS atau Windows folder halaman `DIST/` akan menelan bundle JS/CSS. Nama perangkat Windows (`con`, `nul`, `com1`) juga ditolak, begitu pula bagian terakhir `index` atau yang berakhiran `.html` atau `.json`. Sebuah halaman juga tidak boleh menulis file yang sama dengan halaman lain (`/about` statis dan slug `about`), dan slug tidak boleh menggantikan `404.html` yang disimpan (halaman statis `src/routes/404` boleh). Dua nilai yang hanya beda huruf besar/kecil (`About` dan `about`, atau folder `A/` dan `a/`) juga gagal, karena macOS dan Windows menganggapnya sama; nilai yang berulang cukup ditulis sekali. Jadi `50%-off`, `café` atau `what%3F` gagal; ubah jadi slug seperti `50-off`. Nilai yang hilang juga ditolak. Error apa pun di `entries()`, atau tidak adanya export `entries()`, menggagalkan build. Build yang mengembalikan nilai tidak aman akan gagal lebih awal dengan pesan error yang jelas, alih-alih diam-diam menulis HTML ke luar direktori output.

Prerender juga memeriksa jawaban server. Halaman harus membalas `2xx` berisi HTML, dan API `2xx`; `error(500)` dari loader, `redirect(307, "/login")`, hook yang membalas file, atau timeout menggagalkan build dengan satu baris `❌` per URL, sehingga halaman yang rusak tidak pernah disimpan dan dilayani sebagai snapshot. Slug juga harus sampai ke route-nya sendiri: `/blog/[slug]` yang memberi `new` gagal bila `src/routes/blog/new` ada, begitu pula slug halaman di URL yang dijawab `+server.ts`, karena menyimpannya akan membekukan route live tersebut. Huruf besar/kecil diabaikan di sini, karena host macOS atau Windows menyajikan file yang disimpan untuk setiap ejaan URL-nya: slug `New` gagal di samping `blog/new`, `/about` yang di-prerender di samping `/About` yang live, dan `/blog/new` di samping `/[x]/NEW` (yang menjawab `/BLOG/NEW`). Route yang hanya bertumpang tindih lewat param (`[slug]`, `[...rest]`) diperbolehkan.

## Proteksi Open-Redirect

`redirect(status, location)` menolak URL eksternal secara bawaan. Setel `{ allowExternal: true }` untuk redirect eksternal yang sah (misalnya provider OAuth):

```ts
import { redirect } from "bosia";

redirect(303, "https://accounts.example.com/oauth", { allowExternal: true });
```

Meski `allowExternal: true`, skema berbahaya — `javascript:`, `data:`, `vbscript:` — **selalu** ditolak. Skema-skema itu tidak pernah menjadi tujuan redirect yang sah dan bisa disalahgunakan untuk menyuntikkan eksekusi script ke dalam rantai redirect.

Location dibaca seperti browser membacanya, jadi ejaan yang menipu tidak bisa lolos: `java\tscript:` tetap `javascript:`, dan `/\evil.com`, `htt\tps://evil.com` serta `http:evil.com` semuanya dianggap eksternal. Location yang bukan URL valid (`https://exa mple.com`) akan throw `invalid URL`, juga dengan `allowExternal: true`. Encode dulu, misalnya dengan `new URL(...)`.

`goto()` mengikuti aturan skema yang sama di client: URL `javascript:`, `data:` atau `vbscript:` membuat Promise-nya reject. Berbeda dengan `redirect()`, `goto()` tetap bernavigasi ke situs lain, jadi pastikan `?next=` dari pengguna tetap di origin Anda sebelum dipakai.

Tidak ada halaman yang dilayani di path yang diawali `//`: request ke `//evil.com/x` mendapat 308 ke `/evil.com/x`. Jika tidak, redirect yang memantulkan path (seperti redirect trailing-slash) akan mengirim browser ke evil.com.

## Penanganan Error di Produksi

Pada produksi (`NODE_ENV=production`), stack trace dihapus dari response error untuk mencegah kebocoran detail internal ke klien.
