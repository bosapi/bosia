---
title: Newsletter
description: Backend newsletter — POST /api/newsletter memvalidasi email dan menyimpan subscriber via Drizzle, aman dari duplikat.
---

Feature `newsletter` memberi backend untuk [blok `newsletter/centered` dan
`newsletter/split`](/docs/blocks/newsletter): endpoint `POST /api/newsletter` yang memvalidasi
email lalu menyimpan subscriber via Drizzle. Mendaftar dua kali dengan email yang sama dianggap
sukses, bukan error — aman dipasang di halaman publik.

## Install

```bash
bun x bosia@latest feat newsletter                  # menanyakan dialek DB
bun x bosia@latest feat -y newsletter               # otomatis: default sqlite
bun x bosia@latest feat newsletter -d postgres      # eksplisit
```

CLI memasang feature `drizzle` saat pertama kali dipakai. Setelah install:

```bash
bun run db:generate
bun run db:migrate
```

## Yang kamu dapat

| Path                                                   | Fungsi                                |
| ------------------------------------------------------ | ------------------------------------- |
| `src/features/newsletter/schemas/subscribers.table.ts` | Tabel Drizzle (sesuai dialekmu)       |
| `src/features/newsletter/newsletter.service.ts`        | Validasi + create aman-duplikat       |
| `src/features/newsletter/subscriber.repository.ts`     | Query DB                              |
| `src/routes/api/newsletter/+server.ts`                 | `POST` subscribe, `GET` daftar (auth) |

## Sambungkan blok

```bash
bun x bosia@latest add block newsletter/centered
```

Blok langsung mem-POST ke `/api/newsletter` — tanpa penyambungan. `POST` mengembalikan
`201 { "ok": true }` saat sukses (termasuk pendaftaran ulang) atau `400 { "error": "…" }` untuk
email tidak valid. Email di-lowercase dan unik di level database.

## Membaca subscriber

`GET /api/newsletter` mengembalikan semua subscriber, terbaru dulu, dan butuh user login
(`locals.user`, dari feature `auth`). Feature ini tidak mengirim email — ekspor tabel
`newsletter_subscribers` ke tool email-mu, atau tambahkan mailer saat siap mengirim.
