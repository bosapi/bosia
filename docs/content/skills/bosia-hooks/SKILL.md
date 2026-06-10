---
name: bosia-hooks
description: Bosia hooks.server.ts signature — handle({ event, resolve }) NOT SvelteKit's ({ request, cookies }). Cookies live on event.cookies, locals on event.locals. Covers sequence(), redirect/error from "bosia", typical session-resolver wiring.
triggers:
  - hooks.server.ts
  - hooks.server
  - handle hook
  - event.cookies
  - event.locals
  - sequence
  - session resolver hook
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
    routes:
      - "src/hooks.server.ts"
  stack: [elysia-routes]
---

# bosia-hooks

## What it is

`src/hooks.server.ts` runs on every request. Bosia's signature mirrors SvelteKit's `Handle` middleware shape:

```ts
import { sequence } from "bosia";
import type { Handle } from "bosia";

export const handle: Handle = async ({ event, resolve }) => {
	// read/write cookies, set locals, short-circuit with redirect/error, etc.
	return resolve(event);
};
```

**This is the only correct signature.** It is `{ event, resolve }` — NOT `{ request, cookies }`.

## What's on `event`

```ts
type RequestEvent = {
	request: Request;
	url: URL;
	locals: Record<string, any> & { nonce?: string };
	params: Record<string, string>;
	cookies: Cookies; // event.cookies.get / set / delete
};
```

- `event.request` — the standard `Request` object.
- `event.url` — parsed `URL`.
- `event.locals` — per-request scratch. Write `event.locals.user` etc. here; loaders read it.
- `event.params` — populated for matched routes; empty at hook time for root handler.
- `event.cookies` — see [[bosia-cookies]].

## `sequence()` — compose multiple hooks

```ts
import { sequence } from "bosia";
import { authHandle } from "./features/auth/auth-handle.ts";
import { loggingHandle } from "./features/observability/logging-handle.ts";

export const handle = sequence(authHandle, loggingHandle);
```

Each handler's `resolve` calls the next one in the chain.

## Imports — always from `"bosia"`

```ts
import { redirect, error, fail, sequence, type Handle } from "bosia";
```

Never import these from `"@sveltejs/kit"`. The package isn't installed and the symbols don't exist in this runtime.

## Wrong patterns (do not write these)

```ts
// ❌ WRONG — SvelteKit signature. event will be undefined.
export const handle: Handle = async ({ request, cookies }) => { … };

// ❌ WRONG — cookies isn't on the top-level args.
export const handle: Handle = async ({ event, resolve, cookies }) => { … };

// ❌ WRONG — resolve takes the event, not the request.
return resolve(event.request);
```

## Typical session-resolver wiring

```ts
// src/features/auth/auth-handle.ts
import type { Handle } from "bosia";

export const authHandle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("session");
	if (token) {
		const user = await resolveSession(token); // your code
		if (user) {
			event.locals.user = user;
			event.locals.can = buildPermissions(user);
		}
	}
	return resolve(event);
};
```

Loaders then read `event.locals.user` / `event.locals.can`.

## Cross-references

- [[bosia-cookies]] — `event.cookies` shape, `Secure` semantics.
- [[bosia-auth-flow]] — full auth surface using this hook pattern.
- [[bosia-clean-architecture]] — hooks call services, not the database directly.
