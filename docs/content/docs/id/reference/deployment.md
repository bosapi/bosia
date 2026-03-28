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

| Tipe Aset              | Cache Header                          |
| ---------------------- | ------------------------------------- |
| Nama file dengan hash  | `public, max-age=31536000, immutable` |
| File tanpa hash        | `no-cache`                            |

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
