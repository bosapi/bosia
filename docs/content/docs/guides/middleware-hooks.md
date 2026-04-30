---
title: Middleware Hooks
description: Intercept every request with hooks.server.ts, compose handlers with sequence().
---

Middleware hooks let you run code on every request — authentication, logging, header injection, and more.

## hooks.server.ts

Create `src/hooks.server.ts` and export a `handle` function:

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

The `handle` function intercepts **every request** — pages, API routes, and static assets.

## Handle Type

```ts
type Handle = (input: { event: RequestEvent; resolve: ResolveFunction }) => MaybePromise<Response>;
```

- `event` — the request event with `request`, `url`, `params`, `locals`, `cookies`
- `resolve` — call this to continue to the next handler or the route

## Composing with sequence()

Use `sequence()` to compose multiple handlers:

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

Handlers execute left-to-right. Each handler's `resolve` calls the next handler in the chain.

## Setting Locals

`event.locals` is a plain object shared across hooks, loaders, and API handlers for the current request:

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

## Cookie Access

Read and write cookies via `event.cookies`:

```ts
const handle: Handle = async ({ event, resolve }) => {
	// Read
	const token = event.cookies.get("auth_token");

	// Write (secure defaults applied automatically)
	event.cookies.set("visited", "true", {
		maxAge: 60 * 60 * 24, // 1 day
	});

	// Delete
	event.cookies.delete("old_cookie", { path: "/" });

	return resolve(event);
};
```

## Common Patterns

### Authentication

```ts
const auth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("session");
	event.locals.user = token ? await validateSession(token) : null;
	return resolve(event);
};
```

### Request Logging

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

### Route Protection

```ts
const guard: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/admin") && !event.locals.user) {
		return Response.redirect("/login", 303);
	}
	return resolve(event);
};
```
