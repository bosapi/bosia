---
name: bosia-cookies
description: cookies.set/get/delete on event.cookies. CookieOptions shape, sameSite accepts both cases, Secure auto-applies only when request is HTTPS (downgrades + warns on HTTP). Defaults HttpOnly+Secure+SameSite=Lax+Path=/. Do not pass `secure:true` literal — framework decides per-request.
triggers:
    - cookies.set
    - cookies.get
    - cookies.delete
    - sameSite
    - secure cookie
    - session cookie
    - Set-Cookie
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

# bosia-cookies

## What it is

Cookies live on `event.cookies` inside hooks, loaders, form actions, and `+server.ts` handlers.

```ts
const token = event.cookies.get("session"); // string | undefined
event.cookies.set("session", token, { maxAge: 60 * 60 * 24 * 7 });
event.cookies.delete("session", { path: "/" });
```

## `CookieOptions` shape

```ts
interface CookieOptions {
	path?: string; // default "/"
	domain?: string;
	maxAge?: number; // seconds
	expires?: Date;
	httpOnly?: boolean; // default true
	secure?: boolean; // framework-decided — see below
	sameSite?: "Strict" | "Lax" | "None" | "strict" | "lax" | "none"; // default "Lax"
}
```

## Defaults

`HttpOnly; Secure; SameSite=Lax; Path=/` — applied automatically. You only need to pass `maxAge`/`expires` (and `domain` if you have one).

## `Secure` is framework-decided — DO NOT pass `secure: true` in route code

Bosia inspects the current request's transport per-request:

- HTTPS request → `Secure` is applied (default and honored).
- HTTP request → `Secure` is dropped, with a one-time `console.warn`, **even if the caller passed `secure: true`**. Browsers silently drop `Secure` cookies over HTTP, which causes a login loop where the auth route "sets" a cookie that never reaches the browser.

> **Do NOT write `secure: true` in route code.** The framework decides per request. Hardcoding `secure: true` triggers a downgrade + warn on HTTP and is redundant on HTTPS.

## `sameSite` case-insensitive

Both casings work:

```ts
event.cookies.set("k", "v", { sameSite: "lax" }); // ✅
event.cookies.set("k", "v", { sameSite: "Lax" }); // ✅
```

Bosia normalizes to the canonical `SameSite=Lax|Strict|None` header. (`SvelteKit`/`Express` both accept lowercase; Bosia now matches.)

## Behind a TLS-terminating proxy

If your app sits behind a proxy that terminates HTTPS and forwards plain HTTP to Bosia, set `TRUST_PROXY=true`. Bosia then trusts `x-forwarded-proto: https` and applies `Secure` correctly. Default is **off** (don't trust spoofable headers by default).

| Transport to Bosia          | `TRUST_PROXY` | `x-forwarded-proto` | `Secure` applied?   |
| --------------------------- | ------------- | ------------------- | ------------------- |
| `https://…` direct          | any           | any                 | ✅                  |
| `http://…` no proxy         | any           | any                 | ❌                  |
| `http://…` behind TLS proxy | `false`       | `https`             | ❌ (header ignored) |
| `http://…` behind TLS proxy | `true`        | `https`             | ✅                  |

## Deletion

```ts
event.cookies.delete("session", { path: "/" });
```

Pass the same `path` (and `domain` if you used one) you set the cookie with — otherwise the browser keeps the original. Bosia implements `delete` as `set("", maxAge: 0)`.

## Encoding

Values are `encodeURIComponent`-encoded automatically. Reads decode automatically. Don't pre-encode.

## Wrong patterns

```ts
// ❌ Redundant + breaks dev/preview: hardcoded secure:true
event.cookies.set("session", token, { secure: true, sameSite: "lax" });

// ✅ Right: let the framework decide
event.cookies.set("session", token, { sameSite: "lax", maxAge: WEEK });
```

## Cross-references

- [[bosia-hooks]] — `event.cookies` is on the `event` arg.
- [[bosia-auth-flow]] — session cookie usage in login/register/logout.
