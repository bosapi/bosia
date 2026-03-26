---
title: Perbedaan dengan SvelteKit
description: Apa yang sama, apa yang berbeda, dan apa yang tidak didukung dibandingkan dengan SvelteKit.
---

Bosbun mengikuti konvensi SvelteKit secara erat, namun terdapat beberapa perbedaan penting.

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

## Berbeda dari SvelteKit

| Fitur | SvelteKit | Bosbun |
| ----- | --------- | ------ |
| **Runtime** | Node.js | Bun |
| **Bundler** | Vite | Bun.build |
| **Server HTTP** | Dapat dikonfigurasi via adapters | ElysiaJS (bawaan) |
| **Adapters** | Diperlukan (node, vercel, dll.) | Tidak ada — satu server Bun |
| **Universal load** | `+page.ts` / `+layout.ts` | Tidak didukung — hanya server loaders |
| **Stores** | `$app/stores` | Tidak tersedia — gunakan `$props()` |
| **Navigation** | `$app/navigation` | Router klien bawaan |
| **Env vars** | `$env/static/public`, dll. | `$env` dengan prefix empat tingkat |
| **HMR** | Vite HMR (granular) | SSE full-page reload |
| **Direktori generate** | `.svelte-kit/` | `.bosbun/` |
| **Registry komponen** | Tidak ada | `bosbun add` (gaya shadcn) |
| **Scaffolding fitur** | Tidak ada | `bosbun feat` |
| **Metadata** | Via `<svelte:head>` | Fungsi `metadata()` di `+page.server.ts` |

### Penjelasan Perbedaan Utama

**Tidak ada universal load functions** — Bosbun hanya mendukung `load()` sisi server di `+page.server.ts` dan `+layout.server.ts`. Tidak ada `+page.ts` atau `+layout.ts` untuk loading sisi klien atau universal.

**Tidak ada `$app/stores`** — Sebagai gantinya, akses data melalui Svelte 5 runes:

```svelte
<!-- SvelteKit -->
<script>
  import { page } from "$app/stores";
</script>

<!-- Bosbun -->
<script>
  let { data } = $props();
</script>
```

**Fungsi `metadata()`** — Unik untuk Bosbun. Mengembalikan `title`, `description`, dan tag `meta`. Dapat meneruskan `data` ke `load()` untuk menghindari duplikasi query database.

**`$env`** — Sebagai pengganti empat modul `$env/*` terpisah milik SvelteKit, Bosbun menggunakan satu modul `$env` dengan sistem berbasis prefix:

```ts
// SvelteKit
import { PUBLIC_KEY } from "$env/static/public";
import { SECRET } from "$env/static/private";

// Bosbun
import { PUBLIC_STATIC_KEY, SECRET } from "$env";
```

## Tidak Didukung

Fitur-fitur SvelteKit berikut tidak tersedia di Bosbun:

- `+page.ts` / `+layout.ts` (universal load functions)
- `$app/stores` (`page`, `navigating`, `updated`)
- `$app/navigation` (`goto`, `beforeNavigate`, `afterNavigate`)
- `depends()` / `invalidate()` / `invalidateAll()`
- Optimisasi gambar (`@sveltejs/enhanced-img`)
- Service workers
- Snapshots
- Shallow routing
- i18n
- Sistem adapter / sistem plugin
- `<svelte:head>` untuk metadata (gunakan `metadata()` sebagai gantinya)
