---
title: Referensi CLI
description: Semua perintah CLI bosbun — create, dev, build, start, add, feat.
---

## bosbun create

Buat kerangka proyek Bosbun baru.

```bash
bosbun create <name> [--template <template>]
```

| Opsi         | Deskripsi                                     |
| ------------ | --------------------------------------------- |
| `<name>`     | Nama direktori proyek                         |
| `--template` | Lewati pemilih template: `default` atau `demo` |

**Template:**

- **default** — Starter minimal dengan halaman utama, halaman about, dan satu server loader
- **demo** — Contoh lengkap dengan blog, rute API, form actions, hooks, dan catch-all routes

Setelah kerangka dibuat, `bun install` akan berjalan secara otomatis.

## bosbun dev

Jalankan server pengembangan dengan hot reload.

```bash
bosbun dev
```

- Server dev berjalan di **http://localhost:9000**
- Perubahan file memicu reload browser otomatis melalui SSE
- Menggunakan arsitektur proxy: dev proxy di `:9000`, server aplikasi di `:9001`
- **Auto-restart saat crash** — jika proses aplikasi keluar secara tak terduga, server akan restart otomatis. Setelah 3 crash cepat dalam 5 detik, server berhenti mencoba ulang dan menunggu perubahan file.

## bosbun build

Build proyek untuk produksi.

```bash
bosbun build
```

Perintah ini menjalankan:

1. Pemindaian rute dan pembuatan manifest
2. Pembuatan tipe (`$types.d.ts` files)
3. Pembuatan modul variabel lingkungan (`$env`)
4. Bundle klien (JavaScript + CSS via Tailwind)
5. Bundle entry server
6. Prerendering statis (rute dengan `export const prerender = true`)

Output disimpan ke `dist/`.

## bosbun start

Jalankan server produksi.

```bash
bosbun start
```

Menjalankan server yang sudah di-build dari `dist/`. Membutuhkan `bosbun build` yang sudah dijalankan terlebih dahulu.

## bosbun add

Instal komponen UI dari registry.

```bash
bosbun add <component>
```

- Mengunduh file komponen ke `src/lib/components/ui/<component>/`
- Secara otomatis menginstal dependensi komponen (komponen lain yang menjadi dependensinya)
- Menginstal paket npm yang diperlukan melalui `bun add`
- Registry dihosting di GitHub: `bosapi/bosbun/main/registry/components/`

Contoh:

```bash
bosbun add button
bosbun add card
bosbun add input
```

## bosbun feat

Buat kerangka fitur (routes + components + server files).

```bash
bosbun feat <feature>
```

- Menginstal komponen UI yang diperlukan terlebih dahulu melalui `bosbun add`
- Menyalin file fitur ke lokasi yang sesuai dalam proyek Anda
- Menginstal paket npm yang diperlukan
- Registry dihosting di GitHub: `bosapi/bosbun/main/registry/features/`

Contoh:

```bash
bosbun feat login
```
