---
title: Middleware Hooks
description: Intersep setiap request dengan hooks.server.ts, susun handler dengan sequence().
---

Middleware hook memungkinkan Anda menjalankan kode pada setiap request — autentikasi, pencatatan log, injeksi header, dan lainnya.

## hooks.server.ts

Buat `src/hooks.server.ts` dan ekspor fungsi `handle`:

```ts
import type { Handle } from "bosia";

export const handle: Handle = async ({ event, resolve }) => {
	// Runs before the route handler
	event.locals.requestTime = Date.now();

	const response = await resolve(event);

	// Runs after the route handler
	response.headers.set("X-Custom", "value");

	return response;
};
```

Fungsi `handle` menginterspsi **setiap request** — halaman, API route, dan aset statis.

## Tipe Handle

```ts
type Handle = (input: { event: RequestEvent; resolve: ResolveFunction }) => MaybePromise<Response>;
```

- `event` — event request dengan `request`, `url`, `params`, `locals`, `cookies`
- `resolve` — panggil ini untuk melanjutkan ke handler berikutnya atau ke route

## Menyusun dengan sequence()

Gunakan `sequence()` untuk menyusun beberapa handler:

```ts
import { sequence } from "bosia";
import type { Handle } from "bosia";

const authHandle: Handle = async ({ event, resolve }) => {
	event.locals.requestTime = Date.now();
	event.locals.user = null; // replace with real session logic
	return resolve(event);
};

const loggingHandle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const res = await resolve(event);
	const ms = Date.now() - start;
	console.log(`[${event.request.method}] ${event.url.pathname} ${res.status} (${ms}ms)`);
	res.headers.set("X-Response-Time", `${ms}ms`);
	return res;
};

export const handle = sequence(authHandle, loggingHandle);
```

Handler dieksekusi dari kiri ke kanan. `resolve` milik setiap handler memanggil handler berikutnya dalam rantai.

## Menyetel Locals

`event.locals` adalah objek biasa yang dibagikan di antara hooks, loader, dan handler API untuk request saat ini:

```ts
// hooks.server.ts
const auth: Handle = async ({ event, resolve }) => {
	const session = getSession(event.cookies.get("session_id"));
	event.locals.user = session?.user ?? null;
	return resolve(event);
};
```

```ts
// +page.server.ts — locals are available here
export async function load({ locals }: LoadEvent) {
	return { user: locals.user };
}
```

## Akses Cookie

Baca dan tulis cookie melalui `event.cookies`:

```ts
const handle: Handle = async ({ event, resolve }) => {
	// Read
	const token = event.cookies.get("auth_token");

	// Write (added to the response)
	event.cookies.set("visited", "true", {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 60 * 24, // 1 day
	});

	// Delete
	event.cookies.delete("old_cookie", { path: "/" });

	return resolve(event);
};
```

## Pola Umum

### Autentikasi

```ts
const auth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("session");
	event.locals.user = token ? await validateSession(token) : null;
	return resolve(event);
};
```

### Pencatatan Log Request

```ts
const logger: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const res = await resolve(event);
	console.log(
		`${event.request.method} ${event.url.pathname} → ${res.status} (${Date.now() - start}ms)`,
	);
	return res;
};
```

### Proteksi Route

```ts
const guard: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/admin") && !event.locals.user) {
		return Response.redirect("/login", 303);
	}
	return resolve(event);
};
```
