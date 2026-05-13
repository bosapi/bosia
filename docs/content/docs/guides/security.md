---
title: Security
description: CSRF protection, CORS, security headers, cookie safety, and more.
---

Bosia includes several security features enabled by default.

## CSRF Protection

All non-safe requests (POST, PUT, PATCH, DELETE) are validated against the server's origin. This uses the same approach as SvelteKit — checking the `Origin` or `Referer` header.

- Safe methods (GET, HEAD, OPTIONS) are exempt
- Missing `Origin`/`Referer` on state-changing requests is rejected with 403
- Cross-origin requests from unexpected origins are blocked

### Configuration

Allow additional origins via the `CSRF_ALLOWED_ORIGINS` environment variable:

```bash
CSRF_ALLOWED_ORIGINS=https://app.example.com, https://mobile.example.com
```

### Reverse-proxy deployments (`TRUST_PROXY`)

By default Bosia does **not** trust the `X-Forwarded-Host` and `X-Forwarded-Proto` request headers when deciding whether a request's origin matches. A directly-exposed server would otherwise let any client spoof the expected origin via attacker-supplied forwarded headers, defeating the CSRF check.

When Bosia runs behind a reverse proxy or load balancer (nginx, Caddy, Cloudflare, an ALB, etc.) the public-facing host typically differs from the `Host` header the inner Bun server sees. In that case, set:

```bash
TRUST_PROXY=true
```

Only enable this when **all** of the following are true:

- A proxy/load balancer sits in front of Bosia.
- That proxy **strips** any client-supplied `X-Forwarded-*` headers before forwarding (most do by default; verify yours does).
- The proxy adds its own `X-Forwarded-Host` / `X-Forwarded-Proto` reflecting the public origin.

Do **not** set `TRUST_PROXY=true` when Bosia is internet-facing with no proxy in front, or when you can't verify the proxy strips inbound forwarded headers — that re-opens the spoofing window the default closes.

## CORS

CORS is **disabled by default**. Enable it by setting allowed origins:

```bash
CORS_ALLOWED_ORIGINS=https://app.example.com, https://admin.example.com
```

Additional CORS settings:

```bash
CORS_ALLOWED_METHODS=GET, POST, PUT, DELETE
CORS_ALLOWED_HEADERS=Content-Type, Authorization
CORS_EXPOSED_HEADERS=X-Request-Id
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400
```

Preflight `OPTIONS` requests are handled automatically when CORS is configured.

When CORS is configured, every response includes `Vary: Origin` — even responses to origins that aren't on the allow-list. This stops shared caches (CDNs, browser HTTP cache) from accidentally serving a response that contains `Access-Control-Allow-Origin: A` to a request from a different origin `B`.

## Security Headers

Bosia sets these headers on every response:

| Header                   | Value                             |
| ------------------------ | --------------------------------- |
| `X-Content-Type-Options` | `nosniff`                         |
| `X-Frame-Options`        | `SAMEORIGIN`                      |
| `Referrer-Policy`        | `strict-origin-when-cross-origin` |

## Cookie Security

Every `cookies.set()` call applies secure defaults automatically — no need to specify them manually:

| Option     | Default | Description                       |
| ---------- | ------- | --------------------------------- |
| `path`     | `"/"`   | Available to all routes           |
| `httpOnly` | `true`  | Not accessible via JavaScript     |
| `secure`   | `true`  | HTTPS only (auto-disabled in dev) |
| `sameSite` | `"Lax"` | Protects against CSRF             |

In **dev mode**, `secure` is automatically set to `false` so cookies work over `http://localhost` without browser rejection.

Set a cookie with just the values you care about — secure defaults are applied for everything else:

```ts
event.cookies.set("session", token, {
	maxAge: 60 * 60 * 24 * 7, // 7 days
});
// → Set-Cookie: session=...; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax
```

To opt out of a default, pass it explicitly:

```ts
// Client-readable cookie (e.g. theme preference)
event.cookies.set("theme", "dark", {
	httpOnly: false,
	maxAge: 60 * 60 * 24 * 365,
});
```

Additional protections:

- **Header injection prevention** — values containing `;`, `\r`, or `\n` are rejected
- **SameSite validation** — only `Strict`, `Lax`, or `None` are accepted
- **Automatic encoding** — cookie values are safely encoded with `encodeURIComponent`

## XSS Protection

JSON data embedded in server-rendered HTML is escaped using a safe serializer that:

- Escapes `<`, `>`, `&`, `'`, `"`, and Unicode characters that could break out of script tags
- Handles circular references gracefully

## Request Body Limits

Request body size is limited by default to prevent denial-of-service:

```bash
BODY_SIZE_LIMIT=512K    # default
BODY_SIZE_LIMIT=1M      # 1 megabyte
BODY_SIZE_LIMIT=10M     # 10 megabytes
BODY_SIZE_LIMIT=Infinity # no limit (not recommended)
```

Supports `K` (kilobytes), `M` (megabytes), and `G` (gigabytes) suffixes.

## Path Traversal Protection

Static file and prerendered page serving validates that resolved file paths stay within their allowed directories, preventing `../` traversal attacks.

At build time, prerender `entries()` values are also validated: `..` and `\` are never allowed in any segment, and `/` is only allowed inside catch-all (`[...rest]`) segments. A build that returns an unsafe value fails fast with a clear error rather than silently writing HTML outside the output tree.

## Open-Redirect Protection

`redirect(status, location)` rejects external URLs by default. Pass `{ allowExternal: true }` to opt in for legitimate external redirects (e.g. OAuth providers):

```ts
import { redirect } from "bosia";

redirect(303, "https://accounts.example.com/oauth", { allowExternal: true });
```

Even with `allowExternal: true`, dangerous schemes — `javascript:`, `data:`, `vbscript:` — are **always** rejected. Those schemes are never legitimate redirect targets and could otherwise be abused to inject script execution into a redirect chain.

## Production Error Handling

In production (`NODE_ENV=production`), stack traces are stripped from error responses to prevent leaking internal details to clients.
