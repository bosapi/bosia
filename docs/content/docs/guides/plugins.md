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

Adds a `Server-Timing: handler;dur=<ms>` header to every response. The duration measures the framework handler chain (`onRequest` → `onAfterHandle`). For streaming SSR routes this is "time to start streaming," not full end-to-end render time — `Server-Timing` is a response header, so it must flush before the body. Useful for surfacing framework overhead in browser DevTools.

```ts
import { serverTiming } from "bosia/plugins/server-timing";

serverTiming({ metric: "bosia" }); // override default metric name
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

| Hook                               | When                                         | Receives                     |
| ---------------------------------- | -------------------------------------------- | ---------------------------- |
| `backend.before(app)`              | Server start, before framework routes        | `BosiaApp`                   |
| `backend.after(app, { manifest })` | Server start, after framework routes         | `BosiaApp` + `RouteManifest` |
| `build.preBuild(ctx)`              | Before route scan                            | `BuildContext` (mode, cwd)   |
| `build.postScan(manifest, ctx)`    | After route scan, before bundling            | `RouteManifest`              |
| `build.bunPlugins(target)`         | Bundling — merged into `Bun.build()` plugins | `"browser"` or `"bun"`       |
| `build.postBuild(ctx)`             | After static site generation                 | `BuildContext`               |
| `render.head(ctx)`                 | Streaming SSR, before `</head>`              | `RenderContext`              |
| `render.bodyEnd(ctx)`              | Streaming SSR, before `</body>`              | `RenderContext`              |

`dev.*` and `client.*` hooks are reserved for v0.5.0.

## Backend App

The `app` passed to `backend.before` / `backend.after` is a `BosiaApp` (type exported from `bosia/server`). Every method returns the app, so calls chain.

| Method                                                  | What it does                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `get` / `post` / `put` / `patch` / `delete` / `options` | Add a route. Path is exact (`/__my-plugin/health`) or `"*"`.       |
| `all(path, handler)`                                    | Route for any method.                                              |
| `onRequest(({ request, set }) => …)`                    | Runs first on every request. Return a value to answer right away.  |
| `onAfterHandle(({ request, response, set }) => …)`      | Runs after the handler. Return a value to replace the response.    |
| `onError(({ request, error, set }) => …)`               | Runs in order. Return a value to answer; `undefined` passes it on. |

Route handlers get `{ request, body, query, set }`. `body` is parsed from JSON or form data. Return a `Response`, a string (plain text), or an object (JSON). `set.status` and `set.headers` are merged into the reply.

Exact paths win over `"*"`. Path params (`/users/:id`) are not supported yet. Requests with a method no route handles get `405 Method Not Allowed`.

## Order

Plugins run in the order they appear in `plugins: []`. `before` plugins register in array order; `after` plugins register in array order; render fragments are concatenated in array order.

## Caveats

- `bosia.config.ts` is compiled with `Bun.build({ target: "bun" })`. It can use TypeScript and bare-specifier imports.
- Plugins that throw during `backend.before` / `backend.after` abort server startup. Build hooks that throw abort the build.
- Elysia plugins (`app.use(...)`) no longer work — Bosia dropped Elysia in 0.9.9. Port them to the methods above.

## Migrating from Elysia (0.9.9)

Plugins that used `get/post/…`, `onRequest`, `onAfterHandle`, `onError` or `set.headers` keep working. Only the type changes:

```ts
// before
import type { Elysia } from "elysia";
// after
import type { BosiaApp } from "bosia/server";
```

`app.use()`, `.derive()`, `.decorate()`, `.group()`, `.ws()`, schema validation and `:param` paths are gone. Handle those inside your own handler.
