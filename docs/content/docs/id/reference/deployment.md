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

## Variabel Lingkungan

Lihat [Variabel Lingkungan](/id/guides/environment-variables/) untuk daftar lengkap opsi konfigurasi termasuk `PORT`, `BODY_SIZE_LIMIT`, CORS, dan pengaturan CSRF.
