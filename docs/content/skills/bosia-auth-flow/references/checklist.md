# Auth flow — checklist

## P0

- [ ] Argon2id (or Argon2i) password hashing.
- [ ] Session token is opaque random ≥ 32 bytes, base64url.
- [ ] Cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age` set.
- [ ] Login failures return generic "Invalid credentials".
- [ ] `/forgot` returns identical response for existing/missing email.
- [ ] Logout is POST to `+server.ts`, not GET.
- [ ] All actions validate `formData` (zod / hand-validation).
- [ ] No password / token in logs.
- [ ] RBAC bootstrap: super-admin via wildcard permission `*.*`, not hardcoded role check.

## P1

- [ ] Rate limits on login, register, forgot.
- [ ] Password minimum length (12+ recommended).
- [ ] Email verification (or explicitly deferred).
- [ ] Account lockout / temporary throttle after N failed logins.
- [ ] Re-auth required for sensitive actions (password change, billing).
- [ ] Session rotation on login (invalidate previous session id).

## File map

```
src/features/auth/
├── password.ts            (R1)
├── tokens.ts              (R2)
├── session-resolver.ts    (R2)
├── auth-handle.ts         (hook wiring)
└── cookies.ts             (cookie helpers, flags)

src/routes/
├── (public)/login/+page.svelte
├── (public)/login/+page.server.ts        (actions.default)
├── (public)/register/+page.svelte
├── (public)/register/+page.server.ts     (actions.default)
├── (public)/forgot/+page.svelte
├── (public)/forgot/+page.server.ts       (actions.default)
└── logout/+server.ts                     (POST)
```

## Threats covered

- Credential stuffing — rate limit + generic errors.
- CSRF — SameSite cookie + origin guard on POST.
- Session hijack — HttpOnly + Secure + rotation.
- Account enumeration — generic responses on login/forgot.
- Brute force — Argon2 cost + rate limit.
- Stale sessions — Max-Age + invalidate on logout.
