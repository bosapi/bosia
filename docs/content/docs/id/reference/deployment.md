---
title: Deployment
description: Build, jalankan, dan deploy aplikasi Bosia di produksi — di Bun atau Cloudflare Workers.
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
location /sso {
    proxy_pass http://127.0.0.1:9000;
    proxy_set_header Host              $host;
    proxy_set_header X-Forwarded-Host  $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
}
```

Perhatikan `location /sso` tanpa garis miring di akhir. `location /sso/` tidak akan cocok dengan `example.com/sso` polos, yang oleh Bosia disajikan sebagai halaman akar aplikasi.

Bosia melepas prefix sekali, di tepi permintaan, sehingga semua yang di belakangnya bekerja di "ruang aplikasi" — hooks, `load()`, actions, dan `event.url.pathname` tidak pernah melihat prefix, dan rute ditulis persis seperti di akar. Saat keluar, prefix dipasang kembali: redirect, kanonikalisasi garis miring akhir, URL aset framework, entri history router klien, dan permintaan datanya. Cookie memakai mount sebagai path bawaannya, jadi aplikasi tetangga di origin yang sama tidak pernah menerimanya.

Permintaan di luar base menghasilkan 404 — termasuk health check, yang pindah ke `/sso/_health`. Perbarui load balancer, `HEALTHCHECK` Docker, atau probe Kubernetes agar sesuai.

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

**Build dan runtime harus sepakat.** CSS terkompilasi, tabel rute klien, dan markup di berkas `.svelte` Anda semuanya ditulis ulang saat build, jadi `BASE_PATH` harus disetel untuk `bosia build` maupun `bosia start`. Build mencatat nilainya ke `dist/manifest.json` dan server memperingatkan saat start jika berbeda:

```
⚠️  Built for BASE_PATH="/sso" but running with "" — CSS urls and the client route table are baked in and will not match.
```

Tanggapi peringatan itu dengan serius: ketidakcocokannya sendiri senyap — font hilang, ikon kosong, atau tautan yang keluar dari aplikasi. Jika `BASE_PATH` berada di `.env.production`, ingat bahwa hanya `bosia build` dan `bosia start` yang memuatnya; menjalankan server langsung dengan `bun run` tidak.

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

## Cloudflare Workers

Bosia juga bisa di-build untuk [Cloudflare Workers](https://developers.cloudflare.com/workers/), termasuk paket gratisnya. Pilih target lewat command line:

```bash
bosia build --target=workers
```

atau sekali saja, di `bosia.config.ts`:

```ts
import { defineConfig } from "bosia";

export default defineConfig({ target: "workers" });
```

Selain `dist/` seperti biasa, build Workers menulis:

- `dist/worker/index.js` — worker-nya. File statis dan halaman prerender di `dist/static/` dilayani Cloudflare sebelum worker berjalan.
- `wrangler.jsonc` — hanya jika kamu belum punya. Setelah itu file ini milikmu: tambahkan binding (D1, KV, R2) dan `vars` di sana. Build ulang tidak pernah menimpanya.

Coba secara lokal dengan `bosia start` — untuk build Workers perintah ini menjalankan `wrangler dev` (Wrangler diunduh saat pertama dipakai). Deploy dengan:

```bash
bunx wrangler deploy
```

### Binding — `event.platform.env`

Cloudflare memberikan binding ke worker, bukan ke variabel global. Bosia meneruskannya ke kode server sebagai `event.platform.env` — di hooks, `+server.ts`, `load()` dan `metadata()`:

```ts
// src/routes/posts/+page.server.ts
import type { LoadEvent } from "bosia";

export async function load({ platform }: LoadEvent) {
	const { results } = await platform!.env.DB.prepare("SELECT * FROM posts").all();
	return { posts: results };
}
```

`platform` bernilai `undefined` saat app yang sama berjalan di Bun. Untuk memberi tipe pada binding, jalankan `bunx wrangler types` lalu perluas `PlatformEnv` milik Bosia dengan `Env` yang dihasilkan:

```ts
// src/platform.d.ts — file tersendiri: `export {}` membuat ini memperluas "bosia", bukan menggantinya
export {};

declare module "bosia" {
	interface PlatformEnv extends Env {}
}
```

### Variabel lingkungan

File `.env` tidak ikut di-deploy. Nilai runtime datang dari Cloudflare: `vars` di `wrangler.jsonc`, `wrangler secret put` untuk rahasia, dan file `.dev.vars` untuk `wrangler dev` lokal. Nilainya sampai ke `$env` dan `process.env` seperti biasa. Nama variabel tetap berasal dari file `.env*`, dan `STATIC_*` / `PUBLIC_STATIC_*` tetap ditanam saat build.

Variabel framework bekerja sama (`BODY_SIZE_LIMIT`, `CSRF_*`, `CORS_*`, `CACHE_*`). Yang berkaitan dengan menjalankan proses — `PORT`, `IDLE_TIMEOUT`, `BOSIA_REUSE_PORT` — tidak berpengaruh di Workers.

### Kode khusus Bun

Worker tidak punya global `Bun` dan tidak punya filesystem. Build berhenti lebih awal jika kode server — routes, `hooks.server.ts` dan `src/lib/server/` — memakai `Bun.*` atau meng-import `fs`, `bun` atau `bun:*`, lalu menampilkan tiap file dan barisnya. Ganti dengan Web API (`fetch`, `crypto.subtle`) atau binding (D1 alih-alih `bun:sqlite`, R2 alih-alih `Bun.s3`). `node:crypto`, `node:zlib` dan sejenisnya berjalan lewat kompatibilitas Node milik Cloudflare.

Pengecekan `typeof Bun` di baris yang sama diizinkan, jadi kode yang dipakai bersama kedua target bisa bercabang. Pemeriksaan ini membaca file berdasarkan path, jadi panggilan `Bun` di helper biasa `src/lib/*.ts` lolos — dan baru gagal saat request. Set `BOSIA_WORKERS_GUARD=0` untuk mengubah error menjadi peringatan.

### Batasan

- **Response cache per isolate.** Tetap membantu di route yang ramai, tapi Cloudflare menjalankan banyak isolate dan membuangnya sesukanya, jadi `invalidate()` hanya membersihkan salinan di isolate yang menjalankannya. Buat halaman ter-cache berumur pendek, atau keluarkan route dengan `export const cache = false`.
- **Ukuran bundle.** Paket gratis mengizinkan 3 MB setelah gzip. Aplikasi demo sekitar 410 KB; plugin yang di-import `bosia.config.ts` ikut di-bundle meski hanya aktif di dev.
- **Tanpa graceful shutdown** — siklus hidup diatur Cloudflare. `/_health` tetap menjawab.

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
