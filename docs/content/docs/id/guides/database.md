---
title: Database
description: Drizzle ORM di atas driver bawaan Bun — satu DATABASE_URL, empat engine yang didukung (postgres, mysql, sqlite file, sqlite in-memory).
---

## Ringkasan

Bosia memakai [Drizzle ORM](https://orm.drizzle.team/) di atas driver bawaan Bun — `Bun.SQL` untuk postgres dan mysql, `bun:sqlite` untuk SQLite. Satu variabel `DATABASE_URL` memilih engine sekaligus target koneksi; skema URL menentukan adapter yang dimuat.

Tidak ada paket npm per-engine — Drizzle menyediakan wrapper `drizzle-orm/bun-sql` dan `drizzle-orm/bun-sqlite` di atas driver bawaan.

## Engine yang didukung

| Engine        | Bentuk URL                          | Driver Bun   | Dialect Drizzle               | Persisten?         |
| ------------- | ----------------------------------- | ------------ | ----------------------------- | ------------------ |
| postgres      | `postgres://user:pass@host:port/db` | `Bun.SQL`    | `drizzle-orm/bun-sql` (pg)    | ya                 |
| mysql         | `mysql://user:pass@host:port/db`    | `Bun.SQL`    | `drizzle-orm/bun-sql` (mysql) | ya                 |
| sqlite (file) | `sqlite://./data/app.db`            | `bun:sqlite` | `drizzle-orm/bun-sqlite`      | ya                 |
| sqlite (mem)  | `sqlite://:memory:`                 | `bun:sqlite` | `drizzle-orm/bun-sqlite`      | **tidak** — hilang |

## Pemasangan

```bash
bunx bosia feat drizzle
```

Perintah ini menulis `src/features/drizzle/index.ts` (adapter multi-engine), `schemas.ts`, `seeds/runner.ts`, dan `drizzle.config.ts` ke dalam aplikasi Anda dan menambahkan skrip `db:generate`, `db:migrate`, `db:seed` ke `package.json`.

Lalu set `DATABASE_URL` di `.env.local`:

```bash
# pilih salah satu
DATABASE_URL=postgres://user:pass@localhost:5432/myapp
# DATABASE_URL=mysql://user:pass@localhost:3306/myapp
# DATABASE_URL=sqlite://./data/app.db
# DATABASE_URL=sqlite://:memory:
```

Generate + apply + seed:

```bash
bun run db:generate   # hasilkan migrations/ dari file *.table.ts Anda
bun run db:migrate    # terapkan
bun run db:seed       # jalankan *.ts di src/features/drizzle/seeds/ secara urut
```

## Menambah tabel

Lihat skill `bosia-drizzle-feature` untuk pola kanonik: satu `*.table.ts` per tabel, service kolokasi, dan seed bernomor (`001_*.ts`, `002_*.ts`) bila perlu data awal. Re-export tabel dari `schemas.ts` supaya Drizzle Kit menemukan tipe-nya.

## SQLite in-memory

`sqlite://:memory:` hanya untuk dev/test. Setiap restart server memulai dengan schema kosong dan nol baris. Jangan menjalankan `bun run db:migrate` dari agent chat untuk engine ini — migration-nya sia-sia (schema hilang saat boot berikutnya). Untuk schema in-memory pada tes, bangun ulang di dalam test harness, bukan lewat `db:migrate`.

## Ganti engine

Jangan pakai ulang `src/features/drizzle/migrations/` antar engine — migration spesifik per dialect (postgres `SERIAL`, mysql `AUTO_INCREMENT`, sqlite `AUTOINCREMENT` semua beda). Untuk ganti:

1. Update `DATABASE_URL` di `.env.local` ke skema baru.
2. Hapus `src/features/drizzle/migrations/*.sql` (sisakan `.gitkeep`).
3. Jalankan `bun run db:generate` lalu `bun run db:migrate`.

## Dari editor (chat tools)

Saat bekerja di editor bosapi, agent AI punya keluarga tool `db_*` yang meniru lifecycle ini:

| Tool                                     | Fungsi                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `db_test_connection`                     | Buka + tutup koneksi, laporkan engine, versi, latency                           |
| `db_create` / `db_user`                  | Provisioning DB + role (postgres + mysql; sqlite no-op)                         |
| `db_generate` / `db_migrate` / `db_seed` | Lifecycle Drizzle Kit (`bun run db:*`)                                          |
| `db_query({ sql, params? })`             | SELECT-only, parametrized                                                       |
| `db_raw({ sql })`                        | **BERBAHAYA** — SQL bebas, bypass guard SELECT; hanya untuk escape sekali pakai |
| `db_schema`                              | List tabel + kolom                                                              |
| `db_status`                              | Ringkasan health satu panggilan                                                 |

Semua tool default target **app** (memakai `.env.local` aplikasi Anda). Menargetkan DB editor sendiri butuh `BOSAPI_ALLOW_EDITOR_DB_TOOLS=true` di environment editor.
