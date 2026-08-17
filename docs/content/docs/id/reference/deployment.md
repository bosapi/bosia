---
title: Deployment
description: Build, jalankan, dan deploy aplikasi Bosia di produksi.
---

## Build Produksi

```bash
bun run build
```

Perintah ini menghasilkan direktori `dist/` yang berisi:

- `dist/server/` — entry point server
- `dist/client/` — bundle JavaScript dan CSS klien
- `dist/prerendered/` — HTML statis untuk rute yang telah di-prerender

## Menjalankan di Produksi

```bash
bun run start
```

Atau secara langsung:

```bash
bun dist/server/index.js
```

Atur port dengan variabel lingkungan `PORT` (default: `9000`).

## Health Check

Bosia mengekspos endpoint health di `/_health`:

```bash
curl http://localhost:9000/_health
```

```json
{ "status": "ok", "timestamp": 1711360000000, "timezone": "UTC" }
```

## Prerendering

Tandai rute untuk prerendering statis:

```ts
// +page.server.ts
export const prerender = true;
```

Halaman yang di-prerender dibuat sebagai HTML statis selama `bosia build` dan disajikan dari `dist/prerendered/` dengan cache header 1 jam.

Payload data untuk navigasi sisi klien juga di-prerender sebagai file JSON di `dist/prerendered/__bosia/data/<route>.json`. Ini berarti navigasi klien berfungsi di situs statis (GitHub Pages, Netlify, dll.) tanpa server yang berjalan.

## Caching Aset Statis

Bosia mengatur cache header secara otomatis:

| Tipe Aset             | Cache Header                          |
| --------------------- | ------------------------------------- |
| Nama file dengan hash | `public, max-age=31536000, immutable` |
| File tanpa hash       | `no-cache`                            |

## Di Belakang Reverse Proxy

Saat Bosia berjalan di belakang nginx, Caddy, Cloudflare, ALB, atau reverse proxy / load balancer lain, host publik biasanya berbeda dengan header `Host` yang sampai ke proses Bun di dalamnya. Setel:

```bash
TRUST_PROXY=true
```

agar pemeriksaan origin CSRF menghormati `X-Forwarded-Host` dan `X-Forwarded-Proto` serta menerima request yang `Origin`-nya cocok dengan URL publik.

**Aktifkan `TRUST_PROXY=true` hanya jika:**

- Ada proxy atau load balancer di depan Bosia, dan
- Proxy tersebut membersihkan setiap header `X-Forwarded-*` yang **dikirim klien** sebelum diteruskan (pastikan perilaku proxy-mu), dan
- Proxy menyuntikkan `X-Forwarded-Host` / `X-Forwarded-Proto` sendiri yang mencerminkan origin publik.

**Jangan** menyetel `TRUST_PROXY=true` jika:

- Bosia langsung terekspos ke internet tanpa proxy, atau
- Kamu tidak bisa memastikan proxy membersihkan header `X-Forwarded-*` yang masuk — ini akan membuat klien mana pun bisa memalsukan origin-nya sendiri dan melewati CSRF.

