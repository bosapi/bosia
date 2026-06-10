---
name: bosia-elysia-routes
description: "`+server.ts` conventions — handler signature, body parsing, return shape, status codes. No Express idioms."
triggers:
  - api route
  - server endpoint
  - POST handler
  - REST endpoint
  - webhook
od:
  mode: convention
  category: framework
bosia:
  design: false
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: [elysia-routes]
---

# bosia-elysia-routes

## What it builds

`+server.ts` files with correct handler signatures, body parsing, and response shape.

## When to use

- Creating any `+server.ts`.
- Adding `actions` to a `+page.server.ts`.
- Any code that handles HTTP requests on the server.

## Rules

### R1 — Named verb exports

```ts
// src/routes/api/items/+server.ts
export async function GET({ locals }) { … }
export async function POST({ request, locals }) { … }
export async function DELETE({ params, locals }) { … }
```

Never default export. Never an Elysia app instance — Bosia wraps each verb itself.

### R2 — Body parsing

Bosia passes the parsed body in via context:

```ts
export async function POST({ body, locals }: { body: { name: string }; locals: App.Locals }) {
	// body is already parsed JSON
}
```

Validate at the boundary (zod, valibot, or a hand-written guard). Never trust shape.

### R3 — Return shape

Return a plain object → auto-serialized to JSON with `200`:

```ts
return { ok: true, id: row.id };
```

Return `new Response()` when you need a specific status or headers:

```ts
return new Response(null, { status: 303, headers: { Location: "/login" } });
return new Response(JSON.stringify({ error: "Not found" }), {
	status: 404,
	headers: { "content-type": "application/json" },
});
```

### R4 — RBAC at the top

Every protected handler calls `locals.can('resource.action', scope?)` before any DB read/write. On fail, return `new Response(null, { status: 403 })`.

```ts
export async function DELETE({ params, locals }) {
  if (!locals.can('student.delete', { schoolId: params.schoolId })) {
    return new Response(null, { status: 403 });
  }
  …
}
```

### R5 — Errors

Throw an Error → Bosia returns 500. For explicit status, return a `Response` with that status. Never call `res.status(…).send(…)` — that's Express, not Bosia.

### R6 — Cookies & redirects

Use `setCookie` from `bosia` (or set the header directly):

```ts
return new Response(null, {
	status: 303,
	headers: {
		Location: "/dashboard",
		"set-cookie": serializeSession(token),
	},
});
```

## Workflow

1. Decide verb(s) the route needs. One file can export multiple.
2. Type the body inline at the handler signature.
3. RBAC check first.
4. Validate input (boundary).
5. Do work, return plain object or `Response`.

## Anti-patterns

- `app.post('/foo', …)` (Express)
- `res.json(…)` / `res.status(…)` (Express)
- Default export of a handler
- Trusting `body` shape without validation
- Skipping `locals.can()` because "the page already checked"

## Checklist gate

P0:

- [ ] Named verb exports only.
- [ ] RBAC check at top of every protected handler.
- [ ] Input validated at the boundary.
- [ ] Errors return `Response` with correct status, not throw.

P1:

- [ ] Body type declared inline in the handler signature.
- [ ] 303 redirects use `Location` header + `null` body.
- [ ] No Express-style `req`/`res`.
