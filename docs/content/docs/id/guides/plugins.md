---
title: Plugins
description: Perluas Bosia dengan plugin first-party dan pihak ketiga melalui bosia.config.ts.
---

Plugin memperluas Bosia di empat titik lifecycle: backend HTTP, pipeline build, pipeline render SSR, dan (di versi mendatang) dev server serta runtime klien. Plugin first-party didistribusikan di bawah `bosia/plugins/*`; plugin pihak ketiga berada di paket npm mana pun yang mengekspor sebuah `BosiaPlugin`.

`backend.before` / `backend.after` menerima app backend kecil milik Bosia sendiri. Bentuknya mirip Elysia, jadi kebanyakan plugin terbaca sama, tapi tanpa dependensi Elysia.

## Konfigurasi

Buat `bosia.config.ts` di root proyek:

```ts
import { defineConfig } from "bosia";
import { serverTiming } from "bosia/plugins/server-timing";

export default defineConfig({
	plugins: [serverTiming()],
});
```

Konfigurasi dimuat sekali saat startup oleh `bosia dev`, `bosia build`, dan `bosia start`. Tidak ada file konfigurasi yang wajib — aplikasi tanpa konfigurasi berjalan dengan nol plugin.

## Plugin First-Party

### `bosia/plugins/server-timing`

Menambahkan header `Server-Timing: handler;dur=<ms>` ke setiap respons. Durasinya mengukur rantai handler framework (`onRequest` → `onAfterHandle`). Ini adalah waktu membangun respons, bukan waktu mengirimnya (untuk route `+server.ts` streaming, "waktu mulai streaming") — `Server-Timing` adalah header respons, jadi harus di-flush sebelum body. Berguna untuk memunculkan overhead framework di browser DevTools.

```ts
import { serverTiming } from "bosia/plugins/server-timing";

serverTiming({ metric: "bosia" }); // override default metric name
```

### `bosia/plugins/access-log`

Mencatat satu baris per request — `[GET] /blog 200 (1.2ms)` — dari response final, jadi status-nya sama dengan yang diterima klien dan tiap request tercatat sekali, apa pun yang dilakukan plugin lain. Bosia tidak mencatat request secara default; pasang plugin ini kalau butuh access log dan tidak ada reverse proxy yang mencatatnya. Baris ditulis secara batch (tiap 100ms, atau saat mencapai 64KB), bukan satu write per request: pada stdout berupa pipe (`docker logs`, systemd) biayanya ~3µs CPU per request, bukan ~11–14µs. Baris yang masih menunggu ditulis saat shutdown. Di Workers setiap baris langsung ditulis. Path-nya adalah yang diminta, termasuk prefix `BASE_PATH`, seperti yang dicatat proxy. Respons yang dikirim Bun sebelum app berjalan (body melebihi `BODY_SIZE_LIMIT` → 413) tidak tercatat; buat `write` sinkron agar flush saat shutdown selesai. Di Workers, `ms` hanya bergerak saat I/O (waktu CPU terbaca 0), dan `write` async bisa terpotong setelah respons terkirim.

```ts
import { accessLog } from "bosia/plugins/access-log";

accessLog(); // setiap request
accessLog({ filter: (e) => e.status >= 400 || e.ms > 200 }); // hanya error dan request lambat
accessLog({ format: (e) => JSON.stringify({ m: e.method, p: e.path, s: e.status, ms: e.ms }) });
accessLog({ filter: (e) => e.path !== "/_health" }); // lewati liveness probe
accessLog({ flushMs: 0 }); // tulis setiap baris langsung
```

## Menulis sebuah Plugin

Plugin adalah objek apa pun yang cocok dengan `BosiaPlugin`:

```ts
import type { BosiaPlugin } from "bosia";

export function myPlugin(): BosiaPlugin {
	return {
		name: "my-plugin",

		// Mount backend routes/middleware *before* the framework handles requests.
		// Routes registered here bypass framework middleware (CSRF, hooks, etc.).
		backend: {
			before(app) {
				return app.get("/__my-plugin/health", () => ({ ok: true }));
			},
			// `after` runs once the framework's catch-all routes are in place.
			// You receive the route manifest for introspection.
			after(app, { manifest }) {
				console.log(
					"Routes:",
					manifest.pages.map((p) => p.pattern),
				);
				return app;
			},
		},

		// Hook into the build pipeline.
		build: {
			postScan(manifest) {
				// e.g. emit dist/openapi.json from the route manifest
			},
			bunPlugins(target) {
				// Contribute Bun build plugins for "browser" or "bun" targets.
				return [];
			},
		},

		// Inject HTML into every SSR response.
		render: {
			head(ctx) {
				return `<meta name="generator" content="my-plugin">`;
			},
			bodyEnd(ctx) {
				return `<script>/* analytics */</script>`;
			},
		},
	};
}
```

