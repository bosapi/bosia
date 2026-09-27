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

Menambahkan header `Server-Timing: handler;dur=<ms>` ke setiap respons. Durasinya mengukur rantai handler framework (`onRequest` → `onAfterHandle`). Untuk route SSR streaming ini adalah "waktu mulai streaming", bukan waktu render end-to-end penuh — `Server-Timing` adalah header respons, jadi harus di-flush sebelum body. Berguna untuk memunculkan overhead framework di browser DevTools.

```ts
import { serverTiming } from "bosia/plugins/server-timing";

serverTiming({ metric: "bosia" }); // override default metric name
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

| Method                                                  | Fungsinya                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `get` / `post` / `put` / `patch` / `delete` / `options` | Tambah route. Path persis (`/__my-plugin/health`) atau `"*"`.               |
| `all(path, handler)`                                    | Route untuk method apa pun.                                                 |
| `onRequest(({ request, set }) => …)`                    | Jalan paling awal di setiap request. Kembalikan nilai untuk langsung jawab. |
| `onAfterHandle(({ request, response, set }) => …)`      | Jalan setelah handler. Kembalikan nilai untuk mengganti response.           |
| `onError(({ request, error, set }) => …)`               | Jalan berurutan. Kembalikan nilai untuk jawab; `undefined` diteruskan.      |

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
