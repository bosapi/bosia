---
title: Form Kontak
description: Backend form kontak — POST /api/contact memvalidasi kiriman dan menyimpannya lewat Drizzle.
---

Feature `contact-form` memberi backend untuk [blok `contact/split` dan
`contact/simple`](/docs/blocks/contact): endpoint `POST /api/contact` yang memvalidasi `name`,
`email` dan `message`, lalu menyimpan kirimannya lewat Drizzle.

## Install

```bash
bun x bosia@latest feat contact-form                  # menanyakan dialek DB
bun x bosia@latest feat -y contact-form               # otomatis: default sqlite
bun x bosia@latest feat contact-form -d postgres      # eksplisit
```

CLI memasang feature `drizzle` saat pertama dipakai. Setelah install:

```bash
bun run db:generate
bun run db:migrate
```

## Yang kamu dapat

| Path                                                     | Fungsi                             |
| -------------------------------------------------------- | ---------------------------------- |
| `src/features/contact-form/schemas/submissions.table.ts` | Tabel Drizzle (sesuai dialekmu)    |
| `src/features/contact-form/contact.service.ts`           | Validasi + simpan                  |
| `src/features/contact-form/submission.repository.ts`     | Query DB                           |
| `src/routes/api/contact/+server.ts`                      | `POST` kirim, `GET` daftar (login) |

## Sambungkan blok

```bash
bun x bosia@latest add block contact/split
```

Blok langsung mengirim ke `/api/contact` — tanpa penyambungan tambahan. `POST` mengembalikan
`201 { "ok": true }` saat sukses atau `400 { "error": "…" }` untuk input tidak valid.

## Membaca kiriman

`GET /api/contact` mengembalikan semua kiriman, terbaru dulu, dan butuh user yang login
(`locals.user`, dari feature `auth`). Tidak ada UI admin bawaan — query tabel
`contact_submissions` langsung atau bangun halaman di atas `ContactService.getAll()`.

Tidak ada notifikasi email: kiriman hanya masuk database. Tambahkan mailer di dalam
`ContactService.submit()` bila ingin pemberitahuan per pesan.
