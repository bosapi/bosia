---
name: bosia-cookies
description: cookies.set/get/delete on event.cookies. CookieOptions shape, sameSite accepts both cases, Secure auto-applies only when request is HTTPS (downgrades + warns on HTTP). Defaults HttpOnly+Secure+SameSite=Lax+Path=the mount (`/`, or BASE_PATH). Do not pass `secure:true` literal — framework decides per-request. Do not hardcode `path` on delete.
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

Cookies live on `event.cookies` (hooks, loaders, form actions, `+server.ts`).

```ts
const token = event.cookies.get("session"); // string | undefined
event.cookies.set("session", token, { maxAge: 60 * 60 * 24 * 7 });
event.cookies.delete("session"); // same default path as set() — don't hardcode "/"
```

## `CookieOptions`

`{ path? /*framework-decided*/, domain?, maxAge? /*sec*/, expires?, httpOnly?=true, secure? /*framework-decided*/, sameSite?: "Strict"|"Lax"|"None" (any case, default "Lax") }`.

Defaults applied automatically: `HttpOnly; Secure; SameSite=Lax; Path=<the mount>`. You normally only pass `maxAge`/`expires` (and `domain` if you have one). `sameSite` is case-insensitive (`"lax"` or `"Lax"`), normalized to the canonical header.

## `Path` is framework-decided too — DO NOT hardcode `path: "/"`

The default path is the mount: `/` normally, `BASE_PATH` when the app is mounted under a sub-path. That scoping is what stops two Bosia apps sharing one origin (`example.com/sso`, `example.com/obe`) from overwriting each other's `session`. Hardcoding `path: "/"` re-broadens the cookie to the whole origin and hands your session to the neighbouring app.

## `Secure` is framework-decided — DO NOT pass `secure: true` in route code

Bosia inspects the request transport per-request: HTTPS → `Secure` applied; HTTP → `Secure` dropped with a one-time `console.warn` EVEN IF the caller passed `secure: true`. Browsers silently drop `Secure` cookies over HTTP → a login loop where the auth route "sets" a cookie that never reaches the browser. Hardcoding `secure: true` is redundant on HTTPS and breaks HTTP dev/preview.

```ts
event.cookies.set("session", token, { secure: true, sameSite: "lax" }); // ❌
event.cookies.set("session", token, { sameSite: "lax", maxAge: WEEK }); // ✅ let the framework decide
```

## Behind a TLS-terminating proxy

If a proxy terminates HTTPS and forwards plain HTTP to Bosia, set `TRUST_PROXY=true` so Bosia trusts `x-forwarded-proto: https` and applies `Secure`. Default off (don't trust spoofable headers). So `Secure` applies for: direct `https://` (always), or `http://` behind a TLS proxy ONLY when `TRUST_PROXY=true`. Never for plain `http://` with no proxy.

## Deletion & encoding

`event.cookies.delete("session")` — delete is `set("", maxAge: 0)`, so it must carry the same `path`/`domain` you set with or the browser keeps the cookie. Omit `path` on both and the framework matches them for you; only pass it if you passed a custom one to `set()`. Values are `encodeURIComponent`-encoded/decoded automatically — don't pre-encode.

Related: [[bosia-hooks]] (`event.cookies` on the `event` arg), [[bosia-auth-flow]] (session cookie in login/register/logout).
