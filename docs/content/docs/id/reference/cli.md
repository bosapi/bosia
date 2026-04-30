---
title: Referensi CLI
description: Semua perintah CLI bosia — create, dev, build, start, add, feat.
---

## bosia create

Buat kerangka proyek Bosia baru.

```bash
bosia create <name> [--template <template>]
```

| Opsi         | Deskripsi                                      |
| ------------ | ---------------------------------------------- |
| `<name>`     | Nama direktori proyek                          |
| `--template` | Lewati pemilih template: `default` atau `demo` |

**Template:**

- **default** — Starter minimal dengan halaman utama, halaman about, dan satu server loader
- **demo** — Contoh lengkap dengan blog, rute API, form actions, hooks, dan catch-all routes

Setelah kerangka dibuat, `bun install` akan berjalan secara otomatis.

## bosia dev

Jalankan server pengembangan dengan hot reload.

```bash
bosia dev
```

- Server dev berjalan di **http://localhost:9000**
- Perubahan file memicu reload browser otomatis melalui SSE
- Menggunakan arsitektur proxy: dev proxy di `:9000`, server aplikasi di `:9001`
- **Auto-restart saat crash** — jika proses aplikasi keluar secara tak terduga, server akan restart otomatis. Setelah 3 crash cepat dalam 5 detik, server berhenti mencoba ulang dan menunggu perubahan file.

## bosia build

Build proyek untuk produksi.

```bash
bosia build
```

Perintah ini menjalankan:

1. Pemindaian rute dan pembuatan manifest
2. Pembuatan tipe (`$types.d.ts` files)
3. Pembuatan modul variabel lingkungan (`$env`)
4. Bundle klien (JavaScript + CSS via Tailwind)
5. Bundle entry server
6. Prerendering statis (rute dengan `export const prerender = true`)

Output disimpan ke `dist/`.

## bosia start

Jalankan server produksi.

```bash
bosia start
```

Menjalankan server yang sudah di-build dari `dist/`. Membutuhkan `bosia build` yang sudah dijalankan terlebih dahulu.

## bosia add

Instal komponen UI dari registry.

```bash
bosia add <component>
```

- Mengunduh file komponen ke `src/lib/components/ui/<component>/`
- Mendukung **nama berbasis path** — `bosia add shop/cart` menginstal ke `src/lib/components/shop/cart/`
- Komponen tanpa prefix path default ke `ui/` — `bosia add button` → `src/lib/components/ui/button/`
- Jika komponen sudah ada, akan bertanya apakah ingin **mengganti** atau **lewati**
- Secara otomatis menginstal dependensi komponen (komponen lain yang menjadi dependensinya)
- Menginstal paket npm yang diperlukan melalui `bun add`
- Registry dihosting di GitHub: `bosapi/bosia/main/registry/components/`

Contoh:

```bash
bosia add button              # → src/lib/components/ui/button/
bosia add card                # → src/lib/components/ui/card/
bosia add shop/cart           # → src/lib/components/shop/cart/
```

## bosia feat

Buat kerangka fitur (routes + components + server files).

```bash
bosia feat <feature>
```

- Menginstal komponen UI yang diperlukan terlebih dahulu melalui `bosia add`
- Menyalin file fitur ke lokasi yang sesuai dalam proyek Anda
- Menginstal paket npm yang diperlukan
- Registry dihosting di GitHub: `bosapi/bosia/main/registry/features/`

Contoh:

```bash
bosia feat login
```
