---
title: Security
description: CSRF protection, CORS, security headers, cookie safety, and more.
---

Bosbun includes several security features enabled by default.

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

## Security Headers

Bosbun sets these headers on every response:

| Header                    | Value                              |
| ------------------------- | ---------------------------------- |
| `X-Content-Type-Options`  | `nosniff`                          |
| `X-Frame-Options`         | `SAMEORIGIN`                       |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`  |

## Cookie Security

The cookie API includes several protections:

- **Header injection prevention** — values containing `;`, `\r`, or `\n` are rejected
- **SameSite validation** — only `Strict`, `Lax`, or `None` are accepted
- **Automatic encoding** — cookie values are safely encoded with `encodeURIComponent`

Set secure cookie options:

```ts
event.cookies.set("session", token, {
  path: "/",
  httpOnly: true,    // not accessible via JavaScript
  secure: true,      // HTTPS only
  sameSite: "Lax",   // protects against CSRF
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

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

## Production Error Handling

In production (`NODE_ENV=production`), stack traces are stripped from error responses to prevent leaking internal details to clients.
