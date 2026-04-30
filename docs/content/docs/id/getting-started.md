---
title: Memulai
description: Buat proyek Bosia pertama Anda dalam waktu kurang dari satu menit.
---

## Prasyarat

- [Bun](https://bun.sh) >= 1.x — Bosia berjalan sepenuhnya di atas Bun. Tidak memerlukan Node.js.

## Membuat Proyek Baru

```bash
bunx bosia create my-app
```

Anda akan diminta memilih template:

| Template    | Deskripsi                                                   |
| ----------- | ----------------------------------------------------------- |
| **default** | Starter minimal — halaman utama, halaman about, satu loader |
| **demo**    | Fitur lengkap — blog, API routes, form actions, hooks       |

Untuk melewati prompt:

```bash
bunx bosia create my-app --template demo
```

## Pengembangan

```bash
cd my-app
bun run dev
```

Buka [http://localhost:9000](http://localhost:9000). Dev server memantau perubahan file dan memuat ulang browser secara otomatis melalui SSE — tanpa kedipan halaman penuh.

## Build Produksi

```bash
bun run build
bun run start
```

`build` mengompilasi bundle klien, entry server, Tailwind CSS, dan melakukan prerender rute statis. `start` menjalankan server produksi.

## Halaman Pertama Anda

Buat file baru di `src/routes/hello/+page.svelte`:

```svelte
<h1>Hello!</h1><p>This is my first Bosia page.</p>
```

Kunjungi [http://localhost:9000/hello](http://localhost:9000/hello) — selesai. Tidak perlu konfigurasi, impor, atau pendaftaran. Router berbasis file mendeteksinya secara otomatis.

## Menambahkan Server Loader

Buat `src/routes/hello/+page.server.ts` di samping halaman:

```ts
import type { LoadEvent } from "bosia";

export async function load({ url }: LoadEvent) {
	return {
		greeting: `Hello from the server!`,
		timestamp: Date.now(),
	};
}
```

Akses data di halaman Anda:

```svelte
<script lang="ts">
	let { data } = $props();
</script>

<h1>{data.greeting}</h1><p>Rendered at {new Date(data.timestamp).toLocaleString()}</p>
```

## Langkah Selanjutnya

- [Struktur Proyek](/id/project-structure/) — pahami tata letak file
- [Routing](/id/guides/routing/) — rute dinamis, grup, layout
- [Server Loaders](/id/guides/server-loaders/) — muat data, metadata, pengaliran parent
- [API Routes](/id/guides/api-routes/) — bangun endpoint REST
