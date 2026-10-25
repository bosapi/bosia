---
title: Plugins
description: Extend Bosia with first-party and third-party plugins via bosia.config.ts.
---

Plugins extend Bosia at four lifecycle points: the HTTP backend, the build pipeline, the SSR render pipeline, and (in upcoming versions) the dev server and client runtime. First-party plugins ship under `bosia/plugins/*`; third-party plugins live in any npm package that exports a `BosiaPlugin`.

`backend.before` / `backend.after` receive Bosia's own small backend app. It is shaped like Elysia, so most plugins read the same, but it carries no Elysia dependency.

## Configuration

Create `bosia.config.ts` at the project root:

```ts
import { defineConfig } from "bosia";
import { serverTiming } from "bosia/plugins/server-timing";

export default defineConfig({
	plugins: [serverTiming()],
});
```

The config is loaded once at startup by `bosia dev`, `bosia build`, and `bosia start`. No config file is required — apps without one run with zero plugins.

## First-Party Plugins

### `bosia/plugins/server-timing`

Adds a `Server-Timing: handler;dur=<ms>` header to every response. The duration measures the framework handler chain (`onRequest` → `onAfterHandle`). It is the time to build the response, not to deliver it (for a streaming `+server.ts` route, "time to start streaming") — `Server-Timing` is a response header, so it must flush before the body. Useful for surfacing framework overhead in browser DevTools.

```ts
import { serverTiming } from "bosia/plugins/server-timing";

serverTiming({ metric: "bosia" }); // override default metric name
```

### `bosia/plugins/access-log`

Logs one line per request — `[GET] /blog 200 (1.2ms)` — from the final response, so the status is what the client got and each request is logged once, whatever other plugins do. Bosia doesn't log requests by default; add this when you want an access log and no reverse proxy keeps one. Lines are written in batches (every 100ms, or at 64KB) instead of one write per request: on a piped stdout (`docker logs`, systemd) that's ~3µs of CPU per request instead of ~11–14µs. Lines still waiting are written on shutdown. On Workers every line is written at once. The path is the one requested, with any `BASE_PATH` prefix, as a proxy would log it. Responses Bun sends before the app runs (a body over `BODY_SIZE_LIMIT` → 413) aren't logged; keep `write` synchronous so the shutdown flush completes. On Workers, `ms` only moves across I/O (CPU time reads as 0), and an async `write` may be cut off after the response.

```ts
import { accessLog } from "bosia/plugins/access-log";

accessLog(); // every request
accessLog({ filter: (e) => e.status >= 400 || e.ms > 200 }); // errors and slow requests only
accessLog({ format: (e) => JSON.stringify({ m: e.method, p: e.path, s: e.status, ms: e.ms }) });
accessLog({ filter: (e) => e.path !== "/_health" }); // skip liveness probes
accessLog({ flushMs: 0 }); // write each line immediately
```

## Authoring a Plugin

A plugin is any object matching `BosiaPlugin`:

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

## Lifecycle Reference

| Hook                               | When                                            | Receives                     |
| ---------------------------------- | ----------------------------------------------- | ---------------------------- |
| `backend.before(app)`              | Server start, before framework routes           | `BosiaApp`                   |
| `backend.after(app, { manifest })` | Server start, after framework routes            | `BosiaApp` + `RouteManifest` |
| `build.preBuild(ctx)`              | Before route scan                               | `BuildContext` (mode, cwd)   |
| `build.postScan(manifest, ctx)`    | After route scan and flag read, before bundling | `RouteManifest`              |
| `build.bunPlugins(target)`         | Bundling — merged into `Bun.build()` plugins    | `"browser"` or `"bun"`       |
| `build.postBuild(ctx)`             | After static site generation                    | `BuildContext`               |
| `render.head(ctx)`                 | Streaming SSR, before `</head>`                 | `RenderContext`              |
| `render.bodyEnd(ctx)`              | Streaming SSR, before `</body>`                 | `RenderContext`              |

Before `postScan`, Bosia bundles and imports every route server module once to read its `prerender`, `ssr`, `actions` and `trailingSlash`, so `bunPlugins("bun")` also runs for that bundle. After `postScan`, Bosia settles the flags of the routes you added or changed:

- **Added route:** prerendered if you set `prerender: true` or its file has `export const prerender = true`. A `false` you set doesn't override the file. Its `trailingSlash` comes from its page and layout files (default `"never"`) unless you set one.
- **Changed route:** your `prerender` wins. If you only swap its server file, the new file's flag is used.
- **Always:** a page with `actions` or `ssr = false`, or with no server file, is never prerendered, even if you set `prerender: true`.

`dev.*` and `client.*` hooks are reserved for v0.5.0.

## Backend App

The `app` passed to `backend.before` / `backend.after` is a `BosiaApp` (type exported from `bosia/server`). Every method returns the app, so calls chain.

| Method                                                              | What it does                                                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `get` / `post` / `put` / `patch` / `delete` / `options`             | Add a route. Path is exact (`/__my-plugin/health`) or `"*"`.                                                             |
| `all(path, handler)`                                                | Route for any method.                                                                                                    |
| `onRequest(({ request, set }) => …)`                                | Runs first on every request. Return a value to answer right away.                                                        |
| `onAfterHandle(({ request, response, set }) => …)`                  | Runs after the handler. Return a value to replace the response. Skipped for a WebSocket upgrade.                         |
| `onError(({ request, error, set }) => …)`                           | Runs in order. Return a value to answer; `undefined` passes it on.                                                       |
| `onResponse(({ request, response, status, upgraded, start }) => …)` | Sees the final response once per request. Observe only. Read `status`: `101` for a WebSocket upgrade (`upgraded: true`). |

Route handlers get `{ request, body, query, set }`. `body` is parsed from JSON or form data. Return a `Response`, a string (plain text), or an object (JSON). `set.status` and `set.headers` are merged into the reply.

Exact paths win over `"*"`. Path params (`/users/:id`) are not supported yet. Requests with a method no route handles get `405 Method Not Allowed`.

## Order

Plugins run in the order they appear in `plugins: []`. `before` plugins register in array order; `after` plugins register in array order; render fragments are concatenated in array order.

## Caveats

- `bosia.config.ts` is compiled with `Bun.build({ target: "bun" })`. It can use TypeScript and bare-specifier imports.
- Plugins that throw during `backend.before` / `backend.after` abort server startup. Build hooks that throw abort the build.
- Elysia plugins (`app.use(...)`) no longer work — Bosia dropped Elysia in 0.9.10. Port them to the methods above.

## Migrating from Elysia (0.9.10)

Plugins that used `get/post/…`, `onRequest`, `onAfterHandle`, `onError` or `set.headers` keep working. Only the type changes:

```ts
// before
import type { Elysia } from "elysia";
// after
import type { BosiaApp } from "bosia/server";
```

`app.use()`, `.derive()`, `.decorate()`, `.group()`, `.ws()`, schema validation and `:param` paths are gone. Handle those inside your own handler.