## Referensi Lifecycle

| Hook                               | Kapan                                       | Menerima                     |
| ---------------------------------- | ------------------------------------------- | ---------------------------- |
| `backend.before(app)`              | Start server, sebelum route framework       | `BosiaApp`                   |
| `backend.after(app, { manifest })` | Start server, setelah route framework       | `BosiaApp` + `RouteManifest` |
| `build.preBuild(ctx)`              | Sebelum pemindaian route                    | `BuildContext` (mode, cwd)   |
| `build.postScan(manifest, ctx)`    | Setelah pemindaian route, sebelum bundling  | `RouteManifest`              |
| `build.bunPlugins(target)`         | Bundling — digabung ke plugin `Bun.build()` | `"browser"` atau `"bun"`     |
| `build.postBuild(ctx)`             | Setelah pembuatan situs statis              | `BuildContext`               |
| `render.head(ctx)`                 | SSR streaming, sebelum `</head>`            | `RenderContext`              |
| `render.bodyEnd(ctx)`              | SSR streaming, sebelum `</body>`            | `RenderContext`              |

Hook `dev.*` dan `client.*` dicadangkan untuk v0.5.0.

## App Backend

`app` yang diterima `backend.before` / `backend.after` adalah `BosiaApp` (tipenya diekspor dari `bosia/server`). Setiap method mengembalikan app, jadi bisa dirantai.

| Method                                                              | Fungsinya                                                                                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `get` / `post` / `put` / `patch` / `delete` / `options`             | Tambah route. Path persis (`/__my-plugin/health`) atau `"*"`.                                                                |
| `all(path, handler)`                                                | Route untuk method apa pun.                                                                                                  |
| `onRequest(({ request, set }) => …)`                                | Jalan paling awal di setiap request. Kembalikan nilai untuk langsung jawab.                                                  |
| `onAfterHandle(({ request, response, set }) => …)`                  | Jalan setelah handler. Kembalikan nilai untuk mengganti response.                                                            |
| `onError(({ request, error, set }) => …)`                           | Jalan berurutan. Kembalikan nilai untuk jawab; `undefined` diteruskan.                                                       |
| `onResponse(({ request, response, status, upgraded, start }) => …)` | Melihat response final sekali per request. Hanya mengamati. Baca `status`: `101` untuk upgrade WebSocket (`upgraded: true`). |

Handler route menerima `{ request, body, query, set }`. `body` di-parse dari JSON atau form data. Kembalikan `Response`, string (teks biasa), atau objek (JSON). `set.status` dan `set.headers` digabung ke balasan.

Path persis menang atas `"*"`. Parameter path (`/users/:id`) belum didukung. Request dengan method yang tidak ditangani route mana pun mendapat `405 Method Not Allowed`.

## Urutan

Plugin berjalan sesuai urutan kemunculannya di `plugins: []`. Plugin `before` terdaftar sesuai urutan array; plugin `after` terdaftar sesuai urutan array; fragmen render digabung sesuai urutan array.

## Catatan penting

- `bosia.config.ts` dikompilasi dengan `Bun.build({ target: "bun" })`. Ia bisa memakai TypeScript dan impor bare-specifier.
- Plugin yang melempar error saat `backend.before` / `backend.after` membatalkan startup server. Build hook yang melempar error membatalkan build.
- Plugin Elysia (`app.use(...)`) tidak lagi berfungsi — Bosia melepas Elysia di 0.9.10. Pindahkan ke method di atas.

## Migrasi dari Elysia (0.9.10)

Plugin yang memakai `get/post/…`, `onRequest`, `onAfterHandle`, `onError` atau `set.headers` tetap berjalan. Hanya tipenya yang berubah:

```ts
// sebelum
import type { Elysia } from "elysia";
// sesudah
import type { BosiaApp } from "bosia/server";
```

`app.use()`, `.derive()`, `.decorate()`, `.group()`, `.ws()`, validasi skema dan path `:param` sudah tidak ada. Tangani di dalam handler Anda sendiri.
