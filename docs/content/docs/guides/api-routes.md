---
title: API Routes
description: Build REST API endpoints with +server.ts files.
---

API routes let you build JSON endpoints alongside your pages.

## Creating an API Route

Create a `+server.ts` file and export named HTTP verb functions:

```ts
// src/routes/api/hello/+server.ts
import type { RequestEvent } from "bosia";

export function GET({ params, locals }: RequestEvent) {
	return Response.json({
		message: "Hello from Bosia API!",
		user: locals.user,
	});
}

export async function POST({ request }: RequestEvent) {
	const body = await request.json().catch(() => ({}));
	return Response.json({ received: body });
}
```

Supported exports: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.

## RequestEvent

Every handler receives a `RequestEvent`:

| Property  | Type                     | Description                    |
| --------- | ------------------------ | ------------------------------ |
| `request` | `Request`                | The raw Web API Request object |
| `url`     | `URL`                    | Parsed request URL             |
| `params`  | `Record<string, string>` | Dynamic route parameters       |
| `locals`  | `Record<string, any>`    | Data set by middleware hooks   |
| `cookies` | `Cookies`                | Read/write cookies             |

## Returning Responses

Return standard Web API `Response` objects:

```ts
// JSON
return Response.json({ ok: true });

// Custom status
return Response.json({ error: "Not found" }, { status: 404 });

// Plain text
return new Response("Hello", { status: 200 });

// Custom headers
return new Response(null, {
	status: 204,
	headers: { "X-Custom": "value" },
});
```

## Dynamic API Routes

Use dynamic segments just like pages:

```
src/routes/api/users/[id]/+server.ts  →  /api/users/123
```

```ts
export function GET({ params }: RequestEvent) {
	return Response.json({ userId: params.id });
}

export function DELETE({ params }: RequestEvent) {
	return Response.json({ deleted: params.id });
}
```

## Method Not Allowed

If a request hits a `+server.ts` that doesn't export the requested method, Bosia responds with `405 Method Not Allowed` and an `Allow` header listing the supported methods.

## Accessing Locals

Data set in `hooks.server.ts` is available in every API handler:

```ts
export function GET({ locals }: RequestEvent) {
	if (!locals.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	return Response.json({ user: locals.user });
}
```
