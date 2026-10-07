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

The `handle` function intercepts **every page and API request**. Static files (JS/CSS chunks,
`public/` files) are served before the hooks run, so a session lookup in `handle` never runs
once per asset. A file request that matches nothing still goes through the hooks before its 404.

`event.params` already holds the matched route's params when `handle` runs.

## Handle Type

```ts
type Handle = (input: { event: RequestEvent; resolve: ResolveFunction }) => MaybePromise<Response>;
```

- `event` — the request event with `request`, `url`, `params`, `route`, `locals`, `cookies`
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
	event.cookies.delete("old_cookie"); // matches the default path set() used

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
import { redirect } from "bosia";

const guard: Handle = async ({ event, resolve }) => {
	if (event.route.id?.startsWith("/(private)") && !event.locals.user) {
		throw redirect(303, "/login");
	}
	return resolve(event);
};
```

`event.route.id` is the matched route's folder under `src/routes`, with groups kept: a page at
`src/routes/(private)/dashboard/[id]/+page.svelte` has the id `/(private)/dashboard/[id]`. Put
signed-in pages under `(private)` and this one check covers all of them, including pages added
later. It is `null` when no route matched.

One check covers every way into a page: a full page load, a client-side navigation (the router
fetches the page's loader data, and `event.route` is that page's route) and a form action POST.
`event.isDataRequest` tells a navigation apart when you need to know; authorization should not
care. See [Security › Route Guards in Hooks](/guides/security/#route-guards-in-hooks).

`throw redirect()` is preferred over returning `Response.redirect(...)`: it is
turned into the right thing for both request kinds, and it applies your
[`BASE_PATH`](/docs/reference/deployment) for you. A returned `Response.redirect`
also works, but its `Location` is passed through untouched — under a base path you
have to write the prefix yourself.

`throw error(404, "…")` works the same way: an error page for a document request,
the router's error boundary for a navigation.
