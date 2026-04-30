---
title: Struktur Proyek
description: Pahami file dan direktori dalam sebuah proyek Bosia.
---

## Tata Letak Direktori

```
my-app/
├── src/
│   ├── routes/            # Halaman dan endpoint API
│   │   ├── +page.svelte
│   │   ├── +layout.svelte
│   │   └── about/
│   │       ├── +page.svelte
│   │       └── +page.server.ts
│   ├── lib/               # Kode bersama (di-alias sebagai $lib)
│   │   └── utils.ts
│   ├── app.css            # Gaya global + token Tailwind
│   ├── app.d.ts           # Deklarasi tipe
│   └── hooks.server.ts    # Middleware (opsional)
├── public/                # Aset statis (disajikan apa adanya)
├── dist/                  # Output build (diabaikan git)
├── .bosia/               # File yang dihasilkan (diabaikan git)
├── .env                   # Variabel lingkungan
└── package.json
```

## File Khusus

| File                | Kegunaan                                                        |
| ------------------- | --------------------------------------------------------------- |
| `+page.svelte`      | Komponen halaman — dirender pada URL rute tersebut              |
| `+layout.svelte`    | Layout — membungkus halaman dan layout anak                     |
| `+page.server.ts`   | Server loader — menjalankan `load()` dan `metadata()` di server |
| `+layout.server.ts` | Layout loader — data yang dibagikan ke semua rute anak          |
| `+server.ts`        | Endpoint API — mengekspor fungsi HTTP verb                      |
| `+error.svelte`     | Halaman error — dirender ketika loader melempar kesalahan       |
| `hooks.server.ts`   | Middleware — mencegat setiap request                            |
| `app.css`           | Gaya global — direktif Tailwind dan design token                |

## Alias Path

| Alias  | Mengarah ke | Contoh                            |
| ------ | ----------- | --------------------------------- |
| `$lib` | `src/lib/`  | `import { cn } from "$lib/utils"` |

## File yang Dihasilkan

Direktori `.bosia/` dibuat saat `dev` dan `build` dijalankan. Direktori ini berisi:

- **`routes.ts`** — manifest rute (pemetaan rute halaman dan API)
- **`types/`** — tipe TypeScript yang dihasilkan otomatis (`PageData`, `ActionData`, dll.)
- **`env.server.ts`** / **`env.client.ts`** — modul variabel lingkungan yang bertipe

File-file ini diabaikan git. Semuanya dihasilkan ulang setiap kali Anda menjalankan `dev` atau `build`.