Lihat [Keamanan › Deployment di belakang reverse-proxy](/id/guides/security/#deployment-di-belakang-reverse-proxy-trust_proxy) untuk penjelasan lengkapnya.

## Memasang di Sub-Path

Untuk menyajikan aplikasi dari `example.com/sso`, bukan dari akar origin — beberapa aplikasi berbagi satu hostname, atau subdomain tidak tersedia — setel:

```bash
BASE_PATH=/sso
```

nginx lalu meneruskan path **apa adanya**. Tanpa stripping, tanpa `proxy_redirect`, tanpa `sub_filter`:

```nginx
location /sso/ {
    proxy_pass http://127.0.0.1:9000;
    proxy_set_header Host              $host;
    proxy_set_header X-Forwarded-Host  $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
}
```

Bosia melepas prefix sekali, di tepi permintaan, sehingga semua yang di belakangnya bekerja di "ruang aplikasi" — hooks, `load()`, actions, dan `event.url.pathname` tidak pernah melihat prefix, dan rute ditulis persis seperti di akar. Saat keluar, prefix dipasang kembali: redirect, URL aset framework, entri history router klien, dan permintaan datanya. Cookie memakai mount sebagai path bawaannya, jadi aplikasi tetangga di origin yang sama tidak pernah menerimanya.

Permintaan di luar base menghasilkan 404.

### Yang tidak tercakup

**URL yang dibangun komponen Anda.** Bosia menulis ulang URL di HTML yang dirender server, tetapi klien merender ulang saat mount dan komponen menuliskan kembali path aslinya. Apa pun yang disusun komponen memerlukan ekspor `base`:

```svelte
<script>
	import { base } from "bosia";
</script>

<img src="{base}/logo.png" alt="" />
<span style="mask-image:url('{base}/icons/check.svg')"></span>
```

Ini mudah terlewat karena gagal tanpa suara — mask yang 404 tampak sebagai kotak kosong, bukan galat.

Markup statis sudah ditangani: literal `<a href="/masuk">` di berkas `.svelte` ditulis ulang saat kompilasi, jadi href di DOM adalah URL sebenarnya. Tidak ada yang ditulis ulang setelah klik — tabel rute dibuat dengan prefix, jadi klik mendorong persis URL yang ada di tautan. Karena itu `goto()` menerima path sebenarnya:

```ts
goto(`${base}/beranda`); // bukan goto("/beranda")
```

`redirect()` **tidak** memerlukannya, baik di `load()` maupun di action — sudah ditulis ulang untuk Anda:

```ts
throw redirect(303, "/masuk"); // → /sso/masuk di kabel
```

Begitu pula `event.url.pathname`, yang sudah berada di ruang aplikasi saat Anda membacanya. Gunakan `base` hanya saat menyusun URL absolut secara manual, misalnya `${url.origin}${base}/reset?t=...` untuk tautan yang keluar dari aplikasi.

**Build dan runtime harus sepakat.** CSS terkompilasi ditulis ulang saat build, jadi `BASE_PATH` harus disetel untuk `bosia build` maupun `bosia start`. Ketidakcocokan muncul sebagai font hilang atau ikon kosong.

## Graceful Shutdown

Server produksi menangani sinyal `SIGTERM` dan `SIGINT`:

1. Berhenti menerima koneksi baru
2. Menunggu request yang sedang berjalan untuk selesai
3. Memaksa keluar setelah 10 detik jika proses shutdown terhenti

## Docker

Contoh `Dockerfile`:

```docker
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build
FROM deps AS build
COPY . .
RUN bun run build

# Production
FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

ENV NODE_ENV=production
ENV PORT=9000
EXPOSE 9000

CMD ["bun", "dist/server/index.js"]
```

## Hosting Sandbox / Multi-Tenant

Jika kamu menjalankan app Bosia di dalam sandbox yang memblokir addon native (`.node`) — misalnya host multi-tenant yang memindai `node_modules` tiap app — perlu diketahui bahwa toolchain Bosia membawa binari native yang dibutuhkan untuk **build dan menjalankan** app:

| Paket                | Dipakai oleh                            |
| -------------------- | --------------------------------------- |
| `@tailwindcss/oxide` | Mesin CSS Tailwind v4 (build)           |
| `lightningcss`       | Transform/minify CSS (build)            |
| `@parcel/watcher`    | Pemantau file di `bosia dev` (mode dev) |

Ini adalah perkakas build framework — murni komputasi / inotify — dan **tidak** butuh syscall pengubah-kernel yang biasanya diblokir sandbox semacam itu (unit systemd `SystemCallFilter=@system-service` mengizinkannya). Jika host-mu menolak semua file `.node`, **izinkan (allowlist) paket-paket ini** (beserta sub-paket per-platform seperti `lightningcss-linux-x64-musl`), bukan kode app itu sendiri. Cocokkan nama direktori paket dengan akhiran platform yang ter-anchor agar tiruan seperti `lightningcss-evil` tidak lolos.

## Variabel Lingkungan

Lihat [Variabel Lingkungan](/id/guides/environment-variables/) untuk daftar lengkap opsi konfigurasi termasuk `PORT`, `BODY_SIZE_LIMIT`, CORS, dan pengaturan CSRF.
