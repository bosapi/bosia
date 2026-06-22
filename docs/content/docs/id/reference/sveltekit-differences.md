---
title: Perbedaan dengan SvelteKit
description: Apa yang sama, apa yang berbeda, dan apa yang tidak didukung dibandingkan dengan SvelteKit.
---

Bosia mengikuti konvensi SvelteKit secara erat, namun terdapat beberapa perbedaan penting.

## Sama Seperti SvelteKit

Hal-hal berikut bekerja dengan cara yang sama seperti yang Anda harapkan:

- **Konvensi file** — `+page.svelte`, `+layout.svelte`, `+page.server.ts`, `+layout.server.ts`, `+server.ts`, `+error.svelte`
- **Route groups** — direktori `(name)` yang tidak terlihat dalam URL
- **Dynamic routes** — segmen `[param]` dan `[...rest]`
- **Fungsi `load()`** — signature yang sama dengan `params`, `url`, `locals`, `cookies`, `parent()`
- **Tipe `Handle`** — `({ event, resolve }) => Response`
- **`sequence()`** — menyusun handler middleware
- **Form actions** — ekspor `actions` dengan `fail()` dan `redirect()`
- **Cookie API** — `get()`, `getAll()`, `set()`, `delete()`
- **Alias `$lib`** — memetakan ke `src/lib/`
- **Perlindungan CSRF** — pemeriksaan berbasis origin pada metode non-safe
- **Invalidasi data** — `depends()` pada `LoadEvent`, plus `invalidate()` / `invalidateAll()` dari `bosia/client`
- **Navigation API** — `goto()`, `beforeNavigate()`, `afterNavigate()` dari `bosia/client`
- **Sistem plugin** — `bosia.config.ts` dengan hooks untuk lifecycle backend, build, render, dan klien

## Berbeda dari SvelteKit

| Fitur                  | SvelteKit                        | Bosia                                     |
| ---------------------- | -------------------------------- | ----------------------------------------- |
| **Runtime**            | Node.js                          | Bun                                       |
| **Bundler**            | Vite                             | Bun.build                                 |
| **Server HTTP**        | Dapat dikonfigurasi via adapters | ElysiaJS (bawaan)                         |
| **Adapters**           | Diperlukan (node, vercel, dll.)  | Tidak ada — satu server Bun               |
| **Universal load**     | `+page.ts` / `+layout.ts`        | Tidak didukung — hanya server loaders     |
| **Stores**             | `$app/stores`                    | Tidak tersedia — gunakan `$props()`       |
| **Env vars**           | `$env/static/public`, dll.       | `$env` dengan prefix empat tingkat        |
| **HMR**                | Vite HMR (granular)              | SSE full-page reload                      |
| **Direktori generate** | `.svelte-kit/`                   | `.bosia/`                                 |
| **Registry komponen**  | Tidak ada                        | `bosia add` (gaya shadcn)                 |
| **Scaffolding fitur**  | Tidak ada                        | `bosia feat`                              |
| **Metadata**           | Via `<svelte:head>`              | Fungsi `metadata()` di `+page.server.ts`  |
| **Response caching**   | Tidak bawaan                     | Cache server dengan LRU + brotli/gzip     |
| **Prop `data`**        | Data layout digabung ke halaman  | Tiap load terpisah — aliri via `parent()` |

### Penjelasan Perbedaan Utama

**Tidak ada universal load functions** — Bosia hanya mendukung `load()` sisi server di `+page.server.ts` dan `+layout.server.ts`. Tidak ada `+page.ts` atau `+layout.ts` untuk loading sisi klien atau universal.

**Tidak ada `$app/stores`** — Sebagai gantinya, akses data melalui Svelte 5 runes:

```svelte
<!-- SvelteKit -->
<script>
  import { page } from "$app/stores";
</script>

<!-- Bosia -->
<script>
  let { data } = $props();
</script>
```

**Data layout tidak digabung ke prop `data` halaman** — Di SvelteKit, prop `data` pada `+page.svelte` adalah gabungan dari setiap load `+layout` leluhur ditambah load halaman itu sendiri. Di Bosia tiap hasil load tetap terpisah: `data` halaman hanya berisi hasil `load()` halaman itu, dan tiap layout mendapat datanya sendiri. Jadi `data.session` (atau key apa pun yang dikembalikan layout induk) bernilai `undefined` di halaman kecuali loader halaman itu mengembalikannya ulang. Aliri data induk secara eksplisit via `parent()` di loader halaman — lihat [Server Loaders](/guides/server-loaders#pengaliran-data-dengan-parent). Ini menghindari tabrakan key dan pembengkakan payload per halaman dengan biaya satu baris tambahan per halaman yang butuh data leluhur.

**Fungsi `metadata()`** — Unik untuk Bosia. Mengembalikan `title`, `description`, dan tag `meta`. Dapat meneruskan `data` ke `load()` untuk menghindari duplikasi query database.

**`$env`** — Sebagai pengganti empat modul `$env/*` terpisah milik SvelteKit, Bosia menggunakan satu modul `$env` dengan sistem berbasis prefix:

```ts
// SvelteKit
import { PUBLIC_KEY } from "$env/static/public";
import { SECRET } from "$env/static/private";

// Bosia
import { PUBLIC_STATIC_KEY, SECRET } from "$env";
```

## Tidak Didukung

Fitur-fitur SvelteKit berikut tidak tersedia di Bosia:

- `+page.ts` / `+layout.ts` (universal load functions)
- `$app/stores` (`page`, `navigating`, `updated`)
- Optimisasi gambar (`@sveltejs/enhanced-img`)
- Service workers
- Snapshots
- Shallow routing (`pushState` / `replaceState`)
- Sistem adapter (terikat pada Bun + ElysiaJS)
- `<svelte:head>` untuk metadata (gunakan `metadata()` sebagai gantinya)
