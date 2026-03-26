---
title: Environment Variables
description: Muat file .env, gunakan import bertipe, dan pahami sistem prefix empat tingkat.
---

## Pemuatan File .env

Bosbun memuat variabel lingkungan dari file `.env` secara berurutan (yang belakangan menimpa yang sebelumnya):

1. `.env`
2. `.env.local`
3. `.env.[mode]` (misalnya `.env.development`, `.env.production`)
4. `.env.[mode].local`

Variabel lingkungan sistem selalu memiliki prioritas tertinggi — file `.env` tidak pernah menimpa variabel sistem yang sudah ada.

## Sistem Prefix

Nama variabel mengontrol di mana dan kapan variabel tersebut tersedia:

| Prefix            | Client | Server | Waktu      | Contoh                     |
| ----------------- | ------ | ------ | ---------- | -------------------------- |
| `PUBLIC_STATIC_`  | Ya     | Ya     | Build-time | `PUBLIC_STATIC_APP_NAME`   |
| `PUBLIC_`         | Ya     | Ya     | Runtime    | `PUBLIC_API_URL`           |
| `STATIC_`         | Tidak  | Ya     | Build-time | `STATIC_BUILD_ID`          |
| *(tanpa prefix)*  | Tidak  | Ya     | Runtime    | `DATABASE_URL`             |

- Variabel **Build-time** disematkan saat `bosbun build` — mengubahnya memerlukan build ulang
- Variabel **Runtime** dibaca dari `process.env` pada setiap request
- Variabel **Client** diekspos secara aman ke browser; variabel **Server** tidak pernah meninggalkan server

## Mengakses Variabel

Impor dari modul virtual `$env`:

```ts
import { PUBLIC_API_URL, DATABASE_URL } from "$env";
```

Hanya variabel yang dideklarasikan dalam file `.env` Anda yang tersedia melalui impor ini. Modul ini bersifat type-safe dengan deklarasi tipe yang dibuat secara otomatis.

## Variabel Framework

Variabel-variabel ini dicadangkan oleh Bosbun dan mengontrol perilaku framework:

| Variabel                | Default   | Deskripsi                                                    |
| ----------------------- | --------- | ------------------------------------------------------------ |
| `PORT`                  | `9000`    | Port server                                                  |
| `NODE_ENV`              | —         | `development` atau `production`                              |
| `BODY_SIZE_LIMIT`       | `512K`    | Ukuran maksimal body request (mendukung K, M, G, Infinity)   |
| `LOAD_TIMEOUT`          | —         | Timeout untuk `load()` dalam ms                              |
| `METADATA_TIMEOUT`      | —         | Timeout untuk `metadata()` dalam ms                         |
| `PRERENDER_TIMEOUT`     | —         | Timeout untuk fetch prerender dalam ms                       |
| `CSRF_ALLOWED_ORIGINS`  | —         | Origin yang diizinkan untuk CSRF, dipisahkan koma            |
| `CORS_ALLOWED_ORIGINS`  | —         | Origin yang diizinkan untuk CORS, dipisahkan koma            |
| `CORS_ALLOWED_METHODS`  | —         | Method yang diizinkan, dipisahkan koma                       |
| `CORS_ALLOWED_HEADERS`  | —         | Header yang diizinkan, dipisahkan koma                       |
| `CORS_EXPOSED_HEADERS`  | —         | Header yang diekspos, dipisahkan koma                        |
| `CORS_CREDENTIALS`      | `false`   | Setel ke `"true"` untuk mengizinkan credentials              |
| `CORS_MAX_AGE`          | `86400`   | Durasi cache preflight dalam detik                           |

Variabel framework diakses melalui `process.env` secara langsung, bukan melalui `$env`.

## Contoh File .env

```bash
# Public — available on client and server at runtime
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_NAME=My App

# Public static — inlined at build time
PUBLIC_STATIC_VERSION=1.0.0

# Private — server only
DATABASE_URL=postgres://localhost:5432/mydb
API_SECRET=sk_live_abc123

# Framework config
PORT=3000
BODY_SIZE_LIMIT=1M
CORS_ALLOWED_ORIGINS=https://app.example.com
```

## Keamanan

Hanya variabel `PUBLIC_*` yang dideklarasikan dalam file `.env` yang dikirim ke client. Variabel yang hanya disetel sebagai variabel lingkungan sistem (tidak ada di file `.env`) **tidak pernah** diekspos ke browser, meskipun memiliki prefix `PUBLIC_`.
