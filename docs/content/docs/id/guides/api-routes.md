---
title: API Routes
description: Bangun endpoint REST API dengan file +server.ts.
---

API route memungkinkan Anda membangun endpoint JSON berdampingan dengan halaman Anda.

## Membuat API Route

Buat file `+server.ts` dan ekspor fungsi kata kerja HTTP yang diberi nama:

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

Ekspor yang didukung: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.

## RequestEvent

Setiap handler menerima sebuah `RequestEvent`:

| Properti  | Tipe                     | Deskripsi                               |
| --------- | ------------------------ | --------------------------------------- |
| `request` | `Request`                | Objek Web API Request mentah            |
| `url`     | `URL`                    | URL request yang telah diurai           |
| `params`  | `Record<string, string>` | Parameter route dinamis                 |
| `locals`  | `Record<string, any>`    | Data yang disetel oleh middleware hooks |
| `cookies` | `Cookies`                | Membaca/menulis cookies                 |

## Mengembalikan Response

Kembalikan objek `Response` Web API standar:

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

## API Route Dinamis

Gunakan segmen dinamis seperti pada halaman:

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

Jika sebuah request mengenai `+server.ts` yang tidak mengekspor method yang diminta, Bosia merespons dengan `405 Method Not Allowed` dan header `Allow` yang mencantumkan method yang didukung.

## Mengakses Locals

Data yang disetel di `hooks.server.ts` tersedia di setiap handler API:

```ts
export function GET({ locals }: RequestEvent) {
	if (!locals.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	return Response.json({ user: locals.user });
}
```
