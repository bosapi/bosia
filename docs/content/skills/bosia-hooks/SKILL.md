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

`src/hooks.server.ts` runs on every request. The ONLY correct signature is `{ event, resolve }` — NOT `{ request, cookies }`:

```ts
import { sequence, redirect, error, fail, type Handle } from "bosia";

export const handle: Handle = async ({ event, resolve }) => {
	// read/write event.cookies, set event.locals, short-circuit with redirect/error
	return resolve(event);
};
```

Import `redirect`/`error`/`fail`/`sequence`/`Handle` from `"bosia"`, never `"@sveltejs/kit"` (not installed).

## `event`

`{ request: Request, url: URL, locals: Record<string, any> & { nonce? }, params: Record<string, string>, cookies: Cookies }`. `locals` is per-request scratch (write `event.locals.user`; loaders read it). `params` is empty at root-hook time. `cookies` → [[bosia-cookies]].

## `sequence()` — compose hooks

```ts
import { sequence } from "bosia";
export const handle = sequence(authHandle, loggingHandle); // each resolve calls the next
```

## ❌ Wrong

```ts
async ({ request, cookies }) => {}; // SvelteKit signature — event undefined
async ({ event, resolve, cookies }) => {}; // cookies isn't a top-level arg
return resolve(event.request); // resolve takes the event, not the request
```

## Session-resolver wiring

```ts
// src/features/auth/auth-handle.ts
import type { Handle } from "bosia";
export const authHandle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("session");
	if (token) {
		const user = await resolveSession(token);
		if (user) {
			event.locals.user = user;
			event.locals.can = buildPermissions(user);
		}
	}
	return resolve(event);
};
```

Loaders then read `event.locals.user` / `event.locals.can`.

Related: [[bosia-cookies]] (`Secure` semantics), [[bosia-auth-flow]], [[bosia-clean-architecture]] (hooks call services, not the DB directly).
